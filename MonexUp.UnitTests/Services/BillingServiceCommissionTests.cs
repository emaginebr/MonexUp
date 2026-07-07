using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    /// <summary>
    /// Unit tests for BillingService.GenerateCommissionForPaidInvoiceAsync — the new
    /// paid-detection commission path invoked by OrderController.CheckPixStatus after
    /// MarkPaidByInvoiceId. This method is the fix for "buyer paid via PIX poll but no
    /// commission was generated" (webhook/reconciliation were the only generators before).
    ///
    /// BillingService has ~14 constructor dependencies; only four are exercised by this
    /// method (INetworkDomainFactory, IProxyPayClient, IBillingFeeService, ILogger). The
    /// rest are supplied as loose Moq objects so the ctor is satisfiable.
    /// </summary>
    public class BillingServiceCommissionTests
    {
        private const int STATUS_PAID = 3;

        private readonly Mock<INetworkDomainFactory> _networkFactory = new();
        private readonly Mock<INetworkModel> _network = new();
        private readonly Mock<IProxyPayClient> _proxyPayClient = new();
        private readonly Mock<IBillingFeeService> _billingFeeService = new();

        private BillingService BuildSut()
        {
            // The network model is resolved through BuildNetworkModel().GetById(id, factory).
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(_network.Object);
            _network.Setup(m => m.GetById(It.IsAny<long>(), It.IsAny<INetworkDomainFactory>()))
                    .Returns(_network.Object);

            return new BillingService(
                _networkFactory.Object,
                Mock.Of<IUserNetworkDomainFactory>(),
                Mock.Of<IInvoiceFeeDomainFactory>(),
                Mock.Of<IOrderDomainFactory>(),
                Mock.Of<IOrderItemDomainFactory>(),
                Mock.Of<IUserProfileDomainFactory>(),
                Mock.Of<INetworkService>(),
                _proxyPayClient.Object,
                Mock.Of<IProxyPayService>(),
                _billingFeeService.Object,
                Mock.Of<IUserClient>(),
                Mock.Of<ILofnProductClient>(),
                Mock.Of<IConfiguration>(),
                NullLogger<BillingService>.Instance);
        }

        private void ConfigureNetwork(long? storeId, string clientId)
        {
            _network.SetupGet(m => m.ProxyPayStoreId).Returns(storeId);
            _network.SetupGet(m => m.ProxyPayClientId).Returns(clientId);
        }

        [Fact]
        public async Task GenerateCommission_NetworkMissingProxyPayConfig_ReturnsZeroAndDoesNotRecord()
        {
            const long networkId = 1;
            const long invoiceId = 7001;
            // No ProxyPayStoreId / ProxyPayClientId → network is not provisioned.
            ConfigureNetwork(storeId: null, clientId: null!);
            var sut = BuildSut();

            var result = await sut.GenerateCommissionForPaidInvoiceAsync(networkId, invoiceId, default);

            Assert.Equal(0, result);
            _proxyPayClient.Verify(c => c.GetInvoiceAsync(It.IsAny<long>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
            _billingFeeService.Verify(b => b.RecordPaidProxyPayInvoice(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<DateTime>()), Times.Never);
        }

        [Fact]
        public async Task GenerateCommission_InvoiceNotPaid_ReturnsZeroAndDoesNotRecord()
        {
            const long networkId = 1;
            const long invoiceId = 7002;
            ConfigureNetwork(storeId: 500, clientId: "client-abc");
            _proxyPayClient
                .Setup(c => c.GetInvoiceAsync(invoiceId, "client-abc", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProxyPayInvoiceStatusInfo
                {
                    InvoiceId = invoiceId,
                    StoreId = 500,
                    Status = 1, // pending, not STATUS_PAID(3)
                    Amount = 100.00
                });
            var sut = BuildSut();

            var result = await sut.GenerateCommissionForPaidInvoiceAsync(networkId, invoiceId, default);

            Assert.Equal(0, result);
            _billingFeeService.Verify(b => b.RecordPaidProxyPayInvoice(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<DateTime>()), Times.Never);
        }

        [Fact]
        public async Task GenerateCommission_InvoicePaid_RecordsRoundedCentsAndReturnsInsertedCount()
        {
            const long networkId = 1;
            const long invoiceId = 7003;
            var paidAt = new DateTime(2026, 2, 3, 8, 30, 0, DateTimeKind.Utc);
            ConfigureNetwork(storeId: 500, clientId: "client-abc");

            // 123.45 → 12345 cents (Math.Round(Amount * 100)).
            _proxyPayClient
                .Setup(c => c.GetInvoiceAsync(invoiceId, "client-abc", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProxyPayInvoiceStatusInfo
                {
                    InvoiceId = invoiceId,
                    StoreId = 500,
                    Status = STATUS_PAID,
                    Amount = 123.45,
                    PaidAt = paidAt
                });

            // The fee service reports 2 rows written (e.g. store cut + seller).
            _billingFeeService
                .Setup(b => b.RecordPaidProxyPayInvoice(invoiceId, networkId, 12345L, paidAt))
                .Returns(2);

            var sut = BuildSut();

            var result = await sut.GenerateCommissionForPaidInvoiceAsync(networkId, invoiceId, default);

            Assert.Equal(2, result);
            _billingFeeService.Verify(
                b => b.RecordPaidProxyPayInvoice(invoiceId, networkId, 12345L, paidAt),
                Times.Once);
        }

        [Fact]
        public async Task GenerateCommission_GetInvoiceThrows_ReturnsZeroAndSwallowsException()
        {
            const long networkId = 1;
            const long invoiceId = 7004;
            ConfigureNetwork(storeId: 500, clientId: "client-abc");
            _proxyPayClient
                .Setup(c => c.GetInvoiceAsync(invoiceId, "client-abc", It.IsAny<CancellationToken>()))
                .ThrowsAsync(new HttpRequestException("ProxyPay down"));
            var sut = BuildSut();

            var result = await sut.GenerateCommissionForPaidInvoiceAsync(networkId, invoiceId, default);

            Assert.Equal(0, result);
            _billingFeeService.Verify(b => b.RecordPaidProxyPayInvoice(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<DateTime>()), Times.Never);
        }
    }
}

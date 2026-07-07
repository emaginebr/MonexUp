using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    /// <summary>
    /// Service-level tests for the Commission Ledger read model (feature 011).
    /// The balance arithmetic (total / released / maturing) and the statement
    /// status derivation are exercised here by stubbing the InvoiceFee model the
    /// service delegates to. The raw LINQ that produces the sums lives in the
    /// repository and is covered separately by InvoiceFeeRepositoryTests.
    /// </summary>
    public class BillingServiceTests
    {
        private readonly Mock<INetworkDomainFactory> _networkFactory;
        private readonly Mock<IUserNetworkDomainFactory> _userNetworkFactory;
        private readonly Mock<IInvoiceFeeDomainFactory> _feeFactory;
        private readonly Mock<IOrderDomainFactory> _orderFactory;
        private readonly Mock<IOrderItemDomainFactory> _orderItemFactory;
        private readonly Mock<IUserProfileDomainFactory> _profileFactory;
        private readonly Mock<INetworkService> _networkService;
        private readonly Mock<IProxyPayClient> _proxyPayClient;
        private readonly Mock<IProxyPayService> _proxyPayService;
        private readonly Mock<IBillingFeeService> _billingFeeService;
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<ILofnProductClient> _lofnProductClient;
        private readonly Mock<IConfiguration> _configuration;
        private readonly BillingService _service;

        public BillingServiceTests()
        {
            _networkFactory = new Mock<INetworkDomainFactory>();
            _userNetworkFactory = new Mock<IUserNetworkDomainFactory>();
            _feeFactory = new Mock<IInvoiceFeeDomainFactory>();
            _orderFactory = new Mock<IOrderDomainFactory>();
            _orderItemFactory = new Mock<IOrderItemDomainFactory>();
            _profileFactory = new Mock<IUserProfileDomainFactory>();
            _networkService = new Mock<INetworkService>();
            _proxyPayClient = new Mock<IProxyPayClient>();
            _proxyPayService = new Mock<IProxyPayService>();
            _billingFeeService = new Mock<IBillingFeeService>();
            _userClient = new Mock<IUserClient>();
            _lofnProductClient = new Mock<ILofnProductClient>();
            _configuration = new Mock<IConfiguration>();

            _service = new BillingService(
                _networkFactory.Object,
                _userNetworkFactory.Object,
                _feeFactory.Object,
                _orderFactory.Object,
                _orderItemFactory.Object,
                _profileFactory.Object,
                _networkService.Object,
                _proxyPayClient.Object,
                _proxyPayService.Object,
                _billingFeeService.Object,
                _userClient.Object,
                _lofnProductClient.Object,
                _configuration.Object,
                new Mock<ILogger<BillingService>>().Object);
        }

        private Mock<IInvoiceFeeModel> SetupFeeModel()
        {
            var feeModel = new Mock<IInvoiceFeeModel>();
            _feeFactory.Setup(f => f.BuildInvoiceFeeModel()).Returns(feeModel.Object);
            return feeModel;
        }

        // ---- GetMemberBalance: arithmetic + scoping ----

        [Fact]
        public void GetMemberBalance_ShouldReturnTotalReleasedAndMaturingSplit()
        {
            const long networkId = 1;
            const long userId = 7;
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(networkId, userId)).Returns(60);
            feeModel.Setup(m => m.GetReleasedBalance(networkId, userId)).Returns(40);

            var result = _service.GetMemberBalance(networkId, userId);

            Assert.Equal(60, result.Total);
            Assert.Equal(40, result.Released);
            Assert.Equal(20, result.Maturing); // total - released
        }

        [Fact]
        public void GetMemberBalance_WhenAllMatured_MaturingIsZero()
        {
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(1, 7)).Returns(60);
            feeModel.Setup(m => m.GetReleasedBalance(1, 7)).Returns(60);

            var result = _service.GetMemberBalance(1, 7);

            Assert.Equal(60, result.Total);
            Assert.Equal(60, result.Released);
            Assert.Equal(0, result.Maturing);
        }

        [Fact]
        public void GetMemberBalance_WhenNothingMatured_MaturingEqualsTotal()
        {
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(1, 7)).Returns(60);
            feeModel.Setup(m => m.GetReleasedBalance(1, 7)).Returns(0);

            var result = _service.GetMemberBalance(1, 7);

            Assert.Equal(60, result.Total);
            Assert.Equal(0, result.Released);
            Assert.Equal(60, result.Maturing);
        }

        [Fact]
        public void GetMemberBalance_ShouldScopeToPassedUserId()
        {
            const long networkId = 3;
            const long userId = 42;
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(It.IsAny<long?>(), It.IsAny<long?>())).Returns(10);
            feeModel.Setup(m => m.GetReleasedBalance(It.IsAny<long?>(), It.IsAny<long?>())).Returns(5);

            _service.GetMemberBalance(networkId, userId);

            // Member balance must query with the passed member id — never null.
            feeModel.Verify(m => m.GetTotalBalance(networkId, userId), Times.Once);
            feeModel.Verify(m => m.GetReleasedBalance(networkId, userId), Times.Once);
        }

        [Fact]
        public void GetMemberBalance_MemberWithNoCommissions_ReturnsAllZeros()
        {
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(It.IsAny<long?>(), It.IsAny<long?>())).Returns(0);
            feeModel.Setup(m => m.GetReleasedBalance(It.IsAny<long?>(), It.IsAny<long?>())).Returns(0);

            var result = _service.GetMemberBalance(1, 999);

            Assert.Equal(0, result.Total);
            Assert.Equal(0, result.Released);
            Assert.Equal(0, result.Maturing);
        }

        // ---- GetNetworkBalance: own-cut scoping (userId == null) ----

        [Fact]
        public void GetNetworkBalance_ShouldQueryOwnCutRowsWithNullUserId()
        {
            const long networkId = 5;
            var feeModel = SetupFeeModel();
            feeModel.Setup(m => m.GetTotalBalance(networkId, null)).Returns(100);
            feeModel.Setup(m => m.GetReleasedBalance(networkId, null)).Returns(70);

            var result = _service.GetNetworkBalance(networkId);

            Assert.Equal(100, result.Total);
            Assert.Equal(70, result.Released);
            Assert.Equal(30, result.Maturing);
            // Own-cut view must pass userId == null (network's own commission rows).
            feeModel.Verify(m => m.GetTotalBalance(networkId, null), Times.Once);
            feeModel.Verify(m => m.GetReleasedBalance(networkId, null), Times.Once);
        }

        // ---- SearchStatement: per-row status derivation ----

        private static Mock<IInvoiceFeeModel> Fee(long feeId, double amount, DateTime? withdrawalDue, DateTime? reversedAt)
        {
            var fee = new Mock<IInvoiceFeeModel>();
            fee.SetupAllProperties();
            fee.Object.FeeId = feeId;
            fee.Object.Amount = amount;
            fee.Object.PaidAt = DateTime.Today.AddDays(-30);
            fee.Object.WithdrawalDueDate = withdrawalDue;
            fee.Object.ReversedAt = reversedAt;
            // NetworkId / ProxyPayInvoiceId left null so GetStatementInfo skips all
            // external enrichment (network name, buyer/seller, product) and we test
            // the pure status derivation in isolation.
            fee.Object.NetworkId = null;
            fee.Object.ProxyPayInvoiceId = null;
            return fee;
        }

        private void SetupSearchReturns(IList<IInvoiceFeeModel> fees, int pageCount = 1)
        {
            var feeModel = SetupFeeModel();
            int pc = pageCount;
            feeModel
                .Setup(m => m.Search(
                    It.IsAny<long?>(), It.IsAny<long?>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
                    It.IsAny<int>(), out pc, It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(fees);
        }

        [Fact]
        public async Task SearchStatement_ReversedRow_IsFlaggedAndStatusReversed()
        {
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(1, 25, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: DateTime.Today).Object
            };
            SetupSearchReturns(fees);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            var row = Assert.Single(result.Statements);
            Assert.True(row.Reversed);
            Assert.Equal("reversed", row.Status);
        }

        [Fact]
        public async Task SearchStatement_MaturedNonReversedRow_StatusReleased()
        {
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(2, 10, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: null).Object
            };
            SetupSearchReturns(fees);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            var row = Assert.Single(result.Statements);
            Assert.False(row.Reversed);
            Assert.Equal("released", row.Status);
        }

        [Fact]
        public async Task SearchStatement_FutureDueRow_StatusMaturing()
        {
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(3, 30, withdrawalDue: DateTime.Today.AddDays(10), reversedAt: null).Object
            };
            SetupSearchReturns(fees);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            var row = Assert.Single(result.Statements);
            Assert.False(row.Reversed);
            Assert.Equal("maturing", row.Status);
        }

        [Fact]
        public async Task SearchStatement_NullDueRow_StatusMaturing()
        {
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(4, 30, withdrawalDue: null, reversedAt: null).Object
            };
            SetupSearchReturns(fees);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            var row = Assert.Single(result.Statements);
            Assert.Equal("maturing", row.Status);
        }

        [Fact]
        public async Task SearchStatement_ReversedTakesPrecedenceOverMaturedDueDate()
        {
            // A row can be both matured (due <= today) and reversed; reversed wins.
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(5, 15, withdrawalDue: DateTime.Today.AddDays(-5), reversedAt: DateTime.Today.AddDays(-2)).Object
            };
            SetupSearchReturns(fees);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            var row = Assert.Single(result.Statements);
            Assert.True(row.Reversed);
            Assert.Equal("reversed", row.Status);
        }

        [Fact]
        public async Task SearchStatement_MixedRows_DeriveIndependentStatuses()
        {
            var fees = new List<IInvoiceFeeModel>
            {
                Fee(1, 10, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: null).Object,   // released
                Fee(2, 20, withdrawalDue: DateTime.Today.AddDays(10), reversedAt: null).Object,   // maturing
                Fee(3, 30, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: DateTime.Today).Object // reversed
            };
            SetupSearchReturns(fees, pageCount: 1);

            var result = await _service.SearchStatement(
                new StatementSearchParam { NetworkId = 1, UserId = 7, PageNum = 1 }, "tok");

            Assert.Equal(3, result.Statements.Count);
            Assert.Equal("released", result.Statements.Single(s => s.FeeId == 1).Status);
            Assert.Equal("maturing", result.Statements.Single(s => s.FeeId == 2).Status);
            Assert.Equal("reversed", result.Statements.Single(s => s.FeeId == 3).Status);
            Assert.Equal(1, result.PageNum);
            Assert.Equal(1, result.PageCount);
        }
    }
}

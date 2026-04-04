using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Network;
using NAuth.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    public class InvoiceServiceTests
    {
        private readonly Mock<IInvoiceDomainFactory> _invoiceFactory;
        private readonly Mock<IInvoiceFeeDomainFactory> _feeFactory;
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<IUserProfileDomainFactory> _profileFactory;
        private readonly Mock<IOrderDomainFactory> _orderFactory;
        private readonly Mock<IOrderItemDomainFactory> _orderItemFactory;
        private readonly Mock<IProductDomainFactory> _productFactory;
        private readonly Mock<IOrderService> _orderService;
        private readonly Mock<INetworkService> _networkService;
        private readonly InvoiceService _sut;

        public InvoiceServiceTests()
        {
            _invoiceFactory = new Mock<IInvoiceDomainFactory>();
            _feeFactory = new Mock<IInvoiceFeeDomainFactory>();
            _userClient = new Mock<IUserClient>();
            _profileFactory = new Mock<IUserProfileDomainFactory>();
            _orderFactory = new Mock<IOrderDomainFactory>();
            _orderItemFactory = new Mock<IOrderItemDomainFactory>();
            _productFactory = new Mock<IProductDomainFactory>();
            _orderService = new Mock<IOrderService>();
            _networkService = new Mock<INetworkService>();

            _sut = new InvoiceService(
                _invoiceFactory.Object,
                _feeFactory.Object,
                _userClient.Object,
                _profileFactory.Object,
                _orderFactory.Object,
                _orderItemFactory.Object,
                _productFactory.Object,
                _orderService.Object,
                _networkService.Object
            );
        }

        private Mock<IInvoiceModel> CreateInvoiceMock(long invoiceId = 1, long orderId = 10, double price = 100.0)
        {
            var mock = new Mock<IInvoiceModel>();
            mock.SetupGet(m => m.InvoiceId).Returns(invoiceId);
            mock.SetupGet(m => m.OrderId).Returns(orderId);
            mock.SetupGet(m => m.Price).Returns(price);
            mock.SetupGet(m => m.UserId).Returns(1);
            mock.Setup(m => m.ListFees(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(new List<IInvoiceFeeModel>());
            return mock;
        }

        private Mock<IOrderModel> CreateOrderMock(long networkId = 5, long? sellerId = null)
        {
            var mock = new Mock<IOrderModel>();
            mock.SetupGet(m => m.NetworkId).Returns(networkId);
            mock.SetupGet(m => m.SellerId).Returns(sellerId);
            return mock;
        }

        private Mock<INetworkModel> CreateNetworkMock(
            NetworkPlanEnum plan = NetworkPlanEnum.Standard,
            double commission = 0)
        {
            var mock = new Mock<INetworkModel>();
            mock.SetupGet(m => m.NetworkId).Returns(5);
            mock.SetupGet(m => m.Plan).Returns(plan);
            mock.SetupGet(m => m.Commission).Returns(commission);
            return mock;
        }

        private void SetupFeeFactoryForClearAndInsert()
        {
            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            var insertFeeModel = new Mock<IInvoiceFeeModel>();
            insertFeeModel.SetupAllProperties();
            insertFeeModel.Setup(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(insertFeeModel.Object);

            // First call returns the delete model (ClearFees), subsequent calls return insert models
            _feeFactory.SetupSequence(f => f.BuildInvoiceFeeModel())
                .Returns(deleteFeeModel.Object)
                .Returns(insertFeeModel.Object)
                .Returns(insertFeeModel.Object)
                .Returns(insertFeeModel.Object);
        }

        [Fact]
        public void CalculateFee_WithFreePlan_ShouldCreatePlatformFee()
        {
            // Arrange
            var invoice = CreateInvoiceMock(price: 200.0);
            var order = CreateOrderMock();
            var network = CreateNetworkMock(plan: NetworkPlanEnum.Free, commission: 0);

            _orderService.Setup(s => s.GetById(invoice.Object.OrderId)).Returns(order.Object);
            _networkService.Setup(s => s.GetById(order.Object.NetworkId)).Returns(network.Object);

            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            var insertFeeModel = new Mock<IInvoiceFeeModel>();
            insertFeeModel.SetupAllProperties();
            insertFeeModel.Setup(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(insertFeeModel.Object);

            _feeFactory.SetupSequence(f => f.BuildInvoiceFeeModel())
                .Returns(deleteFeeModel.Object)  // ClearFees
                .Returns(insertFeeModel.Object);  // Platform fee

            // Act
            _sut.CalculateFee(invoice.Object);

            // Assert: platform fee = 200 * 0.02 = 4.0
            insertFeeModel.VerifySet(m => m.Amount = 4.0, Times.Once());
            insertFeeModel.VerifySet(m => m.InvoiceId = invoice.Object.InvoiceId, Times.Once());
            insertFeeModel.Verify(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()), Times.Once());
        }

        [Fact]
        public void CalculateFee_WithNetworkCommission_ShouldCreateNetworkFee()
        {
            // Arrange
            var invoice = CreateInvoiceMock(price: 500.0);
            var order = CreateOrderMock();
            var network = CreateNetworkMock(plan: NetworkPlanEnum.Standard, commission: 10);

            _orderService.Setup(s => s.GetById(invoice.Object.OrderId)).Returns(order.Object);
            _networkService.Setup(s => s.GetById(order.Object.NetworkId)).Returns(network.Object);

            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            var networkFeeModel = new Mock<IInvoiceFeeModel>();
            networkFeeModel.SetupAllProperties();
            networkFeeModel.Setup(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(networkFeeModel.Object);

            _feeFactory.SetupSequence(f => f.BuildInvoiceFeeModel())
                .Returns(deleteFeeModel.Object)    // ClearFees
                .Returns(networkFeeModel.Object);   // Network fee

            // Act
            _sut.CalculateFee(invoice.Object);

            // Assert: network fee = 500 * (10 / 100) = 50.0
            networkFeeModel.VerifySet(m => m.Amount = 50.0, Times.Once());
            networkFeeModel.VerifySet(m => m.NetworkId = network.Object.NetworkId, Times.Once());
            networkFeeModel.Verify(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()), Times.Once());
        }

        [Fact]
        public void CalculateFee_WithSellerCommission_ShouldCreateSellerFee()
        {
            // Arrange
            long sellerId = 42;
            var invoice = CreateInvoiceMock(price: 1000.0);
            var order = CreateOrderMock(sellerId: sellerId);
            var network = CreateNetworkMock(plan: NetworkPlanEnum.Standard, commission: 0);

            _orderService.Setup(s => s.GetById(invoice.Object.OrderId)).Returns(order.Object);
            _networkService.Setup(s => s.GetById(order.Object.NetworkId)).Returns(network.Object);

            var profileMock = new Mock<IUserProfileModel>();
            profileMock.SetupGet(p => p.Commission).Returns(5);

            var userNetworkMock = new Mock<IUserNetworkModel>();
            userNetworkMock.Setup(un => un.GetProfile(It.IsAny<IUserProfileDomainFactory>()))
                .Returns(profileMock.Object);

            _networkService.Setup(s => s.GetUserNetwork(network.Object.NetworkId, sellerId))
                .Returns(userNetworkMock.Object);

            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            var sellerFeeModel = new Mock<IInvoiceFeeModel>();
            sellerFeeModel.SetupAllProperties();
            sellerFeeModel.Setup(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(sellerFeeModel.Object);

            _feeFactory.SetupSequence(f => f.BuildInvoiceFeeModel())
                .Returns(deleteFeeModel.Object)    // ClearFees
                .Returns(sellerFeeModel.Object);    // Seller fee

            // Act
            _sut.CalculateFee(invoice.Object);

            // Assert: seller fee = 1000 * (5 / 100) = 50.0
            sellerFeeModel.VerifySet(m => m.Amount = 50.0, Times.Once());
            sellerFeeModel.VerifySet(m => m.UserId = sellerId, Times.Once());
            sellerFeeModel.Verify(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()), Times.Once());
        }

        [Fact]
        public void CalculateFee_WithAlreadyPaidFee_ShouldThrowException()
        {
            // Arrange
            var paidFee = new Mock<IInvoiceFeeModel>();
            paidFee.SetupGet(f => f.PaidAt).Returns(DateTime.UtcNow);

            var invoice = new Mock<IInvoiceModel>();
            invoice.SetupGet(m => m.InvoiceId).Returns(1);
            invoice.Setup(m => m.ListFees(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(new List<IInvoiceFeeModel> { paidFee.Object });

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.CalculateFee(invoice.Object));
            Assert.Equal("Invoice already has a commission paid", ex.Message);
        }

        [Fact]
        public void Insert_ShouldInsertAndCalculateFees()
        {
            // Arrange
            var invoice = CreateInvoiceMock(price: 300.0);
            var insertedInvoice = CreateInvoiceMock(invoiceId: 2, orderId: 10, price: 300.0);

            invoice.Setup(m => m.Insert(It.IsAny<IInvoiceDomainFactory>()))
                .Returns(insertedInvoice.Object);

            var order = CreateOrderMock();
            var network = CreateNetworkMock(plan: NetworkPlanEnum.Free, commission: 0);

            _orderService.Setup(s => s.GetById(insertedInvoice.Object.OrderId)).Returns(order.Object);
            _networkService.Setup(s => s.GetById(order.Object.NetworkId)).Returns(network.Object);

            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            var insertFeeModel = new Mock<IInvoiceFeeModel>();
            insertFeeModel.SetupAllProperties();
            insertFeeModel.Setup(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()))
                .Returns(insertFeeModel.Object);

            _feeFactory.SetupSequence(f => f.BuildInvoiceFeeModel())
                .Returns(deleteFeeModel.Object)
                .Returns(insertFeeModel.Object);

            // Act
            var result = _sut.Insert(invoice.Object);

            // Assert
            Assert.Equal(insertedInvoice.Object, result);
            invoice.Verify(m => m.Insert(_invoiceFactory.Object), Times.Once());
            insertFeeModel.Verify(m => m.Insert(It.IsAny<IInvoiceFeeDomainFactory>()), Times.Once());
        }

        [Fact]
        public void Pay_ShouldUpdateStatusAndRecalculateFees()
        {
            // Arrange
            var invoice = CreateInvoiceMock(price: 400.0);
            invoice.SetupProperty(m => m.Status);

            var updatedInvoice = CreateInvoiceMock(invoiceId: 1, orderId: 10, price: 400.0);
            invoice.Setup(m => m.Update(It.IsAny<IInvoiceDomainFactory>()))
                .Returns(updatedInvoice.Object);

            var order = CreateOrderMock();
            var network = CreateNetworkMock(plan: NetworkPlanEnum.Standard, commission: 0);

            _orderService.Setup(s => s.GetById(updatedInvoice.Object.OrderId)).Returns(order.Object);
            _networkService.Setup(s => s.GetById(order.Object.NetworkId)).Returns(network.Object);

            var deleteFeeModel = new Mock<IInvoiceFeeModel>();
            deleteFeeModel.Setup(m => m.DeleteByInvoice(It.IsAny<long>()));

            _feeFactory.Setup(f => f.BuildInvoiceFeeModel()).Returns(deleteFeeModel.Object);

            // Act
            var result = _sut.Pay(invoice.Object);

            // Assert
            Assert.Equal(updatedInvoice.Object, result);
            invoice.VerifySet(m => m.Status = InvoiceStatusEnum.Paid, Times.Once());
            invoice.Verify(m => m.Update(_invoiceFactory.Object), Times.Once());
        }

        [Fact]
        public void GetBalance_ShouldDelegateToFeeModel()
        {
            // Arrange
            long? networkId = 5;
            long? userId = 10;
            var feeModel = new Mock<IInvoiceFeeModel>();
            feeModel.Setup(m => m.GetBalance(networkId, userId)).Returns(250.50);
            _feeFactory.Setup(f => f.BuildInvoiceFeeModel()).Returns(feeModel.Object);

            // Act
            var result = _sut.GetBalance(networkId, userId);

            // Assert
            Assert.Equal(250.50, result);
            feeModel.Verify(m => m.GetBalance(networkId, userId), Times.Once());
        }

        [Fact]
        public void GetAvailableBalance_ShouldDelegateToFeeModel()
        {
            // Arrange
            long userId = 10;
            var feeModel = new Mock<IInvoiceFeeModel>();
            feeModel.Setup(m => m.GetAvailableBalance(userId)).Returns(175.25);
            _feeFactory.Setup(f => f.BuildInvoiceFeeModel()).Returns(feeModel.Object);

            // Act
            var result = _sut.GetAvailableBalance(userId);

            // Assert
            Assert.Equal(175.25, result);
            feeModel.Verify(m => m.GetAvailableBalance(userId), Times.Once());
        }

    }
}

using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Order;
using MonexUp.DTO.Payment;
using MonexUp.DTO.Subscription;
using MonexUp.Infra.Interfaces.AppServices;
using Moq;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;

namespace MonexUp.UnitTests.Services
{
    public class SubscriptionServiceTests
    {
        private readonly Mock<IOrderService> _orderService;
        private readonly Mock<IProxyPayService> _proxyPayService;
        private readonly Mock<IInvoiceService> _invoiceService;
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<INetworkDomainFactory> _networkFactory;
        private readonly Mock<IProductDomainFactory> _productFactory;
        private readonly Mock<IOrderItemDomainFactory> _orderItemFactory;
        private readonly Mock<IInvoiceDomainFactory> _invoiceFactory;
        private readonly Mock<IProductModel> _productModel;
        private readonly Mock<INetworkModel> _networkModel;
        private readonly Mock<IInvoiceModel> _invoiceModel;
        private readonly SubscriptionService _sut;

        public SubscriptionServiceTests()
        {
            _orderService = new Mock<IOrderService>();
            _proxyPayService = new Mock<IProxyPayService>();
            _invoiceService = new Mock<IInvoiceService>();
            _userClient = new Mock<IUserClient>();
            _networkFactory = new Mock<INetworkDomainFactory>();
            _productFactory = new Mock<IProductDomainFactory>();
            _orderItemFactory = new Mock<IOrderItemDomainFactory>();
            _invoiceFactory = new Mock<IInvoiceDomainFactory>();

            _productModel = new Mock<IProductModel>();
            _networkModel = new Mock<INetworkModel>();
            _invoiceModel = new Mock<IInvoiceModel>();

            _productFactory
                .Setup(f => f.BuildProductModel())
                .Returns(_productModel.Object);

            _networkFactory
                .Setup(f => f.BuildNetworkModel())
                .Returns(_networkModel.Object);

            _invoiceFactory
                .Setup(f => f.BuildInvoiceModel())
                .Returns(_invoiceModel.Object);

            _sut = new SubscriptionService(
                _orderService.Object,
                _proxyPayService.Object,
                _invoiceService.Object,
                _userClient.Object,
                _networkFactory.Object,
                _productFactory.Object,
                _orderItemFactory.Object,
                _invoiceFactory.Object);
        }

        [Fact]
        public async Task CreatePixPayment_WithProductNotFound_ShouldReturnError()
        {
            // Arrange
            _productModel
                .Setup(m => m.GetById(99, _productFactory.Object))
                .Returns((IProductModel)null!);

            // Act
            var result = await _sut.CreatePixPayment(99, 1, null, null, "doc", "token");

            // Assert
            Assert.False(result.Sucesso);
            Assert.Equal("Product not found", result.Mensagem);
        }

        [Fact]
        public async Task CreatePixPayment_WithExistingOrder_ShouldReuseOrder()
        {
            // Arrange
            long productId = 1, userId = 10;
            SetupProduct(productId, networkId: 5, price: 50.0);

            var existingOrder = new Mock<IOrderModel>();
            existingOrder.Setup(o => o.OrderId).Returns(100);
            existingOrder.Setup(o => o.UserId).Returns(userId);

            _orderService
                .Setup(s => s.Get(productId, userId, null, OrderStatusEnum.Incoming))
                .Returns(existingOrder.Object);

            SetupInvoiceAndQRCode(existingOrder.Object);

            // Act
            var result = await _sut.CreatePixPayment(productId, userId, null, null, "doc", "token");

            // Assert
            Assert.True(result.Sucesso);
            _orderService.Verify(s => s.Insert(It.IsAny<OrderInfo>()), Times.Never);
        }

        [Fact]
        public async Task CreatePixPayment_WithNoExistingOrder_ShouldCreateNewOrder()
        {
            // Arrange
            long productId = 1, userId = 10;
            SetupProduct(productId, networkId: 5, price: 50.0);

            _orderService
                .Setup(s => s.Get(productId, userId, null, OrderStatusEnum.Incoming))
                .Returns((IOrderModel)null!);

            var newOrder = new Mock<IOrderModel>();
            newOrder.Setup(o => o.OrderId).Returns(200);
            newOrder.Setup(o => o.UserId).Returns(userId);

            _orderService
                .Setup(s => s.Insert(It.IsAny<OrderInfo>()))
                .Returns(newOrder.Object);

            SetupInvoiceAndQRCode(newOrder.Object);

            // Act
            var result = await _sut.CreatePixPayment(productId, userId, null, null, "doc", "token");

            // Assert
            Assert.True(result.Sucesso);
            _orderService.Verify(s => s.Insert(It.Is<OrderInfo>(o =>
                o.NetworkId == 5 &&
                o.UserId == userId &&
                o.Status == OrderStatusEnum.Incoming &&
                o.Items.Count == 1 &&
                o.Items[0].ProductId == productId
            )), Times.Once);
        }

        [Fact]
        public async Task CreatePixPayment_WithQRCodeFailure_ShouldReturnError()
        {
            // Arrange
            long productId = 1, userId = 10;
            SetupProduct(productId, networkId: 5, price: 50.0);

            var order = new Mock<IOrderModel>();
            order.Setup(o => o.OrderId).Returns(100);
            order.Setup(o => o.UserId).Returns(userId);

            _orderService
                .Setup(s => s.Get(productId, userId, null, OrderStatusEnum.Incoming))
                .Returns(order.Object);

            _invoiceService
                .Setup(s => s.Insert(It.IsAny<IInvoiceModel>()))
                .Returns(_invoiceModel.Object);

            var user = new UserInfo { Name = "User", Email = "user@test.com" };
            _userClient
                .Setup(c => c.GetByIdAsync(userId, "token"))
                .ReturnsAsync(user);

            _proxyPayService
                .Setup(s => s.CreateQRCode(user, It.IsAny<IProductModel>(), It.IsAny<INetworkModel>(), It.IsAny<UserInfo>(), "doc"))
                .ReturnsAsync(new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = "PIX service unavailable"
                });

            // Act
            var result = await _sut.CreatePixPayment(productId, userId, null, null, "doc", "token");

            // Assert
            Assert.False(result.Sucesso);
            Assert.Equal("PIX service unavailable", result.Mensagem);
        }

        [Fact]
        public async Task CreatePixPayment_WithSuccess_ShouldReturnPixPaymentResult()
        {
            // Arrange
            long productId = 1, userId = 10;
            SetupProduct(productId, networkId: 5, price: 50.0);

            var order = new Mock<IOrderModel>();
            order.Setup(o => o.OrderId).Returns(100);
            order.Setup(o => o.UserId).Returns(userId);

            _orderService
                .Setup(s => s.Get(productId, userId, null, OrderStatusEnum.Incoming))
                .Returns(order.Object);

            _invoiceService
                .Setup(s => s.Insert(It.IsAny<IInvoiceModel>()))
                .Returns(_invoiceModel.Object);

            var user = new UserInfo { Name = "User", Email = "user@test.com" };
            _userClient
                .Setup(c => c.GetByIdAsync(userId, "token"))
                .ReturnsAsync(user);

            var qrResponse = new ProxyPayQRCodeResponse
            {
                Sucesso = true,
                InvoiceId = "inv-abc",
                BrCode = "00020126...",
                BrCodeBase64 = "base64qr",
                ExpiredAt = new DateTime(2026, 12, 31)
            };

            _proxyPayService
                .Setup(s => s.CreateQRCode(user, It.IsAny<IProductModel>(), It.IsAny<INetworkModel>(), It.IsAny<UserInfo>(), "doc"))
                .ReturnsAsync(qrResponse);

            var orderInfo = new OrderInfo { OrderId = 100 };
            _orderService
                .Setup(s => s.GetOrderInfo(order.Object, "token"))
                .ReturnsAsync(orderInfo);

            // Act
            var result = await _sut.CreatePixPayment(productId, userId, null, null, "doc", "token");

            // Assert
            Assert.True(result.Sucesso);
            Assert.NotNull(result.QrCode);
            Assert.Equal("inv-abc", result.QrCode.InvoiceId);
            Assert.Equal("00020126...", result.QrCode.BrCode);
            Assert.Equal("base64qr", result.QrCode.BrCodeBase64);
            Assert.Equal(new DateTime(2026, 12, 31), result.QrCode.ExpiredAt);
            Assert.Same(orderInfo, result.Order);
        }

        [Fact]
        public async Task CreateSubscription_ShouldThrowNotSupportedException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NotSupportedException>(
                () => _sut.CreateSubscription(1, 1, null, null, "token"));
        }

        // --- Helper methods ---

        private void SetupProduct(long productId, long networkId, double price)
        {
            var product = new Mock<IProductModel>();
            product.Setup(p => p.ProductId).Returns(productId);
            product.Setup(p => p.NetworkId).Returns(networkId);
            product.Setup(p => p.Name).Returns("Test Product");
            product.Setup(p => p.Price).Returns(price);

            _productModel
                .Setup(m => m.GetById(productId, _productFactory.Object))
                .Returns(product.Object);
        }

        private void SetupInvoiceAndQRCode(IOrderModel order)
        {
            _invoiceService
                .Setup(s => s.Insert(It.IsAny<IInvoiceModel>()))
                .Returns(_invoiceModel.Object);

            var user = new UserInfo { Name = "User", Email = "user@test.com" };
            _userClient
                .Setup(c => c.GetByIdAsync(order.UserId, "token"))
                .ReturnsAsync(user);

            _proxyPayService
                .Setup(s => s.CreateQRCode(user, It.IsAny<IProductModel>(), It.IsAny<INetworkModel>(), It.IsAny<UserInfo>(), "doc"))
                .ReturnsAsync(new ProxyPayQRCodeResponse
                {
                    Sucesso = true,
                    InvoiceId = "inv-001",
                    BrCode = "brcode",
                    BrCodeBase64 = "base64"
                });

            _orderService
                .Setup(s => s.GetOrderInfo(order, "token"))
                .ReturnsAsync(new OrderInfo { OrderId = order.OrderId });
        }
    }
}

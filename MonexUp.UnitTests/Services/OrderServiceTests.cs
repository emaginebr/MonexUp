using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using NAuth.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderDomainFactory> _orderFactory;
        private readonly Mock<IOrderItemDomainFactory> _itemFactory;
        private readonly Mock<IProductService> _productService;
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<IProductDomainFactory> _productFactory;
        private readonly OrderService _sut;

        public OrderServiceTests()
        {
            _orderFactory = new Mock<IOrderDomainFactory>();
            _itemFactory = new Mock<IOrderItemDomainFactory>();
            _productService = new Mock<IProductService>();
            _userClient = new Mock<IUserClient>();
            _productFactory = new Mock<IProductDomainFactory>();

            _sut = new OrderService(
                _orderFactory.Object,
                _itemFactory.Object,
                _productService.Object,
                _userClient.Object,
                _productFactory.Object
            );
        }

        private OrderInfo CreateValidOrderInfo(
            long networkId = 5,
            long userId = 10,
            long? sellerId = null,
            List<OrderItemInfo>? items = null)
        {
            return new OrderInfo
            {
                NetworkId = networkId,
                UserId = userId,
                SellerId = sellerId,
                Status = OrderStatusEnum.Incoming,
                Items = items ?? new List<OrderItemInfo>
                {
                    new OrderItemInfo { ProductId = 1, Quantity = 2 },
                    new OrderItemInfo { ProductId = 2, Quantity = 1 }
                }
            };
        }

        [Fact]
        public void Insert_WithValidData_ShouldCreateOrderAndItems()
        {
            // Arrange
            var orderInfo = CreateValidOrderInfo();

            var mockOrderModel = new Mock<IOrderModel>();
            mockOrderModel.SetupAllProperties();
            mockOrderModel.Setup(m => m.Insert(It.IsAny<IOrderDomainFactory>()))
                .Returns(mockOrderModel.Object);
            mockOrderModel.SetupGet(m => m.OrderId).Returns(1);

            _orderFactory.Setup(f => f.BuildOrderModel()).Returns(mockOrderModel.Object);

            var mockItemModel = new Mock<IOrderItemModel>();
            mockItemModel.SetupAllProperties();
            mockItemModel.Setup(m => m.Insert(It.IsAny<IOrderItemDomainFactory>()))
                .Returns(mockItemModel.Object);

            _itemFactory.Setup(f => f.BuildOrderItemModel()).Returns(mockItemModel.Object);

            // Act
            var result = _sut.Insert(orderInfo);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(mockOrderModel.Object, result);
            mockOrderModel.Verify(m => m.Insert(_orderFactory.Object), Times.Once());
            // Two items in the order
            mockItemModel.Verify(m => m.Insert(_itemFactory.Object), Times.Exactly(2));
        }

        [Fact]
        public void Insert_WithZeroNetworkId_ShouldThrow()
        {
            // Arrange
            var orderInfo = CreateValidOrderInfo(networkId: 0);

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.Insert(orderInfo));
            Assert.Equal("Network is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithZeroUserId_ShouldThrow()
        {
            // Arrange
            var orderInfo = CreateValidOrderInfo(userId: 0);

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.Insert(orderInfo));
            Assert.Equal("User is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithEmptyItems_ShouldThrow()
        {
            // Arrange
            var orderInfo = CreateValidOrderInfo(items: new List<OrderItemInfo>());

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.Insert(orderInfo));
            Assert.Equal("Order is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithNullItems_ShouldThrow()
        {
            // Arrange
            var orderInfo = new OrderInfo
            {
                NetworkId = 5,
                UserId = 10,
                Status = OrderStatusEnum.Incoming,
                Items = null
            };

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.Insert(orderInfo));
            Assert.Equal("Order is empty", ex.Message);
        }

        [Fact]
        public void Update_WithValidOrderId_ShouldUpdateStatus()
        {
            // Arrange
            var orderInfo = new OrderInfo
            {
                OrderId = 1,
                Status = OrderStatusEnum.Active
            };

            var existingModel = new Mock<IOrderModel>();
            existingModel.SetupAllProperties();
            existingModel.Setup(m => m.GetById(1, It.IsAny<IOrderDomainFactory>()))
                .Returns(existingModel.Object);
            existingModel.Setup(m => m.Update(It.IsAny<IOrderDomainFactory>()))
                .Returns(existingModel.Object);

            _orderFactory.Setup(f => f.BuildOrderModel()).Returns(existingModel.Object);

            // Act
            var result = _sut.Update(orderInfo);

            // Assert
            Assert.NotNull(result);
            existingModel.VerifySet(m => m.Status = OrderStatusEnum.Active, Times.Once());
            existingModel.Verify(m => m.Update(_orderFactory.Object), Times.Once());
        }

        [Fact]
        public void Update_WithZeroOrderId_ShouldThrow()
        {
            // Arrange
            var orderInfo = new OrderInfo
            {
                OrderId = 0,
                Status = OrderStatusEnum.Active
            };

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _sut.Update(orderInfo));
            Assert.Equal("Order ID is empty", ex.Message);
        }

        [Fact]
        public void GetById_ShouldDelegateToFactory()
        {
            // Arrange
            long orderId = 42;
            var mockModel = new Mock<IOrderModel>();
            mockModel.Setup(m => m.GetById(orderId, It.IsAny<IOrderDomainFactory>()))
                .Returns(mockModel.Object);

            _orderFactory.Setup(f => f.BuildOrderModel()).Returns(mockModel.Object);

            // Act
            var result = _sut.GetById(orderId);

            // Assert
            Assert.Equal(mockModel.Object, result);
            mockModel.Verify(m => m.GetById(orderId, _orderFactory.Object), Times.Once());
        }

        [Fact]
        public void List_ShouldDelegateToFactory()
        {
            // Arrange
            long networkId = 5;
            long userId = 10;
            OrderStatusEnum? status = OrderStatusEnum.Active;

            var item1 = new Mock<IOrderModel>().Object;
            var item2 = new Mock<IOrderModel>().Object;
            var expectedList = new List<IOrderModel> { item1, item2 };

            var mockModel = new Mock<IOrderModel>();
            mockModel.Setup(m => m.List(networkId, userId, status, It.IsAny<IOrderDomainFactory>()))
                .Returns(expectedList);

            _orderFactory.Setup(f => f.BuildOrderModel()).Returns(mockModel.Object);

            // Act
            var result = _sut.List(networkId, userId, status);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(expectedList, result);
            mockModel.Verify(m => m.List(networkId, userId, status, _orderFactory.Object), Times.Once());
        }
    }
}

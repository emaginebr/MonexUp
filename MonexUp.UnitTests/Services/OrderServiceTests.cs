using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Order;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.ACL.Interfaces;
using Xunit;

namespace MonexUp.UnitTests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderDomainFactory> _orderFactory;
        private readonly Mock<IOrderItemDomainFactory> _itemFactory;
        private readonly Mock<ILofnProductClient> _lofnProductClient;
        private readonly Mock<IUserClient> _userClient;
        private readonly OrderService _service;

        public OrderServiceTests()
        {
            _orderFactory = new Mock<IOrderDomainFactory>();
            _itemFactory = new Mock<IOrderItemDomainFactory>();
            _lofnProductClient = new Mock<ILofnProductClient>();
            _userClient = new Mock<IUserClient>();

            _service = new OrderService(
                _orderFactory.Object,
                _itemFactory.Object,
                _lofnProductClient.Object,
                _userClient.Object);
        }

        private Mock<IOrderModel> SetupOrderLookup(long invoiceId, IOrderModel resolved)
        {
            var builder = new Mock<IOrderModel>();
            builder
                .Setup(m => m.GetByProxyPayInvoiceId(invoiceId, _orderFactory.Object))
                .Returns(resolved);
            _orderFactory.Setup(f => f.BuildOrderModel()).Returns(builder.Object);
            return builder;
        }

        [Fact]
        public void MarkPaidByInvoiceId_AdvancesIncomingToActive()
        {
            var order = new Mock<IOrderModel>();
            order.SetupAllProperties();
            order.Object.Status = OrderStatusEnum.Incoming;
            order.Setup(m => m.Update(_orderFactory.Object)).Returns(order.Object);
            SetupOrderLookup(7, order.Object);

            var result = _service.MarkPaidByInvoiceId(7);

            Assert.NotNull(result);
            Assert.Equal(OrderStatusEnum.Active, result.Status);
            order.Verify(m => m.Update(_orderFactory.Object), Times.Once);
        }

        [Fact]
        public void MarkPaidByInvoiceId_IsNoOpWhenAlreadyActive()
        {
            var order = new Mock<IOrderModel>();
            order.SetupAllProperties();
            order.Object.Status = OrderStatusEnum.Active;
            SetupOrderLookup(7, order.Object);

            var result = _service.MarkPaidByInvoiceId(7);

            Assert.NotNull(result);
            Assert.Equal(OrderStatusEnum.Active, result.Status);
            order.Verify(m => m.Update(It.IsAny<IOrderDomainFactory>()), Times.Never);
        }

        [Fact]
        public void MarkPaidByInvoiceId_ReturnsNullWhenNoMatchingOrder()
        {
            SetupOrderLookup(999, null);

            var result = _service.MarkPaidByInvoiceId(999);

            Assert.Null(result);
        }
    }
}

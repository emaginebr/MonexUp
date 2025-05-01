using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Order;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderDomainFactory _orderFactory;

        public OrderService(IOrderDomainFactory orderFactory)
        {
            _orderFactory = orderFactory;
        }

        public IOrderModel Insert(OrderInfo order)
        {
            if (!(order.ProductId > 0))
            {
                throw new Exception("Product is empty");
            }
            if (!(order.UserId > 0))
            {
                throw new Exception("User is empty");
            }

            var model = _orderFactory.BuildOrderModel();
            model.ProductId = order.ProductId;
            model.UserId = order.UserId;
            model.Status = order.Status;

            return model.Insert(_orderFactory);
        }

        public IOrderModel Update(OrderInfo order)
        {
            if (!(order.OrderId > 0))
            {
                throw new Exception("Order ID is empty");
            }
            var model = _orderFactory.BuildOrderModel().GetById(order.OrderId, _orderFactory);

            model.Status = order.Status;

            return model.Update(_orderFactory);
        }

        public IOrderModel GetById(long orderId)
        {
            return _orderFactory.BuildOrderModel().GetById(orderId, _orderFactory);
        }

        public IOrderModel Get(long productId, long userId, OrderStatusEnum status)
        {
            return _orderFactory.BuildOrderModel().Get(productId, userId, status, _orderFactory);
        }

        public OrderInfo GetOrderInfo(IOrderModel order)
        {
            return new OrderInfo
            {
                OrderId = order.OrderId,
                ProductId = order.ProductId,
                UserId = order.UserId,
                Status = order.Status
            };
        }

        public IList<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status)
        {
            return _orderFactory.BuildOrderModel().List(networkId, userId, status, _orderFactory).ToList();
        }

        public IOrderModel GetByStripeId(string stripeId)
        {
            return _orderFactory.BuildOrderModel().GetByStripeId(stripeId, _orderFactory);
        }
    }
}

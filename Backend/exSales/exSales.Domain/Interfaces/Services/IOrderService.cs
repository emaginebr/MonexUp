using exSales.Domain.Interfaces.Models;
using exSales.DTO.Order;
using exSales.DTO.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IOrderService
    {
        IList<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status);
        IOrderModel GetById(long orderId);
        IOrderModel Get(long productId, long userId, OrderStatusEnum status);
        IOrderModel GetByStripeId(string stripeId);
        OrderInfo GetOrderInfo(IOrderModel order);
        IOrderModel Insert(OrderInfo order);
        IOrderModel Update(OrderInfo order);
    }
}

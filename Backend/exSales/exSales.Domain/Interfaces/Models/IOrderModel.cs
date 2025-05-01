using exSales.Domain.Interfaces.Factory;
using exSales.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Models
{
    public interface IOrderModel
    {
        long OrderId { get; set; }
        long ProductId { get; set; }
        long UserId { get; set; }
        OrderStatusEnum Status { get; set; }
        string StripeId { get; set; }

        IUserModel GetUser(IUserDomainFactory factory);
        IProductModel GetProduct(IProductDomainFactory factory);

        IEnumerable<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status, IOrderDomainFactory factory);
        IOrderModel GetById(long id, IOrderDomainFactory factory);
        IOrderModel Get(long productId, long userId, OrderStatusEnum status, IOrderDomainFactory factory);
        IOrderModel GetByStripeId(string stripeId, IOrderDomainFactory factory);
        IOrderModel Insert(IOrderDomainFactory factory);
        IOrderModel Update(IOrderDomainFactory factory);
    }
}

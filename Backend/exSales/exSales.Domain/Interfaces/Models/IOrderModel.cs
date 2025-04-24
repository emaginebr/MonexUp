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

        IEnumerable<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status, IOrderDomainFactory factory);
        IOrderModel GetById(long id, IOrderDomainFactory factory);
        IOrderModel Insert(IOrderDomainFactory factory);
        IOrderModel Update(IOrderDomainFactory factory);
    }
}

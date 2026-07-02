using MonexUp.Domain.Interfaces.Factory;
using System.Collections.Generic;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IOrderItemModel
    {
        long ItemId { get; set; }
        long OrderId { get; set; }
        long ProductId { get; set; }
        int Quantity { get; set; }
        decimal? Amount { get; set; }
        IList<IOrderItemModel> ListItems(long orderId, IOrderItemDomainFactory factory);
        IOrderItemModel Insert(IOrderItemDomainFactory factory);
    }
}

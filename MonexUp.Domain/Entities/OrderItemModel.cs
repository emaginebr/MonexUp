using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System.Collections.Generic;
using System.Linq;

namespace MonexUp.Domain.Impl.Models
{
    public class OrderItemModel : IOrderItemModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory> _repositoryItem;

        public OrderItemModel(
            IUnitOfWork unitOfWork,
            IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory> repositoryItem
        )
        {
            _unitOfWork = unitOfWork;
            _repositoryItem = repositoryItem;
        }

        public long ItemId { get; set; }
        public long OrderId { get; set; }
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal? Amount { get; set; }

        public IOrderItemModel Insert(IOrderItemDomainFactory factory)
        {
            return _repositoryItem.Insert(this, factory);
        }

        public IList<IOrderItemModel> ListItems(long orderId, IOrderItemDomainFactory factory)
        {
            return _repositoryItem.ListByOrder(orderId, factory).ToList();
        }
    }
}

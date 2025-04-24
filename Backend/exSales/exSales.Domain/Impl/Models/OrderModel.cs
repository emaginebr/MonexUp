using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class OrderModel : IOrderModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderRepository<IOrderModel, IOrderDomainFactory> _repositoryOrder;

        public OrderModel(IUnitOfWork unitOfWork, IOrderRepository<IOrderModel, IOrderDomainFactory> repositoryOrder)
        {
            _unitOfWork = unitOfWork;
            _repositoryOrder = repositoryOrder;
        }

        public long OrderId { get; set; }
        public long ProductId { get; set; }
        public long UserId { get; set; }
        public OrderStatusEnum Status { get; set; }

        public IOrderModel Insert(IOrderDomainFactory factory)
        {
            return _repositoryOrder.Insert(this, factory);
        }

        public IOrderModel Update(IOrderDomainFactory factory)
        {
            return _repositoryOrder.Update(this, factory);
        }

        public IEnumerable<IOrderModel> List(long networkId, long userId, OrderStatusEnum? status, IOrderDomainFactory factory)
        {
            return _repositoryOrder.List(networkId, userId, (status.HasValue ? (int) status : 0), factory);
        }

        public IOrderModel GetById(long id, IOrderDomainFactory factory)
        {
            return _repositoryOrder.GetById(id, factory);
        }
    }
}

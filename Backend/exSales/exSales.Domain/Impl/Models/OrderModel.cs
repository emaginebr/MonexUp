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

        public OrderModel(
            IUnitOfWork unitOfWork, 
            IOrderRepository<IOrderModel, IOrderDomainFactory> repositoryOrder
        )
        {
            _unitOfWork = unitOfWork;
            _repositoryOrder = repositoryOrder;
        }

        public long OrderId { get; set; }
        public long ProductId { get; set; }
        public long UserId { get; set; }
        public OrderStatusEnum Status { get; set; }
        public string StripeId { get; set; }

        public IUserModel GetUser(IUserDomainFactory factory)
        {
            if (UserId > 0)
            {
                return factory.BuildUserModel().GetById(UserId, factory);
            }
            else
            {
                return null;
            }
        }

        public IProductModel GetProduct(IProductDomainFactory factory)
        {
            if (ProductId > 0)
            {
                return factory.BuildProductModel().GetById(ProductId, factory);
            }
            else
            {
                return null;
            }
        }

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

        public IOrderModel Get(long productId, long userId, OrderStatusEnum status, IOrderDomainFactory factory)
        {
            return _repositoryOrder.Get(productId, userId, (int)status, factory);
        }

        public IOrderModel GetByStripeId(string stripeId, IOrderDomainFactory factory)
        {
            return _repositoryOrder.GetByStripeId(stripeId, factory);
        }
    }
}

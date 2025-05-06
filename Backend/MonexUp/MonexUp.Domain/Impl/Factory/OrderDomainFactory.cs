using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MonexUp.Domain.Impl.Models;

namespace MonexUp.Domain.Impl.Factory
{
    public class OrderDomainFactory : IOrderDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderRepository<IOrderModel, IOrderDomainFactory> _repositoryOrder;

        public OrderDomainFactory(IUnitOfWork unitOfWork, IOrderRepository<IOrderModel, IOrderDomainFactory> repositoryOrder)
        {
            _unitOfWork = unitOfWork;
            _repositoryOrder = repositoryOrder;
        }

        public IOrderModel BuildOrderModel()
        {
            return new OrderModel(_unitOfWork, _repositoryOrder);
        }
    }
}

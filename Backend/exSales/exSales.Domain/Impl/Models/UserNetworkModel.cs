using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class UserNetworkModel : IUserNetworkModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory> _repositoryNetwork;

        public UserNetworkModel(IUnitOfWork unitOfWork, IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory> repositoryNetwork)
        {
            _unitOfWork = unitOfWork;
            _repositoryNetwork = repositoryNetwork;
        }

        public long UserId { get; set; }
        public long NetworkId { get; set; }
        public long? ProfileId { get; set; }
        public UserRoleEnum Role { get; set; }
        public UserNetworkStatusEnum Status { get; set; }
        public long? ReferrerId { get; set; }

        public IUserNetworkModel Insert(IUserNetworkDomainFactory factory)
        {
            return _repositoryNetwork.Insert(this, factory);
        }
        public IUserNetworkModel Update(IUserNetworkDomainFactory factory)
        {
            return _repositoryNetwork.Update(this, factory);
        }
        public IEnumerable<IUserNetworkModel> ListByUser(long userId, IUserNetworkDomainFactory factory)
        {
            return _repositoryNetwork.ListByUser(userId, factory);
        }

        public IUserNetworkModel Get(long networkId, long userId, IUserNetworkDomainFactory factory)
        {
            return _repositoryNetwork.Get(networkId, userId, factory);
        }

        public int GetQtdyUserByNetwork(long networkId)
        {
            return _repositoryNetwork.GetQtdyUserByNetwork(networkId);
        }
    }
}

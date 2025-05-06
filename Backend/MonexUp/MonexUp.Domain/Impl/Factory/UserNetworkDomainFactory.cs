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
    public class UserNetworkDomainFactory : IUserNetworkDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory> _repositoryNetwork;

        public UserNetworkDomainFactory(IUnitOfWork unitOfWork, IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory> repositoryNetwork)
        {
            _unitOfWork = unitOfWork;
            _repositoryNetwork = repositoryNetwork;
        }

        public IUserNetworkModel BuildUserNetworkModel()
        {
            return new UserNetworkModel(_unitOfWork, _repositoryNetwork);
        }
    }
}

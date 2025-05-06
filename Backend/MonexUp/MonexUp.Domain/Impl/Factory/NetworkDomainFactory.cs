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
    public class NetworkDomainFactory : INetworkDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INetworkRepository<INetworkModel, INetworkDomainFactory> _repositoryNetwork;

        public NetworkDomainFactory(IUnitOfWork unitOfWork, INetworkRepository<INetworkModel, INetworkDomainFactory> repositoryNetwork)
        {
            _unitOfWork = unitOfWork;
            _repositoryNetwork = repositoryNetwork;
        }

        public INetworkModel BuildNetworkModel()
        {
            return new NetworkModel(_unitOfWork, _repositoryNetwork);
        }
    }
}

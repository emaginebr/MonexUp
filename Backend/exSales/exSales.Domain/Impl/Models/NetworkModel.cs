using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Network;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class NetworkModel : INetworkModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INetworkRepository<INetworkModel, INetworkDomainFactory> _repositoryNetwork;

        public NetworkModel(IUnitOfWork unitOfWork, INetworkRepository<INetworkModel, INetworkDomainFactory> repositoryNetwork)
        {
            _unitOfWork = unitOfWork;
            _repositoryNetwork = repositoryNetwork;
        }

        public long NetworkId { get; set; }
        public string Slug { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public double Commission { get; set; }
        public double WithdrawalMin { get; set; }
        public int WithdrawalPeriod { get; set; }
        public NetworkPlanEnum Plan { get; set; }
        public NetworkStatusEnum Status { get; set; }

        public INetworkModel Insert(INetworkDomainFactory factory)
        {
            return _repositoryNetwork.Insert(this, factory);
        }

        public INetworkModel Update(INetworkDomainFactory factory)
        {
            return _repositoryNetwork.Update(this, factory);
        }

        public IEnumerable<INetworkModel> ListByStatus(NetworkStatusEnum status, INetworkDomainFactory factory)
        {
            return _repositoryNetwork.ListByStatus((int)status, factory);
        }

        public INetworkModel GetById(long id, INetworkDomainFactory factory)
        {
            return _repositoryNetwork.GetById(id, factory);
        }

        public bool ExistSlug(long networkId, string slug)
        {
            return _repositoryNetwork.ExistSlug(networkId, slug);
        }

        public INetworkModel GetByEmail(string email, INetworkDomainFactory factory)
        {
            return _repositoryNetwork.GetByEmail(email, factory);

        }

        public INetworkModel GetByName(string name, INetworkDomainFactory factory)
        {
            return _repositoryNetwork.GetByName(name, factory);
        }

        public int MaxQtdyUserByNetwork() {
            int max = 0;
            switch (Plan)
            {
                case NetworkPlanEnum.Free:
                    max = 15;
                    break;
                default:
                    max = 0;
                    break;
            }
            return max;
        }
    }
}

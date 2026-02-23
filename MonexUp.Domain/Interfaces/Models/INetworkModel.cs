using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Network;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface INetworkModel
    {
        long NetworkId { get; set; }
        string Slug { get; set; }
        string Image {  get; set; }
        string Name { get; set; }

        string Email { get; set; }

        double Commission { get; set; }

        double WithdrawalMin { get; set; }

        int WithdrawalPeriod { get; set; }
        NetworkPlanEnum Plan { get; set; }

        NetworkStatusEnum Status { get; set; }

        IEnumerable<INetworkModel> ListByStatus(NetworkStatusEnum status, INetworkDomainFactory factory);
        INetworkModel GetById(long id, INetworkDomainFactory factory);
        INetworkModel GetBySlug(string slug, INetworkDomainFactory factory);
        INetworkModel Insert(INetworkDomainFactory factory);
        INetworkModel Update(INetworkDomainFactory factory);
        bool ExistSlug(long networkId, string slug);
        INetworkModel GetByEmail(string email, INetworkDomainFactory factory);
        INetworkModel GetByName(string name, INetworkDomainFactory factory);
        int MaxQtdyUserByNetwork();
    }
}

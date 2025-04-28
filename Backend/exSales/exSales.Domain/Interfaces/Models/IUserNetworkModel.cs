using exSales.Domain.Interfaces.Factory;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Models
{
    public interface IUserNetworkModel
    {
        long UserId { get; set; }

        long NetworkId { get; set; }

        long? ProfileId { get; set; }

        UserRoleEnum Role { get; set; }

        UserNetworkStatusEnum Status { get; set; }

        long? ReferrerId { get; set; }

        IEnumerable<IUserNetworkModel> ListByUser(long userId, IUserNetworkDomainFactory factory);
        IEnumerable<IUserNetworkModel> Search(long networkId, string keyword, long? profileId, int pageNum, out int pageCount, IUserNetworkDomainFactory factory);
        IUserNetworkModel Get(long networkId, long userId, IUserNetworkDomainFactory factory);
        int GetQtdyUserByNetwork(long networkId);
        IUserNetworkModel Insert(IUserNetworkDomainFactory factory);
        IUserNetworkModel Update(IUserNetworkDomainFactory factory);
    }
}

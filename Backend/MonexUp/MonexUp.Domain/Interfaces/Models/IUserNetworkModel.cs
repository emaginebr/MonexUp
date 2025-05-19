using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IUserNetworkModel
    {
        long UserId { get; set; }

        long NetworkId { get; set; }

        long? ProfileId { get; set; }

        UserRoleEnum Role { get; set; }

        UserNetworkStatusEnum Status { get; set; }

        long? ReferrerId { get; set; }

        IUserModel GetUser(IUserDomainFactory factory);
        INetworkModel GetNetwork(INetworkDomainFactory factory);
        IUserProfileModel GetProfile(IUserProfileDomainFactory factory);

        IEnumerable<IUserNetworkModel> ListByUser(long userId, IUserNetworkDomainFactory factory);
        IEnumerable<IUserNetworkModel> ListByNetwork(long networkId, IUserNetworkDomainFactory factory);
        IEnumerable<IUserNetworkModel> Search(long networkId, string keyword, long? profileId, int pageNum, out int pageCount, IUserNetworkDomainFactory factory);
        IUserNetworkModel Get(long networkId, long userId, IUserNetworkDomainFactory factory);
        int GetQtdyUserByNetwork(long networkId);
        IUserNetworkModel Insert(IUserNetworkDomainFactory factory);
        IUserNetworkModel Update(IUserNetworkDomainFactory factory);
        void Promote(long networkId, long userId);
        void Demote(long networkId, long userId);
    }
}

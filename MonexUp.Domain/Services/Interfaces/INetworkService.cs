using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface INetworkService
    {
        IList<INetworkModel> ListByStatus(NetworkStatusEnum status);
        INetworkModel GetById(long networkId);
        INetworkModel GetBySlug(string slug);
        IUserNetworkModel GetUserNetwork(long networkId, long userId);
        Task<UserNetworkInfo> GetUserNetworkInfo(IUserNetworkModel model, string token);
        Task<NetworkInfo> GetNetworkInfo(INetworkModel model);
        INetworkModel Insert(NetworkInsertInfo network, long userId);
        Task<INetworkModel> Update(NetworkInfo network, long userId, string token);
        void RequestAccess(long networkId, long userId, long? referrerId);
        Task<InviteResultInfo> InviteByEmail(long networkId, string email, long inviterUserId, string token);
        Task JoinFromInvite(long joinerUserId, string inviteToken);
        Task<InviteDetailInfo> GetInviteDetail(long callerUserId, string inviteToken, string token);
        Task AcceptInvite(long callerUserId, string inviteToken);
        Task DeclineInvite(long callerUserId, string inviteToken);
        Task ChangeStatus(long networkId, long userId, UserNetworkStatusEnum status, long managerId, string token);
        Task<bool> Promote(long networkId, long userId, long manegerId, string token);
        Task<bool> Demote(long networkId, long userId, long manegerId, string token);
        IList<IUserNetworkModel> ListByUser(long userId);
        IList<IUserNetworkModel> ListByNetwork(long networkId, bool includeAllStatuses);
        Task<HierarchyInfo> BuildHierarchy(long networkId, long userId, string token);

    }
}

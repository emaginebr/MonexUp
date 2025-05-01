using exSales.Domain.Interfaces.Models;
using exSales.DTO.Network;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface INetworkService
    {
        IList<INetworkModel> ListByStatus(NetworkStatusEnum status);
        INetworkModel GetById(long networkId);
        INetworkModel GetBySlug(string slug);
        IUserNetworkModel GetUserNetwork(long networkId, long userId);
        UserNetworkInfo GetUserNetworkInfo(IUserNetworkModel model);
        NetworkInfo GetNetworkInfo(INetworkModel model);
        INetworkModel Insert(NetworkInsertInfo network, long userId);
        INetworkModel Update(NetworkInfo network, long userId);
        void RequestAccess(long networkId, long userId, long? referrerId);
        void ChangeStatus(long networkId, long userId, UserNetworkStatusEnum status, long managerId);
        IList<IUserNetworkModel> ListByUser(long userId);

    }
}

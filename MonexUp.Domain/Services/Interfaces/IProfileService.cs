using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProfileService
    {
        IList<IUserProfileModel> ListByNetwork(long networkId);
        IUserProfileModel GetById(long profileId);
        UserProfileInfo GetUserProfileInfo(IUserProfileModel profile);
        Task<IUserProfileModel> Insert(UserProfileInfo profile, long userId, string token);
        Task<IUserProfileModel> Update(UserProfileInfo profile, long userId, string token);
        Task Delete(long profileId, long userId, string token);
    }
}

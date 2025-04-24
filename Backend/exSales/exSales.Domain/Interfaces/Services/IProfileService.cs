using exSales.Domain.Interfaces.Models;
using exSales.DTO.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IProfileService
    {
        IList<IUserProfileModel> ListByNetwork(long networkId);
        IUserProfileModel GetById(long profileId);
        UserProfileInfo GetUserProfileInfo(IUserProfileModel profile);
        IUserProfileModel Insert(UserProfileInfo profile, long userId);
        IUserProfileModel Update(UserProfileInfo profile, long userId);
        void Delete(long profileId, long userId);
    }
}

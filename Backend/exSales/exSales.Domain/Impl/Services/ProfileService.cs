using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace exSales.Domain.Impl.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUserDomainFactory _userFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserProfileDomainFactory _profileFactory;

        public ProfileService(IUserDomainFactory userFactory, IUserNetworkDomainFactory userNetworFactory, IUserProfileDomainFactory profileFactory)
        {
            _userFactory = userFactory;
            _userNetworkFactory = userNetworFactory;
            _profileFactory = profileFactory;
        }

        private void ValidateAccess(long networkId, long userId)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);

            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = _userFactory.BuildUserModel().GetById(userId, _userFactory);
                if (user == null)
                {
                    throw new Exception("User not found");
                }
                if (!user.IsAdmin)
                {
                    throw new Exception("Your dont have access to this network");
                }
            }
        }

        public IUserProfileModel Insert(UserProfileInfo profile, long userId)
        {
            ValidateAccess(profile.NetworkId, userId);

            if (string.IsNullOrEmpty(profile.Name))
            {
                throw new Exception("Name is empty");
            }

            var model = _profileFactory.BuildUserProfileModel();

            model.NetworkId = profile.NetworkId;
            model.Name = profile.Name;
            model.Commission = profile.Commission;
            model.Level = profile.Level;

            return model.Insert(_profileFactory);
        }

        public IUserProfileModel Update(UserProfileInfo profile, long userId)
        {
            ValidateAccess(profile.NetworkId, userId);

            if (string.IsNullOrEmpty(profile.Name))
            {
                throw new Exception("Name is empty");
            }

            var model = _profileFactory.BuildUserProfileModel();

            model.ProfileId = profile.ProfileId;
            model.NetworkId = profile.NetworkId;
            model.Name = profile.Name;
            model.Commission = profile.Commission;
            model.Level = profile.Level;

            return model.Update(_profileFactory);
        }

        public void Delete(long profileId, long userId)
        {
            var model = _profileFactory.BuildUserProfileModel().GetById(profileId, _profileFactory);

            ValidateAccess(model.NetworkId, userId);

            int qtdeUser = model.GetUsersCount(model.NetworkId, profileId);

            if (qtdeUser > 0)
            {
                throw new Exception(string.Format("Cannot delete, has {0} user(s) linked", qtdeUser));
            }

            model.Delete(profileId);
        }

        public IUserProfileModel GetById(long profileId)
        {
            return _profileFactory.BuildUserProfileModel().GetById(profileId, _profileFactory);
        }

        public UserProfileInfo GetUserProfileInfo(IUserProfileModel profile)
        {
            if (profile == null) {
                return null;
            }
            return new UserProfileInfo
            {
                ProfileId = profile.ProfileId,
                NetworkId = profile.NetworkId,
                Name = profile.Name,
                Commission = profile.Commission,
                Level = profile.Level,
                Members = profile.Members
            };
        }

        public IList<IUserProfileModel> ListByNetwork(long networkId)
        {
            return _profileFactory.BuildUserProfileModel().ListByNetwork(networkId, _profileFactory).ToList();
        }
    }
}

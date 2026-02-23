using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Profile;
using NAuth.ACL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MonexUp.Domain.Impl.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUserClient _userClient;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserProfileDomainFactory _profileFactory;

        public ProfileService(IUserClient userClient, IUserNetworkDomainFactory userNetworFactory, IUserProfileDomainFactory profileFactory)
        {
            _userClient = userClient;
            _userNetworkFactory = userNetworFactory;
            _profileFactory = profileFactory;
        }

        private async Task ValidateAccess(long networkId, long userId)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);

            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = await _userClient.GetByIdAsync(userId, "");
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

        public async Task<IUserProfileModel> Insert(UserProfileInfo profile, long userId)
        {
            await ValidateAccess(profile.NetworkId, userId);

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

        public async Task<IUserProfileModel> Update(UserProfileInfo profile, long userId)
        {
            await ValidateAccess(profile.NetworkId, userId);

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

        public async Task Delete(long profileId, long userId)
        {
            var model = _profileFactory.BuildUserProfileModel().GetById(profileId, _profileFactory);

            await ValidateAccess(model.NetworkId, userId);

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

using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class NetworkService : INetworkService
    {

        private readonly INetworkDomainFactory _networkFactory;
        private readonly IUserDomainFactory _userFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserProfileDomainFactory _userProfileFactory;
        private readonly IUserService _userService;
        private readonly IProfileService _profileService;
        private readonly IImageService _imageService;

        public NetworkService(
            IUserDomainFactory userFactory,
            INetworkDomainFactory networkFactory, 
            IUserNetworkDomainFactory userNetworkFactory, 
            IUserProfileDomainFactory userProfileFactory,
            IUserService userService,
            IProfileService profileService,
            IImageService imageService
        )
        {
            _userFactory = userFactory;
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _userProfileFactory = userProfileFactory;   
            _userService = userService;
            _profileService = profileService;
            _imageService = imageService;
        }

        private string GenerateSlug(INetworkModel md)
        {
            string newSlug;
            int c = 0;
            do
            {
                newSlug = SlugHelper.GerarSlug((!string.IsNullOrEmpty(md.Slug)) ? md.Slug : md.Name);
                if (c > 0)
                {
                    newSlug += c.ToString();
                }
                c++;
            } while (md.ExistSlug(md.NetworkId, newSlug));
            return newSlug;
        }

        public INetworkModel Insert(NetworkInsertInfo network, long userId)
        {
            var model = _networkFactory.BuildNetworkModel();
            if (string.IsNullOrEmpty(network.Name))
            {
                throw new Exception("Name is empty");
            }
            else
            {
                var networkWithName = model.GetByName(network.Name, _networkFactory);
                if (networkWithName != null && networkWithName.NetworkId != model.NetworkId)
                {
                    throw new Exception("Network with this name already registered");
                }
            }
            if (string.IsNullOrEmpty(network.Email))
            {
                throw new Exception("Email is empty");
            }
            else
            {
                if (!EmailValidator.IsValidEmail(network.Email))
                {
                    throw new Exception("Email is not valid");
                }
                var networkWithEmail = model.GetByEmail(network.Email, _networkFactory);
                if (networkWithEmail != null)
                {
                    throw new Exception("Network with email already registered");
                }
            }

            model.Name = network.Name;
            model.Email = network.Email;
            model.Commission = network.Commission;
            model.Plan = network.Plan;
            model.WithdrawalMin = 300;
            model.WithdrawalPeriod = 30;
            model.Status = NetworkStatusEnum.Active;
            model.Slug = GenerateSlug(model);

            var md = model.Insert(_networkFactory);

            var modelUser = _userNetworkFactory.BuildUserNetworkModel();
            modelUser.NetworkId = md.NetworkId;
            modelUser.UserId = userId;
            modelUser.ProfileId = null;
            modelUser.Role = DTO.User.UserRoleEnum.NetworkManager;
            modelUser.Status = DTO.User.UserNetworkStatusEnum.Active;
            modelUser.Insert(_userNetworkFactory);

            var modelProfile = _userProfileFactory.BuildUserProfileModel();
            modelProfile.NetworkId = md.NetworkId;
            modelProfile.Name = "Gerente";
            modelProfile.Commission = 0;
            modelProfile.Level = 1;
            modelProfile.Insert(_userProfileFactory);

            modelProfile = _userProfileFactory.BuildUserProfileModel();
            modelProfile.NetworkId = md.NetworkId;
            modelProfile.Name = "Vendedor";
            modelProfile.Commission = 0;
            modelProfile.Level = 2;
            modelProfile.Insert(_userProfileFactory);

            return md;
        }

        public INetworkModel Update(NetworkInfo network, long userId)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(network.NetworkId, userId, _userNetworkFactory);

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

            var model = _networkFactory.BuildNetworkModel();
            if (string.IsNullOrEmpty(network.Name))
            {
                throw new Exception("Name is empty");
            }
            else
            {
                var networkWithName = model.GetByName(network.Name, _networkFactory);
                if (networkWithName != null && networkWithName.NetworkId != network.NetworkId)
                {
                    throw new Exception("Network with this name already registered");
                }
            }
            if (string.IsNullOrEmpty(network.Email))
            {
                throw new Exception("Email is empty");
            }
            else
            {
                if (!EmailValidator.IsValidEmail(network.Email))
                {
                    throw new Exception("Email is not valid");
                }
                var networkWithEmail = model.GetByEmail(network.Email, _networkFactory);
                if (networkWithEmail != null && networkWithEmail.NetworkId != network.NetworkId)
                {
                    throw new Exception("Network with email already registered");
                }
            }

            model.NetworkId = network.NetworkId;
            model.Name = network.Name;
            model.Slug = network.Slug;
            model.Email = network.Email;
            model.Commission = network.Commission;
            model.Plan = network.Plan;
            model.WithdrawalMin = network.WithdrawalMin;
            model.WithdrawalPeriod = network.WithdrawalPeriod;
            model.Status = network.Status;
            model.Slug = GenerateSlug(model);

            var md = model.Update(_networkFactory);

            return md;
        }
        public IList<INetworkModel> ListByStatus(NetworkStatusEnum status)
        {
            return _networkFactory.BuildNetworkModel().ListByStatus(status, _networkFactory).ToList();
        }
        public IList<IUserNetworkModel> ListByUser(long userId)
        {
            return _userNetworkFactory.BuildUserNetworkModel().ListByUser(userId, _userNetworkFactory).ToList();
        }

        public IList<IUserNetworkModel> ListByNetwork(long networkId)
        {
            return _userNetworkFactory.BuildUserNetworkModel().ListByNetwork(networkId, _userNetworkFactory).ToList();
        }

        public INetworkModel GetById(long networkId)
        {
            return _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
        }

        public INetworkModel GetBySlug(string slug)
        {
            return _networkFactory.BuildNetworkModel().GetBySlug(slug, _networkFactory);
        }

        public IUserNetworkModel GetUserNetwork(long networkId, long userId)
        {
            return _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
        }

        public UserNetworkInfo GetUserNetworkInfo(IUserNetworkModel model)
        {
            if (model == null)
            {
                return null;
            }
            return new UserNetworkInfo
            {
                NetworkId = model.NetworkId,
                UserId = model.UserId,
                ProfileId = model.ProfileId,
                ReferrerId = model.ReferrerId,
                Role = model.Role,
                Status = model.Status,
                Network = GetNetworkInfo(model.GetNetwork(_networkFactory)),
                User = _userService.GetUserInfoFromModel(_userFactory.BuildUserModel().GetById(model.UserId, _userFactory)),
                Profile = _profileService.GetUserProfileInfo(
                    _userProfileFactory.BuildUserProfileModel()
                    .GetById(model.ProfileId.GetValueOrDefault(), _userProfileFactory)
                )

            };
        }

        public NetworkInfo GetNetworkInfo(INetworkModel model)
        {
            if (model == null)
            {
                return null;
            }
            return new NetworkInfo
            {
                NetworkId = model.NetworkId,
                Name = model.Name,
                Slug = model.Slug,
                ImageUrl = _imageService.GetImageUrl(model.Image),
                Email = model.Email,
                Plan = model.Plan,
                Commission = model.Commission,
                WithdrawalMin = model.WithdrawalMin,
                WithdrawalPeriod = model.WithdrawalPeriod,
                QtdyUsers = _userNetworkFactory.BuildUserNetworkModel().GetQtdyUserByNetwork(model.NetworkId),
                MaxUsers = model.MaxQtdyUserByNetwork(),
                Status = model.Status
            };
        }

        public void RequestAccess(long networkId, long userId, long? referrerId)
        {
            var profiles = _userProfileFactory.BuildUserProfileModel().ListByNetwork(networkId, _userProfileFactory);

            var lowerProfile = profiles.OrderByDescending(x => x.Level).FirstOrDefault();
            if (lowerProfile == null) {
                throw new Exception("Lower profile not found");
            }

            var model = _userNetworkFactory.BuildUserNetworkModel();
            model.NetworkId = networkId;
            model.UserId = userId;
            model.ProfileId = lowerProfile.ProfileId;
            model.Role = DTO.User.UserRoleEnum.Seller;
            model.Status = DTO.User.UserNetworkStatusEnum.WaitForApproval;
            model.ReferrerId = referrerId;

            model.Insert(_userNetworkFactory);
        }
        public void ChangeStatus(long networkId, long userId, UserNetworkStatusEnum status, long managerId)
        {
            var userNetwork = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
            if (userNetwork == null)
            {
                throw new Exception("Access is not required");
            }

            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, managerId, _userNetworkFactory);

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

            userNetwork.Status = status;

            userNetwork.Update(_userNetworkFactory);
        }
    }
}

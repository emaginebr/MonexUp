using Core.Domain;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using NAuth.ACL.Interfaces;
using zTools.ACL.Interfaces;
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
        private readonly IUserClient _userClient;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserProfileDomainFactory _userProfileFactory;
        private readonly IProfileService _profileService;
        private readonly IFileClient _fileClient;
        private readonly IInviteTokenSigner _inviteTokenSigner;
        private readonly ILogger<NetworkService> _logger;

        public NetworkService(
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IUserProfileDomainFactory userProfileFactory,
            IProfileService profileService,
            IFileClient fileClient,
            IInviteTokenSigner inviteTokenSigner,
            ILogger<NetworkService> logger
        )
        {
            _userClient = userClient;
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _userProfileFactory = userProfileFactory;
            _profileService = profileService;
            _fileClient = fileClient;
            _inviteTokenSigner = inviteTokenSigner;
            _logger = logger;
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
            model.Template = network.Template;
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

        public async Task<INetworkModel> Update(NetworkInfo network, long userId, string token)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(network.NetworkId, userId, _userNetworkFactory);

            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = await _userClient.GetByIdAsync(userId, token);
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
            model.Template = network.Template;
            model.Image = network.ImageUrl;
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

        public async Task<UserNetworkInfo> GetUserNetworkInfo(IUserNetworkModel model, string token)
        {
            if (model == null)
            {
                return null;
            }

            // Public surfaces (storefront, seller landing) hit this without a
            // bearer token. NAuth refuses unauthenticated calls, so we guard
            // the User fetch and degrade gracefully instead of 500'ing the
            // whole request.
            NAuth.DTO.User.UserInfo userInfo = null;
            if (!string.IsNullOrWhiteSpace(token))
            {
                try
                {
                    userInfo = await _userClient.GetByIdAsync(model.UserId, token);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "NAuth GetByIdAsync failed for userId={UserId} — returning UserNetworkInfo without user details.", model.UserId);
                    userInfo = null;
                }
            }

            return new UserNetworkInfo
            {
                NetworkId = model.NetworkId,
                UserId = model.UserId,
                ProfileId = model.ProfileId,
                ReferrerId = model.ReferrerId,
                Role = model.Role,
                Status = model.Status,
                Network = await GetNetworkInfo(model.GetNetwork(_networkFactory)),
                User = userInfo,
                Profile = _profileService.GetUserProfileInfo(
                    _userProfileFactory.BuildUserProfileModel()
                    .GetById(model.ProfileId.GetValueOrDefault(), _userProfileFactory)
                )

            };
        }

        public async Task<NetworkInfo> GetNetworkInfo(INetworkModel model)
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
                Template = model.Template,
                ImageUrl = await _fileClient.GetFileUrlAsync("monexup", model.Image),
                Email = model.Email,
                Plan = model.Plan,
                Commission = model.Commission,
                WithdrawalMin = model.WithdrawalMin,
                WithdrawalPeriod = model.WithdrawalPeriod,
                QtdyUsers = _userNetworkFactory.BuildUserNetworkModel().GetQtdyUserByNetwork(model.NetworkId),
                MaxUsers = model.MaxQtdyUserByNetwork(),
                Status = model.Status,
                LofnStoreId = model.LofnStoreId,
                ProxyPayStoreId = model.ProxyPayStoreId,
                ProxyPayClientId = model.ProxyPayClientId
            };
        }

        public void RequestAccess(long networkId, long userId, long? referrerId)
        {
            CreatePendingMembership(networkId, userId, referrerId);
        }

        /// <summary>
        /// Creates a WaitForApproval membership (lowest profile, Seller role) with
        /// the given referrer. Shared by self-service RequestAccess and the invite flows.
        /// </summary>
        private void CreatePendingMembership(long networkId, long userId, long? referrerId)
        {
            var profiles = _userProfileFactory.BuildUserProfileModel().ListByNetwork(networkId, _userProfileFactory);

            var lowerProfile = profiles.OrderByDescending(x => x.Level).FirstOrDefault();
            if (lowerProfile == null)
            {
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

        /// <summary>
        /// Authorizes that <paramref name="managerId"/> may manage <paramref name="networkId"/>
        /// (NetworkManager of the network, or a platform admin). Mirrors ValidateAccess
        /// without requiring a pre-existing target membership.
        /// </summary>
        private async Task ValidateManager(long networkId, long managerId, string token)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, managerId, _userNetworkFactory);
            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = await _userClient.GetByIdAsync(managerId, token);
                if (user == null || !user.IsAdmin)
                {
                    throw new Exception("Your dont have access to this network");
                }
            }
        }

        public async Task<InviteResultInfo> InviteByEmail(long networkId, string email, long inviterUserId, string token)
        {
            if (string.IsNullOrWhiteSpace(email) || !EmailValidator.IsValidEmail(email))
            {
                return new InviteResultInfo { Sucesso = false, MensagemErro = "E-mail inválido." };
            }

            await ValidateManager(networkId, inviterUserId, token);

            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null)
            {
                return new InviteResultInfo { Sucesso = false, MensagemErro = "Rede não encontrada." };
            }

            // NAuth GetByEmailAsync throws (EnsureSuccessStatusCode) when the
            // email has no account — treat any failure as "no account" and log.
            NAuth.DTO.User.UserInfo invitee = null;
            try
            {
                invitee = await _userClient.GetByEmailAsync(email);
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex, "NAuth GetByEmailAsync found no account for {Email} — treating as no-account invite.", email);
                invitee = null;
            }

            if (invitee == null)
            {
                // No account → new-person invite; nothing created until sign-up + join.
                var newToken = _inviteTokenSigner.Sign(networkId, inviterUserId, 0, false);
                return new InviteResultInfo
                {
                    Sucesso = true,
                    HasAccount = false,
                    AlreadyMember = false,
                    Token = newToken,
                    NetworkSlug = network.Slug
                };
            }

            if (invitee.UserId == inviterUserId)
            {
                return new InviteResultInfo { Sucesso = false, MensagemErro = "Você não pode convidar a si mesmo." };
            }

            var existing = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, invitee.UserId, _userNetworkFactory);
            var alreadyMember = false;

            if (existing != null &&
                (existing.Status == DTO.User.UserNetworkStatusEnum.Active
                 || existing.Status == DTO.User.UserNetworkStatusEnum.WaitForApproval))
            {
                // Idempotent: already active/pending — surface state, no duplicate.
                alreadyMember = true;
            }
            else if (existing != null)
            {
                // Inactive/Blocked → reactivate to pending with the new referrer.
                existing.Status = DTO.User.UserNetworkStatusEnum.WaitForApproval;
                existing.ReferrerId = inviterUserId;
                existing.Update(_userNetworkFactory);
            }
            else
            {
                // Create the pending membership at invite time (per FR-007/FR-012).
                CreatePendingMembership(networkId, invitee.UserId, inviterUserId);
            }

            var token2 = _inviteTokenSigner.Sign(networkId, inviterUserId, invitee.UserId, true);
            return new InviteResultInfo
            {
                Sucesso = true,
                HasAccount = true,
                AlreadyMember = alreadyMember,
                Token = token2,
                NetworkSlug = network.Slug
            };
        }

        public Task JoinFromInvite(long joinerUserId, string inviteToken)
        {
            if (!_inviteTokenSigner.TryVerify(inviteToken, out var payload))
            {
                throw new Exception("Convite inválido.");
            }

            var existing = _userNetworkFactory.BuildUserNetworkModel().Get(payload.NetworkId, joinerUserId, _userNetworkFactory);
            if (existing != null &&
                (existing.Status == DTO.User.UserNetworkStatusEnum.Active
                 || existing.Status == DTO.User.UserNetworkStatusEnum.WaitForApproval))
            {
                // Idempotent — already active/pending.
                return Task.CompletedTask;
            }

            if (existing != null)
            {
                existing.Status = DTO.User.UserNetworkStatusEnum.WaitForApproval;
                existing.ReferrerId = payload.InviterUserId;
                existing.Update(_userNetworkFactory);
                return Task.CompletedTask;
            }

            CreatePendingMembership(payload.NetworkId, joinerUserId, payload.InviterUserId);
            return Task.CompletedTask;
        }

        public async Task<InviteDetailInfo> GetInviteDetail(long callerUserId, string inviteToken, string token)
        {
            if (!_inviteTokenSigner.TryVerify(inviteToken, out var payload))
            {
                return new InviteDetailInfo { Sucesso = false, MensagemErro = "Convite inválido." };
            }

            var network = _networkFactory.BuildNetworkModel().GetById(payload.NetworkId, _networkFactory);

            string inviterName = null;
            try
            {
                var inviter = await _userClient.GetByIdAsync(payload.InviterUserId, token);
                inviterName = inviter?.Name;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "NAuth GetByIdAsync failed for inviter {InviterId} — returning invite detail without inviter name.", payload.InviterUserId);
            }

            var existing = _userNetworkFactory.BuildUserNetworkModel().Get(payload.NetworkId, callerUserId, _userNetworkFactory);

            return new InviteDetailInfo
            {
                Sucesso = true,
                NetworkId = payload.NetworkId,
                NetworkName = network?.Name,
                InviterName = inviterName,
                TargetUserId = payload.TargetUserId,
                IsForCurrentUser = payload.TargetUserId == callerUserId,
                AlreadyActiveMember = existing != null && existing.Status == DTO.User.UserNetworkStatusEnum.Active
            };
        }

        public Task AcceptInvite(long callerUserId, string inviteToken)
        {
            if (!_inviteTokenSigner.TryVerify(inviteToken, out var payload))
            {
                throw new Exception("Convite inválido.");
            }
            if (payload.TargetUserId != callerUserId)
            {
                throw new UnauthorizedAccessException("Este convite não é para a sua conta.");
            }

            var existing = _userNetworkFactory.BuildUserNetworkModel().Get(payload.NetworkId, callerUserId, _userNetworkFactory);
            if (existing == null)
            {
                // Pending row should already exist from invite time; recreate idempotently if missing.
                CreatePendingMembership(payload.NetworkId, callerUserId, payload.InviterUserId);
            }
            else if (existing.Status == DTO.User.UserNetworkStatusEnum.Inactive)
            {
                existing.Status = DTO.User.UserNetworkStatusEnum.WaitForApproval;
                existing.ReferrerId = payload.InviterUserId;
                existing.Update(_userNetworkFactory);
            }
            // Active/WaitForApproval → no-op; still requires manager approval.
            return Task.CompletedTask;
        }

        public Task DeclineInvite(long callerUserId, string inviteToken)
        {
            if (!_inviteTokenSigner.TryVerify(inviteToken, out var payload))
            {
                throw new Exception("Convite inválido.");
            }
            if (payload.TargetUserId != callerUserId)
            {
                throw new UnauthorizedAccessException("Este convite não é para a sua conta.");
            }

            var existing = _userNetworkFactory.BuildUserNetworkModel().Get(payload.NetworkId, callerUserId, _userNetworkFactory);
            if (existing != null && existing.Status == DTO.User.UserNetworkStatusEnum.WaitForApproval)
            {
                existing.Status = DTO.User.UserNetworkStatusEnum.Inactive;
                existing.Update(_userNetworkFactory);
            }
            return Task.CompletedTask;
        }

        private async Task ValidateAccess(long networkId, long userId, long managerId, string token)
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
                var user = await _userClient.GetByIdAsync(userId, token);
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
        public async Task ChangeStatus(long networkId, long userId, UserNetworkStatusEnum status, long managerId, string token)
        {
            await ValidateAccess(networkId, userId, managerId, token);

            var userNetwork = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
            userNetwork.Status = status;
            userNetwork.Update(_userNetworkFactory);
        }

        public async Task<bool> Promote(long networkId, long userId, long managerId, string token)
        {
            await ValidateAccess(networkId, userId, managerId, token);

            return _userNetworkFactory.BuildUserNetworkModel().Promote(networkId, userId);
        }

        public async Task<bool> Demote(long networkId, long userId, long managerId, string token)
        {
            await ValidateAccess(networkId, userId, managerId, token);

            return _userNetworkFactory.BuildUserNetworkModel().Demote(networkId, userId);
        }
    }
}

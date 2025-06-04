using DB.Infra.Context;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Domain;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NetworkController : ControllerBase
    {
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserService _userService;
        private readonly INetworkService _networkService;
        private readonly IProfileService _profileService;

        public NetworkController(INetworkDomainFactory networkFactory, IUserNetworkDomainFactory userNetworkFactory, IUserService userService, INetworkService networkService, IProfileService profileService)
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _userService = userService;
            _networkService = networkService;
            _profileService = profileService;
        }

        [Authorize]
        [HttpPost("insert")]
        public ActionResult<NetworkResult> Insert([FromBody] NetworkInsertInfo network)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newNetwork = _networkService.Insert(network, userSession.UserId);
                return new NetworkResult()
                {
                    Network = _networkService.GetNetworkInfo(newNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public ActionResult<NetworkResult> Update([FromBody] NetworkInfo network)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newNetwork = _networkService.Update(network, userSession.UserId);
                return new NetworkResult()
                {
                    Network = _networkService.GetNetworkInfo(newNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listAll")]
        public ActionResult<NetworkListResult> ListAll()
        {
            try
            {
                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var networks = _networkService
                    .ListByStatus(NetworkStatusEnum.Active)
                    .ToList();
                return new NetworkListResult()
                {
                    Networks = networks.Select(x => _networkService.GetNetworkInfo(x)).ToList()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("listByUser")]
        public ActionResult<UserNetworkListResult> ListByUser()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var userNetworks = _networkService
                    .ListByUser(userSession.UserId)
                    .ToList();
                return new UserNetworkListResult()
                {
                    UserNetworks = userNetworks.Select(x => _networkService.GetUserNetworkInfo(x)).ToList()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetwork/{networkSlug}")]
        public ActionResult<UserNetworkListResult> ListByNetwork(string networkSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var userNetworks = _networkService
                    .ListByNetwork(network.NetworkId)
                    .ToList();
                return new UserNetworkListResult()
                {
                    UserNetworks = userNetworks.Select(x => _networkService.GetUserNetworkInfo(x)).ToList()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        /*
        private NetworkInfo NetworkModelToInfo(INetworkModel model)
        {
            var networkInfo = _networkService.GetNetworkInfo(model);
            if (networkInfo != null)
            {
                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();
                networkInfo.QtdyUsers = mdUserNetwork.GetQtdyUserByNetwork(model.NetworkId);
                networkInfo.MaxUsers = model.MaxQtdyUserByNetwork();
            }
            return networkInfo;
        }

        private UserNetworkInfo UserNetworkModelToInfo(IUserNetworkModel model)
        {
            var userNetwork = _networkService.GetUserNetworkInfo(model);
            if (userNetwork != null)
            {
                var md = _networkFactory.BuildNetworkModel().GetById(userNetwork.NetworkId, _networkFactory);
                userNetwork.Network = _networkService.GetNetworkInfo(md);
                userNetwork.Network.QtdyUsers = model.GetQtdyUserByNetwork(userNetwork.NetworkId);
                userNetwork.Network.MaxUsers = md.MaxQtdyUserByNetwork();
                if (userNetwork.ProfileId.HasValue)
                {
                    var mdProfile = _profileService.GetById(userNetwork.ProfileId.Value);
                    userNetwork.Profile = _profileService.GetUserProfileInfo(mdProfile);
                }
            }
            return userNetwork;
        }
        */

        [Authorize]
        [HttpGet("getById/{networkId}")]
        public ActionResult<NetworkResult> GetById(long networkId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var network = _networkService.GetById(networkId);
                return new NetworkResult()
                {
                    Network = _networkService.GetNetworkInfo(network)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getUserNetwork/{networkId}")]
        public ActionResult<UserNetworkResult> GetUserNetwork(long networkId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var userNetwork = _networkService.GetUserNetwork(networkId, userSession.UserId);
                return new UserNetworkResult()
                {
                    UserNetwork = _networkService.GetUserNetworkInfo(userNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getUserNetworkBySlug/{networkSlug}")]
        public ActionResult<UserNetworkResult> GetUserNetworkBySlug(string networkSlug)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var network = _networkService.GetBySlug(networkSlug);
                if (network == null) {
                    throw new Exception("Network not found");
                }

                var userNetwork = _networkService.GetUserNetwork(network.NetworkId, userSession.UserId);
                return new UserNetworkResult()
                {
                    UserNetwork = _networkService.GetUserNetworkInfo(userNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBySlug/{networkSlug}")]
        public ActionResult<NetworkResult> GetBySlug(string networkSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                return new NetworkResult()
                {
                    Network = _networkService.GetNetworkInfo(network)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getSellerBySlug/{networkSlug}/{sellerSlug}")]
        public ActionResult<UserNetworkResult> GetSellerBySlug(string networkSlug, string sellerSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }
                var user = _userService.GetBySlug(sellerSlug);
                if (user == null)
                {
                    throw new Exception("User not found");
                }

                var userNetwork = _networkService.GetUserNetwork(network.NetworkId, user.UserId);

                return new UserNetworkResult()
                {
                    UserNetwork = _networkService.GetUserNetworkInfo(userNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("requestAccess")]
        public ActionResult<StatusResult> RequestAccess([FromBody]NetworkRequestInfo request)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                _networkService.RequestAccess(request.NetworkId, userSession.UserId, request.ReferrerId);

                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "request access successfully"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("changeStatus")]
        public ActionResult<StatusResult> ChangeStatus([FromBody] NetworkChangeStatusInfo changeStatus)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                UserNetworkStatusEnum status = (UserNetworkStatusEnum)changeStatus.Status;

                _networkService.ChangeStatus(changeStatus.NetworkId, changeStatus.UserId, status, userSession.UserId);

                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "User status successfully changed"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("promote/{networkId}/{userId}")]
        public ActionResult<StatusResult> Promote(long networkId, long userId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }


                _networkService.Promote(networkId, userId, userSession.UserId);

                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "User successfully changed"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("demote/{networkId}/{userId}")]
        public ActionResult<StatusResult> Demote(long networkId, long userId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }


                _networkService.Demote(networkId, userId, userSession.UserId);

                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "User successfully changed"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

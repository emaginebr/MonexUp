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
using NAuth.ACL.Interfaces;
using System.Threading.Tasks;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NetworkController : ControllerBase
    {
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IUserClient _userClient;
        private readonly INetworkService _networkService;
        private readonly IProfileService _profileService;

        public NetworkController(
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IUserClient userClient,
            INetworkService networkService,
            IProfileService profileService
        )
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _userClient = userClient;
            _networkService = networkService;
            _profileService = profileService;
        }

        [Authorize]
        [HttpPost("insert")]
        public async Task<ActionResult<NetworkResult>> Insert([FromBody] NetworkInsertInfo network)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newNetwork = _networkService.Insert(network, userSession.UserId);
                return new NetworkResult()
                {
                    Network = await _networkService.GetNetworkInfo(newNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<ActionResult<NetworkResult>> Update([FromBody] NetworkInfo network)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var token = HttpContext.GetBearerToken();
                var newNetwork = await _networkService.Update(network, userSession.UserId, token);
                return new NetworkResult()
                {
                    Network = await _networkService.GetNetworkInfo(newNetwork)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listAll")]
        public async Task<ActionResult<NetworkListResult>> ListAll()
        {
            try
            {
                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var networks = _networkService
                    .ListByStatus(NetworkStatusEnum.Active)
                    .ToList();
                var networkInfos = new List<NetworkInfo>();
                foreach (var x in networks)
                {
                    networkInfos.Add(await _networkService.GetNetworkInfo(x));
                }
                return new NetworkListResult()
                {
                    Networks = networkInfos
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("listByUser")]
        public async Task<ActionResult<UserNetworkListResult>> ListByUser()
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var userNetworks = _networkService
                    .ListByUser(userSession.UserId)
                    .ToList();
                var token = HttpContext.GetBearerToken();
                var userNetworkInfos = new List<UserNetworkInfo>();
                foreach (var x in userNetworks)
                {
                    userNetworkInfos.Add(await _networkService.GetUserNetworkInfo(x, token));
                }
                return new UserNetworkListResult()
                {
                    UserNetworks = userNetworkInfos
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetwork/{networkSlug}")]
        public async Task<ActionResult<UserNetworkListResult>> ListByNetwork(string networkSlug)
        {
            try
            {
                var token = HttpContext.GetBearerToken();
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var userNetworks = _networkService
                    .ListByNetwork(network.NetworkId)
                    .ToList();
                var userNetworkInfos = new List<UserNetworkInfo>();
                foreach (var x in userNetworks)
                {
                    userNetworkInfos.Add(await _networkService.GetUserNetworkInfo(x, token));
                }
                return new UserNetworkListResult()
                {
                    UserNetworks = userNetworkInfos
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{networkId}")]
        public async Task<ActionResult<NetworkResult>> GetById(long networkId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var network = _networkService.GetById(networkId);
                return new NetworkResult()
                {
                    Network = await _networkService.GetNetworkInfo(network)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getUserNetwork/{networkId}")]
        public async Task<ActionResult<UserNetworkResult>> GetUserNetwork(long networkId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var token = HttpContext.GetBearerToken();
                var userNetwork = _networkService.GetUserNetwork(networkId, userSession.UserId);
                return new UserNetworkResult()
                {
                    UserNetwork = await _networkService.GetUserNetworkInfo(userNetwork, token)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getUserNetworkBySlug/{networkSlug}")]
        public async Task<ActionResult<UserNetworkResult>> GetUserNetworkBySlug(string networkSlug)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var token = HttpContext.GetBearerToken();
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null) {
                    throw new Exception("Network not found");
                }

                var userNetwork = _networkService.GetUserNetwork(network.NetworkId, userSession.UserId);
                return new UserNetworkResult()
                {
                    UserNetwork = await _networkService.GetUserNetworkInfo(userNetwork, token)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBySlug/{networkSlug}")]
        public async Task<ActionResult<NetworkResult>> GetBySlug(string networkSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                return new NetworkResult()
                {
                    Network = await _networkService.GetNetworkInfo(network)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getSellerBySlug/{networkSlug}/{sellerSlug}")]
        public async Task<ActionResult<UserNetworkResult>> GetSellerBySlug(string networkSlug, string sellerSlug)
        {
            try
            {
                var token = HttpContext.GetBearerToken();
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }
                var user = await _userClient.GetBySlugAsync(sellerSlug);
                if (user == null)
                {
                    throw new Exception("User not found");
                }

                var userNetwork = _networkService.GetUserNetwork(network.NetworkId, user.UserId);

                return new UserNetworkResult()
                {
                    UserNetwork = await _networkService.GetUserNetworkInfo(userNetwork, token)
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
                var userSession = _userClient.GetUserInSession(HttpContext);
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
        public async Task<ActionResult<StatusResult>> ChangeStatus([FromBody] NetworkChangeStatusInfo changeStatus)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var token = HttpContext.GetBearerToken();
                UserNetworkStatusEnum status = (UserNetworkStatusEnum)changeStatus.Status;

                await _networkService.ChangeStatus(changeStatus.NetworkId, changeStatus.UserId, status, userSession.UserId, token);

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
        public async Task<ActionResult<StatusResult>> Promote(long networkId, long userId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }


                var token = HttpContext.GetBearerToken();
                await _networkService.Promote(networkId, userId, userSession.UserId, token);

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
        public async Task<ActionResult<StatusResult>> Demote(long networkId, long userId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }


                var token = HttpContext.GetBearerToken();
                await _networkService.Demote(networkId, userId, userSession.UserId, token);

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

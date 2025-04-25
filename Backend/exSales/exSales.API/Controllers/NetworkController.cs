using DB.Infra.Context;
using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Domain;
using exSales.DTO.Network;
using exSales.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace exSales.API.Controllers
{
    [Route("api/[controller]")]
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

        [Authorize]
        [HttpGet("listByUser")]
        public ActionResult<NetworkListResult> ListByUser()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var networks = _networkService
                    .ListByUser(userSession.UserId)
                    .Select(x => _networkService.GetUserNetworkInfo(x))
                    .ToList();
                foreach (var network in networks)
                {
                    var md = _networkFactory.BuildNetworkModel().GetById(network.NetworkId, _networkFactory);
                    network.Network = _networkService.GetNetworkInfo(md);
                    network.Network.QtdyUsers = mdUserNetwork.GetQtdyUserByNetwork(network.NetworkId);
                    network.Network.MaxUsers = md.MaxQtdyUserByNetwork();
                    if (network.ProfileId.HasValue)
                    {
                        var mdProfile = _profileService.GetById(network.ProfileId.Value);
                        network.Profile = _profileService.GetUserProfileInfo(mdProfile);
                    }
                }
                return new NetworkListResult()
                {
                    Networks = networks
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

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

                var mdUserNetwork = _userNetworkFactory.BuildUserNetworkModel();

                var network = _networkService.GetById(networkId);
                var networkInfo = _networkService.GetNetworkInfo(network);
                if (networkInfo != null)
                {
                    networkInfo.QtdyUsers = mdUserNetwork.GetQtdyUserByNetwork(network.NetworkId);
                    networkInfo.MaxUsers = network.MaxQtdyUserByNetwork();
                }
                return new NetworkResult()
                {
                    Network = networkInfo
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
    }
}

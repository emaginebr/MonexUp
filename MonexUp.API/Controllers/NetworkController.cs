using FluentValidation;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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
        private readonly ILofnStoreProvisioningService _lofnStoreProvisioning;
        private readonly IBillingService _billingService;
        private readonly IValidator<EnsureStoreRequest> _ensureStoreValidator;
        private readonly IProxyPayService _proxyPayService;

        public NetworkController(
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IUserClient userClient,
            INetworkService networkService,
            IProfileService profileService,
            ILofnStoreProvisioningService lofnStoreProvisioning,
            IBillingService billingService,
            IValidator<EnsureStoreRequest> ensureStoreValidator,
            IProxyPayService proxyPayService
        )
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _userClient = userClient;
            _networkService = networkService;
            _profileService = profileService;
            _lofnStoreProvisioning = lofnStoreProvisioning;
            _billingService = billingService;
            _ensureStoreValidator = ensureStoreValidator;
            _proxyPayService = proxyPayService;
        }

        [Authorize]
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] NetworkInsertInfo network, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            var newNetwork = _networkService.Insert(network, userSession.UserId);

            // Transparent ProxyPay store provisioning at network creation —
            // the manager bearer token signs the ProxyPay /Store call.
            // Failure breaks the request: the network must not be exposed
            // without a usable billing store.
            var ensure = await _billingService.EnsureStoreAsync(newNetwork.NetworkId, userSession.UserId, token, ct);
            if (ensure.StatusCode < 200 || ensure.StatusCode >= 300)
            {
                return StatusCode(ensure.StatusCode, ensure.Body);
            }

            return Ok(await _networkService.GetNetworkInfo(_networkService.GetById(newNetwork.NetworkId)));
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] NetworkInfo network, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            var newNetwork = await _networkService.Update(network, userSession.UserId, token);

            // Lazy ProxyPay store provisioning for pre-existing networks
            // created before the auto-provisioning at insert was added.
            // Failure breaks the request.
            if (!newNetwork.ProxyPayStoreId.HasValue || string.IsNullOrEmpty(newNetwork.ProxyPayClientId))
            {
                var ensure = await _billingService.EnsureStoreAsync(newNetwork.NetworkId, userSession.UserId, token, ct);
                if (ensure.StatusCode < 200 || ensure.StatusCode >= 300)
                {
                    return StatusCode(ensure.StatusCode, ensure.Body);
                }
            }

            return Ok(await _networkService.GetNetworkInfo(_networkService.GetById(newNetwork.NetworkId)));
        }

        [HttpGet("listAll")]
        public async Task<IActionResult> ListAll()
        {
            var networks = _networkService
                .ListByStatus(NetworkStatusEnum.Active)
                .ToList();
            var networkInfos = new List<NetworkInfo>();
            foreach (var x in networks)
            {
                networkInfos.Add(await _networkService.GetNetworkInfo(x));
            }
            return Ok(networkInfos);
        }

        [Authorize]
        [HttpGet("listByUser")]
        public async Task<IActionResult> ListByUser()
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var userNetworks = _networkService
                .ListByUser(userSession.UserId)
                .ToList();
            var token = HttpContext.GetBearerToken();
            var userNetworkInfos = new List<UserNetworkInfo>();
            foreach (var x in userNetworks)
            {
                userNetworkInfos.Add(await _networkService.GetUserNetworkInfo(x, token));
            }
            return Ok(userNetworkInfos);
        }

        [Authorize]
        [HttpGet("hierarchy/{networkId}")]
        public async Task<IActionResult> Hierarchy(long networkId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var hierarchy = await _networkService.BuildHierarchy(networkId, userSession.UserId, token);
            if (hierarchy == null)
            {
                return NotFound(new { sucesso = false, mensagemErro = "Membro não encontrado nesta rede." });
            }
            return Ok(hierarchy);
        }

        [HttpGet("listByNetwork/{networkSlug}")]
        public async Task<IActionResult> ListByNetwork(string networkSlug)
        {
            var token = HttpContext.GetBearerToken();
            var network = _networkService.GetBySlug(networkSlug);
            if (network == null) throw new Exception("Network not found");

            var userNetworks = _networkService
                .ListByNetwork(network.NetworkId)
                .ToList();
            var userNetworkInfos = new List<UserNetworkInfo>();
            foreach (var x in userNetworks)
            {
                userNetworkInfos.Add(await _networkService.GetUserNetworkInfo(x, token));
            }
            return Ok(userNetworkInfos);
        }

        [Authorize]
        [HttpPost("ensure-store")]
        public async Task<IActionResult> EnsureStore([FromBody] EnsureStoreRequest request, CancellationToken ct)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            var validation = await _ensureStoreValidator.ValidateAsync(request, ct);
            if (!validation.IsValid)
            {
                return BadRequest(new BillingApiResult<EnsureStoreResponse>
                {
                    Sucesso = false,
                    MensagemErro = string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))
                });
            }

            var result = await _billingService.EnsureStoreAsync(request.NetworkId, session.UserId, token, ct);
            return StatusCode(result.StatusCode, result.Body);
        }

        [Authorize]
        [HttpPost("ensure-lofn-store/{networkId}")]
        public async Task<IActionResult> EnsureLofnStore(long networkId, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            try
            {
                await _lofnStoreProvisioning.EnsureStoreAsync(networkId, token, ct);
            }
            catch (System.Exception ex)
            {
                return StatusCode(503, new { sucesso = false, mensagemErro = ex.Message });
            }

            var network = _networkService.GetById(networkId);
            return Ok(await _networkService.GetNetworkInfo(network));
        }

        [Authorize]
        [HttpGet("getById/{networkId}")]
        public async Task<IActionResult> GetById(long networkId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var network = _networkService.GetById(networkId);
            return Ok(await _networkService.GetNetworkInfo(network));
        }

        [Authorize]
        [HttpGet("getUserNetwork/{networkId}")]
        public async Task<IActionResult> GetUserNetwork(long networkId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var userNetwork = _networkService.GetUserNetwork(networkId, userSession.UserId);
            return Ok(await _networkService.GetUserNetworkInfo(userNetwork, token));
        }

        [Authorize]
        [HttpGet("getUserNetworkBySlug/{networkSlug}")]
        public async Task<IActionResult> GetUserNetworkBySlug(string networkSlug)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var network = _networkService.GetBySlug(networkSlug);
            if (network == null) throw new Exception("Network not found");

            var userNetwork = _networkService.GetUserNetwork(network.NetworkId, userSession.UserId);
            return Ok(await _networkService.GetUserNetworkInfo(userNetwork, token));
        }

        [HttpGet("getBySlug/{networkSlug}")]
        public async Task<IActionResult> GetBySlug(string networkSlug)
        {
            var network = _networkService.GetBySlug(networkSlug);
            return Ok(await _networkService.GetNetworkInfo(network));
        }

        [HttpGet("getSellerBySlug/{networkSlug}/{sellerSlug}")]
        public async Task<IActionResult> GetSellerBySlug(string networkSlug, string sellerSlug)
        {
            var token = HttpContext.GetBearerToken();
            var network = _networkService.GetBySlug(networkSlug);
            if (network == null) throw new Exception("Network not found");
            var user = await _userClient.GetBySlugAsync(sellerSlug);
            if (user == null) throw new Exception("User not found");

            var userNetwork = _networkService.GetUserNetwork(network.NetworkId, user.UserId);
            return Ok(await _networkService.GetUserNetworkInfo(userNetwork, token));
        }

        [Authorize]
        [HttpPost("requestAccess")]
        public IActionResult RequestAccess([FromBody] NetworkRequestInfo request)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            _networkService.RequestAccess(request.NetworkId, userSession.UserId, request.ReferrerId);
            return Ok();
        }

        [Authorize]
        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] InviteRequestInfo request)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var result = await _networkService.InviteByEmail(request.NetworkId, request.Email, userSession.UserId, token);
            if (!result.Sucesso) return BadRequest(result);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("invite/join")]
        public async Task<IActionResult> InviteJoin([FromBody] InviteActionInfo request)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            await _networkService.JoinFromInvite(userSession.UserId, request.Token);
            return Ok(new { sucesso = true });
        }

        [Authorize]
        [HttpGet("invite/detail")]
        public async Task<IActionResult> InviteDetail([FromQuery] string token)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var bearer = HttpContext.GetBearerToken();
            var detail = await _networkService.GetInviteDetail(userSession.UserId, token, bearer);
            if (!detail.Sucesso) return BadRequest(detail);
            return Ok(detail);
        }

        [Authorize]
        [HttpPost("invite/accept")]
        public async Task<IActionResult> InviteAccept([FromBody] InviteActionInfo request)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            try
            {
                await _networkService.AcceptInvite(userSession.UserId, request.Token);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { sucesso = false, mensagemErro = ex.Message });
            }
            return Ok(new { sucesso = true });
        }

        [Authorize]
        [HttpPost("invite/decline")]
        public async Task<IActionResult> InviteDecline([FromBody] InviteActionInfo request)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            try
            {
                await _networkService.DeclineInvite(userSession.UserId, request.Token);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { sucesso = false, mensagemErro = ex.Message });
            }
            return Ok(new { sucesso = true });
        }

        [Authorize]
        [HttpPost("changeStatus")]
        public async Task<IActionResult> ChangeStatus([FromBody] NetworkChangeStatusInfo changeStatus)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            UserNetworkStatusEnum status = (UserNetworkStatusEnum)changeStatus.Status;
            await _networkService.ChangeStatus(changeStatus.NetworkId, changeStatus.UserId, status, userSession.UserId, token);
            return Ok();
        }

        // AbacatePay API key — served through MonexUp, relayed to ProxyPay
        // server-side (browser never calls the provider). Write-only.
        [Authorize]
        [HttpPut("{networkId}/abacatepay-apikey")]
        public async Task<IActionResult> SetAbacatePayApiKey(long networkId, [FromBody] AbacatePayApiKeyRequest request, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            if (request == null || string.IsNullOrWhiteSpace(request.ApiKey))
            {
                return BadRequest(new { sucesso = false, mensagem = "apiKey é obrigatória." });
            }

            try
            {
                await _proxyPayService.SetAbacatePayApiKey(networkId, request.ApiKey, token, ct);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
            catch (System.Net.Http.HttpRequestException ex)
            {
                // Surface provider ownership (403) / validation (400) verbatim-ish.
                var code = ex.Message.Contains("403") ? 403 : 400;
                return StatusCode(code, new { sucesso = false, mensagem = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{networkId}/abacatepay-apikey/status")]
        public async Task<IActionResult> GetAbacatePayApiKeyStatus(long networkId, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            var hasKey = await _proxyPayService.GetHasAbacatePayApiKey(token, ct);
            return Ok(new { sucesso = true, hasAbacatePayApiKey = hasKey });
        }

        [Authorize]
        [HttpGet("promote/{networkId}/{userId}")]
        public async Task<IActionResult> Promote(long networkId, long userId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var changed = await _networkService.Promote(networkId, userId, userSession.UserId, token);
            if (!changed)
            {
                return BadRequest(new { sucesso = false, mensagemErro = "Não há perfil superior disponível para promover este vendedor. Cadastre um em Estrutura da Equipe." });
            }
            return Ok();
        }

        [Authorize]
        [HttpGet("demote/{networkId}/{userId}")]
        public async Task<IActionResult> Demote(long networkId, long userId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var changed = await _networkService.Demote(networkId, userId, userSession.UserId, token);
            if (!changed)
            {
                return BadRequest(new { sucesso = false, mensagemErro = "Não há perfil inferior disponível para rebaixar este vendedor. Cadastre um em Estrutura da Equipe." });
            }
            return Ok();
        }
    }
}

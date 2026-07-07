using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.API.Extensions;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.User;
using NAuth.ACL.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _service;
        private readonly INetworkService _networkService;
        private readonly IUserClient _userClient;

        public BillingController(
            IBillingService service,
            INetworkService networkService,
            IUserClient userClient)
        {
            _service = service;
            _networkService = networkService;
            _userClient = userClient;
        }

        [Authorize]
        [HttpGet("list")]
        public IActionResult List([FromQuery] long networkId, [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var result = _service.List(networkId, session.UserId, pageNum, pageSize);
            return result.Sucesso ? Ok(result) : StatusCode(403, result);
        }

        /// <summary>
        /// Paginated, role-filtered invoice search backing the <c>/admin/billing</c> page.
        /// Administrator / NetworkManager on the target network see every invoice; Seller
        /// sees only sales they closed; User sees only their own purchases. Callers
        /// without a valid role in the network get 403.
        /// </summary>
        [Authorize]
        [HttpPost("searchInvoices")]
        public async Task<IActionResult> SearchInvoices([FromBody] InvoiceSearchParam param, CancellationToken ct)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            if (param == null || param.NetworkId <= 0) return BadRequest();

            // Role gate mirrors OrderSearchPage rules — the service enforces the same
            // check as a safety net, we do it here to return 403 explicitly.
            var un = _networkService.GetUserNetwork(param.NetworkId, session.UserId);
            var role = un?.Role ?? UserRoleEnum.MoRole;
            if (role != UserRoleEnum.Administrator
                && role != UserRoleEnum.NetworkManager
                && role != UserRoleEnum.Seller
                && role != UserRoleEnum.User)
            {
                return Forbid();
            }

            var token = HttpContext.GetBearerToken();
            var result = await _service.SearchInvoicesAsync(param, session.UserId, token, ct);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("payment-completed")]
        public async Task<IActionResult> PaymentCompleted([FromBody] EnsureCallbackBody body, CancellationToken ct)
        {
            var info = new MonexUp.DTO.Billing.PaymentCompletionInfo
            {
                NetworkId = body?.NetworkId ?? 0,
                ProxyPayInvoiceId = body?.ProxyPayInvoiceId ?? 0,
                Signature = body?.Signature
            };
            var result = await _service.ProcessPaymentCompletionAsync(info, ct);
            return StatusCode(result.StatusCode, result.Body);
        }

        /// <summary>
        /// Member commission balance in a single network: total / released / maturing.
        /// Scoped to the session member; a member with no commissions gets all zeros.
        /// </summary>
        [Authorize]
        [HttpGet("my-balance/{networkId}")]
        public IActionResult MyBalance(long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            return Ok(_service.GetMemberBalance(networkId, session.UserId));
        }

        /// <summary>
        /// Network own-cut balance (UserId IS NULL rows) for a network. Restricted to the
        /// network's manager: callers who are not a NetworkManager of <paramref name="networkId"/>
        /// get 403.
        /// </summary>
        [Authorize]
        [HttpGet("network-balance/{networkId}")]
        public IActionResult NetworkBalance(long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var un = _networkService.GetUserNetwork(networkId, session.UserId);
            if (un == null || un.Role != UserRoleEnum.NetworkManager)
            {
                return StatusCode(403);
            }

            return Ok(_service.GetNetworkBalance(networkId));
        }

        [Authorize]
        [HttpPost("searchStatement")]
        public async Task<IActionResult> SearchStatement([FromBody] StatementSearchParam param)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            if (param == null) return BadRequest();

            // Server-side scoping — never trust a client-supplied userId.
            //  - NetworkManager of the requested network → network own-cut (userId = null).
            //  - Any other member → forced to their own rows (userId = session).
            //    A member asking for a network they don't belong to simply gets their
            //    own (empty) rows — no cross-member leak.
            var un = _networkService.GetUserNetwork(param.NetworkId ?? 0, session.UserId);
            if (un != null && un.Role == UserRoleEnum.NetworkManager)
            {
                param.UserId = null;
            }
            else
            {
                param.UserId = session.UserId;
            }

            var token = HttpContext.GetBearerToken();
            return Ok(await _service.SearchStatement(param, token));
        }

        [Authorize]
        [HttpGet("getBalance")]
        public IActionResult GetBalance([FromQuery] long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            // Session-derived scoping: the member's own non-reversed paid balance,
            // in the given network when provided, else across all their networks.
            long? scopedNetworkId = networkId > 0 ? networkId : (long?)null;
            return Ok(_service.GetBalance(scopedNetworkId, session.UserId));
        }

        [Authorize]
        [HttpGet("getAvailableBalance")]
        public IActionResult GetAvailableBalance()
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            return Ok(_service.GetAvailableBalance(session.UserId));
        }

        [Authorize]
        [HttpGet("getInvoice/{networkId}/{proxypayInvoiceId}")]
        public async Task<IActionResult> GetInvoice(long networkId, long proxypayInvoiceId, CancellationToken ct)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            var inv = await _service.GetInvoice(networkId, proxypayInvoiceId, ct);
            if (inv == null) return NotFound();
            return Ok(inv);
        }

        public class EnsureCallbackBody
        {
            public long NetworkId { get; set; }
            public long ProxyPayInvoiceId { get; set; }
            public string Signature { get; set; }
        }
    }
}

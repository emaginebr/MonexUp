using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.API.Extensions;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
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
        private readonly IUserClient _userClient;

        public BillingController(
            IBillingService service,
            IUserClient userClient)
        {
            _service = service;
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

        [Authorize]
        [HttpPost("searchStatement")]
        public async Task<IActionResult> SearchStatement([FromBody] StatementSearchParam param)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            var token = HttpContext.GetBearerToken();
            return Ok(await _service.SearchStatement(param, token));
        }

        [Authorize]
        [HttpGet("getBalance")]
        public IActionResult GetBalance([FromQuery] long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();
            long? newNetworkId = (networkId > 0) ? networkId : 0;
            return Ok(_service.GetBalance(newNetworkId, newNetworkId.HasValue ? null : session.UserId));
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

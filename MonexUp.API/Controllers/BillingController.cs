using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.API.Extensions;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
using NAuth.ACL.Interfaces;
using System;
using System.Linq;
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
        private readonly IValidator<EnsureStoreRequest> _ensureStoreValidator;

        public BillingController(
            IBillingService service,
            IUserClient userClient,
            IValidator<EnsureStoreRequest> ensureStoreValidator)
        {
            _service = service;
            _userClient = userClient;
            _ensureStoreValidator = ensureStoreValidator;
        }

        [Authorize]
        [HttpPost("ensure-store")]
        public async Task<IActionResult> EnsureStore([FromBody] EnsureStoreRequest request, CancellationToken ct)
        {
            try
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

                var result = await _service.EnsureStoreAsync(request.NetworkId, session.UserId, token, ct);
                return StatusCode(result.StatusCode, result.Body);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BillingApiResult<EnsureStoreResponse>
                {
                    Sucesso = false,
                    MensagemErro = BuildErrorMessage(ex)
                });
            }
        }

        [Authorize]
        [HttpGet("list")]
        public IActionResult List([FromQuery] long networkId, [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();

                var result = _service.List(networkId, session.UserId, pageNum, pageSize);
                return result.Sucesso ? Ok(result) : StatusCode(403, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BillingListApiResult
                {
                    Sucesso = false,
                    MensagemErro = BuildErrorMessage(ex)
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("payment-completed")]
        public async Task<IActionResult> PaymentCompleted([FromBody] EnsureCallbackBody body, CancellationToken ct)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(200, new BillingApiResult<object>
                {
                    Sucesso = false,
                    MensagemErro = BuildErrorMessage(ex)
                });
            }
        }

        [Authorize]
        [HttpPost("searchStatement")]
        public async Task<IActionResult> SearchStatement([FromBody] StatementSearchParam param)
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();
                var token = HttpContext.GetBearerToken();
                return Ok(await _service.SearchStatement(param, token));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getBalance")]
        public IActionResult GetBalance([FromQuery] long networkId)
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();
                long? newNetworkId = (networkId > 0) ? networkId : 0;
                return Ok(_service.GetBalance(newNetworkId, newNetworkId.HasValue ? null : session.UserId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getAvailableBalance")]
        public IActionResult GetAvailableBalance()
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();
                return Ok(_service.GetAvailableBalance(session.UserId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getInvoice/{networkId}/{proxypayInvoiceId}")]
        public async Task<IActionResult> GetInvoice(long networkId, long proxypayInvoiceId, CancellationToken ct)
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();
                var inv = await _service.GetInvoice(networkId, proxypayInvoiceId, ct);
                if (inv == null) return NotFound();
                return Ok(inv);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class EnsureCallbackBody
        {
            public long NetworkId { get; set; }
            public long ProxyPayInvoiceId { get; set; }
            public string Signature { get; set; }
        }

        private static string BuildErrorMessage(Exception ex)
        {
            var parts = new System.Collections.Generic.List<string>();
            for (var current = ex; current != null; current = current.InnerException)
            {
                parts.Add($"[{current.GetType().Name}] {current.Message}");
            }
            return string.Join(" -> ", parts);
        }
    }
}

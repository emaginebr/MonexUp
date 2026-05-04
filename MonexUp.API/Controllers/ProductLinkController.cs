using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.API.Extensions;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.ProductLink;
using NAuth.ACL.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProductLinkController : ControllerBase
    {
        private readonly IProductLinkService _service;
        private readonly IUserClient _userClient;
        private readonly IValidator<ProductLinkInsertInfo> _validator;

        public ProductLinkController(
            IProductLinkService service,
            IUserClient userClient,
            IValidator<ProductLinkInsertInfo> validator)
        {
            _service = service;
            _userClient = userClient;
            _validator = validator;
        }

        [Authorize]
        [HttpPost("")]
        public async Task<IActionResult> Upsert([FromBody] ProductLinkInsertInfo info, CancellationToken ct)
        {
            try
            {
                var session = _userClient.GetUserInSession(HttpContext);
                if (session == null) return Unauthorized();

                var token = HttpContext.GetBearerToken();
                if (string.IsNullOrEmpty(token)) return Unauthorized();

                var validation = await _validator.ValidateAsync(info, ct);
                if (!validation.IsValid)
                {
                    return BadRequest(new ProductLinkApiResult
                    {
                        Sucesso = false,
                        MensagemErro = string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var result = await _service.UpsertAsync(info, session.UserId, token, ct);
                return StatusCode(result.StatusCode, result.Body);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ProductLinkApiResult
                {
                    Sucesso = false,
                    MensagemErro = BuildErrorMessage(ex)
                });
            }
        }

        [Authorize]
        [HttpGet("by-network/{networkId:long}")]
        public IActionResult GetByNetwork(long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var result = _service.GetByNetwork(networkId, session.UserId);
            return result.Sucesso ? Ok(result) : StatusCode(403, result);
        }

        [Authorize]
        [HttpGet("by-user/{userId:long}")]
        public IActionResult GetByUser(long userId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var result = _service.GetByUser(userId, session.UserId);
            return result.Sucesso ? Ok(result) : StatusCode(403, result);
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

        [Authorize]
        [HttpDelete("by-network/{networkId:long}")]
        public IActionResult DeleteByNetwork(long networkId)
        {
            var session = _userClient.GetUserInSession(HttpContext);
            if (session == null) return Unauthorized();

            var result = _service.DeleteByNetwork(networkId, session.UserId);
            return result.Sucesso ? Ok(result) : StatusCode(403, result);
        }
    }
}

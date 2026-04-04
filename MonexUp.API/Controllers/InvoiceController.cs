using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Invoice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using NAuth.ACL.Interfaces;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class InvoiceController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly IInvoiceService _invoiceService;
        private readonly IProxyPayService _proxyPayService;

        public InvoiceController(
            IInvoiceService invoiceService,
            IUserClient userClient,
            IProxyPayService proxyPayService
        )
        {
            _invoiceService = invoiceService;
            _userClient = userClient;
            _proxyPayService = proxyPayService;
        }

        [HttpGet("syncronize")]
        [Authorize]
        public async Task<IActionResult> Syncronize()
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                await _proxyPayService.SyncPendingInvoices();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public async Task<IActionResult> Search([FromBody] InvoiceSearchParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                return Ok(await _invoiceService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum, token));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("searchStatement")]
        [Authorize]
        public async Task<IActionResult> searchStatement([FromBody] StatementSearchParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                return Ok(await _invoiceService.SearchStatement(param, token));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBalance")]
        [Authorize]
        public IActionResult GetBalance([FromQuery] long networkId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                long? newNetworkId = (networkId > 0) ? networkId : 0;
                return Ok(_invoiceService.GetBalance(newNetworkId, newNetworkId.HasValue ? null : userSession.UserId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getAvailableBalance")]
        [Authorize]
        public IActionResult GetAvailableBalance()
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(_invoiceService.GetAvailableBalance(userSession.UserId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}

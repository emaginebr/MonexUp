using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Domain;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Network;
using MonexUp.DTO.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Climate;
using System;
using System.Threading.Tasks;

namespace MonexUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(
            IInvoiceService invoiceService, 
            IUserService userService
        )
        {
            _invoiceService = invoiceService;
            _userService = userService;
        }

        [HttpGet("syncronize")]
        [Authorize]
        public async Task<ActionResult<StatusResult>> Syncronize()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                await _invoiceService.Syncronize();
                return new StatusResult()
                {
                    Sucesso = true,
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public ActionResult<InvoiceListPagedResult> Search([FromBody] InvoiceSearchParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return _invoiceService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("searchStatement")]
        [Authorize]
        public ActionResult<StatementListPagedResult> searchStatement([FromBody] StatementSearchParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return _invoiceService.SearchStatement(param);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBalance")]
        [Authorize]
        public ActionResult<NumberResult> GetBalance([FromQuery] long networkId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                long? newNetworkId = (networkId > 0) ? networkId : 0;
                return new NumberResult{
                    Sucesso = true,
                    Value = _invoiceService.GetBalance(newNetworkId, newNetworkId.HasValue ? null : userSession.UserId)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getAvailableBalance")]
        [Authorize]
        public ActionResult<NumberResult> GetAvailableBalance()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new NumberResult
                {
                    Sucesso = true,
                    Value = _invoiceService.GetAvailableBalance(userSession.UserId)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("checkout/{checkoutSessionId}")]
        public async Task<ActionResult<InvoiceResult>> Checkout(string checkoutSessionId)
        {
            try
            {
                return new InvoiceResult
                {
                    Sucesso = true,
                    Invoice = _invoiceService.GetInvoiceInfo(await _invoiceService.Checkout(checkoutSessionId))
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Domain;
using exSales.DTO.Invoice;
using exSales.DTO.Network;
using exSales.DTO.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Climate;
using System;
using System.Threading.Tasks;

namespace exSales.API.Controllers
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
    }
}

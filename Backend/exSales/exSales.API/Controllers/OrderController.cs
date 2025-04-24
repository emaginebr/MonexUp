using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Order;
using exSales.DTO.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace exSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IOrderService _orderService;

        public OrderController(IUserService userService, IOrderService orderService)
        {
            _userService = userService;
            _orderService = orderService;
        }

        [HttpPost("insert")]
        public ActionResult<OrderResult> Insert([FromBody] OrderInfo order)
        {
            try
            {
                var newOrder = _orderService.Insert(order);
                return new OrderResult()
                {
                    Order = _orderService.GetOrderInfo(newOrder)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public ActionResult<OrderResult> Update([FromBody] OrderInfo order)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newOrder = _orderService.Update(order);
                return new OrderResult()
                {
                    Order = _orderService.GetOrderInfo(newOrder)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("list")]
        public ActionResult<OrderListResult> List([FromBody] OrderParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new OrderListResult
                {
                    Sucesso = true,
                    Orders = _orderService.List(param.NetworkId, param.UserId, param.Status)
                    .ToList()
                    .Select(x => _orderService.GetOrderInfo(x))
                    .ToList()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{orderId}")]
        public ActionResult<OrderResult> GetById(long orderId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new OrderResult
                {
                    Sucesso = true,
                    Order = _orderService.GetOrderInfo(_orderService.GetById(orderId))
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

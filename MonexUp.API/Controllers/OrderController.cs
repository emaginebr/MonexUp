using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using MonexUp.DTO.Payment;
using NAuth.ACL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class OrderController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly IOrderService _orderService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly INetworkService _networkService;
        private readonly IProductService _productService;
        private readonly IProxyPayService _proxyPayService;
        private readonly IProductDomainFactory _productFactory;

        public OrderController(
            IUserClient userClient,
            IOrderService orderService,
            ISubscriptionService subscriptionService,
            INetworkService networkService,
            IProductService productService,
            IProxyPayService proxyPayService,
            IProductDomainFactory productFactory
        )
        {
            _userClient = userClient;
            _orderService = orderService;
            _subscriptionService = subscriptionService;
            _networkService = networkService;
            _productService = productService;
            _proxyPayService = proxyPayService;
            _productFactory = productFactory;
        }

        [Authorize]
        [HttpPost("createPixPayment/{productSlug}")]
        public async Task<IActionResult> CreatePixPayment(
            string productSlug,
            [FromBody] PixPaymentRequest request,
            [FromQuery] string networkSlug,
            [FromQuery] string sellerSlug
        )
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }

                if (string.IsNullOrWhiteSpace(request?.DocumentId))
                {
                    return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "CPF é obrigatório" });
                }

                var product = _productService.GetBySlug(productSlug);
                if (product == null)
                {
                    return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "Produto não encontrado" });
                }

                long? networkId = null;
                if (!string.IsNullOrEmpty(networkSlug))
                {
                    var network = _networkService.GetBySlug(networkSlug);
                    if (network != null)
                    {
                        networkId = network.NetworkId;
                    }
                }

                long? sellerId = null;
                if (!string.IsNullOrEmpty(sellerSlug))
                {
                    var seller = await _userClient.GetBySlugAsync(sellerSlug);
                    if (seller != null)
                    {
                        sellerId = seller.UserId;
                    }
                }

                var token = HttpContext.GetBearerToken();
                var result = await _subscriptionService.CreatePixPayment(
                    product.ProductId, userSession.UserId, networkId, sellerId, request.DocumentId, token
                );

                if (!result.Sucesso)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new PixPaymentResult { Sucesso = false, Mensagem = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("checkPixStatus/{proxyPayInvoiceId}")]
        public async Task<IActionResult> CheckPixStatus(string proxyPayInvoiceId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }

                var status = await _proxyPayService.CheckQRCodeStatus(proxyPayInvoiceId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] OrderInfo order)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var newOrder = _orderService.Update(order);
                return Ok(await _orderService.GetOrderInfo(newOrder, token));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public async Task<IActionResult> Search([FromBody] OrderSearchParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                return Ok(await _orderService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum, token));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("list")]
        public async Task<IActionResult> List([FromBody] OrderParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var orderModels = _orderService.List(param.NetworkId, param.UserId, param.Status).ToList();
                var orders = new List<OrderInfo>();
                foreach (var x in orderModels)
                {
                    orders.Add(await _orderService.GetOrderInfo(x, token));
                }
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{orderId}")]
        public async Task<IActionResult> GetById(long orderId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(await _orderService.GetOrderInfo(_orderService.GetById(orderId), HttpContext.GetBearerToken()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

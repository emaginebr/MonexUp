using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using MonexUp.DTO.Subscription;
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
        private readonly IStripeService _stripeService;
        private readonly IProductDomainFactory _productFactory;

        public OrderController(
            IUserClient userClient,
            IOrderService orderService,
            ISubscriptionService subscriptionService,
            INetworkService networkService,
            IProductService productService,
            IStripeService stripeService,
            IProductDomainFactory productFactory
        )
        {
            _userClient = userClient;
            _orderService = orderService;
            _subscriptionService = subscriptionService;
            _networkService = networkService;
            _productService = productService;
            _stripeService = stripeService;
            _productFactory = productFactory;
        }

        [Authorize]
        [HttpGet("createSubscription/{productSlug}")]
        public async Task<ActionResult<SubscriptionResult>> CreateSubscription(
            string productSlug,
            [FromQuery] string networkSlug,
            [FromQuery] string sellerSlug
        )
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var product = _productService.GetBySlug(productSlug);
                if (product == null)
                {
                    throw new Exception("Product not found");
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
                var subscription = await _subscriptionService.CreateSubscription(product.ProductId, userSession.UserId, networkId, sellerId, token);

                return new SubscriptionResult()
                {
                    Order = subscription.Order,
                    ClientSecret = subscription.ClientSecret
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<ActionResult<OrderResult>> Update([FromBody] OrderInfo order)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var token = HttpContext.GetBearerToken();
                var newOrder = _orderService.Update(order);
                return new OrderResult()
                {
                    Order = await _orderService.GetOrderInfo(newOrder, token)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public async Task<ActionResult<OrderListPagedResult>> Search([FromBody] OrderSearchParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var token = HttpContext.GetBearerToken();
                return await _orderService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum, token);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("list")]
        public async Task<ActionResult<OrderListResult>> List([FromBody] OrderParam param)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var token = HttpContext.GetBearerToken();
                var orderModels = _orderService.List(param.NetworkId, param.UserId, param.Status).ToList();
                var orders = new List<OrderInfo>();
                foreach (var x in orderModels)
                {
                    orders.Add(await _orderService.GetOrderInfo(x, token));
                }
                return new OrderListResult
                {
                    Sucesso = true,
                    Orders = orders
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{orderId}")]
        public async Task<ActionResult<OrderResult>> GetById(long orderId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new OrderResult
                {
                    Sucesso = true,
                    Order = await _orderService.GetOrderInfo(_orderService.GetById(orderId), HttpContext.GetBearerToken())
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

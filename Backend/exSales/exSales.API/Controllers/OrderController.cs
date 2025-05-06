using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Order;
using exSales.DTO.Product;
using exSales.DTO.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace exSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IOrderService _orderService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IProductService _productService;
        private readonly IStripeService _stripeService;
        private readonly IUserDomainFactory _userFactory;
        private readonly IProductDomainFactory _productFactory;

        public OrderController(
            IUserService userService, 
            IOrderService orderService,
            ISubscriptionService subscriptionService,
            IProductService productService,
            IStripeService stripeService,
            IUserDomainFactory userFactory,
            IProductDomainFactory productFactory
        )
        {
            _userService = userService;
            _orderService = orderService;
            _subscriptionService = subscriptionService;
            _productService = productService;
            _stripeService = stripeService;
            _userFactory = userFactory;
            _productFactory = productFactory;
        }

        [Authorize]
        [HttpGet("createSubscription/{productSlug}")]
        public async Task<ActionResult<SubscriptionResult>> CreateSubscription(string productSlug, [FromQuery] string sellerSlug)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var product = _productService.GetBySlug(productSlug);
                if (product == null)
                {
                    throw new Exception("Product not found");
                }
                long? sellerId = null;
                if (!string.IsNullOrEmpty(sellerSlug))
                {
                    var seller = _userService.GetBySlug(sellerSlug);
                    if (seller != null)
                    {
                        sellerId = seller.UserId;
                    }
                }
                var subscription = await _subscriptionService.CreateSubscription(product.ProductId, userSession.UserId, sellerId);

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

        /*
        [Authorize]
        [HttpGet("createInvoice/{productSlug}")]
        public async Task<ActionResult<SubscriptionResult>> CreateInvoice(string productSlug)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var product = _productService.GetBySlug(productSlug);
                if (product == null)
                {
                    throw new Exception("Product not found");
                }
                var subscription = await _subscriptionService.CreateInvoice(product.ProductId, userSession.UserId);

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
        */

        /*
        [Authorize]
        [HttpGet("insert/{productId}")]
        public ActionResult<OrderResult> Insert(long productId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var newOrder = _orderService.Insert(new OrderInfo
                {
                    ProductId = productId,
                    UserId = userSession.UserId,
                    Status = OrderStatusEnum.Incoming
                });
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
        */

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

        [HttpPost("search")]
        [Authorize]
        public ActionResult<OrderListPagedResult> Search([FromBody] OrderSearchParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return _orderService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum);
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

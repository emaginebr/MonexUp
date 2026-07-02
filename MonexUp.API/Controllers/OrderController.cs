using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using MonexUp.DTO.Order;
using MonexUp.DTO.Payment;
using NAuth.ACL.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly IOrderService _orderService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly INetworkService _networkService;
        private readonly ILofnProductClient _lofnProductClient;
        private readonly IProxyPayService _proxyPayService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(
            IUserClient userClient,
            IOrderService orderService,
            ISubscriptionService subscriptionService,
            INetworkService networkService,
            ILofnProductClient lofnProductClient,
            IProxyPayService proxyPayService,
            ILogger<OrderController> logger
        )
        {
            _userClient = userClient;
            _orderService = orderService;
            _subscriptionService = subscriptionService;
            _networkService = networkService;
            _lofnProductClient = lofnProductClient;
            _proxyPayService = proxyPayService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("createPixPayment")]
        public async Task<IActionResult> CreatePixPayment([FromBody] PixPaymentRequest request, CancellationToken ct)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            if (request == null)
            {
                return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "Body é obrigatório" });
            }
            if (string.IsNullOrWhiteSpace(request.DocumentId))
            {
                return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "CPF é obrigatório" });
            }
            if (string.IsNullOrWhiteSpace(request.ProductSlug))
            {
                return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "productSlug é obrigatório" });
            }

            var product = await _lofnProductClient.GetBySlugAsync(request.ProductSlug);
            if (product == null)
            {
                return BadRequest(new PixPaymentResult { Sucesso = false, Mensagem = "Produto não encontrado" });
            }

            long? networkId = null;
            if (!string.IsNullOrWhiteSpace(request.NetworkSlug))
            {
                var network = _networkService.GetBySlug(request.NetworkSlug);
                if (network != null) networkId = network.NetworkId;
            }

            long? sellerId = null;
            if (!string.IsNullOrWhiteSpace(request.SellerSlug))
            {
                var seller = await _userClient.GetBySlugAsync(request.SellerSlug);
                if (seller != null) sellerId = seller.UserId;
            }

            var token = HttpContext.GetBearerToken();
            var result = await _subscriptionService.CreatePixPayment(
                product.ProductId, userSession.UserId, networkId, sellerId, request.DocumentId, request.Cellphone, token, request.Amount, ct
            );

            if (!result.Sucesso) return BadRequest(result);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("checkPixStatus/{proxyPayInvoiceId}")]
        public async Task<IActionResult> CheckPixStatus(string proxyPayInvoiceId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var status = await _proxyPayService.CheckQRCodeStatus(proxyPayInvoiceId);

            // When the provider reports paid, reflect it on the MonexUp order.
            // Idempotent (only advances Incoming → Active); a charge with no
            // matching order is surfaced by MarkPaidByInvoiceId returning null.
            if (status.Sucesso && status.Paid && long.TryParse(proxyPayInvoiceId, out var invoiceId))
            {
                var order = _orderService.MarkPaidByInvoiceId(invoiceId);
                if (order == null)
                {
                    _logger.LogWarning("Paid ProxyPay invoice {InvoiceId} has no matching MonexUp order.", invoiceId);
                }
            }

            return Ok(status);
        }

        // Dev/test only: proxies ProxyPay's simulate-payment so the browser never
        // calls ProxyPay directly. The status poller then flips the order to Active.
        [Authorize]
        [HttpPost("simulatePixPayment/{proxyPayInvoiceId}")]
        public async Task<IActionResult> SimulatePixPayment(long proxyPayInvoiceId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            try
            {
                await _proxyPayService.SimulatePayment(proxyPayInvoiceId);
                return Ok(new { sucesso = true });
            }
            catch (System.Net.Http.HttpRequestException ex)
            {
                _logger.LogWarning(ex, "Simulate PIX payment failed for invoice {InvoiceId}", proxyPayInvoiceId);
                return StatusCode(502, new { sucesso = false, mensagem = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] OrderInfo order)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var newOrder = _orderService.Update(order);
            return Ok(await _orderService.GetOrderInfo(newOrder, token));
        }

        [HttpPost("search")]
        [Authorize]
        public async Task<IActionResult> Search([FromBody] OrderSearchParam param)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            return Ok(await _orderService.Search(param.NetworkId, param.UserId, param.SellerId, param.PageNum, token));
        }

        [Authorize]
        [HttpPost("list")]
        public async Task<IActionResult> List([FromBody] OrderParam param)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var orderModels = _orderService.List(param.NetworkId, param.UserId, param.Status).ToList();
            var orders = new List<OrderInfo>();
            foreach (var x in orderModels)
            {
                orders.Add(await _orderService.GetOrderInfo(x, token));
            }
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("getById/{orderId}")]
        public async Task<IActionResult> GetById(long orderId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            return Ok(await _orderService.GetOrderInfo(_orderService.GetById(orderId), HttpContext.GetBearerToken()));
        }
    }
}

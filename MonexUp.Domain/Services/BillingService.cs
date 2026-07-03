using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Order;
using MonexUp.DTO.User;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.ACL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class BillingService : IBillingService
    {
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IInvoiceFeeDomainFactory _feeFactory;
        private readonly IOrderDomainFactory _orderFactory;
        private readonly IOrderItemDomainFactory _orderItemFactory;
        private readonly IUserProfileDomainFactory _profileFactory;
        private readonly INetworkService _networkService;
        private readonly IProxyPayClient _proxyPayClient;
        private readonly IProxyPayService _proxyPayService;
        private readonly IBillingFeeService _billingFeeService;
        private readonly IUserClient _userClient;
        private readonly ILofnProductClient _lofnProductClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BillingService> _logger;

        public BillingService(
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IInvoiceFeeDomainFactory feeFactory,
            IOrderDomainFactory orderFactory,
            IOrderItemDomainFactory orderItemFactory,
            IUserProfileDomainFactory profileFactory,
            INetworkService networkService,
            IProxyPayClient proxyPayClient,
            IProxyPayService proxyPayService,
            IBillingFeeService billingFeeService,
            IUserClient userClient,
            ILofnProductClient lofnProductClient,
            IConfiguration configuration,
            ILogger<BillingService> logger)
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _feeFactory = feeFactory;
            _orderFactory = orderFactory;
            _orderItemFactory = orderItemFactory;
            _profileFactory = profileFactory;
            _networkService = networkService;
            _proxyPayClient = proxyPayClient;
            _proxyPayService = proxyPayService;
            _billingFeeService = billingFeeService;
            _userClient = userClient;
            _lofnProductClient = lofnProductClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<EnsureStoreResult> EnsureStoreAsync(long networkId, long callerUserId, string bearerToken, CancellationToken ct = default)
        {
            if (networkId <= 0)
            {
                return Fail(400, "networkId é obrigatório.");
            }
            if (string.IsNullOrWhiteSpace(bearerToken))
            {
                return Fail(401, "bearerToken é obrigatório.");
            }
            if (!IsManager(callerUserId, networkId))
            {
                return Fail(403, "Apenas o gestor da rede pode provisionar a loja ProxyPay.");
            }

            var networkModel = _networkFactory.BuildNetworkModel();
            var network = networkModel.GetById(networkId, _networkFactory);
            if (network == null)
            {
                return Fail(404, $"Rede {networkId} não encontrada.");
            }

            if (network.ProxyPayStoreId.HasValue && network.ProxyPayStoreId.Value > 0
                && !string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return Ok(network.ProxyPayStoreId.Value, network.ProxyPayClientId);
            }

            INetworkModel provisioned;
            try
            {
                provisioned = await _proxyPayService.EnsureStoreAsync(network, bearerToken, ct);
            }
            catch (Exception ex)
            {
                return Fail(503, "ProxyPay indisponível, tente novamente. " + ex.Message);
            }

            if (provisioned == null
                || !provisioned.ProxyPayStoreId.HasValue
                || provisioned.ProxyPayStoreId.Value <= 0
                || string.IsNullOrEmpty(provisioned.ProxyPayClientId))
            {
                return Fail(503, "ProxyPay provisioning did not return a usable store.");
            }

            return Ok(provisioned.ProxyPayStoreId.Value, provisioned.ProxyPayClientId);
        }

        public async Task<PaymentCompletionResult> ProcessPaymentCompletionAsync(PaymentCompletionInfo info, CancellationToken ct = default)
        {
            if (info == null)
            {
                return CompletionFail(400, "Body inválido.");
            }
            var secret = _configuration["ProxyPay:WebhookCallbackSecret"];
            if (string.IsNullOrWhiteSpace(secret))
            {
                return CompletionFail(500, "WebhookCallbackSecret não configurado.");
            }

            var expectedSig = ComputeHmac(secret, $"{info.NetworkId}|{info.ProxyPayInvoiceId}");
            if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(info.Signature ?? string.Empty),
                Encoding.UTF8.GetBytes(expectedSig)))
            {
                return CompletionFail(401, "Assinatura inválida.");
            }

            var network = _networkFactory.BuildNetworkModel().GetById(info.NetworkId, _networkFactory);
            if (network == null || !network.ProxyPayStoreId.HasValue || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return CompletionFail(404, "Rede sem ProxyPay configurado.");
            }

            ProxyPayInvoiceStatusInfo invoice;
            try
            {
                invoice = await _proxyPayClient.GetInvoiceAsync(info.ProxyPayInvoiceId, network.ProxyPayClientId, ct);
            }
            catch (Exception ex)
            {
                return CompletionFail(503, "ProxyPay indisponível. " + ex.Message);
            }

            if (invoice == null)
            {
                return CompletionFail(404, "Invoice não encontrado no ProxyPay.");
            }

            if (invoice.StoreId.HasValue && invoice.StoreId.Value != network.ProxyPayStoreId.Value)
            {
                return CompletionFail(403, "Invoice não pertence a esta rede.");
            }

            const int STATUS_PAID = 3;
            if (invoice.Status != STATUS_PAID)
            {
                return CompletionOk("Aguardando confirmação (pending).");
            }

            var paidAmountCents = (long)Math.Round(invoice.Amount * 100);
            var paidAt = invoice.PaidAt ?? DateTime.UtcNow;

            var inserted = _billingFeeService.RecordPaidProxyPayInvoice(
                info.ProxyPayInvoiceId, info.NetworkId, paidAmountCents, paidAt);

            return CompletionOk(inserted > 0 ? "Comissão registrada." : "Comissão já registrada.");
        }

        public string BuildCompletionUrl(long networkId, long proxypayInvoiceId)
        {
            var baseUrl = _configuration["ProxyPay:CompletionUrlBase"]?.TrimEnd('/') ?? string.Empty;
            var secret = _configuration["ProxyPay:WebhookCallbackSecret"] ?? string.Empty;
            var sig = ComputeHmac(secret, $"{networkId}|{proxypayInvoiceId}");
            return $"{baseUrl}?n={networkId}&i={proxypayInvoiceId}&s={Uri.EscapeDataString(sig)}";
        }

        public BillingListApiResult List(long networkId, long callerUserId, int pageNum, int pageSize)
        {
            if (!IsMember(callerUserId, networkId))
            {
                return new BillingListApiResult
                {
                    Sucesso = false,
                    MensagemErro = "Usuário não pertence à rede."
                };
            }

            return new BillingListApiResult
            {
                Sucesso = true,
                Data = new List<BillingListItemInfo>(),
                PageNum = pageNum,
                PageSize = pageSize,
                TotalCount = 0
            };
        }

        public async Task<StatementListPagedResult> SearchStatement(StatementSearchParam param, string token)
        {
            int pageCount = 0;
            var fees = _feeFactory.BuildInvoiceFeeModel().Search(param.NetworkId, param.UserId, param.Ini, param.End, param.PageNum, out pageCount, _feeFactory);
            var statements = new List<StatementInfo>();
            foreach (var fee in fees)
            {
                statements.Add(await GetStatementInfo(fee, token));
            }
            return new StatementListPagedResult
            {
                PageNum = param.PageNum,
                PageCount = pageCount,
                Statements = statements
            };
        }

        public double GetBalance(long? networkId, long? userId)
        {
            return _feeFactory.BuildInvoiceFeeModel().GetBalance(networkId, userId);
        }

        public double GetAvailableBalance(long userId)
        {
            return _feeFactory.BuildInvoiceFeeModel().GetAvailableBalance(userId);
        }

        public async Task<InvoiceListPagedResult> SearchInvoicesAsync(InvoiceSearchParam param, long callerUserId, string token, CancellationToken ct = default)
        {
            var empty = new InvoiceListPagedResult
            {
                Invoices = new List<InvoiceListItemInfo>(),
                PageNum = param?.PageNum ?? 1,
                PageSize = Math.Min(Math.Max(param?.PageSize ?? 20, 1), 50),
                TotalCount = 0,
                TotalPages = 0,
                PageCount = 0
            };

            if (param == null || param.NetworkId <= 0)
            {
                return empty;
            }

            // Cap pageSize hard at 50 to bound the N+1 damage to ProxyPay until
            // the batch list endpoint documented in docs/PROXYPAY_FIXES_NEEDED.md
            // item 6 lands.
            var pageSize = Math.Min(Math.Max(param.PageSize <= 0 ? 20 : param.PageSize, 1), 50);
            var pageNum = param.PageNum <= 0 ? 1 : param.PageNum;

            _logger?.LogWarning(
                "SearchInvoicesAsync runs N+1 HTTP calls to ProxyPay (one per order) — pending a fast-path list endpoint from ProxyPay (see docs/PROXYPAY_FIXES_NEEDED.md item 6). NetworkId={NetworkId} pageSize={PageSize}",
                param.NetworkId, pageSize);

            // Role gate: mirrors OrderSearchPage rules.
            //  - Administrator / NetworkManager: no per-user filter
            //  - Seller: order.SellerId == callerUserId
            //  - User: order.UserId == callerUserId
            var un = _userNetworkFactory.BuildUserNetworkModel().Get(param.NetworkId, callerUserId, _userNetworkFactory);
            var role = un?.Role ?? UserRoleEnum.MoRole;

            long? filterUserId = null;
            long? filterSellerId = null;
            switch (role)
            {
                case UserRoleEnum.Administrator:
                case UserRoleEnum.NetworkManager:
                    break;
                case UserRoleEnum.Seller:
                    filterSellerId = callerUserId;
                    break;
                case UserRoleEnum.User:
                    filterUserId = callerUserId;
                    break;
                default:
                    // Anyone without a valid role in the network gets nothing —
                    // the controller already 401/403s upstream, this is a safety net.
                    return empty;
            }

            // Pull every matching order for the network+role. Uses the existing
            // IOrderModel.Search paginated call in a loop because there is no
            // "list all for network" repository method today. Filters like status
            // and date range are applied AFTER we fetch each ProxyPay invoice
            // (status only lives on the invoice, not on the order).
            var orderModel = _orderFactory.BuildOrderModel();
            var orders = new List<IOrderModel>();
            int p = 1;
            int pageCount;
            do
            {
                var batch = orderModel
                    .Search(param.NetworkId, filterUserId, filterSellerId, p, out pageCount, _orderFactory)
                    .ToList();
                orders.AddRange(batch);
                p++;
            } while (p <= pageCount);

            // Fetch full invoice per order (N+1 into ProxyPay). Enrich with buyer
            // and seller from NAuth, order id, and computed total. Skip orders
            // without an invoice id or whose invoice fetch fails.
            var items = new List<InvoiceListItemInfo>();
            foreach (var order in orders)
            {
                if (!order.ProxyPayInvoiceId.HasValue || order.ProxyPayInvoiceId.Value <= 0)
                {
                    continue;
                }

                InvoiceInfo invoice;
                try
                {
                    invoice = await GetInvoice(param.NetworkId, order.ProxyPayInvoiceId.Value, ct);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex,
                        "SearchInvoicesAsync: failed to fetch ProxyPay invoice {InvoiceId} for order {OrderId} (network {NetworkId}) — row skipped",
                        order.ProxyPayInvoiceId.Value, order.OrderId, param.NetworkId);
                    continue;
                }
                if (invoice == null)
                {
                    continue;
                }

                string buyerName = null;
                string buyerEmail = null;
                var buyer = await _userClient.GetByIdAsync(order.UserId, token);
                if (buyer != null)
                {
                    buyerName = buyer.Name;
                    buyerEmail = buyer.Email;
                }

                string sellerName = null;
                if (order.SellerId.HasValue)
                {
                    var seller = await _userClient.GetByIdAsync(order.SellerId.Value, token);
                    sellerName = seller?.Name;
                }

                items.Add(new InvoiceListItemInfo
                {
                    InvoiceId = invoice.InvoiceId,
                    InvoiceNumber = invoice.InvoiceNumber,
                    DueDate = invoice.DueDate,
                    PaidAt = invoice.PaidAt,
                    CreatedAt = invoice.CreatedAt,
                    Status = invoice.Status,
                    Total = ComputeInvoiceTotal(invoice),
                    OrderId = order.OrderId,
                    BuyerId = order.UserId,
                    BuyerName = buyerName,
                    BuyerEmail = buyerEmail,
                    SellerId = order.SellerId,
                    SellerName = sellerName
                });
            }

            // In-memory filters.
            if (param.Status.HasValue)
            {
                var statusFilter = (InvoiceStatusEnum)param.Status.Value;
                items = items.Where(i => i.Status == statusFilter).ToList();
            }
            if (param.FromDate.HasValue)
            {
                var from = param.FromDate.Value;
                items = items.Where(i => i.CreatedAt >= from).ToList();
            }
            if (param.ToDate.HasValue)
            {
                var to = param.ToDate.Value;
                items = items.Where(i => i.CreatedAt <= to).ToList();
            }
            if (!string.IsNullOrWhiteSpace(param.Keyword))
            {
                var kw = param.Keyword.Trim();
                items = items.Where(i =>
                    (!string.IsNullOrEmpty(i.InvoiceNumber) && i.InvoiceNumber.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    || (!string.IsNullOrEmpty(i.BuyerName) && i.BuyerName.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    || (!string.IsNullOrEmpty(i.BuyerEmail) && i.BuyerEmail.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    || (!string.IsNullOrEmpty(i.SellerName) && i.SellerName.Contains(kw, StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            var sorted = items.OrderByDescending(i => i.CreatedAt).ToList();
            var totalCount = sorted.Count;
            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / pageSize);

            var pageItems = sorted
                .Skip(pageSize * (pageNum - 1))
                .Take(pageSize)
                .ToList();

            return new InvoiceListPagedResult
            {
                Invoices = pageItems,
                PageNum = pageNum,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                PageCount = totalPages
            };
        }

        private static double ComputeInvoiceTotal(InvoiceInfo invoice)
        {
            if (invoice?.Items == null)
            {
                return 0;
            }
            var subtotal = invoice.Items.Sum(i => (i.UnitPrice * i.Quantity) - i.Discount);
            var total = subtotal - invoice.Discount;
            return total < 0 ? 0 : total;
        }

        public async Task<IList<InvoiceInfo>> ListInvoicesForOrderAsync(long networkId, long? proxyPayInvoiceId, CancellationToken ct = default)
        {
            var invoices = new List<InvoiceInfo>();
            if (!proxyPayInvoiceId.HasValue || proxyPayInvoiceId.Value <= 0)
            {
                return invoices;
            }

            try
            {
                var invoice = await GetInvoice(networkId, proxyPayInvoiceId.Value, ct);
                if (invoice != null)
                {
                    invoices.Add(invoice);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex,
                    "Failed to fetch ProxyPay invoice {ProxyPayInvoiceId} for network {NetworkId}",
                    proxyPayInvoiceId.Value, networkId);
                return new List<InvoiceInfo>();
            }

            return invoices
                .OrderByDescending(i => i.CreatedAt)
                .ToList();
        }

        public async Task<InvoiceInfo> GetInvoice(long networkId, long proxypayInvoiceId, CancellationToken ct = default)
        {
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return null;
            }

            // Prefer the full `/Invoice/getById/{id}` response so consumers get
            // items, invoice number, discount, dates. Fall back to the lightweight
            // qrcode/status shape if the full endpoint fails for any reason.
            try
            {
                var full = await _proxyPayClient.GetFullInvoiceAsync(proxypayInvoiceId, ct);
                if (full != null)
                {
                    return new InvoiceInfo
                    {
                        InvoiceId = full.InvoiceId,
                        InvoiceNumber = full.InvoiceNumber,
                        Notes = full.Notes,
                        Status = (InvoiceStatusEnum)full.Status,
                        PaymentMethod = full.PaymentMethod > 0
                            ? (MonexUp.DTO.Invoice.PaymentMethodEnum)full.PaymentMethod
                            : MonexUp.DTO.Invoice.PaymentMethodEnum.Pix,
                        Discount = full.Discount,
                        DueDate = full.DueDate,
                        ExpiresAt = full.ExpiresAt,
                        PaidAt = full.PaidAt,
                        CreatedAt = full.CreatedAt,
                        UpdatedAt = full.UpdatedAt,
                        ExternalCode = full.ExternalCode,
                        Items = (full.Items ?? new List<ProxyPayInvoiceItemInfo>())
                            .Select(i => new InvoiceItemInfo
                            {
                                InvoiceItemId = i.InvoiceItemId,
                                InvoiceId = full.InvoiceId,
                                Description = i.Description,
                                Quantity = i.Quantity,
                                UnitPrice = i.UnitPrice,
                                Discount = i.Discount
                            })
                            .ToList()
                    };
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex,
                    "GetFullInvoiceAsync failed for invoice {InvoiceId} — falling back to lightweight status",
                    proxypayInvoiceId);
            }

            var status = await _proxyPayClient.GetInvoiceAsync(proxypayInvoiceId, network.ProxyPayClientId, ct);
            if (status == null)
            {
                return null;
            }

            return new InvoiceInfo
            {
                InvoiceId = status.InvoiceId,
                Status = (InvoiceStatusEnum)status.Status,
                PaymentMethod = MonexUp.DTO.Invoice.PaymentMethodEnum.Pix,
                DueDate = status.DueDate ?? DateTime.MinValue,
                PaidAt = status.PaidAt,
                Items = new List<InvoiceItemInfo>()
            };
        }

        private async Task<StatementInfo> GetStatementInfo(IInvoiceFeeModel fee, string token)
        {
            string networkName = null;
            string buyerName = null;
            string sellerName = null;
            string description = null;
            long? sellerId = null;
            long? buyerUserId = null;

            if (fee.NetworkId.HasValue)
            {
                var net = _networkService.GetById(fee.NetworkId.Value);
                networkName = net?.Name;
            }

            if (fee.ProxyPayInvoiceId.HasValue)
            {
                var order = _orderFactory.BuildOrderModel().GetByProxyPayInvoiceId(fee.ProxyPayInvoiceId.Value, _orderFactory);
                if (order != null)
                {
                    if (string.IsNullOrEmpty(networkName))
                    {
                        var net = _networkService.GetById(order.NetworkId);
                        networkName = net?.Name;
                    }
                    sellerId = order.SellerId;
                    buyerUserId = order.UserId;

                    var buyer = await _userClient.GetByIdAsync(order.UserId, token);
                    buyerName = buyer?.Name;

                    if (order.SellerId.HasValue)
                    {
                        var seller = await _userClient.GetByIdAsync(order.SellerId.Value, token);
                        sellerName = seller?.Name;
                    }

                    var items = order.ListItems(_orderItemFactory);
                    var descriptions = new List<string>();
                    foreach (var x in items)
                    {
                        var product = await _lofnProductClient.GetByIdAsync(x.ProductId);
                        descriptions.Add((product?.Name ?? "?") + " (" + x.Quantity.ToString() + ")");
                    }
                    description = string.Join(", ", descriptions);
                }
            }

            return new StatementInfo
            {
                ProxyPayInvoiceId = fee.ProxyPayInvoiceId,
                FeeId = fee.FeeId,
                NetworkId = fee.NetworkId,
                NetworkName = networkName,
                UserId = buyerUserId,
                BuyerName = buyerName,
                SellerId = sellerId,
                SellerName = sellerName,
                Description = description,
                Amount = fee.Amount,
                PaidAt = fee.PaidAt,
                WithdrawalDueDate = fee.WithdrawalDueDate
            };
        }

        private bool IsManager(long userId, long networkId)
        {
            var un = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
            if (un == null) return false;
            return un.Role == UserRoleEnum.NetworkManager || un.Role == UserRoleEnum.Administrator;
        }

        private bool IsMember(long userId, long networkId)
        {
            var un = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);
            return un != null && un.Role >= UserRoleEnum.User;
        }

        private static string ComputeHmac(string secret, string payload)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToBase64String(bytes);
        }

        private static PaymentCompletionResult CompletionOk(string msg) => new()
        {
            StatusCode = 200,
            Body = new BillingApiResult<object>
            {
                Sucesso = true,
                MensagemSucesso = msg
            }
        };

        private static PaymentCompletionResult CompletionFail(int status, string err) => new()
        {
            StatusCode = status,
            Body = new BillingApiResult<object>
            {
                Sucesso = false,
                MensagemErro = err
            }
        };

        private static EnsureStoreResult Ok(long storeId, string clientId) => new()
        {
            StatusCode = 200,
            Body = new BillingApiResult<EnsureStoreResponse>
            {
                Sucesso = true,
                Data = new EnsureStoreResponse
                {
                    ProxyPayStoreId = storeId,
                    ProxyPayClientId = clientId
                }
            }
        };

        private static EnsureStoreResult Fail(int status, string error) => new()
        {
            StatusCode = status,
            Body = new BillingApiResult<EnsureStoreResponse>
            {
                Sucesso = false,
                MensagemErro = error
            }
        };
    }
}

using Microsoft.Extensions.Configuration;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
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
        private readonly IBillingFeeService _billingFeeService;
        private readonly IUserClient _userClient;
        private readonly ILofnProductClient _lofnProductClient;
        private readonly IConfiguration _configuration;

        public BillingService(
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IInvoiceFeeDomainFactory feeFactory,
            IOrderDomainFactory orderFactory,
            IOrderItemDomainFactory orderItemFactory,
            IUserProfileDomainFactory profileFactory,
            INetworkService networkService,
            IProxyPayClient proxyPayClient,
            IBillingFeeService billingFeeService,
            IUserClient userClient,
            ILofnProductClient lofnProductClient,
            IConfiguration configuration)
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _feeFactory = feeFactory;
            _orderFactory = orderFactory;
            _orderItemFactory = orderItemFactory;
            _profileFactory = profileFactory;
            _networkService = networkService;
            _proxyPayClient = proxyPayClient;
            _billingFeeService = billingFeeService;
            _userClient = userClient;
            _lofnProductClient = lofnProductClient;
            _configuration = configuration;
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

            ProxyPayStoreCreatedInfo created;
            try
            {
                created = await _proxyPayClient.InsertStoreAsync(network.Name, network.Email, bearerToken, ct);
            }
            catch (Exception ex) when (ex.Message.Contains("User already has a store", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    created = await _proxyPayClient.GetMyStoreAsync(bearerToken, ct);
                }
                catch (Exception ex2)
                {
                    return Fail(503, "ProxyPay indisponível, tente novamente. " + ex2.Message);
                }
                if (created == null || created.StoreId <= 0 || string.IsNullOrEmpty(created.ClientId))
                {
                    return Fail(503, "ProxyPay reportou loja existente mas GraphQL myStore não retornou dados.");
                }
            }
            catch (Exception ex)
            {
                return Fail(503, "ProxyPay indisponível, tente novamente. " + ex.Message);
            }

            var won = networkModel.TrySetProxyPayStore(networkId, created.StoreId, created.ClientId);
            if (won)
            {
                return Ok(created.StoreId, created.ClientId);
            }

            var refreshed = networkModel.GetById(networkId, _networkFactory);
            if (refreshed?.ProxyPayStoreId.HasValue == true && refreshed.ProxyPayStoreId.Value > 0)
            {
                return Ok(refreshed.ProxyPayStoreId.Value, refreshed.ProxyPayClientId);
            }

            return Ok(created.StoreId, created.ClientId);
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

        public async Task<InvoiceInfo> GetInvoice(long networkId, long proxypayInvoiceId, CancellationToken ct = default)
        {
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return null;
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

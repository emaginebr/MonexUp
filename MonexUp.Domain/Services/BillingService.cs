using Microsoft.Extensions.Configuration;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Billing;
using MonexUp.DTO.User;
using MonexUp.Infra.Interfaces.AppServices;
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
        private readonly IProxyPayClient _proxyPayClient;
        private readonly IBillingFeeService _billingFeeService;
        private readonly IConfiguration _configuration;

        public BillingService(
            INetworkDomainFactory networkFactory,
            IUserNetworkDomainFactory userNetworkFactory,
            IProxyPayClient proxyPayClient,
            IBillingFeeService billingFeeService,
            IConfiguration configuration)
        {
            _networkFactory = networkFactory;
            _userNetworkFactory = userNetworkFactory;
            _proxyPayClient = proxyPayClient;
            _billingFeeService = billingFeeService;
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
                created = await _proxyPayClient.InsertStoreAsync(network.Name, bearerToken, ct);
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

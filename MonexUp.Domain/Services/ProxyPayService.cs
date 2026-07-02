using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Lofn;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.DTO.User;

namespace MonexUp.Domain.Impl.Services
{
    public class ProxyPayService : IProxyPayService
    {
        private readonly IProxyPayAppService _proxyPayAppService;
        private readonly IProxyPayClient _proxyPayClient;
        private readonly INetworkDomainFactory _networkFactory;

        public ProxyPayService(
            IProxyPayAppService proxyPayAppService,
            IProxyPayClient proxyPayClient,
            INetworkDomainFactory networkFactory)
        {
            _proxyPayAppService = proxyPayAppService;
            _proxyPayClient = proxyPayClient;
            _networkFactory = networkFactory;
        }

        public async Task<INetworkModel> EnsureStoreAsync(INetworkModel network, string bearerToken, CancellationToken ct = default)
        {
            if (network == null)
                throw new ArgumentNullException(nameof(network));
            if (string.IsNullOrWhiteSpace(bearerToken))
                throw new ArgumentException("bearerToken is required.", nameof(bearerToken));

            if (network.ProxyPayStoreId.HasValue
                && network.ProxyPayStoreId.Value > 0
                && !string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return network;
            }

            ProxyPayStoreCreatedInfo created;
            try
            {
                created = await _proxyPayClient.InsertStoreAsync(network.Name, network.Email, bearerToken, ct);
            }
            catch (Exception ex) when (ex.Message.Contains("User already has a store", StringComparison.OrdinalIgnoreCase))
            {
                created = await _proxyPayClient.GetMyStoreAsync(bearerToken, ct);
                if (created == null || created.StoreId <= 0 || string.IsNullOrEmpty(created.ClientId))
                {
                    throw new InvalidOperationException("ProxyPay reported existing store but GraphQL myStore returned no data.");
                }
            }

            _networkFactory.BuildNetworkModel().TrySetProxyPayStore(network.NetworkId, created.StoreId, created.ClientId);

            // Persisted via raw SQL (ExecuteSqlInterpolated bypasses the EF change
            // tracker). Reflect the values on the in-memory model instead of
            // rereading — GetById/Find would return the stale tracked instance
            // from the same DbContext scope, with proxypay_store_id still null.
            network.ProxyPayStoreId = created.StoreId;
            network.ProxyPayClientId = created.ClientId;
            return network;
        }

        public async Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, LofnProductInfo product, INetworkModel network, UserInfo seller, decimal? unitPriceOverride = null)
        {
            if (network == null || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = "Network has no ProxyPay store."
                };
            }

            // Open-amount donations send the buyer-typed value via
            // unitPriceOverride. Anything else (fixed price products, fixed
            // donations) falls back to the product's stored Price.
            // ProxyPayItem.UnitPrice is double — cast at the boundary.
            var unitPrice = unitPriceOverride.HasValue && unitPriceOverride.Value > 0
                ? (double)unitPriceOverride.Value
                : product.Price;

            // Buyer identity is sourced from the NAuth UserInfo (already
            // merged with any body-supplied values upstream).
            var customerCellphone = user.Phones?.FirstOrDefault()?.Phone ?? string.Empty;

            var request = new ProxyPayQRCodeRequest
            {
                ClientId = network.ProxyPayClientId,
                CustomerName = user.Name,
                CustomerEmail = user.Email,
                CustomerDocumentId = user.IdDocument,
                CustomerCellphone = customerCellphone,
                Items = new List<ProxyPayItem>
                {
                    new ProxyPayItem
                    {
                        Id = product.ProductId.ToString(),
                        Description = product.Name,
                        Quantity = 1,
                        UnitPrice = unitPrice
                    }
                }
            };

            return await _proxyPayAppService.CreateQRCodeAsync(request);
        }

        public async Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId)
        {
            return await _proxyPayAppService.CheckQRCodeStatusAsync(proxyPayInvoiceId);
        }

        public async Task SetAbacatePayApiKey(long networkId, string apiKey, string bearerToken, CancellationToken ct = default)
        {
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null)
                throw new InvalidOperationException("Network not found.");
            if (!network.ProxyPayStoreId.HasValue || network.ProxyPayStoreId.Value <= 0)
                throw new InvalidOperationException("Network has no ProxyPay store provisioned.");

            await _proxyPayClient.SetAbacatePayApiKeyAsync(network.ProxyPayStoreId.Value, apiKey, bearerToken, ct);
        }

        public async Task<bool> GetHasAbacatePayApiKey(string bearerToken, CancellationToken ct = default)
        {
            return await _proxyPayClient.GetHasAbacatePayApiKeyAsync(bearerToken, ct);
        }

        public async Task SimulatePayment(long proxyPayInvoiceId, CancellationToken ct = default)
        {
            await _proxyPayClient.SimulatePaymentAsync(proxyPayInvoiceId, ct);
        }

        public Task SyncPendingInvoices()
        {
            // Reconciliation now handled by BillingReconciliationService.
            return Task.CompletedTask;
        }
    }
}

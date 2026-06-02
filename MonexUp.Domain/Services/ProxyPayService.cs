using System;
using System.Collections.Generic;
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

            var refreshed = _networkFactory.BuildNetworkModel().GetById(network.NetworkId, _networkFactory);
            return refreshed ?? network;
        }

        public async Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, LofnProductInfo product, INetworkModel network, UserInfo seller, string documentId)
        {
            if (network == null || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = "Network has no ProxyPay store."
                };
            }

            var request = new ProxyPayQRCodeRequest
            {
                ClientId = network.ProxyPayClientId,
                CustomerName = user.Name,
                CustomerEmail = user.Email,
                CustomerDocumentId = documentId,
                CustomerCellphone = string.Empty,
                Items = new List<ProxyPayItem>
                {
                    new ProxyPayItem
                    {
                        Id = product.ProductId.ToString(),
                        Description = product.Name,
                        Quantity = 1,
                        UnitPrice = product.Price
                    }
                }
            };

            return await _proxyPayAppService.CreateQRCodeAsync(request);
        }

        public async Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId)
        {
            return await _proxyPayAppService.CheckQRCodeStatusAsync(proxyPayInvoiceId);
        }

        public Task SyncPendingInvoices()
        {
            // Reconciliation now handled by BillingReconciliationService.
            return Task.CompletedTask;
        }
    }
}

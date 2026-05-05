using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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

        public ProxyPayService(IProxyPayAppService proxyPayAppService)
        {
            _proxyPayAppService = proxyPayAppService;
        }

        public async Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, LofnProductInfo product, INetworkModel network, UserInfo seller, string documentId)
        {
            if (network == null || string.IsNullOrEmpty(network.ProxyPayClientId))
            {
                return new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = "Network has no ProxyPay store. Call /Billing/ensure-store first."
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

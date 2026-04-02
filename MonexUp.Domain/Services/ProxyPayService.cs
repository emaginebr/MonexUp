using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using NAuth.DTO.User;

namespace MonexUp.Domain.Impl.Services
{
    public class ProxyPayService : IProxyPayService
    {
        private readonly IProxyPayAppService _proxyPayAppService;
        private readonly IInvoiceDomainFactory _invoiceFactory;
        private readonly IInvoiceFeeDomainFactory _feeFactory;
        private readonly IInvoiceService _invoiceService;

        public ProxyPayService(
            IProxyPayAppService proxyPayAppService,
            IInvoiceDomainFactory invoiceFactory,
            IInvoiceFeeDomainFactory feeFactory,
            IInvoiceService invoiceService)
        {
            _proxyPayAppService = proxyPayAppService;
            _invoiceFactory = invoiceFactory;
            _feeFactory = feeFactory;
            _invoiceService = invoiceService;
        }

        public async Task<ProxyPayQRCodeResponse> CreateQRCode(UserInfo user, IProductModel product, INetworkModel network, UserInfo seller, string documentId)
        {
            var request = new ProxyPayQRCodeRequest
            {
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

            var response = await _proxyPayAppService.CreateQRCodeAsync(request);
            return response;
        }

        public async Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatus(string proxyPayInvoiceId)
        {
            var response = await _proxyPayAppService.CheckQRCodeStatusAsync(proxyPayInvoiceId);
            return response;
        }

        public async Task SyncPendingInvoices()
        {
            // Placeholder: In this phase, PIX payment sync is handled by the polling flow
            // (frontend polls CheckQRCodeStatus). Once we add a ProxyPay external code field
            // to invoices, this method will query pending invoices and check their status
            // against the ProxyPay API.
            Console.WriteLine("[ProxyPayService] SyncPendingInvoices: No-op placeholder. PIX sync is handled via polling.");
            await Task.CompletedTask;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonexUp.Infra.Interfaces.AppServices
{
    public interface IProxyPayAppService
    {
        Task<ProxyPayQRCodeResponse> CreateQRCodeAsync(ProxyPayQRCodeRequest request);
        Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatusAsync(string invoiceId);
    }

    public class ProxyPayQRCodeRequest
    {
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerDocumentId { get; set; }
        public string CustomerCellphone { get; set; }
        public List<ProxyPayItem> Items { get; set; }
    }

    public class ProxyPayItem
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public double UnitPrice { get; set; }
    }

    public class ProxyPayQRCodeResponse
    {
        public bool Sucesso { get; set; }
        public string Mensagem { get; set; }
        public string InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public string BrCode { get; set; }
        public string BrCodeBase64 { get; set; }
        public DateTime? ExpiredAt { get; set; }
    }

    public class ProxyPayQRCodeStatusResponse
    {
        public bool Sucesso { get; set; }
        public string Status { get; set; }
        public bool Paid { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}

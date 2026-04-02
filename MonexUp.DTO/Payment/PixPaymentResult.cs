using System;
using MonexUp.DTO.Order;

namespace MonexUp.DTO.Payment
{
    public class PixPaymentResult
    {
        public bool Sucesso { get; set; }
        public string Mensagem { get; set; }
        public OrderInfo Order { get; set; }
        public PixQRCodeInfo QrCode { get; set; }
    }

    public class PixQRCodeInfo
    {
        public string InvoiceId { get; set; }
        public string BrCode { get; set; }
        public string BrCodeBase64 { get; set; }
        public DateTime? ExpiredAt { get; set; }
    }
}

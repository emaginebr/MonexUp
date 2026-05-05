using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceFeeInfo
    {
        [JsonPropertyName("feeId")]
        public long FeeId { get; set; }
        [JsonPropertyName("proxyPayInvoiceId")]
        public long? ProxyPayInvoiceId { get; set; }
        [JsonPropertyName("networkId")]
        public long? NetworkId { get; set; }
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("amount")]
        public double Amount { get; set; }
        [JsonPropertyName("paidAt")]
        public DateTime? PaidAt { get; set; }
        [JsonPropertyName("withdrawalDueDate")]
        public DateTime? WithdrawalDueDate { get; set; }
    }
}

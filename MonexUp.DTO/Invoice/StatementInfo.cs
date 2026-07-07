using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class StatementInfo
    {
        [JsonPropertyName("proxyPayInvoiceId")]
        public long? ProxyPayInvoiceId { get; set; }
        [JsonPropertyName("feeId")]
        public long FeeId { get; set; }
        [JsonPropertyName("networkId")]
        public long? NetworkId { get; set; }
        [JsonPropertyName("networkName")]
        public string NetworkName { get; set; }
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("buyerName")]
        public string BuyerName { get; set; }
        [JsonPropertyName("sellerId")]
        public long? SellerId { get; set; }
        [JsonPropertyName("sellerName")]
        public string SellerName { get; set; }
        [JsonPropertyName("description")]
        public string Description { get; set; }
        [JsonPropertyName("amount")]
        public double Amount { get; set; }
        [JsonPropertyName("paidAt")]
        public DateTime? PaidAt { get; set; }
        [JsonPropertyName("withdrawalDueDate")]
        public DateTime? WithdrawalDueDate { get; set; }
        [JsonPropertyName("reversed")]
        public bool Reversed { get; set; }
        [JsonPropertyName("status")]
        public string Status { get; set; }
    }
}

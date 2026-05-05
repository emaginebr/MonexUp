using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class BillingListItemInfo
    {
        [JsonPropertyName("proxypayBillingId")]
        public long ProxyPayBillingId { get; set; }

        [JsonPropertyName("customerName")]
        public string CustomerName { get; set; }

        [JsonPropertyName("customerUserId")]
        public long? CustomerUserId { get; set; }

        [JsonPropertyName("referrerUserId")]
        public long? ReferrerUserId { get; set; }

        [JsonPropertyName("frequency")]
        public BillingFrequencyEnum Frequency { get; set; }

        [JsonPropertyName("nextChargeDate")]
        public DateTime? NextChargeDate { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("latestInvoiceStatus")]
        public int? LatestInvoiceStatus { get; set; }
    }
}

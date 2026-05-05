using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class BillingCreateRequest
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("customerUserId")]
        public long CustomerUserId { get; set; }

        [JsonPropertyName("referrerUserId")]
        public long? ReferrerUserId { get; set; }

        [JsonPropertyName("frequency")]
        public BillingFrequencyEnum Frequency { get; set; }

        [JsonPropertyName("paymentMethod")]
        public PaymentMethodEnum PaymentMethod { get; set; }

        [JsonPropertyName("billingStartDate")]
        public DateTime BillingStartDate { get; set; }

        [JsonPropertyName("items")]
        public IList<BillingItemRequest> Items { get; set; }
    }
}

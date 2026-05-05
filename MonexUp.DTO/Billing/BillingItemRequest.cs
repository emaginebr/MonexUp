using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class BillingItemRequest
    {
        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("unitPrice")]
        public double UnitPrice { get; set; }

        [JsonPropertyName("discount")]
        public double Discount { get; set; }
    }
}

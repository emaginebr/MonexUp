using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class PaymentCompletionInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("proxypayInvoiceId")]
        public long ProxyPayInvoiceId { get; set; }

        [JsonPropertyName("signature")]
        public string Signature { get; set; }
    }
}

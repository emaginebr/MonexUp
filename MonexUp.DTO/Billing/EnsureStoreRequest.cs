using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class EnsureStoreRequest
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
    }

    public class EnsureStoreResponse
    {
        [JsonPropertyName("proxypayStoreId")]
        public long ProxyPayStoreId { get; set; }

        [JsonPropertyName("proxypayClientId")]
        public string ProxyPayClientId { get; set; }
    }
}

using System.Text.Json.Serialization;

namespace MonexUp.DTO.Payment
{
    public class PixPaymentRequest
    {
        [JsonPropertyName("networkSlug")]
        public string NetworkSlug { get; set; }

        [JsonPropertyName("productSlug")]
        public string ProductSlug { get; set; }

        [JsonPropertyName("sellerSlug")]
        public string SellerSlug { get; set; }

        [JsonPropertyName("documentId")]
        public string DocumentId { get; set; }
    }
}

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

        /// <summary>
        /// Optional. When provided, replaces the buyer's first NAuth phone
        /// before the PIX is created. Empty preserves the NAuth value.
        /// </summary>
        [JsonPropertyName("cellphone")]
        public string Cellphone { get; set; }

        /// <summary>
        /// Optional override for the order unit price. Used for open-amount
        /// donations where the product itself has no fixed price and the
        /// buyer types the value at checkout. When null/0 we fall back to
        /// the product's stored Price.
        /// </summary>
        [JsonPropertyName("amount")]
        public decimal? Amount { get; set; }
    }
}

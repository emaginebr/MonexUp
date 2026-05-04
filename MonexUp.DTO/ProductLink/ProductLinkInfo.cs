using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.ProductLink
{
    public class ProductLinkInfo
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("lofnProductId")]
        public long LofnProductId { get; set; }

        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }
}

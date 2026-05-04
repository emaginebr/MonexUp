using System.Text.Json.Serialization;

namespace MonexUp.DTO.ProductLink
{
    public class ProductLinkInsertInfo
    {
        [JsonPropertyName("lofnProductId")]
        public long LofnProductId { get; set; }

        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("userId")]
        public long UserId { get; set; }
    }
}

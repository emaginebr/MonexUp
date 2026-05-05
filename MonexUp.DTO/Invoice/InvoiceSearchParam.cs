using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceSearchParam
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("sellerId")]
        public long? SellerId { get; set; }
        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }
    }
}

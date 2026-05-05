using MonexUp.DTO.Lofn;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Order
{
    public class OrderItemInfo
    {
        [JsonPropertyName("itemId")]
        public long ItemId { get; set; }
        [JsonPropertyName("orderId")]
        public long OrderId { get; set; }
        [JsonPropertyName("productId")]
        public long ProductId { get; set; }
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        [JsonPropertyName("product")]
        public LofnProductInfo Product { get; set; }
    }
}

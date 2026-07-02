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
        /// <summary>
        /// Unit amount actually paid for this item. Mirrors the product price
        /// when the product has a fixed price, or the buyer-typed donation
        /// value when the product has no price (open-amount donation).
        /// </summary>
        [JsonPropertyName("amount")]
        public decimal? Amount { get; set; }
        [JsonPropertyName("product")]
        public LofnProductInfo Product { get; set; }
    }
}

using System.Text.Json.Serialization;

namespace MonexUp.DTO.Lofn
{
    public class LofnProductInfo
    {
        [JsonPropertyName("productId")]
        public long ProductId { get; set; }

        [JsonPropertyName("storeId")]
        public long? StoreId { get; set; }

        [JsonPropertyName("categoryId")]
        public long? CategoryId { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("price")]
        public double Price { get; set; }

        [JsonPropertyName("discount")]
        public double Discount { get; set; }

        [JsonPropertyName("frequency")]
        public int Frequency { get; set; }

        [JsonPropertyName("limit")]
        public int Limit { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("productType")]
        public int ProductType { get; set; }

        [JsonPropertyName("featured")]
        public bool Featured { get; set; }

        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
    }
}

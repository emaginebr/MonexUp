using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class MemberBalanceInfo
    {
        [JsonPropertyName("total")]
        public double Total { get; set; }
        [JsonPropertyName("released")]
        public double Released { get; set; }
        [JsonPropertyName("maturing")]
        public double Maturing { get; set; }
    }
}

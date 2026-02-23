using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class NetworkInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("slug")]
        public string Slug { get; set; }
        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("comission")]
        public double Commission { get; set; }
        [JsonPropertyName("withdrawalMin")]
        public double WithdrawalMin { get; set; }
        [JsonPropertyName("withdrawalPeriod")]
        public int WithdrawalPeriod { get; set; }
        [JsonPropertyName("plan")]
        public NetworkPlanEnum Plan { get; set; }
        [JsonPropertyName("status")]
        public NetworkStatusEnum Status { get; set; }
        [JsonPropertyName("qtdyUsers")]
        public int QtdyUsers { get; set; }
        [JsonPropertyName("maxUsers")]
        public int MaxUsers { get; set; }
    }
}

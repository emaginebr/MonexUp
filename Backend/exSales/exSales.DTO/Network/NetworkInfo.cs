using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.Network
{
    public class NetworkInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("slug")]
        public string Slug { get; set; }
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
    }
}

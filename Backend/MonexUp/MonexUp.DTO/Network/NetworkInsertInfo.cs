using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class NetworkInsertInfo
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("comission")]
        public double Commission { get; set; }
        [JsonPropertyName("plan")]
        public NetworkPlanEnum Plan { get; set; }
    }
}

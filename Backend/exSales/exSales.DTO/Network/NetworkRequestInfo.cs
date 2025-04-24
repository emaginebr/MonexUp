using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.Network
{
    public class NetworkRequestInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("referrerId")]
        public long? ReferrerId { get; set; }
    }
}

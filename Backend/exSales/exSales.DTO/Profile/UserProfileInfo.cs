using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.Profile
{
    public class UserProfileInfo
    {
        [JsonPropertyName("profileId")]
        public long ProfileId { get; set; }
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("commission")]
        public double Commission { get; set; }
        [JsonPropertyName("level")]
        public int Level { get; set; }
    }
}

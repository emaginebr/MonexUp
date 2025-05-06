using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.User
{
    public class UserNetworkSearchInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("profileId")]
        public long? ProfileId { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("profile")]
        public string Profile { get; set; }
        [JsonPropertyName("level")]
        public int Level { get; set; }
        [JsonPropertyName("commission")]
        public double Commission { get; set; }
        [JsonPropertyName("role")]
        public UserRoleEnum Role { get; set; }
        [JsonPropertyName("status")]
        public UserNetworkStatusEnum Status { get; set; }
    }
}

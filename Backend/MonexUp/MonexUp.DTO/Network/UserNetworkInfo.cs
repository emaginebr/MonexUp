using MonexUp.DTO.Profile;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class UserNetworkInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }
        [JsonPropertyName("profileId")]
        public long? ProfileId { get; set; }
        [JsonPropertyName("role")]
        public UserRoleEnum Role { get; set; }
        [JsonPropertyName("status")]
        public UserNetworkStatusEnum Status { get; set; }
        [JsonPropertyName("referrerId")]
        public long? ReferrerId { get; set; }
        [JsonPropertyName("network")]
        public NetworkInfo Network { get; set; }
        [JsonPropertyName("profile")]
        public UserProfileInfo Profile { get; set; }
        [JsonPropertyName("user")]
        public UserInfo User { get; set; }
    }
}

using System.Collections.Generic;
using System.Text.Json.Serialization;
using MonexUp.DTO.User;

namespace MonexUp.DTO.Network
{
    public class HierarchyNodeInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("profileName")]
        public string ProfileName { get; set; }

        [JsonPropertyName("role")]
        public UserRoleEnum Role { get; set; }

        [JsonPropertyName("status")]
        public UserNetworkStatusEnum Status { get; set; }

        /// <summary>Descendant children (down-tree). Empty for ancestors and for leaf/depth-limited nodes.</summary>
        [JsonPropertyName("children")]
        public IList<HierarchyNodeInfo> Children { get; set; } = new List<HierarchyNodeInfo>();
    }
}

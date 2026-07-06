using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Network
{
    public class HierarchyInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        /// <summary>The logged-in member (tree center / highlight).</summary>
        [JsonPropertyName("current")]
        public HierarchyNodeInfo Current { get; set; }

        /// <summary>Referrer chain, immediate referrer first, up to 3 levels.</summary>
        [JsonPropertyName("ancestors")]
        public IList<HierarchyNodeInfo> Ancestors { get; set; } = new List<HierarchyNodeInfo>();

        /// <summary>Direct referred members (level +1), each nesting its own children down to level +3.</summary>
        [JsonPropertyName("descendants")]
        public IList<HierarchyNodeInfo> Descendants { get; set; } = new List<HierarchyNodeInfo>();
    }
}

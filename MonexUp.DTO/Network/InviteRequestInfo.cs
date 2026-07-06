using System.Text.Json.Serialization;

namespace MonexUp.DTO.Network
{
    public class InviteRequestInfo
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }
    }
}

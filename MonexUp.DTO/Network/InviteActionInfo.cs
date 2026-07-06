using System.Text.Json.Serialization;

namespace MonexUp.DTO.Network
{
    public class InviteActionInfo
    {
        [JsonPropertyName("token")]
        public string Token { get; set; }
    }
}

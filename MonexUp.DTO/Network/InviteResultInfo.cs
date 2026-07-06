using System.Text.Json.Serialization;

namespace MonexUp.DTO.Network
{
    public class InviteResultInfo
    {
        [JsonPropertyName("sucesso")]
        public bool Sucesso { get; set; }

        [JsonPropertyName("hasAccount")]
        public bool HasAccount { get; set; }

        [JsonPropertyName("alreadyMember")]
        public bool AlreadyMember { get; set; }

        [JsonPropertyName("token")]
        public string Token { get; set; }

        [JsonPropertyName("networkSlug")]
        public string NetworkSlug { get; set; }

        [JsonPropertyName("mensagemErro")]
        public string MensagemErro { get; set; }
    }
}

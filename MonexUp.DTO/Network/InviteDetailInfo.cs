using System.Text.Json.Serialization;

namespace MonexUp.DTO.Network
{
    public class InviteDetailInfo
    {
        [JsonPropertyName("sucesso")]
        public bool Sucesso { get; set; }

        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        [JsonPropertyName("networkName")]
        public string NetworkName { get; set; }

        [JsonPropertyName("inviterName")]
        public string InviterName { get; set; }

        [JsonPropertyName("targetUserId")]
        public long TargetUserId { get; set; }

        [JsonPropertyName("isForCurrentUser")]
        public bool IsForCurrentUser { get; set; }

        [JsonPropertyName("alreadyActiveMember")]
        public bool AlreadyActiveMember { get; set; }

        [JsonPropertyName("mensagemErro")]
        public string MensagemErro { get; set; }
    }
}

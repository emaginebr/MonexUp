using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.ProductLink
{
    public class ProductLinkApiResult
    {
        [JsonPropertyName("sucesso")]
        public bool Sucesso { get; set; }

        [JsonPropertyName("mensagem")]
        public string Mensagem { get; set; }

        [JsonPropertyName("mensagemErro")]
        public string MensagemErro { get; set; }

        [JsonPropertyName("mensagemSucesso")]
        public string MensagemSucesso { get; set; }

        [JsonPropertyName("data")]
        public ProductLinkInfo Data { get; set; }
    }

    public class ProductLinkListApiResult
    {
        [JsonPropertyName("sucesso")]
        public bool Sucesso { get; set; }

        [JsonPropertyName("mensagem")]
        public string Mensagem { get; set; }

        [JsonPropertyName("mensagemErro")]
        public string MensagemErro { get; set; }

        [JsonPropertyName("data")]
        public List<ProductLinkInfo> Data { get; set; }
    }
}

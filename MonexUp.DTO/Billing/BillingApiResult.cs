using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Billing
{
    public class BillingApiResult<T>
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
        public T Data { get; set; }
    }

    public class BillingListApiResult
    {
        [JsonPropertyName("sucesso")]
        public bool Sucesso { get; set; }

        [JsonPropertyName("mensagemErro")]
        public string MensagemErro { get; set; }

        [JsonPropertyName("data")]
        public List<BillingListItemInfo> Data { get; set; }

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }

        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }

        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; }
    }
}

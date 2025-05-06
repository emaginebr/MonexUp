using System;
using System.Text.Json.Serialization;
using MonexUp.DTO.Domain;

namespace MonexUp.DTO.User
{
    public class BalanceResult : StatusResult
    {
        [JsonPropertyName("balance")]
        public BalanceInfo Balance { get; set; }
    }
}

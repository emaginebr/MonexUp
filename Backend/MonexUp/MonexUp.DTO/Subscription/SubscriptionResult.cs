using MonexUp.DTO.Domain;
using MonexUp.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Subscription
{
    public class SubscriptionResult: StatusResult
    {
        [JsonPropertyName("order")]
        public OrderInfo Order { get; set; }
        [JsonPropertyName("clientSecret")]
        public string ClientSecret { get; set; }
    }
}

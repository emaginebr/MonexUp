using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Network
{
    public class UserNetworkResult: StatusResult
    {
        [JsonPropertyName("userNetwork")]
        public UserNetworkInfo UserNetwork { get; set; }
    }
}

using exSales.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.Network
{
    public class UserNetworkListResult: StatusResult
    {
        [JsonPropertyName("userNetworks")]
        public IList<UserNetworkInfo> UserNetworks { get; set; }
    }
}

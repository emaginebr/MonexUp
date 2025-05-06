using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.User
{
    public class UserAddressInfo
    {
        [JsonPropertyName("zipCode")]
        public string ZipCode { get; set; }
        [JsonPropertyName("address")]
        public string Address { get; set; }
        [JsonPropertyName("complement")]
        public string Complement { get; set; }
        [JsonPropertyName("neighborhood")]
        public string Neighborhood { get; set; }
        [JsonPropertyName("city")]
        public string City { get; set; }
        [JsonPropertyName("state")]
        public string State { get; set; }
    }
}

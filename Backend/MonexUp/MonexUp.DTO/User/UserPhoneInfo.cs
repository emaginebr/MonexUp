using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.User
{
    public class UserPhoneInfo
    {
        [JsonPropertyName("phone")]
        public string Phone { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Domain
{
    public class StringResult: StatusResult
    {
        [JsonPropertyName("value")]
        public string Value { get; set; }
    }
}

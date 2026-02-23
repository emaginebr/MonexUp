using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Template
{
    public class TemplatePartResult: StatusResult
    {
        [JsonPropertyName("part")]
        public TemplatePartInfo Part { get; set; }
    }
}

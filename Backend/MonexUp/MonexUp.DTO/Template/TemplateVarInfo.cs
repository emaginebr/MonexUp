using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Template
{
    public class TemplateVarInfo
    {
        [JsonPropertyName("pageId")]
        public long PageId { get; set; }
        [JsonPropertyName("key")]
        public string Key { get; set; }
        [JsonPropertyName("english")]
        public string English {  get; set; }
        [JsonPropertyName("french")]
        public string French { get; set; }
        [JsonPropertyName("spanish")]
        public string Spanish { get; set; }
        [JsonPropertyName("portuguese")]
        public string Portuguese { get; set; }
    }
}

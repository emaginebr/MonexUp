using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Template
{
    public class TemplatePartInfo
    {
        [JsonPropertyName("partId")]
        public long PartId { get; set; }
        [JsonPropertyName("pageId")]
        public long PageId { get; set; }
        [JsonPropertyName("partKey")]
        public string PartKey { get; set; }
        [JsonPropertyName("order")]
        public double Order { get; set; }
    }
}

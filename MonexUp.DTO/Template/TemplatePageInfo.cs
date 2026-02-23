using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Template
{
    public class TemplatePageInfo
    {
        [JsonPropertyName("pageId")]
        public long PageId { get; set; }
        [JsonPropertyName("templateId")]
        public long TemplateId { get; set; }
        [JsonPropertyName("slug")]
        public string Slug { get; set; }
        [JsonPropertyName("title")]
        public string Title { get; set; }
        [JsonPropertyName("parts")]
        public IList<TemplatePartInfo> Parts { get; set; }
        [JsonPropertyName("variables")]
        public IDictionary<string, string> Variables { get; set; }
    }
}

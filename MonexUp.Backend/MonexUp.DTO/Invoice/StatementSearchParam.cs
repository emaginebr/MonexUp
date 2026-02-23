using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Invoice
{
    public class StatementSearchParam
    {
        [JsonPropertyName("networkId")]
        public long? NetworkId { get; set; }
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("ini")]
        public DateTime? Ini { get; set; }
        [JsonPropertyName("end")]
        public DateTime? End { get; set; }
        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }
    }
}

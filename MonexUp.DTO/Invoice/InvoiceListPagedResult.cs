using MonexUp.DTO.Domain;
using MonexUp.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceListPagedResult: StatusResult
    {
        [JsonPropertyName("invoices")]
        public IList<InvoiceInfo> Invoices { get; set; }
        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }
        [JsonPropertyName("pageCount")]
        public int PageCount { get; set; }
    }
}

using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceListPagedResult
    {
        /// <summary>Page of invoice rows enriched with buyer/seller/order fields.</summary>
        [JsonPropertyName("invoices")]
        public IList<InvoiceListItemInfo> Invoices { get; set; }

        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; }

        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; }

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }

        [JsonPropertyName("totalPages")]
        public int TotalPages { get; set; }

        // Legacy field kept for callers that used the previous shape; equal to TotalPages.
        [JsonPropertyName("pageCount")]
        public int PageCount { get; set; }
    }
}

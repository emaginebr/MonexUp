using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceSearchParam
    {
        [JsonPropertyName("networkId")]
        public long NetworkId { get; set; }

        // Legacy fields kept for BillingController.searchStatement compatibility.
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("sellerId")]
        public long? SellerId { get; set; }

        [JsonPropertyName("pageNum")]
        public int PageNum { get; set; } = 1;

        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; } = 20;

        /// <summary>Free-text keyword matched against invoiceNumber, buyer name/email, seller name.</summary>
        [JsonPropertyName("keyword")]
        public string Keyword { get; set; }

        /// <summary>Numeric <see cref="InvoiceStatusEnum"/> value (1..6) or null for all statuses.</summary>
        [JsonPropertyName("status")]
        public int? Status { get; set; }

        [JsonPropertyName("fromDate")]
        public DateTime? FromDate { get; set; }

        [JsonPropertyName("toDate")]
        public DateTime? ToDate { get; set; }
    }
}

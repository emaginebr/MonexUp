using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceFeeInfo
    {
        [JsonPropertyName("feeId")]
        public long FeeId { get; set; }
        [JsonPropertyName("invoiceId")]
        public long InvoiceId { get; set; }
        [JsonPropertyName("networkId")]
        public long? NetworkId { get; set; }
        [JsonPropertyName("userId")]
        public long? UserId { get; set; }
        [JsonPropertyName("amount")]
        public double Amount { get; set; }
        [JsonPropertyName("paidAt")]
        public DateTime? PaidAt { get; set; }
    }
}

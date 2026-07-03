using System;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.Invoice
{
    /// <summary>
    /// Row shape returned by <c>POST /Billing/searchInvoices</c>. Wraps a subset
    /// of <see cref="InvoiceInfo"/> plus the buyer/seller/order join fields the
    /// <c>/admin/billing</c> UI needs, so <see cref="InvoiceInfo"/> stays clean.
    /// </summary>
    public class InvoiceListItemInfo
    {
        [JsonPropertyName("invoiceId")]
        public long InvoiceId { get; set; }

        [JsonPropertyName("invoiceNumber")]
        public string InvoiceNumber { get; set; }

        [JsonPropertyName("dueDate")]
        public DateTime DueDate { get; set; }

        [JsonPropertyName("paidAt")]
        public DateTime? PaidAt { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("status")]
        public InvoiceStatusEnum Status { get; set; }

        /// <summary>Sum of item (unitPrice * quantity) - itemDiscount, minus the invoice-level discount. Never negative.</summary>
        [JsonPropertyName("total")]
        public double Total { get; set; }

        [JsonPropertyName("orderId")]
        public long OrderId { get; set; }

        [JsonPropertyName("buyerId")]
        public long BuyerId { get; set; }

        [JsonPropertyName("buyerName")]
        public string BuyerName { get; set; }

        [JsonPropertyName("buyerEmail")]
        public string BuyerEmail { get; set; }

        [JsonPropertyName("sellerId")]
        public long? SellerId { get; set; }

        [JsonPropertyName("sellerName")]
        public string SellerName { get; set; }
    }
}

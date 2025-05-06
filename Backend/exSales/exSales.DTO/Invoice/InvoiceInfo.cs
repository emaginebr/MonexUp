using exSales.DTO.Order;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace exSales.DTO.Invoice
{
    public class InvoiceInfo
    {
        [JsonPropertyName("invoiceId")]
        public long InvoiceId { get; set; }
        [JsonPropertyName("orderId")]
        public long OrderId { get; set; }
        [JsonPropertyName("userId")]
        public long UserId { get; set; }
        [JsonPropertyName("sellerId")]
        public long? SellerId { get; set; }
        [JsonPropertyName("price")]
        public double Price { get; set; }
        [JsonPropertyName("dueDate")]
        public DateTime DueDate { get; set; }
        [JsonPropertyName("paymentDate")]
        public DateTime? PaymentDate { get; set; }
        [JsonPropertyName("status")]
        public InvoiceStatusEnum Status { get; set; }
        [JsonPropertyName("order")]
        public OrderInfo Order {  get; set; }
        [JsonPropertyName("user")]
        public UserInfo User { get; set; }
        [JsonPropertyName("seller")]
        public UserInfo Seller {  get; set; }
        [JsonPropertyName("fees")]
        public IList<InvoiceFeeInfo> Fees {  get; set; }
    }
}

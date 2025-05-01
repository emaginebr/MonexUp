using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Invoice
{
    public long InvoiceId { get; set; }

    public long OrderId { get; set; }

    public long UserId { get; set; }

    public long? SellerId { get; set; }

    public double Price { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime? PaymentDate { get; set; }

    public int Status { get; set; }

    public string StripeId { get; set; }

    public virtual Order Order { get; set; }

    public virtual User Seller { get; set; }

    public virtual User User { get; set; }
}

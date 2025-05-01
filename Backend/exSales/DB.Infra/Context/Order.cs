using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Order
{
    public long OrderId { get; set; }

    public long ProductId { get; set; }

    public long UserId { get; set; }

    public int Status { get; set; }

    public string StripeId { get; set; }

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual Product Product { get; set; }

    public virtual User User { get; set; }
}

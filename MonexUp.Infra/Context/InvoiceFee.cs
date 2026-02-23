using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class InvoiceFee
{
    public long FeeId { get; set; }

    public long InvoiceId { get; set; }

    public long? NetworkId { get; set; }

    public long? UserId { get; set; }

    public double Amount { get; set; }

    public DateTime? PaidAt { get; set; }

    public virtual Invoice Invoice { get; set; }

    public virtual Network Network { get; set; }
}

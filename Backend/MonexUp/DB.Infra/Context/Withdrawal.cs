using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Withdrawal
{
    public long WithdrawalId { get; set; }

    public long NetworkId { get; set; }

    public long UserId { get; set; }

    public DateTime Duedate { get; set; }

    public int Status { get; set; }

    public virtual Network Network { get; set; }

    public virtual User User { get; set; }
}

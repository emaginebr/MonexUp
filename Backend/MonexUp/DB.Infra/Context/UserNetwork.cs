using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class UserNetwork
{
    public long UserId { get; set; }

    public long NetworkId { get; set; }

    public long? ProfileId { get; set; }

    public int Role { get; set; }

    public int Status { get; set; }

    public long? ReferrerId { get; set; }

    public virtual Network Network { get; set; }

    public virtual UserProfile Profile { get; set; }

    public virtual User Referrer { get; set; }

    public virtual User User { get; set; }
}

using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class UserProfile
{
    public long ProfileId { get; set; }

    public long NetworkId { get; set; }

    public string Name { get; set; }

    public double Commission { get; set; }

    public int Level { get; set; }

    public virtual Network Network { get; set; }

    public virtual ICollection<UserNetwork> UserNetworks { get; set; } = new List<UserNetwork>();
}

using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Network
{
    public long NetworkId { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public double Commission { get; set; }

    public double WithdrawalMin { get; set; }

    public int WithdrawalPeriod { get; set; }

    public int Status { get; set; }

    public string Slug { get; set; }

    public int Plan { get; set; }

    public virtual ICollection<InvoiceFee> InvoiceFees { get; set; } = new List<InvoiceFee>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<UserNetwork> UserNetworks { get; set; } = new List<UserNetwork>();

    public virtual ICollection<UserProfile> UserProfiles { get; set; } = new List<UserProfile>();
}

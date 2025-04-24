using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class User
{
    public long UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Hash { get; set; }

    public string Email { get; set; }

    public string Name { get; set; }

    public string Password { get; set; }

    public bool IsAdmin { get; set; }

    public string Token { get; set; }

    public string RecoveryHash { get; set; }

    public string IdDocument { get; set; }

    public DateTime? BirthDate { get; set; }

    public string PixKey { get; set; }

    public string Slug { get; set; }

    public virtual ICollection<Invoice> InvoiceSellers { get; set; } = new List<Invoice>();

    public virtual ICollection<Invoice> InvoiceUsers { get; set; } = new List<Invoice>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<UserAddress> UserAddresses { get; set; } = new List<UserAddress>();

    public virtual ICollection<UserDocument> UserDocuments { get; set; } = new List<UserDocument>();

    public virtual ICollection<UserNetwork> UserNetworkReferrers { get; set; } = new List<UserNetwork>();

    public virtual ICollection<UserNetwork> UserNetworkUsers { get; set; } = new List<UserNetwork>();

    public virtual ICollection<UserPhone> UserPhones { get; set; } = new List<UserPhone>();
}

using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class UserAddress
{
    public long AddressId { get; set; }

    public long UserId { get; set; }

    public string ZipCode { get; set; }

    public string Address { get; set; }

    public string Complement { get; set; }

    public string Neighborhood { get; set; }

    public string City { get; set; }

    public string State { get; set; }

    public virtual User User { get; set; }
}

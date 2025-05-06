using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class UserPhone
{
    public long PhoneId { get; set; }

    public long UserId { get; set; }

    public string Phone { get; set; }

    public virtual User User { get; set; }
}

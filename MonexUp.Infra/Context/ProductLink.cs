using System;

namespace DB.Infra.Context;

public partial class ProductLink
{
    public int Id { get; set; }

    public long LofnProductId { get; set; }

    public long NetworkId { get; set; }

    public long UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Network Network { get; set; }
}

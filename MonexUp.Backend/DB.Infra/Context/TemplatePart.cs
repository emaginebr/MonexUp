using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class TemplatePart
{
    public long PartId { get; set; }

    public long PageId { get; set; }

    public string PartKey { get; set; }

    public double Order { get; set; }

    public virtual TemplatePage Page { get; set; }
}

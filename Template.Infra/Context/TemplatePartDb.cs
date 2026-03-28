using System;
using System.Collections.Generic;

namespace Template.Infra.Context;

public partial class TemplatePartDb
{
    public long PartId { get; set; }

    public long PageId { get; set; }

    public string PartKey { get; set; }

    public double Order { get; set; }

    public virtual TemplatePageDb Page { get; set; }
}

using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class TemplateVar
{
    public long VarId { get; set; }

    public long PageId { get; set; }

    public int Language { get; set; }

    public string Key { get; set; }

    public string Value { get; set; }

    public virtual TemplatePage Page { get; set; }
}

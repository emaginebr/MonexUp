using System;
using System.Collections.Generic;

namespace Template.Infra.Context;

public partial class TemplateVarDb
{
    public long VarId { get; set; }

    public long PageId { get; set; }

    public int Language { get; set; }

    public string Key { get; set; }

    public string Value { get; set; }

    public virtual TemplatePageDb Page { get; set; }
}

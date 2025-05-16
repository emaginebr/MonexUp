using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class TemplatePage
{
    public long PageId { get; set; }

    public long TemplateId { get; set; }

    public string Slug { get; set; }

    public string Title { get; set; }

    public virtual Template Template { get; set; }

    public virtual ICollection<TemplatePart> TemplateParts { get; set; } = new List<TemplatePart>();

    public virtual ICollection<TemplateVar> TemplateVars { get; set; } = new List<TemplateVar>();
}

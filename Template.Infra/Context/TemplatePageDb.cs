using System;
using System.Collections.Generic;

namespace Template.Infra.Context;

public partial class TemplatePageDb
{
    public long PageId { get; set; }

    public long TemplateId { get; set; }

    public string Slug { get; set; }

    public string Title { get; set; }

    public virtual TemplateDb Template { get; set; }

    public virtual ICollection<TemplatePartDb> TemplateParts { get; set; } = new List<TemplatePartDb>();

    public virtual ICollection<TemplateVarDb> TemplateVars { get; set; } = new List<TemplateVarDb>();
}

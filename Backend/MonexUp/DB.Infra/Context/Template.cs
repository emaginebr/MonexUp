using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Template
{
    public long TemplateId { get; set; }

    public long? NetworkId { get; set; }

    public long? UserId { get; set; }

    public string Title { get; set; }

    public string Css { get; set; }

    public virtual Network Network { get; set; }

    public virtual ICollection<TemplatePage> TemplatePages { get; set; } = new List<TemplatePage>();

    public virtual User User { get; set; }
}

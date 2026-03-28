using System;
using System.Collections.Generic;

namespace Template.Infra.Context;

public partial class TemplateDb
{
    public long TemplateId { get; set; }

    public long? NetworkId { get; set; }

    public long? UserId { get; set; }

    public string Title { get; set; }

    public string Css { get; set; }

    public virtual ICollection<TemplatePageDb> TemplatePages { get; set; } = new List<TemplatePageDb>();
}

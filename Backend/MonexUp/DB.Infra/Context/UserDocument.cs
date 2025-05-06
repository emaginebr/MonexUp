using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class UserDocument
{
    public long DocumentId { get; set; }

    public long? UserId { get; set; }

    public int DocumentType { get; set; }

    public string Base64 { get; set; }

    public virtual User User { get; set; }
}

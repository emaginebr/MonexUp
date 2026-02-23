using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Image
{
    public long ImageId { get; set; }

    public string Name { get; set; }

    public string ImageBase64 { get; set; }
}

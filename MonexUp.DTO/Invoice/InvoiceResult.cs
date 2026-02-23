using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceResult: StatusResult
    {
        public InvoiceInfo Invoice { get; set; }
    }
}

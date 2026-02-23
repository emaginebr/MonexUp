using MonexUp.DTO.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.DTO.Invoice
{
    public class InvoiceListResult: StatusResult
    {
        public IList<InvoiceInfo> Invoices { get; set; }
    }
}

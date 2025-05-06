using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.DTO.Invoice
{
    public enum InvoiceStatusEnum
    {
        Draft = 1,
        Open = 2,
        Paid = 3,
        Cancelled = 4,
        Lost = 5
    }
}

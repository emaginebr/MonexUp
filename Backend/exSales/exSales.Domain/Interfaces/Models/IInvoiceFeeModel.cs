using exSales.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Models
{
    public interface IInvoiceFeeModel
    {
        long FeeId { get; set; }
        long InvoiceId { get; set; }
        long? NetworkId { get; set; }
        long? UserId { get; set; }
        double Amount { get; set; }
        DateTime? PaidAt { get; set; }

        IInvoiceFeeModel Insert(IInvoiceFeeDomainFactory factory);
        void DeleteByInvoice(long invoiceId);
        List<IInvoiceFeeModel> ListByInvoice(long invoiceId, IInvoiceFeeDomainFactory factory);
    }
}

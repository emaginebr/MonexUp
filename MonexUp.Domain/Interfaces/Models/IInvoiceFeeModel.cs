using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
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
        IList<IInvoiceFeeModel> ListByInvoice(long invoiceId, IInvoiceFeeDomainFactory factory);
        IList<IInvoiceFeeModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, IInvoiceFeeDomainFactory factory);
        double GetBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);
    }
}

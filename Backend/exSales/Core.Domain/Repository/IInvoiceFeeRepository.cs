using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface IInvoiceFeeRepository<TModel, TFactory>
    {
        IEnumerable<TModel> ListByInvoice(long invoiceId, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        void DeleteByInvoice(long invoiceId);
    }
}

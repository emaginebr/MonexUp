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
        IEnumerable<TModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, TFactory factory);
        double GetBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);
        TModel Insert(TModel model, TFactory factory);
        void DeleteByInvoice(long invoiceId);
    }
}

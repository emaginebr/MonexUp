using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface IInvoiceRepository<TModel, TFactory>
    {
        IEnumerable<TModel> List(long networkId, long orderId, long userId, int status, TFactory factory);
        TModel GetById(long id, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
    }
}

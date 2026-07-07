using System;
using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface IInvoiceFeeRepository<TModel, TFactory>
    {
        IEnumerable<TModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, TFactory factory);
        double GetBalance(long? networkId, long? userId);
        double GetTotalBalance(long? networkId, long? userId);
        double GetReleasedBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);
        TModel Insert(TModel model, TFactory factory);
    }
}

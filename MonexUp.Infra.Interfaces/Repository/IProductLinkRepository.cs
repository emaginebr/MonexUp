using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface IProductLinkRepository<TModel, TFactory>
    {
        TModel Upsert(TModel model, TFactory factory);
        TModel GetByLofnProductId(long lofnProductId, TFactory factory);
        IList<TModel> ListByNetwork(long networkId, TFactory factory);
        IList<TModel> ListByUser(long userId, TFactory factory);
        int DeleteByNetwork(long networkId);
    }
}

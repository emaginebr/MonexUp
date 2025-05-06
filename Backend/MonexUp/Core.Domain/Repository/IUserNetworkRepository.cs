using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface IUserNetworkRepository<TModel, TFactory>
    { 
        IEnumerable<TModel> ListByUser(long userId, TFactory factory);
        IEnumerable<TModel> ListByNetwork(long networkId, TFactory factory);
        IEnumerable<TModel> Search(long networkId, string keyword, long? profileId, int pageNum, out int pageCount, TFactory factory);
        int GetQtdyUserByNetwork(long networkId);
        TModel Get(long networkId, long userId, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
    }
}

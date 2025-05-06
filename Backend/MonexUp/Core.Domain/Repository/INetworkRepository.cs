using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface INetworkRepository<TModel, TFactory>
    {
        IEnumerable<TModel> ListByStatus(int status, TFactory factory);
        TModel GetById(long id, TFactory factory);
        TModel GetBySlug(string slug, TFactory factory);
        TModel GetByName(string name, TFactory factory);
        TModel GetByEmail(string email, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        bool ExistSlug(long networkId, string slug);
    }
}

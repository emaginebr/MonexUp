using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface ITemplateRepository<TModel, TFactory>
    {
        TModel GetByNetwork(long networkId, TFactory factory);
        TModel GetByUser(long userId, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
    }
}

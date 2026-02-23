using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface ITemplateVarRepository<TModel, TFactory>
    {
        IEnumerable<TModel> ListByPage(long pageId, int? language, TFactory factory);
        IEnumerable<TModel> ListByKey(long pageId, string key, TFactory factory);
        TModel Save(TModel model, TFactory factory);
    }
}

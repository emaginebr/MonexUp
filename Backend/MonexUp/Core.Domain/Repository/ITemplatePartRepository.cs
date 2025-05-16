using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface ITemplatePartRepository<TModel, TFactory>
    {
        TModel GetByKey(long pageId, string key, TFactory factory);
        IEnumerable<TModel> ListByPage(long pageId, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        void Delete(long partId);
        void MoveUp(long partId);
        void MoveDown(long partId);
    }
}

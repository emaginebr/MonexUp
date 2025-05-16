using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Repository
{
    public interface ITemplatePageRepository<TModel, TFactory>
    {
        TModel GetById(long pageId, TFactory factory);
        TModel GetBySlug(long templateId, string slug, TFactory factory);
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        void Delete(long pageId);
    }
}

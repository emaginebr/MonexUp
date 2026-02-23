using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface ITemplatePageModel
    {
        long PageId { get; set; }

        long TemplateId { get; set; }

        string Slug { get; set; }

        string Title { get; set; }

        IList<ITemplatePartModel> ListParts(ITemplatePartDomainFactory factory);
        IList<ITemplateVarModel> ListVariables(LanguageEnum lang, ITemplateVarDomainFactory factory);

        ITemplatePageModel GetById(long pageId, ITemplatePageDomainFactory factory);
        ITemplatePageModel GetBySlug(long templateId, string slug, ITemplatePageDomainFactory factory);
        ITemplatePageModel Insert(ITemplatePageDomainFactory factory);
        ITemplatePageModel Update(ITemplatePageDomainFactory factory);
        void Delete(long pageId);
    }
}

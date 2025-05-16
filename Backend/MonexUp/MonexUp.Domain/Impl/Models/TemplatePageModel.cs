using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MonexUp.DTO.Template;

namespace MonexUp.Domain.Impl.Models
{
    public class TemplatePageModel : ITemplatePageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory> _repositoryPage;

        public TemplatePageModel(IUnitOfWork unitOfWork, ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory> repositoryPage)
        {
            _unitOfWork = unitOfWork;
            _repositoryPage = repositoryPage;
        }
        public long PageId { get; set; }
        public long TemplateId { get; set; }
        public string Slug { get; set; }
        public string Title { get; set; }

        public IList<ITemplatePartModel> ListParts(ITemplatePartDomainFactory factory)
        {
            return factory.BuildTemplatePartModel().ListByPage(this.PageId, factory).ToList();
        }

        public IList<ITemplateVarModel> ListVariables(LanguageEnum lang, ITemplateVarDomainFactory factory)
        {
            return factory.BuildTemplateVarModel().ListByPage(PageId, lang, factory).ToList();
        }

        public ITemplatePageModel Insert(ITemplatePageDomainFactory factory)
        {
            return _repositoryPage.Insert(this, factory);
        }
        public ITemplatePageModel Update(ITemplatePageDomainFactory factory)
        {
            return _repositoryPage.Update(this, factory);
        }
        public void Delete(long pageId)
        {
            _repositoryPage.Delete(pageId);
        }
        public ITemplatePageModel GetById(long pageId, ITemplatePageDomainFactory factory)
        {
            return _repositoryPage.GetById(pageId, factory);
        }

        public ITemplatePageModel GetBySlug(long templateId, string slug, ITemplatePageDomainFactory factory)
        {
            return _repositoryPage.GetBySlug(templateId, slug, factory);
        }
    }
}

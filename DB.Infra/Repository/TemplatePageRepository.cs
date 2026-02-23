using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class TemplatePageRepository : ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public TemplatePageRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private ITemplatePageModel DbToModel(ITemplatePageDomainFactory factory, TemplatePage row)
        {
            if (row == null)
            {
                return null;
            }
            var md = factory.BuildTemplatePageModel();
            md.PageId = row.PageId;
            md.TemplateId = row.TemplateId;
            md.Slug = row.Slug;
            md.Title = row.Title;
            return md;
        }

        private void ModelToDb(ITemplatePageModel md, TemplatePage row)
        {
            row.PageId = md.PageId;
            row.TemplateId = md.TemplateId;
            row.Slug = md.Slug;
            row.Title = md.Title;
        }

        public ITemplatePageModel Insert(ITemplatePageModel model, ITemplatePageDomainFactory factory)
        {
            var row = new TemplatePage();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.PageId = row.PageId;
            return model;
        }

        public ITemplatePageModel Update(ITemplatePageModel model, ITemplatePageDomainFactory factory)
        {
            var row = _ccsContext.TemplatePages.Find(model.PageId);
            ModelToDb(model, row);
            _ccsContext.TemplatePages.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public void Delete(long pageId)
        {
            var row = _ccsContext.TemplatePages.Find(pageId);
            _ccsContext.Remove(row);
            _ccsContext.SaveChanges();
        }

        public ITemplatePageModel GetById(long pageId, ITemplatePageDomainFactory factory)
        {
            var row = _ccsContext.TemplatePages.Find(pageId);
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplatePageModel GetBySlug(long templateId, string slug, ITemplatePageDomainFactory factory)
        {
            var row = _ccsContext.TemplatePages.Where(x => x.TemplateId == templateId && x.Slug == slug).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }
    }
}

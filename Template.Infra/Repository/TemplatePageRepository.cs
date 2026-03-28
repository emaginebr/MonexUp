using Template.Core.Repository;
using Template.Infra.Context;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Infra.Repository
{
    public class TemplatePageRepository : ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory>
    {
        private TemplateContext _context;

        public TemplatePageRepository(TemplateContext context)
        {
            _context = context;
        }

        private ITemplatePageModel DbToModel(ITemplatePageDomainFactory factory, TemplatePageDb row)
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

        private void ModelToDb(ITemplatePageModel md, TemplatePageDb row)
        {
            row.PageId = md.PageId;
            row.TemplateId = md.TemplateId;
            row.Slug = md.Slug;
            row.Title = md.Title;
        }

        public ITemplatePageModel Insert(ITemplatePageModel model, ITemplatePageDomainFactory factory)
        {
            var row = new TemplatePageDb();
            ModelToDb(model, row);
            _context.Add(row);
            _context.SaveChanges();
            model.PageId = row.PageId;
            return model;
        }

        public ITemplatePageModel Update(ITemplatePageModel model, ITemplatePageDomainFactory factory)
        {
            var row = _context.TemplatePages.Find(model.PageId);
            ModelToDb(model, row);
            _context.TemplatePages.Update(row);
            _context.SaveChanges();
            return model;
        }

        public void Delete(long pageId)
        {
            var row = _context.TemplatePages.Find(pageId);
            _context.Remove(row);
            _context.SaveChanges();
        }

        public ITemplatePageModel GetById(long pageId, ITemplatePageDomainFactory factory)
        {
            var row = _context.TemplatePages.Find(pageId);
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplatePageModel GetBySlug(long templateId, string slug, ITemplatePageDomainFactory factory)
        {
            var row = _context.TemplatePages.Where(x => x.TemplateId == templateId && x.Slug == slug).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }
    }
}

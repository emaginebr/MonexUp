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
    public class TemplateRepository : ITemplateRepository<ITemplateModel, ITemplateDomainFactory>
    {
        private TemplateContext _context;

        public TemplateRepository(TemplateContext context)
        {
            _context = context;
        }

        private ITemplateModel DbToModel(ITemplateDomainFactory factory, TemplateDb row)
        {
            if (row == null)
            {
                return null;
            }
            var md = factory.BuildTemplateModel();
            md.TemplateId = row.TemplateId;
            md.NetworkId = row.NetworkId;
            md.UserId = row.UserId;
            md.Title = row.Title;
            md.Css = row.Css;
            return md;
        }

        private void ModelToDb(ITemplateModel md, TemplateDb row)
        {
            row.TemplateId = md.TemplateId;
            row.NetworkId = md.NetworkId;
            row.UserId = md.UserId;
            row.Title = md.Title;
            row.Css = md.Css;
        }

        public ITemplateModel GetByNetwork(long networkId, ITemplateDomainFactory factory)
        {
            var row = _context.Templates.Where(x => x.NetworkId == networkId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplateModel GetByUser(long userId, ITemplateDomainFactory factory)
        {
            var row = _context.Templates.Where(x => x.UserId == userId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplateModel Insert(ITemplateModel model, ITemplateDomainFactory factory)
        {
            var row = new TemplateDb();
            ModelToDb(model, row);
            _context.Add(row);
            _context.SaveChanges();
            model.TemplateId = row.TemplateId;
            return model;
        }

        public ITemplateModel Update(ITemplateModel model, ITemplateDomainFactory factory)
        {
            var row = _context.Templates.Find(model.TemplateId);
            ModelToDb(model, row);
            _context.Templates.Update(row);
            _context.SaveChanges();
            return model;
        }
    }
}

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
    public class TemplateRepository : ITemplateRepository<ITemplateModel, ITemplateDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public TemplateRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private ITemplateModel DbToModel(ITemplateDomainFactory factory, Template row)
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

        private void ModelToDb(ITemplateModel md, Template row)
        {
            row.TemplateId = md.TemplateId;
            row.NetworkId = md.NetworkId;
            row.UserId = md.UserId;
            row.Title = md.Title;
            row.Css = md.Css;
        }

        public ITemplateModel GetByNetwork(long networkId, ITemplateDomainFactory factory)
        {
            var row = _ccsContext.Templates.Where(x => x.NetworkId == networkId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplateModel GetByUser(long userId, ITemplateDomainFactory factory)
        {
            var row = _ccsContext.Templates.Where(x => x.UserId == userId).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public ITemplateModel Insert(ITemplateModel model, ITemplateDomainFactory factory)
        {
            var row = new Template();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.TemplateId = row.TemplateId;
            return model;
        }

        public ITemplateModel Update(ITemplateModel model, ITemplateDomainFactory factory)
        {
            var row = _ccsContext.Templates.Find(model.TemplateId);
            ModelToDb(model, row);
            _ccsContext.Templates.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }
    }
}

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
    public class TemplatePartRepository : ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public TemplatePartRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private ITemplatePartModel DbToModel(ITemplatePartDomainFactory factory, TemplatePart row)
        {
            if (row == null)
            {
                return null;
            }
            var md = factory.BuildTemplatePartModel();
            md.PartId = row.PartId;
            md.PageId = row.PageId;
            md.PartKey = row.PartKey;
            md.Order = row.Order;
            return md;
        }

        private void ModelToDb(ITemplatePartModel md, TemplatePart row)
        {
            row.PartId = md.PartId;
            row.PageId = md.PageId;
            row.PartKey = md.PartKey;
            row.Order = md.Order;
        }

        private void Reorder(long pageId)
        {
            var rows = _ccsContext.TemplateParts
                .Where(x => x.PageId == pageId)
                .OrderBy(x => x.Order)
                .ToList();
            double order = 0.0;
            foreach (var row in rows) {
                row.Order = order;
                order++;
                _ccsContext.Update(row);
            }
            _ccsContext.SaveChanges();
        }

        public ITemplatePartModel Insert(ITemplatePartModel model, ITemplatePartDomainFactory factory)
        {
            var row = new TemplatePart();
            ModelToDb(model, row);
            row.Order = -1;
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.PartId = row.PartId;
            Reorder(row.PageId);
            return model;
        }

        public ITemplatePartModel Update(ITemplatePartModel model, ITemplatePartDomainFactory factory)
        {
            var row = _ccsContext.TemplateParts.Find(model.PartId);
            ModelToDb(model, row);
            _ccsContext.TemplateParts.Update(row);
            _ccsContext.SaveChanges();
            return model;
        }

        public void Delete(long partId)
        {
            var row = _ccsContext.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            _ccsContext.Remove(row);
            _ccsContext.SaveChanges();
            Reorder(row.PageId);
        }

        public ITemplatePartModel GetByKey(long pageId, string key, ITemplatePartDomainFactory factory)
        {
            var row = _ccsContext.TemplateParts.Where(x => x.PageId == pageId && x.PartKey == key).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IEnumerable<ITemplatePartModel> ListByPage(long pageId, ITemplatePartDomainFactory factory)
        {
            var rows = _ccsContext.TemplateParts
                .Where(x => x.PageId == pageId)
                .OrderBy(x => x.Order)
                .ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public void MoveDown(long partId)
        {
            var row = _ccsContext.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            row.Order += 1.5;
            _ccsContext.TemplateParts.Update(row);
            _ccsContext.SaveChanges();
            Reorder(row.PageId);
        }

        public void MoveUp(long partId)
        {
            var row = _ccsContext.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            row.Order -= 1.5;
            _ccsContext.TemplateParts.Update(row);
            _ccsContext.SaveChanges();
            Reorder(row.PageId);
        }
    }
}

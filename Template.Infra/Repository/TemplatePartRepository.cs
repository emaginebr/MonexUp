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
    public class TemplatePartRepository : ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory>
    {
        private TemplateContext _context;

        public TemplatePartRepository(TemplateContext context)
        {
            _context = context;
        }

        private ITemplatePartModel DbToModel(ITemplatePartDomainFactory factory, TemplatePartDb row)
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

        private void ModelToDb(ITemplatePartModel md, TemplatePartDb row)
        {
            row.PartId = md.PartId;
            row.PageId = md.PageId;
            row.PartKey = md.PartKey;
            row.Order = md.Order;
        }

        private void Reorder(long pageId)
        {
            var rows = _context.TemplateParts
                .Where(x => x.PageId == pageId)
                .OrderBy(x => x.Order)
                .ToList();
            double order = 0.0;
            foreach (var row in rows) {
                row.Order = order;
                order++;
                _context.Update(row);
            }
            _context.SaveChanges();
        }

        public ITemplatePartModel Insert(ITemplatePartModel model, ITemplatePartDomainFactory factory)
        {
            var row = new TemplatePartDb();
            ModelToDb(model, row);
            row.Order = -1;
            _context.Add(row);
            _context.SaveChanges();
            model.PartId = row.PartId;
            Reorder(row.PageId);
            return model;
        }

        public ITemplatePartModel Update(ITemplatePartModel model, ITemplatePartDomainFactory factory)
        {
            var row = _context.TemplateParts.Find(model.PartId);
            ModelToDb(model, row);
            _context.TemplateParts.Update(row);
            _context.SaveChanges();
            return model;
        }

        public void Delete(long partId)
        {
            var row = _context.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            _context.Remove(row);
            _context.SaveChanges();
            Reorder(row.PageId);
        }

        public ITemplatePartModel GetByKey(long pageId, string key, ITemplatePartDomainFactory factory)
        {
            var row = _context.TemplateParts.Where(x => x.PageId == pageId && x.PartKey == key).FirstOrDefault();
            if (row == null)
                return null;
            return DbToModel(factory, row);
        }

        public IEnumerable<ITemplatePartModel> ListByPage(long pageId, ITemplatePartDomainFactory factory)
        {
            var rows = _context.TemplateParts
                .Where(x => x.PageId == pageId)
                .OrderBy(x => x.Order)
                .ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public void MoveDown(long partId)
        {
            var row = _context.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            row.Order += 1.5;
            _context.TemplateParts.Update(row);
            _context.SaveChanges();
            Reorder(row.PageId);
        }

        public void MoveUp(long partId)
        {
            var row = _context.TemplateParts.Find(partId);
            if (row == null)
            {
                return;
            }
            row.Order -= 1.5;
            _context.TemplateParts.Update(row);
            _context.SaveChanges();
            Reorder(row.PageId);
        }
    }
}

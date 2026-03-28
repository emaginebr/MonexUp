using Template.Core.Repository;
using Template.Infra.Context;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using Template.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Infra.Repository
{
    public class TemplateVarRepository : ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory>
    {
        private TemplateContext _context;

        public TemplateVarRepository(TemplateContext context)
        {
            _context = context;
        }
        private ITemplateVarModel DbToModel(ITemplateVarDomainFactory factory, TemplateVarDb row)
        {
            if (row == null)
            {
                return null;
            }
            var md = factory.BuildTemplateVarModel();
            md.VarId = row.VarId;
            md.PageId = row.PageId;
            md.Language = (LanguageEnum)row.Language;
            md.Key = row.Key;
            md.Value = row.Value;
            return md;
        }

        private void ModelToDb(ITemplateVarModel md, TemplateVarDb row)
        {
            row.VarId = md.VarId;
            row.PageId = md.PageId;
            row.Language = (int)md.Language;
            row.Key = md.Key;
            row.Value = md.Value;
        }

        public IEnumerable<ITemplateVarModel> ListByPage(long pageId, int? language, ITemplateVarDomainFactory factory)
        {
            var q = _context.TemplateVars
                .Where(x => x.PageId == pageId);
            if (language.HasValue && language.Value > 0)
            {
                q = q.Where(x => x.Language == language);
            }
            return q.OrderBy(x => x.Key).ThenBy(x => x.Language)
                .ToList()
                .Select(x => DbToModel(factory, x));
        }

        public IEnumerable<ITemplateVarModel> ListByKey(long pageId, string key, ITemplateVarDomainFactory factory)
        {
            return _context.TemplateVars
                .Where(x => x.PageId == pageId && x.Key == key)
                .OrderBy(x => x.Key)
                .ThenBy(x => x.Language)
                .ToList()
                .Select(x => DbToModel(factory, x));
        }

        public ITemplateVarModel Save(ITemplateVarModel model, ITemplateVarDomainFactory factory)
        {
            var row = _context.TemplateVars
                .Where(x => x.PageId == model.PageId && x.Key == model.Key && x.Language == (int)model.Language)
                .FirstOrDefault();
            if (row != null)
            {
                if (string.IsNullOrEmpty(model.Value))
                {
                    row.Value = "";
                    _context.TemplateVars.Remove(row);
                    _context.SaveChanges();
                    return DbToModel(factory, row);
                }
                row.Value = model.Value;
                _context.TemplateVars.Update(row);
                _context.SaveChanges();
                return DbToModel(factory, row);
            }
            row = new TemplateVarDb
            {
                PageId = model.PageId,
                Key = model.Key,
                Language = (int)model.Language,
                Value = model.Value,
            };
            _context.Add(row);
            _context.SaveChanges();
            return DbToModel(factory, row);
        }
    }
}

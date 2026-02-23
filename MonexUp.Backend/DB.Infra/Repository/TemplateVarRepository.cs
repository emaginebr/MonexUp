using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class TemplateVarRepository : ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory>
    {
        private MonexUpContext _ccsContext;

        public TemplateVarRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }
        private ITemplateVarModel DbToModel(ITemplateVarDomainFactory factory, TemplateVar row)
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

        private void ModelToDb(ITemplateVarModel md, TemplateVar row)
        {
            row.VarId = md.VarId;
            row.PageId = md.PageId;
            row.Language = (int)md.Language;
            row.Key = md.Key;
            row.Value = md.Value;
        }

        public IEnumerable<ITemplateVarModel> ListByPage(long pageId, int? language, ITemplateVarDomainFactory factory)
        {
            var q = _ccsContext.TemplateVars
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
            return _ccsContext.TemplateVars
                .Where(x => x.PageId == pageId && x.Key == key)
                .OrderBy(x => x.Key)
                .ThenBy(x => x.Language)
                .ToList()
                .Select(x => DbToModel(factory, x));
        }

        public ITemplateVarModel Save(ITemplateVarModel model, ITemplateVarDomainFactory factory)
        {
            var row = _ccsContext.TemplateVars
                .Where(x => x.PageId == model.PageId && x.Key == model.Key && x.Language == (int)model.Language)
                .FirstOrDefault();
            if (row != null)
            {
                if (string.IsNullOrEmpty(model.Value))
                {
                    row.Value = "";
                    _ccsContext.TemplateVars.Remove(row);
                    _ccsContext.SaveChanges();
                    return DbToModel(factory, row);
                }
                row.Value = model.Value;
                _ccsContext.TemplateVars.Update(row);
                _ccsContext.SaveChanges();
                return DbToModel(factory, row);
            }
            row = new TemplateVar
            {
                PageId = model.PageId,
                Key = model.Key,
                Language = (int)model.Language,
                Value = model.Value,
            };
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            return DbToModel(factory, row);
        }
    }
}

using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface ITemplateVarModel
    {
        long VarId { get; set; }

        long PageId { get; set; }

        LanguageEnum Language { get; set; }

        string Key { get; set; }

        string Value { get; set; }

        IEnumerable<ITemplateVarModel> ListByPage(long pageId, LanguageEnum? language, ITemplateVarDomainFactory factory);
        IEnumerable<ITemplateVarModel> ListByKey(long pageId, string key, ITemplateVarDomainFactory factory);
        ITemplateVarModel Save(ITemplateVarDomainFactory factory);
    }
}

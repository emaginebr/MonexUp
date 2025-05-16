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
    public class TemplateVarModel : ITemplateVarModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory> _repositoryVar;

        public TemplateVarModel(IUnitOfWork unitOfWork, ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory> repositoryVar)
        {
            _unitOfWork = unitOfWork;
            _repositoryVar = repositoryVar;
        }

        public long VarId { get; set; }
        public long PageId { get; set; }
        public LanguageEnum Language { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }

        public IEnumerable<ITemplateVarModel> ListByKey(long pageId, string key, ITemplateVarDomainFactory factory)
        {
            return _repositoryVar.ListByKey(pageId, key, factory);
        }

        public IEnumerable<ITemplateVarModel> ListByPage(long pageId, LanguageEnum? language, ITemplateVarDomainFactory factory)
        {
            return _repositoryVar.ListByPage(pageId, language.HasValue ? (int)language : null, factory);
        }

        public ITemplateVarModel Save(ITemplateVarDomainFactory factory)
        {
            return _repositoryVar.Save(this, factory);
        }
    }
}

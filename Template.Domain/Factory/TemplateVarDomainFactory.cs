using Template.Core.Repository;
using Template.Core;
using Template.Domain.Impl.Models;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Domain.Impl.Factory
{
    public class TemplateVarDomainFactory: ITemplateVarDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory> _repositoryVar;

        public TemplateVarDomainFactory(IUnitOfWork unitOfWork, ITemplateVarRepository<ITemplateVarModel, ITemplateVarDomainFactory> repositoryVar)
        {
            _unitOfWork = unitOfWork;
            _repositoryVar = repositoryVar;
        }

        public ITemplateVarModel BuildTemplateVarModel()
        {
            return new TemplateVarModel(_unitOfWork, _repositoryVar);
        }
    }
}

using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Factory
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

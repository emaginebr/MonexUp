using Template.Core.Repository;
using Template.Core;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Template.Domain.Impl.Models;

namespace Template.Domain.Impl.Factory
{
    public class TemplateDomainFactory : ITemplateDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplateRepository<ITemplateModel, ITemplateDomainFactory> _repositoryTemplate;

        public TemplateDomainFactory(IUnitOfWork unitOfWork, ITemplateRepository<ITemplateModel, ITemplateDomainFactory> repositoryTemplate)
        {
            _unitOfWork = unitOfWork;
            _repositoryTemplate = repositoryTemplate;
        }

        public ITemplateModel BuildTemplateModel()
        {
            return new TemplateModel(_unitOfWork, _repositoryTemplate);
        }
    }
}

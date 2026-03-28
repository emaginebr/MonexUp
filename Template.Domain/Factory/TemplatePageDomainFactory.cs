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
    public class TemplatePageDomainFactory: ITemplatePageDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory> _repositoryPage;

        public TemplatePageDomainFactory(IUnitOfWork unitOfWork, ITemplatePageRepository<ITemplatePageModel, ITemplatePageDomainFactory> repositoryPage)
        {
            _unitOfWork = unitOfWork;
            _repositoryPage = repositoryPage;
        }

        public ITemplatePageModel BuildTemplatePageModel()
        {
            return new TemplatePageModel(_unitOfWork, _repositoryPage);
        }
    }
}

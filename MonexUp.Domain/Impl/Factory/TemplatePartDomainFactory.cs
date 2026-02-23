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
    public class TemplatePartDomainFactory: ITemplatePartDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory> _repositoryPart;

        public TemplatePartDomainFactory(IUnitOfWork unitOfWork, ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory> repositoryPart)
        {
            _unitOfWork = unitOfWork;
            _repositoryPart = repositoryPart;
        }

        public ITemplatePartModel BuildTemplatePartModel()
        {
            return new TemplatePartModel(_unitOfWork, _repositoryPart);
        }
    }
}

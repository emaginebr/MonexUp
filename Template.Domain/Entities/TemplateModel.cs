using Template.Core.Repository;
using Template.Core;
using Template.Domain.Interfaces.Factory;
using Template.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Domain.Impl.Models
{
    public class TemplateModel : ITemplateModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplateRepository<ITemplateModel, ITemplateDomainFactory> _repositoryTemplate;

        public TemplateModel(IUnitOfWork unitOfWork, ITemplateRepository<ITemplateModel, ITemplateDomainFactory> repositoryTemplate)
        {
            _unitOfWork = unitOfWork;
            _repositoryTemplate = repositoryTemplate;
        }
        public long TemplateId { get; set; }
        public long? NetworkId { get; set; }
        public long? UserId { get; set; }
        public string Title { get; set; }
        public string Css { get; set; }

        public ITemplateModel Insert(ITemplateDomainFactory factory)
        {
            return _repositoryTemplate.Insert(this, factory);
        }

        public ITemplateModel Update(ITemplateDomainFactory factory)
        {
            return _repositoryTemplate.Update(this, factory);
        }

        public ITemplateModel GetByNetwork(long networkId, ITemplateDomainFactory factory)
        {
            return _repositoryTemplate.GetByNetwork(networkId, factory);
        }

        public ITemplateModel GetByUser(long userId, ITemplateDomainFactory factory)
        {
            return _repositoryTemplate.GetByUser(userId, factory);
        }
    }
}

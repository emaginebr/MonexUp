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
    public class TemplatePartModel : ITemplatePartModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory> _repositoryPart;

        public TemplatePartModel(IUnitOfWork unitOfWork, ITemplatePartRepository<ITemplatePartModel, ITemplatePartDomainFactory> repositoryPart)
        {
            _unitOfWork = unitOfWork;
            _repositoryPart = repositoryPart;
        }
        public long PartId { get; set; }
        public long PageId { get; set; }
        public string PartKey { get; set; }
        public double Order { get; set; }

        public ITemplatePartModel Insert(ITemplatePartDomainFactory factory)
        {
            return _repositoryPart.Insert(this, factory);
        }
        public ITemplatePartModel Update(ITemplatePartDomainFactory factory)
        {
            return _repositoryPart.Update(this, factory);
        }
        public void Delete(long partId)
        {
            _repositoryPart.Delete(partId);
        }
        public IEnumerable<ITemplatePartModel> ListByPage(long pageId, ITemplatePartDomainFactory factory)
        {
            return _repositoryPart.ListByPage(pageId, factory);
        }
        public ITemplatePartModel GetByKey(long pageId, string key, ITemplatePartDomainFactory factory)
        {
            return _repositoryPart.GetByKey(pageId, key, factory);
        }

        public void MoveDown(long partId)
        {
            _repositoryPart.MoveDown(partId);
        }

        public void MoveUp(long partId)
        {
            _repositoryPart.MoveUp(partId);
        }
    }
}

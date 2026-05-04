using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonexUp.Domain.Impl.Models
{
    public class ProductLinkModel : IProductLinkModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory> _repository;

        public ProductLinkModel(IUnitOfWork unitOfWork, IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory> repository)
        {
            _unitOfWork = unitOfWork;
            _repository = repository;
        }

        public int Id { get; set; }
        public long LofnProductId { get; set; }
        public long NetworkId { get; set; }
        public long UserId { get; set; }
        public DateTime CreatedAt { get; set; }

        public IProductLinkModel Upsert(IProductLinkDomainFactory factory)
        {
            return _repository.Upsert(this, factory);
        }

        public IProductLinkModel GetByLofnProductId(long lofnProductId, IProductLinkDomainFactory factory)
        {
            return _repository.GetByLofnProductId(lofnProductId, factory);
        }

        public IList<IProductLinkModel> ListByNetwork(long networkId, IProductLinkDomainFactory factory)
        {
            return _repository.ListByNetwork(networkId, factory).ToList();
        }

        public IList<IProductLinkModel> ListByUser(long userId, IProductLinkDomainFactory factory)
        {
            return _repository.ListByUser(userId, factory).ToList();
        }

        public int DeleteByNetwork(long networkId)
        {
            return _repository.DeleteByNetwork(networkId);
        }
    }
}

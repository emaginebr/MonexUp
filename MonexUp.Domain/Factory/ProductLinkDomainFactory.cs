using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;

namespace MonexUp.Domain.Impl.Factory
{
    public class ProductLinkDomainFactory : IProductLinkDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory> _repository;

        public ProductLinkDomainFactory(IUnitOfWork unitOfWork, IProductLinkRepository<IProductLinkModel, IProductLinkDomainFactory> repository)
        {
            _unitOfWork = unitOfWork;
            _repository = repository;
        }

        public IProductLinkModel BuildProductLinkModel()
        {
            return new ProductLinkModel(_unitOfWork, _repository);
        }
    }
}

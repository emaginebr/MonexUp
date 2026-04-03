using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class ProductDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IProductRepository<IProductModel, IProductDomainFactory>> _repository;
        private readonly ProductDomainFactory _sut;

        public ProductDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IProductRepository<IProductModel, IProductDomainFactory>>();
            _sut = new ProductDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildProductModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildProductModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildProductModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildProductModel();
            Assert.IsAssignableFrom<IProductModel>(result);
        }

        [Fact]
        public void BuildProductModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildProductModel();
            var result2 = _sut.BuildProductModel();
            Assert.NotSame(result1, result2);
        }
    }
}

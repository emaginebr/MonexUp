using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class OrderItemDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory>> _repository;
        private readonly OrderItemDomainFactory _sut;

        public OrderItemDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IOrderItemRepository<IOrderItemModel, IOrderItemDomainFactory>>();
            _sut = new OrderItemDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildOrderItemModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildOrderItemModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildOrderItemModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildOrderItemModel();
            Assert.IsAssignableFrom<IOrderItemModel>(result);
        }

        [Fact]
        public void BuildOrderItemModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildOrderItemModel();
            var result2 = _sut.BuildOrderItemModel();
            Assert.NotSame(result1, result2);
        }
    }
}

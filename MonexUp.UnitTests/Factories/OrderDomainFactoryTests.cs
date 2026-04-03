using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class OrderDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IOrderRepository<IOrderModel, IOrderDomainFactory>> _repository;
        private readonly OrderDomainFactory _sut;

        public OrderDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IOrderRepository<IOrderModel, IOrderDomainFactory>>();
            _sut = new OrderDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildOrderModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildOrderModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildOrderModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildOrderModel();
            Assert.IsAssignableFrom<IOrderModel>(result);
        }

        [Fact]
        public void BuildOrderModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildOrderModel();
            var result2 = _sut.BuildOrderModel();
            Assert.NotSame(result1, result2);
        }
    }
}

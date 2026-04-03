using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class NetworkDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<INetworkRepository<INetworkModel, INetworkDomainFactory>> _repository;
        private readonly NetworkDomainFactory _sut;

        public NetworkDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<INetworkRepository<INetworkModel, INetworkDomainFactory>>();
            _sut = new NetworkDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildNetworkModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildNetworkModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildNetworkModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildNetworkModel();
            Assert.IsAssignableFrom<INetworkModel>(result);
        }

        [Fact]
        public void BuildNetworkModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildNetworkModel();
            var result2 = _sut.BuildNetworkModel();
            Assert.NotSame(result1, result2);
        }
    }
}

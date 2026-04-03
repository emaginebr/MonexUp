using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class UserNetworkDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>> _repository;
        private readonly UserNetworkDomainFactory _sut;

        public UserNetworkDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IUserNetworkRepository<IUserNetworkModel, IUserNetworkDomainFactory>>();
            _sut = new UserNetworkDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildUserNetworkModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildUserNetworkModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildUserNetworkModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildUserNetworkModel();
            Assert.IsAssignableFrom<IUserNetworkModel>(result);
        }

        [Fact]
        public void BuildUserNetworkModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildUserNetworkModel();
            var result2 = _sut.BuildUserNetworkModel();
            Assert.NotSame(result1, result2);
        }
    }
}

using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class UserProfileDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory>> _repository;
        private readonly UserProfileDomainFactory _sut;

        public UserProfileDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IUserProfileRepository<IUserProfileModel, IUserProfileDomainFactory>>();
            _sut = new UserProfileDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildUserProfileModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildUserProfileModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildUserProfileModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildUserProfileModel();
            Assert.IsAssignableFrom<IUserProfileModel>(result);
        }

        [Fact]
        public void BuildUserProfileModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildUserProfileModel();
            var result2 = _sut.BuildUserProfileModel();
            Assert.NotSame(result1, result2);
        }
    }
}

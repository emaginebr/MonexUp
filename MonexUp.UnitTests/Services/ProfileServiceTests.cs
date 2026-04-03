using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Profile;
using MonexUp.DTO.User;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;

namespace MonexUp.UnitTests.Services
{
    public class ProfileServiceTests
    {
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<IUserNetworkDomainFactory> _userNetworkFactory;
        private readonly Mock<IUserProfileDomainFactory> _profileFactory;
        private readonly ProfileService _service;

        public ProfileServiceTests()
        {
            _userClient = new Mock<IUserClient>();
            _userNetworkFactory = new Mock<IUserNetworkDomainFactory>();
            _profileFactory = new Mock<IUserProfileDomainFactory>();

            _service = new ProfileService(
                _userClient.Object,
                _userNetworkFactory.Object,
                _profileFactory.Object
            );
        }

        private UserProfileInfo CreateValidProfileInfo()
        {
            return new UserProfileInfo
            {
                ProfileId = 0,
                NetworkId = 1,
                Name = "Test Profile",
                Commission = 5,
                Level = 3
            };
        }

        /// <summary>
        /// Sets up the user network mock so ValidateAccess succeeds for a NetworkManager.
        /// </summary>
        private void SetupValidateAccessAsManager(long networkId, long userId)
        {
            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupGet(m => m.Role).Returns(UserRoleEnum.NetworkManager);

            var mockBuilder = new Mock<IUserNetworkModel>();
            mockBuilder.Setup(m => m.Get(networkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockBuilder.Object);
        }

        /// <summary>
        /// Sets up the user network mock so ValidateAccess fails (no access).
        /// </summary>
        private void SetupValidateAccessNoAccess(long networkId, long userId)
        {
            var mockBuilder = new Mock<IUserNetworkModel>();
            mockBuilder.Setup(m => m.Get(networkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns((IUserNetworkModel)null!);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockBuilder.Object);
        }

        private Mock<IUserProfileModel> SetupProfileModel()
        {
            var mockModel = new Mock<IUserProfileModel>();
            mockModel.SetupAllProperties();
            mockModel.Setup(m => m.Insert(It.IsAny<IUserProfileDomainFactory>())).Returns(mockModel.Object);
            mockModel.Setup(m => m.Update(It.IsAny<IUserProfileDomainFactory>())).Returns(mockModel.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockModel.Object);
            return mockModel;
        }

        [Fact]
        public async Task Insert_WithValidAccess_ShouldCreateProfile()
        {
            // Arrange
            var profileInfo = CreateValidProfileInfo();
            long userId = 10;
            string token = "test-token";

            SetupValidateAccessAsManager(profileInfo.NetworkId, userId);

            var mockProfileModel = new Mock<IUserProfileModel>();
            mockProfileModel.SetupAllProperties();
            mockProfileModel.Setup(m => m.Insert(It.IsAny<IUserProfileDomainFactory>())).Returns(mockProfileModel.Object);

            // After ValidateAccess passes, the factory is called again to build a new profile model
            var mockBuilderForAccess = new Mock<IUserNetworkModel>();
            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupGet(m => m.Role).Returns(UserRoleEnum.NetworkManager);
            mockBuilderForAccess.Setup(m => m.Get(profileInfo.NetworkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockBuilderForAccess.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockProfileModel.Object);

            // Act
            var result = await _service.Insert(profileInfo, userId, token);

            // Assert
            Assert.NotNull(result);
            mockProfileModel.Verify(m => m.Insert(It.IsAny<IUserProfileDomainFactory>()), Times.Once);
        }

        [Fact]
        public async Task Insert_WithEmptyName_ShouldThrow()
        {
            // Arrange
            var profileInfo = CreateValidProfileInfo();
            profileInfo.Name = "";
            long userId = 10;
            string token = "test-token";

            SetupValidateAccessAsManager(profileInfo.NetworkId, userId);
            SetupProfileModel();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.Insert(profileInfo, userId, token));
            Assert.Equal("Name is empty", ex.Message);
        }

        [Fact]
        public async Task Insert_WithNoAccess_ShouldThrow()
        {
            // Arrange
            var profileInfo = CreateValidProfileInfo();
            long userId = 10;
            string token = "test-token";

            SetupValidateAccessNoAccess(profileInfo.NetworkId, userId);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.Insert(profileInfo, userId, token));
            Assert.Equal("Your dont have access to this network", ex.Message);
        }

        [Fact]
        public async Task Update_WithValidAccess_ShouldUpdateProfile()
        {
            // Arrange
            var profileInfo = CreateValidProfileInfo();
            profileInfo.ProfileId = 5;
            long userId = 10;
            string token = "test-token";

            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupGet(m => m.Role).Returns(UserRoleEnum.NetworkManager);
            var mockBuilder = new Mock<IUserNetworkModel>();
            mockBuilder.Setup(m => m.Get(profileInfo.NetworkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockBuilder.Object);

            var mockProfileModel = new Mock<IUserProfileModel>();
            mockProfileModel.SetupAllProperties();
            mockProfileModel.Setup(m => m.Update(It.IsAny<IUserProfileDomainFactory>())).Returns(mockProfileModel.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockProfileModel.Object);

            // Act
            var result = await _service.Update(profileInfo, userId, token);

            // Assert
            Assert.NotNull(result);
            mockProfileModel.Verify(m => m.Update(It.IsAny<IUserProfileDomainFactory>()), Times.Once);
        }

        [Fact]
        public async Task Delete_WithNoUsersLinked_ShouldDelete()
        {
            // Arrange
            long profileId = 5;
            long networkId = 1;
            long userId = 10;
            string token = "test-token";

            // Setup profile model returned by GetById
            var mockProfileModel = new Mock<IUserProfileModel>();
            mockProfileModel.SetupGet(m => m.NetworkId).Returns(networkId);
            mockProfileModel.Setup(m => m.GetUsersCount(networkId, profileId)).Returns(0);

            var mockProfileBuilder = new Mock<IUserProfileModel>();
            mockProfileBuilder.Setup(m => m.GetById(profileId, It.IsAny<IUserProfileDomainFactory>()))
                .Returns(mockProfileModel.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockProfileBuilder.Object);

            // Setup ValidateAccess
            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupGet(m => m.Role).Returns(UserRoleEnum.NetworkManager);
            var mockUserNetworkBuilder = new Mock<IUserNetworkModel>();
            mockUserNetworkBuilder.Setup(m => m.Get(networkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockUserNetworkBuilder.Object);

            // Act
            await _service.Delete(profileId, userId, token);

            // Assert
            mockProfileModel.Verify(m => m.Delete(profileId), Times.Once);
        }

        [Fact]
        public async Task Delete_WithUsersLinked_ShouldThrow()
        {
            // Arrange
            long profileId = 5;
            long networkId = 1;
            long userId = 10;
            string token = "test-token";

            var mockProfileModel = new Mock<IUserProfileModel>();
            mockProfileModel.SetupGet(m => m.NetworkId).Returns(networkId);
            mockProfileModel.Setup(m => m.GetUsersCount(networkId, profileId)).Returns(3);

            var mockProfileBuilder = new Mock<IUserProfileModel>();
            mockProfileBuilder.Setup(m => m.GetById(profileId, It.IsAny<IUserProfileDomainFactory>()))
                .Returns(mockProfileModel.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockProfileBuilder.Object);

            // Setup ValidateAccess
            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupGet(m => m.Role).Returns(UserRoleEnum.NetworkManager);
            var mockUserNetworkBuilder = new Mock<IUserNetworkModel>();
            mockUserNetworkBuilder.Setup(m => m.Get(networkId, userId, It.IsAny<IUserNetworkDomainFactory>()))
                .Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockUserNetworkBuilder.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.Delete(profileId, userId, token));
            Assert.Equal("Cannot delete, has 3 user(s) linked", ex.Message);
        }

        [Fact]
        public void GetById_ShouldDelegateToFactory()
        {
            // Arrange
            long profileId = 5;
            var expectedModel = new Mock<IUserProfileModel>();

            var mockBuilder = new Mock<IUserProfileModel>();
            mockBuilder.Setup(m => m.GetById(profileId, It.IsAny<IUserProfileDomainFactory>()))
                .Returns(expectedModel.Object);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockBuilder.Object);

            // Act
            var result = _service.GetById(profileId);

            // Assert
            Assert.Same(expectedModel.Object, result);
            mockBuilder.Verify(m => m.GetById(profileId, _profileFactory.Object), Times.Once);
        }

        [Fact]
        public void ListByNetwork_ShouldDelegateToFactory()
        {
            // Arrange
            long networkId = 1;
            var profileList = new List<IUserProfileModel>
            {
                new Mock<IUserProfileModel>().Object,
                new Mock<IUserProfileModel>().Object
            };

            var mockBuilder = new Mock<IUserProfileModel>();
            mockBuilder.Setup(m => m.ListByNetwork(networkId, It.IsAny<IUserProfileDomainFactory>()))
                .Returns(profileList);
            _profileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockBuilder.Object);

            // Act
            var result = _service.ListByNetwork(networkId);

            // Assert
            Assert.Equal(2, result.Count);
            mockBuilder.Verify(m => m.ListByNetwork(networkId, _profileFactory.Object), Times.Once);
        }

        [Fact]
        public void GetUserProfileInfo_WithNull_ShouldReturnNull()
        {
            // Act
            var result = _service.GetUserProfileInfo(null!);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetUserProfileInfo_WithModel_ShouldMapCorrectly()
        {
            // Arrange
            var mockModel = new Mock<IUserProfileModel>();
            mockModel.SetupGet(m => m.ProfileId).Returns(1);
            mockModel.SetupGet(m => m.NetworkId).Returns(2);
            mockModel.SetupGet(m => m.Name).Returns("Manager");
            mockModel.SetupGet(m => m.Commission).Returns(15.5);
            mockModel.SetupGet(m => m.Level).Returns(1);
            mockModel.SetupGet(m => m.Members).Returns(10);

            // Act
            var result = _service.GetUserProfileInfo(mockModel.Object);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ProfileId);
            Assert.Equal(2, result.NetworkId);
            Assert.Equal("Manager", result.Name);
            Assert.Equal(15.5, result.Commission);
            Assert.Equal(1, result.Level);
            Assert.Equal(10, result.Members);
        }
    }
}

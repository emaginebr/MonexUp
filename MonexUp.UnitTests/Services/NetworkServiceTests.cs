using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Network;
using MonexUp.DTO.User;
using NAuth.ACL.Interfaces;
using zTools.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    public class NetworkServiceTests
    {
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<INetworkDomainFactory> _networkFactory;
        private readonly Mock<IUserNetworkDomainFactory> _userNetworkFactory;
        private readonly Mock<IUserProfileDomainFactory> _userProfileFactory;
        private readonly Mock<IProfileService> _profileService;
        private readonly Mock<IFileClient> _fileClient;
        private readonly NetworkService _service;

        public NetworkServiceTests()
        {
            _userClient = new Mock<IUserClient>();
            _networkFactory = new Mock<INetworkDomainFactory>();
            _userNetworkFactory = new Mock<IUserNetworkDomainFactory>();
            _userProfileFactory = new Mock<IUserProfileDomainFactory>();
            _profileService = new Mock<IProfileService>();
            _fileClient = new Mock<IFileClient>();

            _service = new NetworkService(
                _userClient.Object,
                _networkFactory.Object,
                _userNetworkFactory.Object,
                _userProfileFactory.Object,
                _profileService.Object,
                _fileClient.Object
            );
        }

        private NetworkInsertInfo CreateValidInsertInfo()
        {
            return new NetworkInsertInfo
            {
                Name = "Test Network",
                Email = "test@example.com",
                Commission = 10,
                Plan = NetworkPlanEnum.Free
            };
        }

        private Mock<INetworkModel> SetupNetworkModel(long networkId = 1)
        {
            var mockModel = new Mock<INetworkModel>();
            mockModel.SetupAllProperties();
            mockModel.Setup(m => m.GetByName(It.IsAny<string>(), It.IsAny<INetworkDomainFactory>())).Returns((INetworkModel)null!);
            mockModel.Setup(m => m.GetByEmail(It.IsAny<string>(), It.IsAny<INetworkDomainFactory>())).Returns((INetworkModel)null!);
            mockModel.Setup(m => m.ExistSlug(It.IsAny<long>(), It.IsAny<string>())).Returns(false);
            mockModel.Setup(m => m.Insert(It.IsAny<INetworkDomainFactory>())).Returns(mockModel.Object);
            mockModel.SetupGet(m => m.NetworkId).Returns(networkId);
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(mockModel.Object);
            return mockModel;
        }

        private Mock<IUserNetworkModel> SetupUserNetworkModel()
        {
            var mockModel = new Mock<IUserNetworkModel>();
            mockModel.SetupAllProperties();
            mockModel.Setup(m => m.Insert(It.IsAny<IUserNetworkDomainFactory>())).Returns(mockModel.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockModel.Object);
            return mockModel;
        }

        private Mock<IUserProfileModel> SetupUserProfileModel()
        {
            var mockModel = new Mock<IUserProfileModel>();
            mockModel.SetupAllProperties();
            mockModel.Setup(m => m.Insert(It.IsAny<IUserProfileDomainFactory>())).Returns(mockModel.Object);
            mockModel.Setup(m => m.ListByNetwork(It.IsAny<long>(), It.IsAny<IUserProfileDomainFactory>()))
                .Returns(new List<IUserProfileModel>());
            _userProfileFactory.Setup(f => f.BuildUserProfileModel()).Returns(mockModel.Object);
            return mockModel;
        }

        [Fact]
        public void Insert_WithValidData_ShouldCreateNetworkAndDefaults()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();
            long userId = 10;

            var mockNetworkModel = SetupNetworkModel(1);
            var mockUserNetworkModel = SetupUserNetworkModel();
            var mockProfileModel = SetupUserProfileModel();

            // Act
            var result = _service.Insert(insertInfo, userId);

            // Assert
            Assert.NotNull(result);
            mockNetworkModel.Verify(m => m.Insert(It.IsAny<INetworkDomainFactory>()), Times.Once);
            mockUserNetworkModel.Verify(m => m.Insert(It.IsAny<IUserNetworkDomainFactory>()), Times.Once);
            // Two profiles created: "Gerente" (L1) and "Vendedor" (L2)
            mockProfileModel.Verify(m => m.Insert(It.IsAny<IUserProfileDomainFactory>()), Times.Exactly(2));
        }

        [Fact]
        public void Insert_WithEmptyName_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();
            insertInfo.Name = "";
            SetupNetworkModel();

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Name is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithNullName_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();
            insertInfo.Name = null!;
            SetupNetworkModel();

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Name is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithDuplicateName_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();

            var existingNetwork = new Mock<INetworkModel>();
            existingNetwork.SetupGet(m => m.NetworkId).Returns(99);

            var mockModel = new Mock<INetworkModel>();
            mockModel.SetupAllProperties();
            mockModel.SetupGet(m => m.NetworkId).Returns(0);
            mockModel.Setup(m => m.GetByName(insertInfo.Name, It.IsAny<INetworkDomainFactory>()))
                .Returns(existingNetwork.Object);
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(mockModel.Object);

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Network with this name already registered", ex.Message);
        }

        [Fact]
        public void Insert_WithEmptyEmail_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();
            insertInfo.Email = "";
            SetupNetworkModel();

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Email is empty", ex.Message);
        }

        [Fact]
        public void Insert_WithInvalidEmail_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();
            insertInfo.Email = "not-an-email";
            SetupNetworkModel();

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Email is not valid", ex.Message);
        }

        [Fact]
        public void Insert_WithDuplicateEmail_ShouldThrow()
        {
            // Arrange
            var insertInfo = CreateValidInsertInfo();

            var existingNetwork = new Mock<INetworkModel>();
            existingNetwork.SetupGet(m => m.NetworkId).Returns(99);

            var mockModel = new Mock<INetworkModel>();
            mockModel.SetupAllProperties();
            mockModel.SetupGet(m => m.NetworkId).Returns(0);
            mockModel.Setup(m => m.GetByName(It.IsAny<string>(), It.IsAny<INetworkDomainFactory>()))
                .Returns((INetworkModel)null!);
            mockModel.Setup(m => m.GetByEmail(insertInfo.Email, It.IsAny<INetworkDomainFactory>()))
                .Returns(existingNetwork.Object);
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(mockModel.Object);

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => _service.Insert(insertInfo, 1));
            Assert.Equal("Network with email already registered", ex.Message);
        }

        [Fact]
        public void GetById_ShouldDelegateToFactory()
        {
            // Arrange
            long networkId = 5;
            var expectedModel = new Mock<INetworkModel>();

            var mockBuilder = new Mock<INetworkModel>();
            mockBuilder.Setup(m => m.GetById(networkId, It.IsAny<INetworkDomainFactory>()))
                .Returns(expectedModel.Object);
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(mockBuilder.Object);

            // Act
            var result = _service.GetById(networkId);

            // Assert
            Assert.Same(expectedModel.Object, result);
            mockBuilder.Verify(m => m.GetById(networkId, _networkFactory.Object), Times.Once);
        }

        [Fact]
        public void ListByStatus_ShouldDelegateToFactory()
        {
            // Arrange
            var status = NetworkStatusEnum.Active;
            var networkList = new List<INetworkModel>
            {
                new Mock<INetworkModel>().Object,
                new Mock<INetworkModel>().Object
            };

            var mockBuilder = new Mock<INetworkModel>();
            mockBuilder.Setup(m => m.ListByStatus(status, It.IsAny<INetworkDomainFactory>()))
                .Returns(networkList);
            _networkFactory.Setup(f => f.BuildNetworkModel()).Returns(mockBuilder.Object);

            // Act
            var result = _service.ListByStatus(status);

            // Assert
            Assert.Equal(2, result.Count);
            mockBuilder.Verify(m => m.ListByStatus(status, _networkFactory.Object), Times.Once);
        }

        [Fact]
        public void RequestAccess_ShouldCreateUserNetworkWithWaitForApproval()
        {
            // Arrange
            long networkId = 1;
            long userId = 10;
            long referrerId = 5;

            var lowerProfile = new Mock<IUserProfileModel>();
            lowerProfile.SetupGet(m => m.ProfileId).Returns(42);
            lowerProfile.SetupGet(m => m.Level).Returns(2);

            var profileBuilder = new Mock<IUserProfileModel>();
            profileBuilder.Setup(m => m.ListByNetwork(networkId, It.IsAny<IUserProfileDomainFactory>()))
                .Returns(new List<IUserProfileModel> { lowerProfile.Object });
            _userProfileFactory.Setup(f => f.BuildUserProfileModel()).Returns(profileBuilder.Object);

            var mockUserNetwork = new Mock<IUserNetworkModel>();
            mockUserNetwork.SetupAllProperties();
            mockUserNetwork.Setup(m => m.Insert(It.IsAny<IUserNetworkDomainFactory>())).Returns(mockUserNetwork.Object);
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(mockUserNetwork.Object);

            // Act
            _service.RequestAccess(networkId, userId, referrerId);

            // Assert
            mockUserNetwork.Verify(m => m.Insert(It.IsAny<IUserNetworkDomainFactory>()), Times.Once);
            mockUserNetwork.VerifySet(m => m.Status = UserNetworkStatusEnum.WaitForApproval);
            mockUserNetwork.VerifySet(m => m.Role = UserRoleEnum.Seller);
            mockUserNetwork.VerifySet(m => m.ProfileId = 42);
            mockUserNetwork.VerifySet(m => m.ReferrerId = referrerId);
        }
    }
}

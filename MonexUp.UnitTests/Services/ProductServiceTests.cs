using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Product;
using MonexUp.DTO.User;
using Moq;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using zTools.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    public class ProductServiceTests
    {
        private readonly Mock<IUserClient> _userClient;
        private readonly Mock<IUserNetworkDomainFactory> _userNetworkFactory;
        private readonly Mock<IProductDomainFactory> _productFactory;
        private readonly Mock<IFileClient> _fileClient;
        private readonly Mock<IUserNetworkModel> _userNetworkModel;
        private readonly Mock<IProductModel> _productModel;
        private readonly ProductService _sut;

        public ProductServiceTests()
        {
            _userClient = new Mock<IUserClient>();
            _userNetworkFactory = new Mock<IUserNetworkDomainFactory>();
            _productFactory = new Mock<IProductDomainFactory>();
            _fileClient = new Mock<IFileClient>();

            _userNetworkModel = new Mock<IUserNetworkModel>();
            _productModel = new Mock<IProductModel>();

            _userNetworkFactory
                .Setup(f => f.BuildUserNetworkModel())
                .Returns(_userNetworkModel.Object);

            _productFactory
                .Setup(f => f.BuildProductModel())
                .Returns(_productModel.Object);

            _sut = new ProductService(
                _userClient.Object,
                _userNetworkFactory.Object,
                _productFactory.Object,
                _fileClient.Object);
        }

        private void SetupValidAccess(long networkId, long userId)
        {
            _userNetworkModel
                .Setup(m => m.Get(networkId, userId, _userNetworkFactory.Object))
                .Returns(() =>
                {
                    var mock = new Mock<IUserNetworkModel>();
                    mock.Setup(x => x.Role).Returns(UserRoleEnum.NetworkManager);
                    return mock.Object;
                });
        }

        [Fact]
        public async Task Insert_WithValidData_ShouldCreateProduct()
        {
            // Arrange
            var productInfo = new ProductInfo
            {
                NetworkId = 1,
                Name = "Test Product",
                Price = 50.0,
                Frequency = 30,
                Limit = 10,
                Status = ProductStatusEnum.Active
            };
            long userId = 1;
            string token = "test-token";

            SetupValidAccess(productInfo.NetworkId, userId);

            _productModel.Setup(m => m.ExistSlug(It.IsAny<long>(), It.IsAny<string>())).Returns(false);
            _productModel.Setup(m => m.Insert(_productFactory.Object)).Returns(_productModel.Object);

            // Act
            var result = await _sut.Insert(productInfo, userId, token);

            // Assert
            Assert.NotNull(result);
            _productModel.Verify(m => m.Insert(_productFactory.Object), Times.Once);
        }

        [Fact]
        public async Task Insert_WithEmptyName_ShouldThrow()
        {
            // Arrange
            var productInfo = new ProductInfo
            {
                NetworkId = 1,
                Name = "",
                Price = 50.0
            };
            long userId = 1;
            string token = "test-token";

            SetupValidAccess(productInfo.NetworkId, userId);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _sut.Insert(productInfo, userId, token));
            Assert.Equal("Name is empty", ex.Message);
        }

        [Fact]
        public async Task Insert_WithZeroPrice_ShouldThrow()
        {
            // Arrange
            var productInfo = new ProductInfo
            {
                NetworkId = 1,
                Name = "Test Product",
                Price = 0
            };
            long userId = 1;
            string token = "test-token";

            SetupValidAccess(productInfo.NetworkId, userId);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _sut.Insert(productInfo, userId, token));
            Assert.Equal("Price cant be 0", ex.Message);
        }

        [Fact]
        public async Task Insert_WithNoAccess_ShouldThrow()
        {
            // Arrange
            var productInfo = new ProductInfo
            {
                NetworkId = 1,
                Name = "Test Product",
                Price = 50.0
            };
            long userId = 1;
            string token = "test-token";

            // No network access found — Get returns null
            _userNetworkModel
                .Setup(m => m.Get(productInfo.NetworkId, userId, _userNetworkFactory.Object))
                .Returns((IUserNetworkModel)null!);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _sut.Insert(productInfo, userId, token));
            Assert.Equal("Your dont have access to this network", ex.Message);
        }

        [Fact]
        public async Task Update_WithValidData_ShouldUpdateProduct()
        {
            // Arrange
            var productInfo = new ProductInfo
            {
                ProductId = 10,
                NetworkId = 1,
                Name = "Updated Product",
                Price = 100.0,
                Image = "img.png",
                Frequency = 30,
                Limit = 5,
                Status = ProductStatusEnum.Active
            };
            long userId = 1;
            string token = "test-token";

            SetupValidAccess(productInfo.NetworkId, userId);

            _productModel.Setup(m => m.ExistSlug(It.IsAny<long>(), It.IsAny<string>())).Returns(false);
            _productModel.Setup(m => m.Update(_productFactory.Object)).Returns(_productModel.Object);

            // Act
            var result = await _sut.Update(productInfo, userId, token);

            // Assert
            Assert.NotNull(result);
            _productModel.Verify(m => m.Update(_productFactory.Object), Times.Once);
        }

        [Fact]
        public void GetById_ShouldDelegateToFactory()
        {
            // Arrange
            long productId = 5;
            var expectedProduct = new Mock<IProductModel>();
            _productModel
                .Setup(m => m.GetById(productId, _productFactory.Object))
                .Returns(expectedProduct.Object);

            // Act
            var result = _sut.GetById(productId);

            // Assert
            Assert.Same(expectedProduct.Object, result);
            _productModel.Verify(m => m.GetById(productId, _productFactory.Object), Times.Once);
        }

        [Fact]
        public void GetBySlug_ShouldDelegateToFactory()
        {
            // Arrange
            string slug = "test-product";
            var expectedProduct = new Mock<IProductModel>();
            _productModel
                .Setup(m => m.GetBySlug(slug, _productFactory.Object))
                .Returns(expectedProduct.Object);

            // Act
            var result = _sut.GetBySlug(slug);

            // Assert
            Assert.Same(expectedProduct.Object, result);
            _productModel.Verify(m => m.GetBySlug(slug, _productFactory.Object), Times.Once);
        }

        [Fact]
        public void ListByNetwork_ShouldReturnOrderedByPrice()
        {
            // Arrange
            long networkId = 1;

            var product1 = new Mock<IProductModel>();
            product1.Setup(p => p.Price).Returns(100.0);

            var product2 = new Mock<IProductModel>();
            product2.Setup(p => p.Price).Returns(25.0);

            var product3 = new Mock<IProductModel>();
            product3.Setup(p => p.Price).Returns(50.0);

            var unorderedList = new List<IProductModel>
            {
                product1.Object, product2.Object, product3.Object
            };

            _productModel
                .Setup(m => m.ListByNetwork(networkId, _productFactory.Object))
                .Returns(unorderedList);

            // Act
            var result = _sut.ListByNetwork(networkId);

            // Assert
            Assert.Equal(3, result.Count);
            Assert.Equal(25.0, result[0].Price);
            Assert.Equal(50.0, result[1].Price);
            Assert.Equal(100.0, result[2].Price);
        }
    }
}

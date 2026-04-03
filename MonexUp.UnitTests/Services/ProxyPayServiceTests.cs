using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using Moq;
using NAuth.DTO.User;

namespace MonexUp.UnitTests.Services
{
    public class ProxyPayServiceTests
    {
        private readonly Mock<IProxyPayAppService> _proxyPayAppService;
        private readonly Mock<IInvoiceDomainFactory> _invoiceFactory;
        private readonly Mock<IInvoiceFeeDomainFactory> _feeFactory;
        private readonly Mock<IInvoiceService> _invoiceService;
        private readonly ProxyPayService _sut;

        public ProxyPayServiceTests()
        {
            _proxyPayAppService = new Mock<IProxyPayAppService>();
            _invoiceFactory = new Mock<IInvoiceDomainFactory>();
            _feeFactory = new Mock<IInvoiceFeeDomainFactory>();
            _invoiceService = new Mock<IInvoiceService>();

            _sut = new ProxyPayService(
                _proxyPayAppService.Object,
                _invoiceFactory.Object,
                _feeFactory.Object,
                _invoiceService.Object);
        }

        [Fact]
        public async Task CreateQRCode_ShouldBuildCorrectRequest()
        {
            // Arrange
            var user = new UserInfo { Name = "John Doe", Email = "john@example.com" };
            var product = new Mock<IProductModel>();
            product.Setup(p => p.ProductId).Returns(42);
            product.Setup(p => p.Name).Returns("Premium Plan");
            product.Setup(p => p.Price).Returns(99.90);

            var network = new Mock<INetworkModel>();
            var seller = new UserInfo { Name = "Seller One" };
            string documentId = "123.456.789-00";

            ProxyPayQRCodeRequest capturedRequest = null!;
            _proxyPayAppService
                .Setup(s => s.CreateQRCodeAsync(It.IsAny<ProxyPayQRCodeRequest>()))
                .Callback<ProxyPayQRCodeRequest>(req => capturedRequest = req)
                .ReturnsAsync(new ProxyPayQRCodeResponse { Sucesso = true });

            // Act
            await _sut.CreateQRCode(user, product.Object, network.Object, seller, documentId);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal("John Doe", capturedRequest.CustomerName);
            Assert.Equal("john@example.com", capturedRequest.CustomerEmail);
            Assert.Equal("123.456.789-00", capturedRequest.CustomerDocumentId);
            Assert.Single(capturedRequest.Items);
            Assert.Equal("42", capturedRequest.Items[0].Id);
            Assert.Equal("Premium Plan", capturedRequest.Items[0].Description);
            Assert.Equal(1, capturedRequest.Items[0].Quantity);
            Assert.Equal(99.90, capturedRequest.Items[0].UnitPrice);
        }

        [Fact]
        public async Task CreateQRCode_ShouldReturnResponse()
        {
            // Arrange
            var user = new UserInfo { Name = "Jane", Email = "jane@example.com" };
            var product = new Mock<IProductModel>();
            product.Setup(p => p.ProductId).Returns(1);
            product.Setup(p => p.Name).Returns("Basic");
            product.Setup(p => p.Price).Returns(10.0);

            var expectedResponse = new ProxyPayQRCodeResponse
            {
                Sucesso = true,
                InvoiceId = "inv-123",
                BrCode = "00020126...",
                BrCodeBase64 = "base64data",
                ExpiredAt = new DateTime(2026, 12, 31)
            };

            _proxyPayAppService
                .Setup(s => s.CreateQRCodeAsync(It.IsAny<ProxyPayQRCodeRequest>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _sut.CreateQRCode(user, product.Object, null!, null!, "doc-id");

            // Assert
            Assert.Same(expectedResponse, result);
            Assert.True(result.Sucesso);
            Assert.Equal("inv-123", result.InvoiceId);
        }

        [Fact]
        public async Task CheckQRCodeStatus_ShouldDelegateToAppService()
        {
            // Arrange
            string invoiceId = "inv-456";
            var expectedStatus = new ProxyPayQRCodeStatusResponse
            {
                Sucesso = true,
                Status = "paid",
                Paid = true,
                ExpiresAt = new DateTime(2026, 12, 31)
            };

            _proxyPayAppService
                .Setup(s => s.CheckQRCodeStatusAsync(invoiceId))
                .ReturnsAsync(expectedStatus);

            // Act
            var result = await _sut.CheckQRCodeStatus(invoiceId);

            // Assert
            Assert.Same(expectedStatus, result);
            Assert.True(result.Paid);
            _proxyPayAppService.Verify(s => s.CheckQRCodeStatusAsync(invoiceId), Times.Once);
        }

        [Fact]
        public async Task SyncPendingInvoices_ShouldComplete()
        {
            // Act & Assert — should not throw
            await _sut.SyncPendingInvoices();
        }
    }
}

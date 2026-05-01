using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class OrderControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public OrderControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task CreatePixPayment_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreatePixPaymentRequest();

            var response = await _fixture.CreateAnonymousRequest("/order/createPixPayment/some-product-slug")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task CreatePixPayment_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreatePixPaymentRequest();

            var response = await _fixture.CreateAuthenticatedRequest("/order/createPixPayment/non-existent-product")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task CheckPixStatus_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/order/checkPixStatus/some-invoice-id")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task CheckPixStatus_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/order/checkPixStatus/some-invoice-id")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Update_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderInfo();

            var response = await _fixture.CreateAnonymousRequest("/order/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Update_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateOrderInfo();

            var response = await _fixture.CreateAuthenticatedRequest("/order/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Search_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderSearchParam();

            var response = await _fixture.CreateAnonymousRequest("/order/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Search_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateOrderSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/order/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task List_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderParam();

            var response = await _fixture.CreateAnonymousRequest("/order/list")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task List_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateOrderParam();

            var response = await _fixture.CreateAuthenticatedRequest("/order/list")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetById_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/order/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetById_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/order/getById/999999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401, "authenticated request should not be rejected");
        }
    }
}

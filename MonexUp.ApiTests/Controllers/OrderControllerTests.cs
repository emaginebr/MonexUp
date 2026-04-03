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
        public async Task Search_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateOrderSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/order/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
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
        public async Task GetById_WithAuth_ShouldReturnOk()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/order/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }
    }
}

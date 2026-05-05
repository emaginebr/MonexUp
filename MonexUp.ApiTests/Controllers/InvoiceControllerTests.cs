using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class InvoiceControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public InvoiceControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task SearchStatement_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateStatementSearchParam();

            var response = await _fixture.CreateAnonymousRequest("/billing/searchStatement")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task SearchStatement_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateStatementSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/billing/searchStatement")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBalance_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/billing/getBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetBalance_WithAuth_ShouldReturnSuccessStatus()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/billing/getBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().BeOneOf(200, 204);
        }

        [Fact]
        public async Task GetAvailableBalance_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/billing/getAvailableBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetAvailableBalance_WithAuth_ShouldReturnOk()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/billing/getAvailableBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }
    }
}

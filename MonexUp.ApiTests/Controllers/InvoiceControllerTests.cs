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
        public async Task Syncronize_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/invoice/syncronize")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Search_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateInvoiceSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/invoice/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task SearchStatement_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateStatementSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/invoice/searchStatement")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBalance_WithAuth_ShouldReturnSuccessStatus()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/invoice/getBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().BeOneOf(200, 204);
        }

        [Fact]
        public async Task GetAvailableBalance_WithAuth_ShouldReturnOk()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/invoice/getAvailableBalance")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }
    }
}

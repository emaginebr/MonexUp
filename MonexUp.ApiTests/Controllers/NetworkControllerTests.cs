using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class NetworkControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public NetworkControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task ListAll_ShouldReturnOk()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/listAll")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBySlug_WithInvalidSlug_ShouldReturnSuccessOrNoContent()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/getBySlug/non-existent-slug-999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().BeOneOf(200, 204);
        }

        [Fact]
        public async Task Insert_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateNetworkInsertInfo();

            var response = await _fixture.CreateAnonymousRequest("/network/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task ListByUser_WithAuth_ShouldReturnOk()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/listByUser")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetById_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetById_WithAuth_ShouldReturnSuccessOrNoContent()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().BeOneOf(200, 204);
        }
    }
}

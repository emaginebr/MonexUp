using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class ProfileControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public ProfileControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task Insert_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateUserProfileInfo(1);

            var response = await _fixture.CreateAnonymousRequest("/profile/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Insert_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateUserProfileInfo(1);

            var response = await _fixture.CreateAuthenticatedRequest("/profile/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Update_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateUserProfileInfo(1);

            var response = await _fixture.CreateAnonymousRequest("/profile/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Update_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateUserProfileInfo(1);

            var response = await _fixture.CreateAuthenticatedRequest("/profile/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Delete_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/profile/delete/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Delete_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/profile/delete/999999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task ListByNetwork_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/profile/listByNetwork/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task ListByNetwork_WithAuth_ShouldReturnOk()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/profile/listByNetwork/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetById_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/profile/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetById_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/profile/getById/999999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }
    }
}

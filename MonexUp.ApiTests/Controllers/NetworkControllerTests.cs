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
        public async Task Update_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateNetworkInfo();

            var response = await _fixture.CreateAnonymousRequest("/network/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Update_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateNetworkInfo();

            var response = await _fixture.CreateAuthenticatedRequest("/network/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401, "authenticated request should not be rejected");
        }

        [Fact]
        public async Task ListByUser_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/listByUser")
                .AllowAnyHttpStatus()
                .GetAsync();

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
        public async Task ListByNetwork_AnonymousWithInvalidSlug_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/listByNetwork/non-existent-slug-999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401, "endpoint is anonymous");
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

        [Fact]
        public async Task GetUserNetwork_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/getUserNetwork/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetUserNetwork_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/getUserNetwork/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task GetUserNetworkBySlug_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/getUserNetworkBySlug/some-slug")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetUserNetworkBySlug_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/getUserNetworkBySlug/non-existent-slug-999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task GetSellerBySlug_AnonymousAllowed_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/getSellerBySlug/non-existent-network/non-existent-seller")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401, "endpoint is anonymous");
        }

        [Fact]
        public async Task RequestAccess_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateNetworkRequestInfo();

            var response = await _fixture.CreateAnonymousRequest("/network/requestAccess")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task RequestAccess_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateNetworkRequestInfo();

            var response = await _fixture.CreateAuthenticatedRequest("/network/requestAccess")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task ChangeStatus_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateNetworkChangeStatusInfo();

            var response = await _fixture.CreateAnonymousRequest("/network/changeStatus")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task ChangeStatus_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateNetworkChangeStatusInfo();

            var response = await _fixture.CreateAuthenticatedRequest("/network/changeStatus")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Promote_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/promote/1/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Promote_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/promote/1/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Demote_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/network/demote/1/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Demote_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/network/demote/1/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }
    }
}

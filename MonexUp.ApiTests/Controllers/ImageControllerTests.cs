using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class ImageControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public ImageControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task UploadImageUser_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/image/uploadImageUser")
                .AllowAnyHttpStatus()
                .PostMultipartAsync(mp => mp.AddFile("file", new MemoryStream(new byte[] { 0x89, 0x50 }), "test.png"));

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task UploadImageNetwork_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/image/uploadImageNetwork")
                .AllowAnyHttpStatus()
                .PostMultipartAsync(mp => mp.AddFile("file", new MemoryStream(new byte[] { 0x89, 0x50 }), "test.png"));

            response.StatusCode.Should().Be(401);
        }
    }
}

using Flurl;
using Flurl.Http;
using Microsoft.Extensions.Configuration;

namespace MonexUp.ApiTests.Fixtures
{
    public class ApiTestFixture : IAsyncLifetime
    {
        public string BaseUrl { get; private set; } = string.Empty;
        public string AuthToken { get; private set; } = string.Empty;

        private IConfiguration _configuration = null!;

        public async Task InitializeAsync()
        {
            _configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.Test.json", optional: false)
                .AddEnvironmentVariables()
                .Build();

            BaseUrl = _configuration["ApiBaseUrl"] ?? throw new Exception("ApiBaseUrl not configured");

            var email = _configuration["Auth:Email"] ?? throw new Exception("Auth:Email not configured");
            var password = _configuration["Auth:Password"] ?? throw new Exception("Auth:Password not configured");
            var loginEndpoint = _configuration["Auth:LoginEndpoint"] ?? "/auth/login";

            try
            {
                var response = await new Url(BaseUrl)
                    .AppendPathSegment(loginEndpoint)
                    .WithAutoRedirect(true)
                    .PostJsonAsync(new { email, password })
                    .ReceiveJson<LoginResponse>();

                AuthToken = response?.Token ?? string.Empty;
            }
            catch (FlurlHttpException ex)
            {
                throw new Exception($"Failed to authenticate for API tests. Status: {ex.StatusCode}. Ensure the API is running at {BaseUrl}", ex);
            }
        }

        public Task DisposeAsync() => Task.CompletedTask;

        public IFlurlRequest CreateAuthenticatedRequest(string path)
        {
            return new Url(BaseUrl)
                .AppendPathSegment(path)
                .WithOAuthBearerToken(AuthToken);
        }

        public IFlurlRequest CreateAnonymousRequest(string path)
        {
            return new Url(BaseUrl)
                .AppendPathSegment(path)
                .WithAutoRedirect(true);
        }

        private class LoginResponse
        {
            public string Token { get; set; } = string.Empty;
            public bool Success { get; set; }
        }
    }
}

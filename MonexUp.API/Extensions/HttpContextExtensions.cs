using Microsoft.AspNetCore.Http;

namespace MonexUp.API.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetBearerToken(this HttpContext httpContext)
        {
            var authHeader = httpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return "";
            }
            return authHeader.Substring("Bearer ".Length).Trim();
        }
    }
}

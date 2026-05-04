using Microsoft.Extensions.Configuration;
using MonexUp.Infra.Interfaces.AppServices;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace DB.Infra.AppServices
{
    public class LofnStoreClient : ILofnStoreClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _lofnApiUrl;
        private const string TenantId = "monexup";

        public LofnStoreClient(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _lofnApiUrl = configuration["Lofn:ApiURL"]
                ?? throw new InvalidOperationException("Lofn:ApiURL configuration is required.");
        }

        public async Task<long> InsertAsync(string storeName, string bearerToken, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(storeName))
                throw new ArgumentException("storeName is required.", nameof(storeName));
            if (string.IsNullOrWhiteSpace(bearerToken))
                throw new ArgumentException("bearerToken is required.", nameof(bearerToken));

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

            var payload = JsonSerializer.Serialize(new { name = storeName });
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");

            var requestUri = $"{_lofnApiUrl.TrimEnd('/')}/Store/insert";
            using var response = await client.PostAsync(requestUri, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Lofn store insert failed ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (!root.TryGetProperty("storeId", out var storeIdProp))
            {
                throw new InvalidOperationException("Lofn response missing 'storeId'.");
            }

            return storeIdProp.GetInt64();
        }
    }
}

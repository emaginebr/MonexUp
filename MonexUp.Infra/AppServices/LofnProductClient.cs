using Microsoft.Extensions.Configuration;
using MonexUp.DTO.Lofn;
using MonexUp.Infra.Interfaces.AppServices;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace DB.Infra.AppServices
{
    public class LofnProductClient : ILofnProductClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _lofnApiUrl;
        private readonly string _tenantId;

        public LofnProductClient(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _lofnApiUrl = configuration["Lofn:ApiURL"] ?? "http://localhost:5003";
            _tenantId = "monexup";
        }

        public Task<LofnProductInfo> GetByIdAsync(long productId, CancellationToken ct = default)
        {
            var query = @"query($id: Long!) {
                getProducts(where: { productId: { eq: $id } }) {
                    items { productId storeId categoryId slug name description price discount frequency limit status productType featured imageUrl }
                }
            }";
            return ExecuteFirstAsync(query, new { id = productId }, ct);
        }

        public Task<LofnProductInfo> GetBySlugAsync(string slug, CancellationToken ct = default)
        {
            var query = @"query($slug: String!) {
                getProducts(where: { slug: { eq: $slug } }) {
                    items { productId storeId categoryId slug name description price discount frequency limit status productType featured imageUrl }
                }
            }";
            return ExecuteFirstAsync(query, new { slug }, ct);
        }

        private async Task<LofnProductInfo> ExecuteFirstAsync(string query, object variables, CancellationToken ct)
        {
            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _tenantId);

            var payload = JsonSerializer.Serialize(new { query, variables });
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");

            var requestUri = $"{_lofnApiUrl.TrimEnd('/')}/graphql";
            using var response = await client.PostAsync(requestUri, content, ct);
            if (!response.IsSuccessStatusCode) return null;

            var body = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(body);
            if (!doc.RootElement.TryGetProperty("data", out var data)) return null;
            if (!data.TryGetProperty("getProducts", out var getProducts)) return null;
            if (!getProducts.TryGetProperty("items", out var items) || items.GetArrayLength() == 0) return null;

            var first = items[0];
            return JsonSerializer.Deserialize<LofnProductInfo>(first.GetRawText(), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}

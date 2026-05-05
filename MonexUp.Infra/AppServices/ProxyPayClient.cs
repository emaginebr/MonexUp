using Microsoft.Extensions.Configuration;
using MonexUp.Infra.Interfaces.AppServices;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace DB.Infra.AppServices
{
    public class ProxyPayClient : IProxyPayClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _proxyPayApiUrl;
        private readonly string _tenantId;

        public ProxyPayClient(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _proxyPayApiUrl = configuration["ProxyPay:ApiUrl"]
                ?? throw new InvalidOperationException("ProxyPay:ApiUrl configuration is required.");
            _tenantId = configuration["ProxyPay:TenantId"] ?? "monexup";
        }

        public async Task<ProxyPayStoreCreatedInfo> InsertStoreAsync(string storeName, string email, string bearerToken, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(storeName))
                throw new ArgumentException("storeName is required.", nameof(storeName));
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("email is required.", nameof(email));
            if (string.IsNullOrWhiteSpace(bearerToken))
                throw new ArgumentException("bearerToken is required.", nameof(bearerToken));

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _tenantId);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

            var payload = JsonSerializer.Serialize(new { name = storeName, email = email, billingStrategy = 1 });
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");

            var requestUri = $"{_proxyPayApiUrl.TrimEnd('/')}/Store";
            using var response = await client.PostAsync(requestUri, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"ProxyPay store insert failed ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (!root.TryGetProperty("storeId", out var storeIdProp))
                throw new InvalidOperationException("ProxyPay store insert response missing 'storeId'.");
            if (!root.TryGetProperty("clientId", out var clientIdProp))
                throw new InvalidOperationException("ProxyPay store insert response missing 'clientId'.");

            return new ProxyPayStoreCreatedInfo
            {
                StoreId = storeIdProp.GetInt64(),
                ClientId = clientIdProp.GetString()
            };
        }

        public async Task<ProxyPayStoreCreatedInfo> GetMyStoreAsync(string bearerToken, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(bearerToken))
                throw new ArgumentException("bearerToken is required.", nameof(bearerToken));

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _tenantId);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

            var query = "{\"query\":\"{ myStore { storeId clientId } }\"}";
            using var content = new StringContent(query, Encoding.UTF8, "application/json");

            var requestUri = $"{_proxyPayApiUrl.TrimEnd('/')}/graphql";
            using var response = await client.PostAsync(requestUri, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"ProxyPay GraphQL myStore failed ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return null;
            if (!data.TryGetProperty("myStore", out var arr) || arr.ValueKind != JsonValueKind.Array || arr.GetArrayLength() == 0)
                return null;

            var first = arr[0];
            if (!first.TryGetProperty("storeId", out var sid) || !first.TryGetProperty("clientId", out var cid))
                return null;

            return new ProxyPayStoreCreatedInfo
            {
                StoreId = sid.GetInt64(),
                ClientId = cid.GetString()
            };
        }

        public async Task<ProxyPayInvoiceStatusInfo> GetInvoiceAsync(long proxypayInvoiceId, string clientId, CancellationToken ct = default)
        {
            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _tenantId);

            var requestUri = $"{_proxyPayApiUrl.TrimEnd('/')}/Payment/qrcode/status/{proxypayInvoiceId}";
            using var response = await client.GetAsync(requestUri, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"ProxyPay get invoice failed ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            return new ProxyPayInvoiceStatusInfo
            {
                InvoiceId = proxypayInvoiceId,
                Status = root.TryGetProperty("status", out var st) && st.ValueKind == JsonValueKind.Number ? st.GetInt32() : 0,
                PaidAt = root.TryGetProperty("paidAt", out var pa) && pa.ValueKind == JsonValueKind.String && DateTime.TryParse(pa.GetString(), out var paDate) ? paDate : (DateTime?)null,
                Amount = root.TryGetProperty("amount", out var am) && am.ValueKind == JsonValueKind.Number ? am.GetDouble() : 0,
                RefundedAmount = root.TryGetProperty("refundedAmount", out var ra) && ra.ValueKind == JsonValueKind.Number ? ra.GetDouble() : 0,
                StoreId = root.TryGetProperty("storeId", out var si) && si.ValueKind == JsonValueKind.Number ? si.GetInt64() : (long?)null,
                Url = root.TryGetProperty("url", out var u) && u.ValueKind == JsonValueKind.String ? u.GetString() : null
            };
        }

        public Task<IList<ProxyPayInvoiceStatusInfo>> ListPendingInvoicesAsync(long storeId, CancellationToken ct = default)
        {
            // GraphQL implementation deferred — returns empty list for now.
            // BillingReconciliationService will tolerate empty results;
            // production wire-up requires the ProxyPay GraphQL endpoint contract.
            IList<ProxyPayInvoiceStatusInfo> empty = new List<ProxyPayInvoiceStatusInfo>();
            return Task.FromResult(empty);
        }
    }
}

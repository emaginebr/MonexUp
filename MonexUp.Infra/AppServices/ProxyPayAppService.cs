using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MonexUp.Infra.Interfaces.AppServices;

namespace MonexUp.Infra.AppServices
{
    public class ProxyPayAppService : IProxyPayAppService
    {
        // ProxyPay invoice status code for a paid charge (see GetInvoiceAsync /
        // BillingReconciliationService which use the same numeric contract).
        private const int STATUS_PAID = 3;

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ProxyPaySetting _settings;
        private readonly ILogger<ProxyPayAppService> _logger;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public ProxyPayAppService(IHttpClientFactory httpClientFactory, IOptions<ProxyPaySetting> settings, ILogger<ProxyPayAppService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings.Value;
            _logger = logger;
        }

        private HttpClient CreateClient()
        {
            var client = _httpClientFactory.CreateClient("ProxyPay");
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _settings.TenantId);
            if (!string.IsNullOrEmpty(_settings.ClientId))
                client.DefaultRequestHeaders.Add("X-Client-Id", _settings.ClientId);
            return client;
        }

        private string BuildUri(string path) =>
            $"{_settings.ApiUrl.TrimEnd('/')}/{path.TrimStart('/')}";

        public async Task<ProxyPayQRCodeResponse> CreateQRCodeAsync(ProxyPayQRCodeRequest request)
        {
            try
            {
                var client = CreateClient();

                var payload = new
                {
                    clientId = request.ClientId,
                    customer = new
                    {
                        name = request.CustomerName,
                        email = request.CustomerEmail,
                        documentId = request.CustomerDocumentId,
                        cellphone = request.CustomerCellphone
                    },
                    items = request.Items?.ConvertAll(item => new
                    {
                        id = item.Id,
                        description = item.Description,
                        quantity = item.Quantity,
                        unitPrice = item.UnitPrice,
                        discount = 0.0
                    })
                };

                var json = JsonSerializer.Serialize(payload, _jsonOptions);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(BuildUri("Payment/qrcode"), content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new ProxyPayQRCodeResponse
                    {
                        Sucesso = false,
                        Mensagem = $"ProxyPay API returned {(int)response.StatusCode}: {responseBody}"
                    };
                }

                var result = JsonSerializer.Deserialize<ProxyPayQRCodeResponse>(responseBody, _jsonOptions);
                if (result == null)
                {
                    return new ProxyPayQRCodeResponse
                    {
                        Sucesso = false,
                        Mensagem = "Failed to deserialize ProxyPay response"
                    };
                }
                result.Sucesso = result.InvoiceId > 0;
                if (!result.Sucesso)
                {
                    result.Mensagem = "ProxyPay returned no invoiceId";
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error calling ProxyPay CreateQRCode for clientId {ClientId}", request?.ClientId);
                return new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = $"Error calling ProxyPay API: {ex.Message}"
                };
            }
        }

        public async Task<ProxyPayQRCodeStatusResponse> CheckQRCodeStatusAsync(string invoiceId)
        {
            try
            {
                var client = CreateClient();

                var response = await client.GetAsync(BuildUri($"Payment/qrcode/status/{invoiceId}"));
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("ProxyPay CheckQRCodeStatus returned {StatusCode} for invoice {InvoiceId}: {Body}",
                        (int)response.StatusCode, invoiceId, responseBody);
                    return new ProxyPayQRCodeStatusResponse
                    {
                        Sucesso = false,
                        Status = "error",
                        Paid = false
                    };
                }

                // ProxyPay's qrcode/status endpoint returns `status` as a NUMBER
                // (same contract as GetInvoiceAsync: 3 = paid), not a string, and
                // has no `paid` boolean. Parse manually and derive Paid so the
                // order transition (Incoming -> Active) actually fires.
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                var paid = false;
                var statusLabel = "unknown";
                if (root.TryGetProperty("status", out var st))
                {
                    if (st.ValueKind == JsonValueKind.Number)
                    {
                        var code = st.GetInt32();
                        statusLabel = code.ToString();
                        paid = code == STATUS_PAID;
                    }
                    else if (st.ValueKind == JsonValueKind.String)
                    {
                        statusLabel = st.GetString() ?? "unknown";
                        paid = statusLabel.Equals("PAID", StringComparison.OrdinalIgnoreCase)
                            || statusLabel.Equals("APPROVED", StringComparison.OrdinalIgnoreCase)
                            || statusLabel.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase);
                    }
                }
                if (!paid && root.TryGetProperty("paid", out var pd) && pd.ValueKind == JsonValueKind.True)
                {
                    paid = true;
                }

                DateTime? expiresAt = null;
                foreach (var name in new[] { "dueDate", "expiresAt", "expiredAt" })
                {
                    if (root.TryGetProperty(name, out var ex) && ex.ValueKind == JsonValueKind.String
                        && DateTime.TryParse(ex.GetString(), out var exDate))
                    {
                        expiresAt = exDate;
                        break;
                    }
                }

                return new ProxyPayQRCodeStatusResponse
                {
                    Sucesso = true,
                    Status = statusLabel,
                    Paid = paid,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error calling ProxyPay CheckQRCodeStatus for invoice {InvoiceId}", invoiceId);
                return new ProxyPayQRCodeStatusResponse
                {
                    Sucesso = false,
                    Status = "error",
                    Paid = false
                };
            }
        }
    }
}

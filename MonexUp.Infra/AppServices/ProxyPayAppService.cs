using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MonexUp.Infra.Interfaces.AppServices;

namespace MonexUp.Infra.AppServices
{
    public class ProxyPayAppService : IProxyPayAppService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ProxyPaySetting _settings;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public ProxyPayAppService(IHttpClientFactory httpClientFactory, IOptions<ProxyPaySetting> settings)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings.Value;
        }

        private HttpClient CreateClient()
        {
            var client = _httpClientFactory.CreateClient("ProxyPay");
            client.BaseAddress = new Uri(_settings.ApiUrl);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _settings.TenantId);
            client.DefaultRequestHeaders.Add("X-Client-Id", _settings.ClientId);
            return client;
        }

        public async Task<ProxyPayQRCodeResponse> CreateQRCodeAsync(ProxyPayQRCodeRequest request)
        {
            try
            {
                var client = CreateClient();

                var payload = new
                {
                    customerName = request.CustomerName,
                    customerEmail = request.CustomerEmail,
                    customerDocumentId = request.CustomerDocumentId,
                    customerCellphone = request.CustomerCellphone,
                    items = request.Items?.ConvertAll(item => new
                    {
                        id = item.Id,
                        description = item.Description,
                        quantity = item.Quantity,
                        unitPrice = (long)(item.UnitPrice * 100)
                    })
                };

                var json = JsonSerializer.Serialize(payload, _jsonOptions);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("/payment/qrcode", content);
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
                return result ?? new ProxyPayQRCodeResponse
                {
                    Sucesso = false,
                    Mensagem = "Failed to deserialize ProxyPay response"
                };
            }
            catch (Exception ex)
            {
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

                var response = await client.GetAsync($"/payment/qrcode/status/{invoiceId}");
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new ProxyPayQRCodeStatusResponse
                    {
                        Sucesso = false,
                        Status = "error",
                        Paid = false
                    };
                }

                var result = JsonSerializer.Deserialize<ProxyPayQRCodeStatusResponse>(responseBody, _jsonOptions);
                return result ?? new ProxyPayQRCodeStatusResponse
                {
                    Sucesso = false,
                    Status = "error",
                    Paid = false
                };
            }
            catch (Exception ex)
            {
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

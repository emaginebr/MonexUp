using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;
using MonexUp.DTO.Billing;
using MonexUp.DTO.Network;
using MonexUp.DTO.Payment;
using System.Text.Json.Serialization;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class OrderControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public OrderControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task CreatePixPayment_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreatePixPaymentRequest();

            var response = await _fixture.CreateAnonymousRequest("/order/createPixPayment/some-product-slug")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task CreatePixPayment_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreatePixPaymentRequest();

            var response = await _fixture.CreateAuthenticatedRequest("/order/createPixPayment/non-existent-product")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task CreatePixPayment_WithoutNetworkSlug_ShouldReturn400()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);
            await UpsertLinkAsync(lofnProduct.ProductId, network.NetworkId, userId);

            var payload = TestDataHelper.CreatePixPaymentRequest();
            var response = await _fixture.CreateAuthenticatedRequest("/order/createPixPayment")
                .AppendPathSegment(lofnProduct.Slug)
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(400, "MonexUp network is required to anchor the order");
        }

        [Fact]
        public async Task CreatePixPayment_WithLinkedProductAndNetworkSlug_ShouldReturnSuccess()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);
            await UpsertLinkAsync(lofnProduct.ProductId, network.NetworkId, userId);
            await EnsureProxyPayStoreAsync(network.NetworkId);

            var payload = TestDataHelper.CreatePixPaymentRequest();
            var response = await _fixture.CreateAuthenticatedRequest("/order/createPixPayment")
                .AppendPathSegment(lofnProduct.Slug)
                .SetQueryParam("networkSlug", network.Slug)
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            await EnsureSuccessOrReportAsync(response,
                $"createPixPayment with networkSlug='{network.Slug}', productSlug='{lofnProduct.Slug}'");

            var body = await response.GetJsonAsync<PixPaymentResult>();
            body.Sucesso.Should().BeTrue();
            body.Order.Should().NotBeNull();
            body.Order.OrderId.Should().BeGreaterThan(0);
            body.Order.NetworkId.Should().Be(network.NetworkId);
            body.Order.Items.Should().Contain(x => x.ProductId == lofnProduct.ProductId);
            body.QrCode.Should().NotBeNull();
            body.QrCode.InvoiceId.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task CreatePixPayment_WithoutDocumentId_ShouldReturn400()
        {
            var payload = TestDataHelper.CreatePixPaymentRequest(documentId: string.Empty);

            var response = await _fixture.CreateAuthenticatedRequest("/order/createPixPayment/any-slug")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(400, "controller validates DocumentId before product lookup");
        }

        [Fact]
        public async Task CheckPixStatus_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/order/checkPixStatus/some-invoice-id")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task CheckPixStatus_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/order/checkPixStatus/some-invoice-id")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Update_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderInfo();

            var response = await _fixture.CreateAnonymousRequest("/order/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Update_WithAuth_ShouldNotReturn401()
        {
            var param = TestDataHelper.CreateOrderInfo();

            var response = await _fixture.CreateAuthenticatedRequest("/order/update")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().NotBe(401);
        }

        [Fact]
        public async Task Search_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderSearchParam();

            var response = await _fixture.CreateAnonymousRequest("/order/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Search_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateOrderSearchParam();

            var response = await _fixture.CreateAuthenticatedRequest("/order/search")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task List_WithoutAuth_ShouldReturn401()
        {
            var param = TestDataHelper.CreateOrderParam();

            var response = await _fixture.CreateAnonymousRequest("/order/list")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task List_WithAuth_ShouldReturnOk()
        {
            var param = TestDataHelper.CreateOrderParam();

            var response = await _fixture.CreateAuthenticatedRequest("/order/list")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetById_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/order/getById/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetById_WithAuth_ShouldNotReturn401()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/order/getById/999999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().NotBe(401, "authenticated request should not be rejected");
        }

        private async Task<NetworkInfo> CreateNetworkAsync()
        {
            var payload = TestDataHelper.CreateNetworkInsertInfo();
            var response = await _fixture.CreateAuthenticatedRequest("/network/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(200, "network must be created so the order can target it");
            return await response.GetJsonAsync<NetworkInfo>();
        }

        private async Task<LofnStoreResponse> CreateLofnStoreAsync()
        {
            var payload = TestDataHelper.CreateLofnStorePayload();
            var response = await _fixture.CreateLofnAuthenticatedRequest("/Store/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(200, "Lofn store insert must succeed before product creation");
            return await response.GetJsonAsync<LofnStoreResponse>();
        }

        private async Task<LofnProductResponse> CreateLofnProductAsync(string storeSlug)
        {
            var payload = TestDataHelper.CreateLofnProductPayload();
            var response = await _fixture.CreateLofnAuthenticatedRequest("/Product")
                .AppendPathSegment(storeSlug)
                .AppendPathSegment("insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(200, $"Lofn product insert must succeed for store {storeSlug}");
            return await response.GetJsonAsync<LofnProductResponse>();
        }

        private async Task EnsureProxyPayStoreAsync(long networkId)
        {
            var payload = new EnsureStoreRequest { NetworkId = networkId };
            var response = await _fixture.CreateAuthenticatedRequest("/billing/ensure-store")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            var status = (int)response.StatusCode;
            if (status != 200)
            {
                var body = await response.GetStringAsync();
                throw new Xunit.Sdk.XunitException(
                    $"EnsureStore seed failed for networkId={networkId}. Status: {status}. Body: {body}");
            }
        }

        private static async Task EnsureSuccessOrReportAsync(IFlurlResponse response, string scope)
        {
            var status = (int)response.StatusCode;
            if (status == 200) return;

            string body;
            try { body = await response.GetStringAsync(); }
            catch (Exception ex) { body = $"<failed to read body: {ex.Message}>"; }

            throw new Xunit.Sdk.XunitException(
                $"Expected 200 for {scope}, got {status}. Body: {body}");
        }

        private async Task UpsertLinkAsync(long lofnProductId, long networkId, long userId)
        {
            var payload = TestDataHelper.CreateProductLinkInsertInfo(lofnProductId, networkId, userId);
            var response = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            var status = (int)response.StatusCode;
            if (status != 200 && status != 201)
            {
                var body = await response.GetStringAsync();
                throw new Xunit.Sdk.XunitException(
                    $"Upsert seed failed. Status: {status}. Body: {body}");
            }
        }

        private class LofnStoreResponse
        {
            [JsonPropertyName("storeId")]
            public long StoreId { get; set; }

            [JsonPropertyName("slug")]
            public string Slug { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;
        }

        private class LofnProductResponse
        {
            [JsonPropertyName("productId")]
            public long ProductId { get; set; }

            [JsonPropertyName("storeId")]
            public long? StoreId { get; set; }

            [JsonPropertyName("slug")]
            public string Slug { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;
        }
    }
}

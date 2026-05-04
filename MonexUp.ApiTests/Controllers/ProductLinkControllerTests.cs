using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;
using MonexUp.DTO.Network;
using MonexUp.DTO.ProductLink;
using System.Text.Json.Serialization;

namespace MonexUp.ApiTests.Controllers
{
    [Collection("ApiTests")]
    public class ProductLinkControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public ProductLinkControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task Upsert_WithoutAuth_ShouldReturn401()
        {
            var payload = TestDataHelper.CreateProductLinkInsertInfo(1, 1, 1);

            var response = await _fixture.CreateAnonymousRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetByNetwork_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/ProductLink/by-network/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task GetByUser_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/ProductLink/by-user/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task DeleteByNetwork_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/ProductLink/by-network/1")
                .AllowAnyHttpStatus()
                .DeleteAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task Upsert_WithEmptyBody_ShouldReturn400()
        {
            var response = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(new { });

            response.StatusCode.Should().Be(400, "validator must reject zero/missing ids");
        }

        [Fact]
        public async Task Upsert_WithAuth_ShouldCreateLofnProductAndLinkToNetwork()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);

            var linkPayload = TestDataHelper.CreateProductLinkInsertInfo(
                lofnProduct.ProductId,
                network.NetworkId,
                userId);

            var response = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(linkPayload);

            response.StatusCode.Should().Be(201, "first link for a Lofn productId must be created");

            var body = await response.GetJsonAsync<ProductLinkApiResult>();
            body.Should().NotBeNull();
            body.Sucesso.Should().BeTrue();
            body.Data.Should().NotBeNull();
            body.Data.Id.Should().BeGreaterThan(0);
            body.Data.LofnProductId.Should().Be(lofnProduct.ProductId);
            body.Data.NetworkId.Should().Be(network.NetworkId);
            body.Data.UserId.Should().Be(userId);
        }

        [Fact]
        public async Task Upsert_RepeatedSamePayload_ShouldBeIdempotentAndReturn200()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);

            var linkPayload = TestDataHelper.CreateProductLinkInsertInfo(
                lofnProduct.ProductId,
                network.NetworkId,
                userId);

            var first = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(linkPayload);
            first.StatusCode.Should().Be(201);
            var firstBody = await first.GetJsonAsync<ProductLinkApiResult>();

            var second = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AllowAnyHttpStatus()
                .PostJsonAsync(linkPayload);
            second.StatusCode.Should().Be(200, "second upsert with same lofnProductId must be idempotent");
            var secondBody = await second.GetJsonAsync<ProductLinkApiResult>();

            secondBody.Data.Id.Should().Be(firstBody.Data.Id, "idempotent retry must return the same row");
            secondBody.Data.LofnProductId.Should().Be(lofnProduct.ProductId);
        }

        [Fact]
        public async Task GetByNetwork_AfterUpsert_ShouldReturnLink()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);

            await UpsertLinkAsync(lofnProduct.ProductId, network.NetworkId, userId);

            var response = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AppendPathSegment("by-network")
                .AppendPathSegment(network.NetworkId)
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
            var body = await response.GetJsonAsync<ProductLinkListApiResult>();
            body.Sucesso.Should().BeTrue();
            body.Data.Should().NotBeNull();
            body.Data.Should().Contain(x => x.LofnProductId == lofnProduct.ProductId,
                "the freshly upserted link must appear in by-network listing");
        }

        [Fact]
        public async Task GetByUser_AfterUpsert_ShouldReturnLink()
        {
            var network = await CreateNetworkAsync();
            var userId = _fixture.ExtractUserIdFromToken();
            var lofnStore = await CreateLofnStoreAsync();
            var lofnProduct = await CreateLofnProductAsync(lofnStore.Slug);

            await UpsertLinkAsync(lofnProduct.ProductId, network.NetworkId, userId);

            var response = await _fixture.CreateAuthenticatedRequest("/ProductLink")
                .AppendPathSegment("by-user")
                .AppendPathSegment(userId)
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200);
            var body = await response.GetJsonAsync<ProductLinkListApiResult>();
            body.Sucesso.Should().BeTrue();
            body.Data.Should().Contain(x => x.LofnProductId == lofnProduct.ProductId
                                         && x.UserId == userId);
        }

        private async Task<NetworkInfo> CreateNetworkAsync()
        {
            var payload = TestDataHelper.CreateNetworkInsertInfo();
            var response = await _fixture.CreateAuthenticatedRequest("/network/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(200, "network must be created so the link can target it");
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

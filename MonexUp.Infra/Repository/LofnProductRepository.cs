using Core.Domain.Repository;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class LofnProductRepository : IProductRepository<IProductModel, IProductDomainFactory>
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _lofnApiUrl;
        private readonly string _tenantId;

        private const int PAGE_SIZE = 15;

        public LofnProductRepository(IHttpClientFactory httpClientFactory, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _lofnApiUrl = configuration["Lofn:ApiURL"] ?? "http://localhost:5003";
            _tenantId = "monexup";
        }

        private HttpClient CreateClient(string token = null)
        {
            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(_lofnApiUrl);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", _tenantId);
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
            return client;
        }

        private IProductModel MapToModel(IProductDomainFactory factory, JsonElement product)
        {
            var md = factory.BuildProductModel();
            md.ProductId = product.GetProperty("productId").GetInt64();
            md.NetworkId = product.TryGetProperty("storeId", out var storeId) && storeId.ValueKind != JsonValueKind.Null
                ? storeId.GetInt64() : 0;
            md.Name = product.GetProperty("name").GetString() ?? "";
            md.Slug = product.GetProperty("slug").GetString() ?? "";
            md.Description = product.TryGetProperty("description", out var desc) && desc.ValueKind != JsonValueKind.Null
                ? desc.GetString() : "";
            md.Price = product.GetProperty("price").GetDouble();
            md.Frequency = product.GetProperty("frequency").GetInt32();
            md.Limit = product.GetProperty("limit").GetInt32();
            md.Status = (ProductStatusEnum)product.GetProperty("status").GetInt32();

            // Image: use first image from images array or imageUrl
            if (product.TryGetProperty("images", out var images) && images.ValueKind == JsonValueKind.Array && images.GetArrayLength() > 0)
            {
                var firstImage = images[0];
                md.Image = firstImage.TryGetProperty("imageUrl", out var imgUrl) && imgUrl.ValueKind != JsonValueKind.Null
                    ? imgUrl.GetString() : "";
            }
            else if (product.TryGetProperty("imageUrl", out var imageUrl) && imageUrl.ValueKind != JsonValueKind.Null)
            {
                md.Image = imageUrl.GetString();
            }

            return md;
        }

        #region GraphQL Helpers

        private async Task<JsonElement?> ExecuteGraphQL(string query, object variables = null)
        {
            using var client = CreateClient();
            var payload = new { query, variables };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/graphql", content);
            if (!response.IsSuccessStatusCode)
                return null;

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);
            if (doc.RootElement.TryGetProperty("data", out var data))
                return data;
            return null;
        }

        private async Task<JsonElement?> ExecuteGraphQLAdmin(string query, string token, object variables = null)
        {
            using var client = CreateClient(token);
            var payload = new { query, variables };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/graphql/admin", content);
            if (!response.IsSuccessStatusCode)
                return null;

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);
            if (doc.RootElement.TryGetProperty("data", out var data))
                return data;
            return null;
        }

        #endregion

        public IProductModel GetById(long id, IProductDomainFactory factory)
        {
            var query = @"query($id: Long!) {
                getProducts(where: { productId: { eq: $id } }) {
                    items { productId storeId slug name description price discount frequency limit status productType featured imageUrl
                        images { imageId productId image imageUrl sortOrder }
                    }
                }
            }";
            var data = ExecuteGraphQL(query, new { id }).GetAwaiter().GetResult();
            if (data == null) return null;

            var items = data.Value.GetProperty("getProducts").GetProperty("items");
            if (items.GetArrayLength() == 0) return null;

            return MapToModel(factory, items[0]);
        }

        public IProductModel GetBySlug(string slug, IProductDomainFactory factory)
        {
            var query = @"query($slug: String!) {
                getProducts(where: { slug: { eq: $slug } }) {
                    items { productId storeId slug name description price discount frequency limit status productType featured imageUrl
                        images { imageId productId image imageUrl sortOrder }
                    }
                }
            }";
            var data = ExecuteGraphQL(query, new { slug }).GetAwaiter().GetResult();
            if (data == null) return null;

            var items = data.Value.GetProperty("getProducts").GetProperty("items");
            if (items.GetArrayLength() == 0) return null;

            return MapToModel(factory, items[0]);
        }

        public IEnumerable<IProductModel> ListByNetwork(long networkId, IProductDomainFactory factory)
        {
            // networkId maps to storeId in Lofn
            var query = @"query($storeId: Long!) {
                getProducts(where: { storeId: { eq: $storeId } }) {
                    items { productId storeId slug name description price discount frequency limit status productType featured imageUrl
                        images { imageId productId image imageUrl sortOrder }
                    }
                }
            }";
            var data = ExecuteGraphQL(query, new { storeId = networkId }).GetAwaiter().GetResult();
            if (data == null) return Enumerable.Empty<IProductModel>();

            var items = data.Value.GetProperty("getProducts").GetProperty("items");
            var result = new List<IProductModel>();
            foreach (var item in items.EnumerateArray())
            {
                result.Add(MapToModel(factory, item));
            }
            return result;
        }

        public IEnumerable<IProductModel> Search(long? networkId, long? userId, string keyword, bool active, int pageNum, out int pageCount, IProductDomainFactory factory)
        {
            // Use REST search endpoint
            using var client = CreateClient();
            var searchParam = new
            {
                storeId = networkId,
                userId = userId,
                keyword = keyword ?? "",
                onlyActive = active,
                pageNum = pageNum
            };
            var json = JsonSerializer.Serialize(searchParam);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = client.PostAsync("/product/search", content).GetAwaiter().GetResult();
            if (!response.IsSuccessStatusCode)
            {
                pageCount = 0;
                return Enumerable.Empty<IProductModel>();
            }

            var responseJson = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;

            pageCount = root.TryGetProperty("pageCount", out var pc) ? pc.GetInt32() : 0;

            var products = new List<IProductModel>();
            if (root.TryGetProperty("products", out var productsArray))
            {
                foreach (var item in productsArray.EnumerateArray())
                {
                    products.Add(MapToModel(factory, item));
                }
            }
            return products;
        }

        public IProductModel Insert(IProductModel model, IProductDomainFactory factory)
        {
            // Need storeSlug to call Lofn API - for now use networkId as storeId
            // The caller needs to ensure the store exists in Lofn
            using var client = CreateClient();
            var insertInfo = new
            {
                name = model.Name,
                description = model.Description,
                price = model.Price,
                frequency = model.Frequency,
                limit = model.Limit,
                status = (int)model.Status,
                productType = 1,
                featured = false
            };
            var json = JsonSerializer.Serialize(insertInfo);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Use storeId to get store slug (simplified: use store ID directly)
            var response = client.PostAsync($"/product/{model.NetworkId}/insert", content).GetAwaiter().GetResult();
            if (response.IsSuccessStatusCode)
            {
                var responseJson = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var doc = JsonDocument.Parse(responseJson);
                model.ProductId = doc.RootElement.GetProperty("productId").GetInt64();
                model.Slug = doc.RootElement.GetProperty("slug").GetString();
            }
            return model;
        }

        public IProductModel Update(IProductModel model, IProductDomainFactory factory)
        {
            using var client = CreateClient();
            var updateInfo = new
            {
                productId = model.ProductId,
                name = model.Name,
                description = model.Description,
                price = model.Price,
                frequency = model.Frequency,
                limit = model.Limit,
                status = (int)model.Status,
                productType = 1,
                featured = false
            };
            var json = JsonSerializer.Serialize(updateInfo);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            client.PostAsync($"/product/{model.NetworkId}/update", content).GetAwaiter().GetResult();
            return model;
        }

        public bool ExistSlug(long productId, string slug)
        {
            var query = @"query($slug: String!) {
                getProducts(where: { slug: { eq: $slug } }) {
                    items { productId }
                }
            }";
            var data = ExecuteGraphQL(query, new { slug }).GetAwaiter().GetResult();
            if (data == null) return false;

            var items = data.Value.GetProperty("getProducts").GetProperty("items");
            foreach (var item in items.EnumerateArray())
            {
                if (item.GetProperty("productId").GetInt64() != productId)
                    return true;
            }
            return false;
        }

    }
}

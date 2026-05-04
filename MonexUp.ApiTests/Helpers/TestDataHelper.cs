using MonexUp.DTO.Network;
using MonexUp.DTO.Order;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Product;
using MonexUp.DTO.ProductLink;
using MonexUp.DTO.Profile;
using MonexUp.DTO.Payment;

namespace MonexUp.ApiTests.Helpers
{
    public static class TestDataHelper
    {
        public static NetworkInsertInfo CreateNetworkInsertInfo(string? name = null, string? email = null)
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            return new NetworkInsertInfo
            {
                Name = name ?? $"Test Network {uniqueId}",
                Email = email ?? $"network-{uniqueId}@test.com",
                Commission = 10.0,
                Plan = NetworkPlanEnum.Free
            };
        }

        public static NetworkInfo CreateNetworkInfo(long networkId = 1, string? name = null)
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            return new NetworkInfo
            {
                NetworkId = networkId,
                Slug = $"test-network-{uniqueId}",
                Name = name ?? $"Test Network {uniqueId}",
                Email = $"network-{uniqueId}@test.com",
                Commission = 10.0,
                Plan = NetworkPlanEnum.Free,
                Status = NetworkStatusEnum.Active
            };
        }

        public static NetworkRequestInfo CreateNetworkRequestInfo(long networkId = 1, long? referrerId = null)
        {
            return new NetworkRequestInfo
            {
                NetworkId = networkId,
                ReferrerId = referrerId
            };
        }

        public static NetworkChangeStatusInfo CreateNetworkChangeStatusInfo(long networkId = 1, long userId = 1, int status = 1)
        {
            return new NetworkChangeStatusInfo
            {
                NetworkId = networkId,
                UserId = userId,
                Status = status
            };
        }

        public static OrderSearchParam CreateOrderSearchParam(long networkId = 1, int pageNum = 1)
        {
            return new OrderSearchParam
            {
                NetworkId = networkId,
                PageNum = pageNum
            };
        }

        public static OrderParam CreateOrderParam(long networkId = 1, long userId = 1)
        {
            return new OrderParam
            {
                NetworkId = networkId,
                UserId = userId
            };
        }

        public static OrderInfo CreateOrderInfo(long orderId = 1, long networkId = 1, long userId = 1)
        {
            return new OrderInfo
            {
                OrderId = orderId,
                NetworkId = networkId,
                UserId = userId,
                Status = OrderStatusEnum.Incoming,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static InvoiceSearchParam CreateInvoiceSearchParam(long networkId = 1, int pageNum = 1)
        {
            return new InvoiceSearchParam
            {
                NetworkId = networkId,
                PageNum = pageNum
            };
        }

        public static StatementSearchParam CreateStatementSearchParam(int pageNum = 1)
        {
            return new StatementSearchParam
            {
                PageNum = pageNum
            };
        }

        public static UserProfileInfo CreateUserProfileInfo(long networkId, string? name = null)
        {
            return new UserProfileInfo
            {
                NetworkId = networkId,
                Name = name ?? $"Test Profile {Guid.NewGuid().ToString("N")[..8]}",
                Commission = 5.0,
                Level = 1,
                Members = 10
            };
        }

        public static PixPaymentRequest CreatePixPaymentRequest(string? documentId = null)
        {
            return new PixPaymentRequest
            {
                DocumentId = documentId ?? "12345678901"
            };
        }

        public static object CreateLofnStorePayload(string? name = null)
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            return new { name = name ?? $"Test Store {uniqueId}" };
        }

        public static object CreateLofnProductPayload(string? name = null)
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            return new
            {
                name = name ?? $"Test Product {uniqueId}",
                description = "Product created from MonexUp.ApiTests",
                price = 49.90,
                discount = 0.0,
                frequency = 0,
                limit = 0,
                status = 1, // ProductStatusEnum.Active
                productType = 1, // ProductTypeEnum.Physical
                featured = false
            };
        }

        public static ProductLinkInsertInfo CreateProductLinkInsertInfo(long lofnProductId, long networkId, long userId)
        {
            return new ProductLinkInsertInfo
            {
                LofnProductId = lofnProductId,
                NetworkId = networkId,
                UserId = userId
            };
        }
    }
}

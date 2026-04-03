using MonexUp.DTO.Network;
using MonexUp.DTO.Order;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Product;
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
    }
}

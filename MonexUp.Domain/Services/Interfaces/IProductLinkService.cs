using MonexUp.DTO.ProductLink;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProductLinkService
    {
        Task<UpsertResult> UpsertAsync(ProductLinkInsertInfo info, long callerUserId, string bearerToken, CancellationToken ct = default);
        ProductLinkListApiResult GetByNetwork(long networkId, long callerUserId);
        ProductLinkListApiResult GetByUser(long userId, long callerUserId);
        ProductLinkApiResult DeleteByNetwork(long networkId, long callerUserId);
    }

    public class UpsertResult
    {
        public ProductLinkApiResult Body { get; set; }
        public bool Created { get; set; }
        public int StatusCode { get; set; }
    }
}

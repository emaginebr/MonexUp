using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Infra.Interfaces.AppServices
{
    public interface ILofnStoreClient
    {
        Task<long> InsertAsync(string storeName, string bearerToken, CancellationToken ct = default);
    }
}

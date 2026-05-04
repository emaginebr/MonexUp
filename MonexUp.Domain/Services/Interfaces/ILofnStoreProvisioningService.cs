using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface ILofnStoreProvisioningService
    {
        Task<long> EnsureStoreAsync(long networkId, string bearerToken, CancellationToken ct = default);
    }
}

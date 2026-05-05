using MonexUp.DTO.Lofn;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Infra.Interfaces.AppServices
{
    public interface ILofnProductClient
    {
        Task<LofnProductInfo> GetByIdAsync(long productId, CancellationToken ct = default);
        Task<LofnProductInfo> GetBySlugAsync(string slug, CancellationToken ct = default);
    }
}

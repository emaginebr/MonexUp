using System.IO;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IImageService
    {
        Task<string> GetImageUrlAsync(string fileName);
        Task<string> InsertFromStreamAsync(Stream stream, string name);
        Task<string> InsertToUserAsync(Stream stream, long userId);
        Task<string> InsertToNetworkAsync(Stream stream, long networkId);
        Task<string> InsertToProductAsync(Stream stream, long productId);
    }
}

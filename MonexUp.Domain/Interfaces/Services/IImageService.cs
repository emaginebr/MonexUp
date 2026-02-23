using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IImageService
    {
        string GetImageUrl(string fileName);
        string InsertFromStream(Stream stream, string name);
        string InsertToUser(Stream stream, long userId);
        string InsertToNetwork(Stream stream, long networkId);
        string InsertToProduct(Stream stream, long productId);
    }
}

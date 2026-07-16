using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain.Cloud
{
    public interface IAssetsProviders
    {
        Task<string> UploadFileToBlobAsync(string strFileName, byte[] fileData, string fileMimeType);
        Task DeleteFile(string strFileName);
    }
}

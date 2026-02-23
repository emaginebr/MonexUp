using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Services;
using System;
using System.IO;
using System.Threading.Tasks;
using Core.Domain;
using zTools.ACL.Interfaces;

namespace MonexUp.Domain.Impl.Services
{
    public class ImageService : IImageService
    {
        private readonly string _bucketName;
        private readonly IFileClient _fileClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IProductDomainFactory _productFactory;

        public ImageService(
            INetworkDomainFactory networkFactory,
            IProductDomainFactory productFactory,
            IFileClient fileClient,
            Microsoft.Extensions.Configuration.IConfiguration configuration
        ) {
            _networkFactory = networkFactory;
            _productFactory = productFactory;
            _fileClient = fileClient;
            _bucketName = configuration["DO_SPACES_BUCKET"] ?? "monexup";
        }

        public async Task<string> GetImageUrlAsync(string fileName)
        {
            if (!string.IsNullOrEmpty(fileName))
            {
                return await _fileClient.GetFileUrlAsync(_bucketName, fileName);
            }
            return string.Empty;
        }

        private async Task UploadFileAsync(Stream fileStream, string fileName)
        {
            var formFile = new FormFileWrapper(fileStream, fileName, "image/jpeg");
            await _fileClient.UploadFileAsync(_bucketName, formFile);
        }

        public async Task<string> InsertFromStreamAsync(Stream stream, string name)
        {
            await UploadFileAsync(stream, name);
            return name;
        }

        public async Task<string> InsertToUserAsync(Stream stream, long userId)
        {
            if (!(userId > 0))
            {
                throw new Exception("Invalid User ID");
            }
            var name = string.Format("user-{0}.jpg", StringUtils.GenerateShortUniqueString());
            await UploadFileAsync(stream, name);
            return name;
        }

        public async Task<string> InsertToNetworkAsync(Stream stream, long networkId)
        {
            if (!(networkId > 0))
            {
                throw new Exception("Invalid Network ID");
            }
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null)
            {
                throw new Exception("Network not found");
            }
            var name = string.Format("network-{0}.jpg", StringUtils.GenerateShortUniqueString());
            await UploadFileAsync(stream, name);
            network.Image = name;
            network.Update(_networkFactory);
            return name;
        }

        public async Task<string> InsertToProductAsync(Stream stream, long productId)
        {
            if (!(productId > 0))
            {
                throw new Exception("Invalid product ID");
            }
            var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
            if (product == null)
            {
                throw new Exception("Product not found");
            }
            var name = string.Format("product-{0}.jpg", StringUtils.GenerateShortUniqueString());
            await UploadFileAsync(stream, name);
            product.Image = name;
            product.Update(_productFactory);
            return name;
        }
    }
}

using Amazon.S3.Transfer;
using Amazon.S3;
using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using Core.Domain;
using NAuth.Client;

namespace MonexUp.Domain.Impl.Services
{
    public class ImageService : IImageService
    {

        private const string ACCESS_KEY = "DO00JY46P2RAD368YY3B";
        private const string SECRET_KEY = "6aojG9/UVwcn9Ss8mT7HNCPPUCk2GF1bG/CarPcC5n0";
        private const string BUCKET_NAME = "monexup";
        private const string REGION = "nyc3"; // ou fra1, sgp1, etc.
        private const string ENDPOINT = "https://emagine.nyc3.digitaloceanspaces.com";

        private readonly IUserClient _userClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IProductDomainFactory _productFactory;

        public ImageService(
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IProductDomainFactory productFactory
        ) {
            _userClient = userClient;
            _networkFactory = networkFactory;
            _productFactory = productFactory;
        }

        public string GetImageUrl(string fileName)
        {
            if (!string.IsNullOrEmpty(fileName))
            {
                return ENDPOINT + "/" + BUCKET_NAME + "/" + fileName;
            }
            return string.Empty;
        }

        private void UploadFile(Stream fileStream, string fileName)
        {
            var config = new AmazonS3Config
            {
                ServiceURL = ENDPOINT,
                ForcePathStyle = true,
                //SignatureVersion = "v4",
            };

            using var client = new AmazonS3Client(ACCESS_KEY, SECRET_KEY, config);
            var transferUtility = new TransferUtility(client);

            var request = new TransferUtilityUploadRequest
            {
                InputStream = fileStream,
                Key = fileName,
                BucketName = BUCKET_NAME,
                CannedACL = S3CannedACL.PublicRead // ou Private se quiser restrito
            };

            transferUtility.Upload(request);
        }

        public string InsertFromStream(Stream stream, string name)
        {
            UploadFile(stream, name);
            return name;
        }

        public async Task<string> InsertToUser(Stream stream, long userId)
        {
            if (!(userId > 0))
            {
                throw new Exception("Invalid User ID");
            }
            //var user = _userFactory.BuildUserModel().GetById(userId, _userFactory);
            var user = await _userClient.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            var name = string.Format("user-{0}.jpg", StringUtils.GenerateShortUniqueString());
            UploadFile(stream, name);
            user.ImageUrl = name;
            user.Update(_userFactory);
            return name;
        }

        public string InsertToNetwork(Stream stream, long networkId)
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
            UploadFile(stream, name);
            network.Image = name;
            network.Update(_networkFactory);
            return name;
        }

        public string InsertToProduct(Stream stream, long productId)
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
            UploadFile(stream, name);
            product.Image = name;
            product.Update(_productFactory);
            return name;
        }
    }
}

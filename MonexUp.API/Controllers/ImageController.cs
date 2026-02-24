using Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Domain;
using NAuth.ACL.Interfaces;
using zTools.ACL.Interfaces;
using System;
using System.Threading.Tasks;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ImageController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IFileClient _fileClient;

        private const string BucketName = "monexup";

        public ImageController(
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IProductDomainFactory productFactory,
            IFileClient fileClient
        ) {
            _userClient = userClient;
            _networkFactory = networkFactory;
            _productFactory = productFactory;
            _fileClient = fileClient;
        }

        [Authorize]
        [HttpPost("uploadImageUser")]
        public async Task<ActionResult<StringResult>> UploadImageUser(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var fileName = $"user-{StringUtils.GenerateShortUniqueString()}.jpg";
                var formFile = new FormFileWrapper(file.OpenReadStream(), fileName, file.ContentType);
                await _fileClient.UploadFileAsync(BucketName, formFile);

                return new StringResult()
                {
                    Value = await _fileClient.GetFileUrlAsync(BucketName, fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("uploadImageNetwork")]
        public async Task<ActionResult<StringResult>> UploadImageNetwork([FromForm] long networkId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
                if (network == null)
                {
                    return BadRequest("Network not found");
                }

                var fileName = $"network-{StringUtils.GenerateShortUniqueString()}.jpg";
                var formFile = new FormFileWrapper(file.OpenReadStream(), fileName, file.ContentType);
                await _fileClient.UploadFileAsync(BucketName, formFile);

                network.Image = fileName;
                network.Update(_networkFactory);

                return new StringResult()
                {
                    Value = await _fileClient.GetFileUrlAsync(BucketName, fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("uploadImageProduct")]
        public async Task<ActionResult<StringResult>> UploadImageProduct([FromForm] long productId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
                if (product == null)
                {
                    return BadRequest("Product not found");
                }

                var fileName = $"product-{StringUtils.GenerateShortUniqueString()}.jpg";
                var formFile = new FormFileWrapper(file.OpenReadStream(), fileName, file.ContentType);
                await _fileClient.UploadFileAsync(BucketName, formFile);

                product.Image = fileName;
                product.Update(_productFactory);

                return new StringResult()
                {
                    Value = await _fileClient.GetFileUrlAsync(BucketName, fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

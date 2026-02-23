using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Domain;
using NAuth.ACL.Interfaces;
using System;
using System.Threading.Tasks;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ImageController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly INetworkService _networkService;
        private readonly IImageService _imageService;

        public ImageController(
            IUserClient userClient,
            INetworkService networkService,
            IImageService imageService
        ) {
            _userClient = userClient;
            _networkService = networkService;
            _imageService = imageService;
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

                var fileName = await _imageService.InsertToUserAsync(file.OpenReadStream(), userSession.UserId);
                return new StringResult()
                {
                    Value = await _imageService.GetImageUrlAsync(fileName)
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

                var fileName = await _imageService.InsertToNetworkAsync(file.OpenReadStream(), networkId);
                return new StringResult()
                {
                    Value = await _imageService.GetImageUrlAsync(fileName)
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

                var fileName = await _imageService.InsertToProductAsync(file.OpenReadStream(), productId);
                return new StringResult()
                {
                    Value = await _imageService.GetImageUrlAsync(fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

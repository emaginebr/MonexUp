using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Domain;
using MonexUp.DTO.Network;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace MonexUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly INetworkService _networkService;
        private readonly IImageService _imageService;

        public ImageController(
            IUserService userService,
            INetworkService networkService,
            IImageService imageService
        ) { 
            _userService = userService;
            _networkService = networkService;
            _imageService = imageService;
        }

        /*
        [Authorize]
        [HttpPost("uploadImage")]
        public ActionResult<StringResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var fileName = _imageService.InsertFromStream(file.OpenReadStream(), file.FileName);
                return new StringResult()
                {
                    Value = fileName
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        */

        [Authorize]
        [HttpPost("uploadImageUser")]
        public ActionResult<StringResult> UploadImageUser(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var fileName = _imageService.InsertToUser(file.OpenReadStream(), userSession.UserId);
                return new StringResult()
                {
                    Value = _imageService.GetImageUrl(fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("uploadImageNetwork")]
        public ActionResult<StringResult> UploadImageNetwork([FromForm] long networkId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var fileName = _imageService.InsertToNetwork(file.OpenReadStream(), networkId);
                return new StringResult()
                {
                    Value = _imageService.GetImageUrl(fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("uploadImageProduct")]
        public ActionResult<StringResult> UploadImageProduct([FromForm] long productId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var fileName = _imageService.InsertToProduct(file.OpenReadStream(), productId);
                return new StringResult()
                {
                    Value = _imageService.GetImageUrl(fileName)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

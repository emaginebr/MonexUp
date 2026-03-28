using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using NAuth.ACL.Interfaces;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProfileController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly IProfileService _profileService;

        public ProfileController(IUserClient userClient, IProfileService profileService)
        {
            _userClient = userClient;
            _profileService = profileService;
        }

        [Authorize]
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] UserProfileInfo profile)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var newProfile = await _profileService.Insert(profile, userSession.UserId, token);
                return Ok(_profileService.GetUserProfileInfo(newProfile));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] UserProfileInfo profile)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var newProfile = await _profileService.Update(profile, userSession.UserId, token);
                return Ok(_profileService.GetUserProfileInfo(newProfile));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("delete/{profileId}")]
        public async Task<IActionResult> Delete(long profileId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                await _profileService.Delete(profileId, userSession.UserId, token);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("listByNetwork/{networkId}")]
        public IActionResult ListByNetwork(long networkId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(_profileService.ListByNetwork(networkId)
                    .OrderBy(x => x.Level)
                    .Select(x => _profileService.GetUserProfileInfo(x))
                    .ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{profileId}")]
        public IActionResult GetById(long profileId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(_profileService.GetUserProfileInfo(_profileService.GetById(profileId)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

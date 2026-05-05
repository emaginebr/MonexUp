using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using NAuth.ACL.Interfaces;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
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
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var newProfile = await _profileService.Insert(profile, userSession.UserId, token);
            return Ok(_profileService.GetUserProfileInfo(newProfile));
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] UserProfileInfo profile)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            var newProfile = await _profileService.Update(profile, userSession.UserId, token);
            return Ok(_profileService.GetUserProfileInfo(newProfile));
        }

        [Authorize]
        [HttpGet("delete/{profileId}")]
        public async Task<IActionResult> Delete(long profileId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            var token = HttpContext.GetBearerToken();
            await _profileService.Delete(profileId, userSession.UserId, token);
            return Ok();
        }

        [Authorize]
        [HttpGet("listByNetwork/{networkId}")]
        public IActionResult ListByNetwork(long networkId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            return Ok(_profileService.ListByNetwork(networkId)
                .OrderBy(x => x.Level)
                .Select(x => _profileService.GetUserProfileInfo(x))
                .ToList());
        }

        [Authorize]
        [HttpGet("getById/{profileId}")]
        public IActionResult GetById(long profileId)
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null) return Unauthorized();

            return Ok(_profileService.GetUserProfileInfo(_profileService.GetById(profileId)));
        }
    }
}

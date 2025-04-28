using DB.Infra.Context;
using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Domain;
using exSales.DTO.Network;
using exSales.DTO.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace exSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IProfileService _profileService;

        public ProfileController(IUserService userService, IProfileService profileService)
        {
            _userService = userService;
            _profileService = profileService;
        }

        [Authorize]
        [HttpPost("insert")]
        public ActionResult<ProfileResult> Insert([FromBody] UserProfileInfo profile)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newProfile = _profileService.Insert(profile, userSession.UserId);
                return new ProfileResult()
                {
                    Profile = _profileService.GetUserProfileInfo(newProfile)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public ActionResult<ProfileResult> Update([FromBody] UserProfileInfo profile)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newProfile = _profileService.Update(profile, userSession.UserId);
                return new ProfileResult()
                {
                    Profile = _profileService.GetUserProfileInfo(newProfile)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("delete/{profileId}")]
        public ActionResult<StatusResult> Delete(long profileId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                _profileService.Delete(profileId, userSession.UserId);
                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "Profile successfully deleted"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("listByNetwork/{networkId}")]
        public ActionResult<ProfileListResult> ListByNetwork(long networkId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new ProfileListResult
                {
                    Sucesso = true,
                    Profiles = _profileService.ListByNetwork(networkId)
                    .OrderBy(x => x.Level)
                    .Select(x => _profileService.GetUserProfileInfo(x))
                    .ToList()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{profileId}")]
        public ActionResult<ProfileResult> GetById(long profileId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new ProfileResult
                {
                    Sucesso = true,
                    Profile = _profileService.GetUserProfileInfo(_profileService.GetById(profileId))
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

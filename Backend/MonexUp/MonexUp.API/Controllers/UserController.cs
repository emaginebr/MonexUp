using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using MonexUp.API.DTO;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Domain;
using MonexUp.Domain.Impl.Services;
using System.Runtime.CompilerServices;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MonexUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly IUserService _userService;
        private readonly IUserDomainFactory _userFactory;

        public UserController(IUserService userService, IUserDomainFactory userFactory)
        {
            _userService = userService;
            _userFactory = userFactory;
        }

        [HttpPost("gettokenauthorized")]
        public ActionResult<UserTokenResult> GetTokenAuthorized([FromBody] LoginParam login)
        {
            try
            {
                var user = _userService.LoginWithEmail(login.Email, login.Password);
                if (user == null)
                {
                    return new UserTokenResult() {Sucesso = false, Mensagem = "Email or password is wrong" };
                }
                return new UserTokenResult()
                {
                    Token = user.GenerateNewToken(_userFactory)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getme")]
        [Authorize]
        public ActionResult<UserResult> GetMe()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var user = _userService.GetUserByID(userSession.UserId);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User Not Found" };
                }

                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(user)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getbyemail/{email}")]
        public ActionResult<UserResult> GetByEmail(string email)
        {
            try
            {
                var user = _userService.GetUserByEmail(email);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User with email not found" };
                }
                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(user)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBySlug/{slug}")]
        public ActionResult<UserResult> GetBySlug(string slug)
        {
            try
            {
                var user = _userService.GetBySlug(slug);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User with email not found" };
                }
                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(user)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("insert")]
        public ActionResult<UserResult> Insert([FromBody] UserInfo user)
        {
            try
            {
                //if(String.IsNullOrEmpty(param.Address))
                //    return StatusCode(400, "Address is empty");
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User is empty" };
                }
                var newUser = _userService.Insert(user);
                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(newUser)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public ActionResult<UserResult> Update([FromBody] UserInfo user)
        {
            try
            {
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User is empty" };
                }
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                if (userSession.UserId != user.UserId)
                {
                    throw new Exception("Only can update your user");
                }

                var updatedUser = _userService.Update(user);
                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(updatedUser)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("loginwithemail")]
        public ActionResult<UserResult> LoginWithEmail([FromBody]LoginParam param)
        {
            try
            {
                var user = _userService.LoginWithEmail(param.Email, param.Password);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "Email or password is wrong" };
                }
                return new UserResult()
                {
                    User = _userService.GetUserInfoFromModel(user)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("haspassword")]
        public ActionResult<StatusResult> HasPassword()
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var user = _userService.GetUserByID(userSession.UserId);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "User Not Found" };
                }
                return new StatusResult
                {
                    Sucesso = _userService.HasPassword(user.UserId),
                    Mensagem = "Password verify successfully"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("changepassword")]
        public ActionResult<StatusResult> ChangePassword([FromBody]ChangePasswordParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var user = _userService.GetUserByID(userSession.UserId);
                if (user == null)
                {
                    return new UserResult() { User = null, Sucesso = false, Mensagem = "Email or password is wrong" };
                }
                _userService.ChangePassword(user.UserId, param.OldPassword, param.NewPassword);
                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "Password changed successfully"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("sendrecoverymail/{email}")]
        public async Task<ActionResult<StatusResult>> SendRecoveryMail(string email)
        {
            try
            {
                var user = _userService.GetUserByEmail(email);
                if (user == null)
                {
                    return new StatusResult
                    {
                        Sucesso = false,
                        Mensagem = "Email not exist"
                    };
                }
                await _userService.SendRecoveryEmail(email);
                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "Recovery email sent successfully"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("changepasswordusinghash")]
        public ActionResult<StatusResult> ChangePasswordUsingHash([FromBody] ChangePasswordUsingHashParam param)
        {
            try
            {
                _userService.ChangePasswordUsingHash(param.RecoveryHash, param.NewPassword);
                return new StatusResult
                {
                    Sucesso = true,
                    Mensagem = "Password changed successfully"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public ActionResult<UserListPagedResult> Search([FromBody] UserSearchParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return _userService.Search(param.NetworkId, param.Keyword, param.ProfileId, param.PageNum);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}

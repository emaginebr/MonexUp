using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonexUp.Domain;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Domain;
using MonexUp.DTO.Network;
using MonexUp.DTO.Template;
using NAuth.ACL.Interfaces;
using System;
using System.Linq;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TemplateController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly INetworkService _networkService;
        private readonly ITemplateService _templateService;

        public TemplateController(
            IUserClient userClient,
            INetworkService networkService,
            ITemplateService templateService
        )
        {
            _userClient = userClient;
            _networkService = networkService;
            _templateService = templateService;
        }

        [HttpGet("getNetworkPage/{networkSlug}/{pageSlug}/{lang}")]
        public ActionResult<TemplatePageResult> GetNetworkPage(string networkSlug, string pageSlug, string lang)
        {
            try
            {
                var language = LanguageUtils.StrToLang(lang);

                var page = _templateService.GetOrCreateNetworkPage(networkSlug, pageSlug);

                return new TemplatePageResult()
                {
                    Page = _templateService.GetTemplatePageInfo(page, language)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getPageById/{pageId}/{lang}")]
        public ActionResult<TemplatePageResult> GetPageById(long pageId, string lang)
        {
            try
            {
                var language = LanguageUtils.StrToLang(lang);

                var page = _templateService.GetPageById(pageId);

                return new TemplatePageResult()
                {
                    Page = _templateService.GetTemplatePageInfo(page, language)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("insertPart")]
        public ActionResult<StatusResult> InsertPart([FromBody]TemplatePartInfo part)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var newPart = _templateService.InsertPart(part);

                return new StatusResult()
                {
                    Sucesso = true
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("updatePart")]
        public ActionResult<StatusResult> UpdatePart([FromBody] TemplatePartInfo part)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                var newPart = _templateService.UpdatePart(part);

                return new StatusResult()
                {
                    Sucesso = true
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("deletePart/{partId}")]
        public ActionResult<StatusResult> DeletePart(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                _templateService.DeletePart(partId);

                return new StatusResult()
                {
                    Sucesso = true
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("movePartUp/{partId}")]
        public ActionResult<StatusResult> MovePartUp(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                _templateService.MovePartUp(partId);

                return new StatusResult()
                {
                    Sucesso = true
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("movePartDown/{partId}")]
        public ActionResult<StatusResult> MovePartDown(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                _templateService.MovePartDown(partId);

                return new StatusResult()
                {
                    Sucesso = true
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getVariable/{pageId}/{key}")]
        public ActionResult<TemplateVarResult> GetVariable(long pageId, string key)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                return new TemplateVarResult()
                {
                    Sucesso = true,
                    Variable = _templateService.GetVariable(pageId, key)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("saveVariable")]
        public ActionResult<TemplateVarResult> SaveVariable([FromBody] TemplateVarInfo variable)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }

                _templateService.SaveVariable(variable);
                var newVariable = _templateService.GetVariable(variable.PageId, variable.Key);

                return new TemplateVarResult()
                {
                    Sucesso = true,
                    Variable = newVariable
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Template.Domain;
using Template.Domain.Interfaces.Services;
using Template.DTO;
using NAuth.ACL.Interfaces;
using System;
using Template.API.Extensions;

namespace Template.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TemplateController: ControllerBase
    {
        private readonly IUserClient _userClient;
        private readonly ITemplateService _templateService;

        public TemplateController(
            IUserClient userClient,
            ITemplateService templateService
        )
        {
            _userClient = userClient;
            _templateService = templateService;
        }

        [HttpGet("getNetworkPage/{networkId}/{pageSlug}/{lang}")]
        public IActionResult GetNetworkPage(long networkId, string pageSlug, string lang)
        {
            try
            {
                var language = LanguageUtils.StrToLang(lang);
                var page = _templateService.GetOrCreateNetworkPage(networkId, pageSlug);
                return Ok(_templateService.GetTemplatePageInfo(page, language));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getPageById/{pageId}/{lang}")]
        public IActionResult GetPageById(long pageId, string lang)
        {
            try
            {
                var language = LanguageUtils.StrToLang(lang);
                var page = _templateService.GetPageById(pageId);
                return Ok(_templateService.GetTemplatePageInfo(page, language));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("insertPart")]
        public IActionResult InsertPart([FromBody]TemplatePartInfo part)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.InsertPart(part);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("updatePart")]
        public IActionResult UpdatePart([FromBody] TemplatePartInfo part)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.UpdatePart(part);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("deletePart/{partId}")]
        public IActionResult DeletePart(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.DeletePart(partId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("movePartUp/{partId}")]
        public IActionResult MovePartUp(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.MovePartUp(partId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("movePartDown/{partId}")]
        public IActionResult MovePartDown(long partId)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.MovePartDown(partId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getVariable/{pageId}/{key}")]
        public IActionResult GetVariable(long pageId, string key)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(_templateService.GetVariable(pageId, key));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("saveVariable")]
        public IActionResult SaveVariable([FromBody] TemplateVarInfo variable)
        {
            try
            {
                var userSession = _userClient.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                _templateService.SaveVariable(variable);
                var newVariable = _templateService.GetVariable(variable.PageId, variable.Key);
                return Ok(newVariable);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

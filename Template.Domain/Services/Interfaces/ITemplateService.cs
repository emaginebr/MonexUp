using Template.Domain.Interfaces.Models;
using Template.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Domain.Interfaces.Services
{
    public interface ITemplateService
    {
        TemplatePageInfo GetTemplatePageInfo(ITemplatePageModel page, LanguageEnum lang);
        ITemplatePageModel GetOrCreateNetworkPage(long networkId, string pageSlug);
        ITemplateModel CreateDefaultNetworkTemplate(long networkId);
        ITemplateModel CreateDefaultUserTemplate(long userId);
        ITemplateModel UpdateTemplate(ITemplateModel template);
        ITemplatePageModel GetPageBySlug(long templateId, string slug);
        ITemplatePageModel GetPageById(long pageId);
        ITemplatePageModel UpdatePage(ITemplatePageModel template);
        ITemplatePartModel InsertPart(TemplatePartInfo part);
        ITemplatePartModel UpdatePart(TemplatePartInfo part);
        void DeletePart(long partId);
        void MovePartUp(long partId);
        void MovePartDown(long partId);
        TemplateVarInfo GetVariable(long pageId, string key);
        void SaveVariable(TemplateVarInfo variable);
    }
}

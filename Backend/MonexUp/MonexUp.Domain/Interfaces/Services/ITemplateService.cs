using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface ITemplateService
    {
        TemplatePageInfo GetTemplatePageInfo(ITemplatePageModel page, LanguageEnum lang);
        ITemplatePageModel GetOrCreateNetworkPage(string networkSlug, string pageSlug);
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

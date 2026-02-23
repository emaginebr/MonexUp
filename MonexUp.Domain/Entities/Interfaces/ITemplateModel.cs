using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface ITemplateModel
    {
        long TemplateId { get; set; }
        long? NetworkId { get; set; }
        long? UserId { get; set; }
        string Title { get; set; }
        string Css { get; set; }

        ITemplateModel GetByNetwork(long networkId, ITemplateDomainFactory factory);
        ITemplateModel GetByUser(long userId, ITemplateDomainFactory factory);
        ITemplateModel Insert(ITemplateDomainFactory factory);
        ITemplateModel Update(ITemplateDomainFactory factory);
    }
}

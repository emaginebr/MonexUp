using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface ITemplatePartModel
    {
        long PartId { get; set; }

        long PageId { get; set; }

        string PartKey { get; set; }

        double Order { get; set; }

        ITemplatePartModel GetByKey(long pageId, string key, ITemplatePartDomainFactory factory);
        IEnumerable<ITemplatePartModel> ListByPage(long pageId, ITemplatePartDomainFactory factory);
        ITemplatePartModel Insert(ITemplatePartDomainFactory factory);
        ITemplatePartModel Update(ITemplatePartDomainFactory factory);
        void Delete(long partId);
        void MoveUp(long partId);
        void MoveDown(long partId);
    }
}

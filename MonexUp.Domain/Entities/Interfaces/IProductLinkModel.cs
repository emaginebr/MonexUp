using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IProductLinkModel
    {
        int Id { get; set; }
        long LofnProductId { get; set; }
        long NetworkId { get; set; }
        long UserId { get; set; }
        DateTime CreatedAt { get; set; }

        IProductLinkModel Upsert(IProductLinkDomainFactory factory);
        IProductLinkModel GetByLofnProductId(long lofnProductId, IProductLinkDomainFactory factory);
        IList<IProductLinkModel> ListByNetwork(long networkId, IProductLinkDomainFactory factory);
        IList<IProductLinkModel> ListByUser(long userId, IProductLinkDomainFactory factory);
        int DeleteByNetwork(long networkId);
    }
}

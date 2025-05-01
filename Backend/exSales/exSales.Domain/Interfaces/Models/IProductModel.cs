using exSales.Domain.Interfaces.Factory;
using exSales.DTO.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Models
{
    public interface IProductModel
    {
        long ProductId { get; set; }
        long NetworkId { get; set; }
        string Slug { get; set; }
        string Name { get; set; }
        string Description { get; set; }
        double Price { get; set; }
        int Frequency { get; set; }
        int Limit { get; set; }
        ProductStatusEnum Status { get; set; }
        string StripeProductId { get; set; }
        string StripePriceId { get; set; }

        IEnumerable<IProductModel> Search(long networkId, string keyword, int pageNum, out int pageCount, IProductDomainFactory factory);
        IEnumerable<IProductModel> ListByNetwork(long networkId, IProductDomainFactory factory);
        IProductModel GetById(long id, IProductDomainFactory factory);
        IProductModel GetByStripeProductId(string stripeProductId, IProductDomainFactory factory);
        IProductModel GetByStripePriceId(string stripePriceId, IProductDomainFactory factory);
        IProductModel GetBySlug(string slug, IProductDomainFactory factory);
        IProductModel Insert(IProductDomainFactory factory);
        IProductModel Update(IProductDomainFactory factory);
        bool ExistSlug(long productId, string slug);
    }
}

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

        double Price { get; set; }

        int Frequency { get; set; }

        int Limit { get; set; }

        ProductStatusEnum Status { get; set; }

        IEnumerable<IProductModel> ListByNetwork(long networkId, IProductDomainFactory factory);
        IProductModel GetById(long id, IProductDomainFactory factory);
        IProductModel Insert(IProductDomainFactory factory);
        IProductModel Update(IProductDomainFactory factory);
    }
}

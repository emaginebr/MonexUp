using exSales.Domain.Interfaces.Models;
using exSales.DTO.Product;
using exSales.DTO.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IProductService
    {
        IList<IProductModel> ListByNetwork(long networkId);
        IProductModel GetById(long productId);
        ProductInfo GetProductInfo(IProductModel product);
        IProductModel Insert(ProductInfo product, long userId);
        IProductModel Update(ProductInfo product, long userId);
    }
}

using exSales.Domain.Interfaces.Models;
using exSales.DTO.Product;
using exSales.DTO.Profile;
using exSales.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IProductService
    {
        ProductListPagedResult Search(long networkId, string keyword, int pageNum);
        IProductModel GetById(long productId);
        ProductInfo GetProductInfo(IProductModel product);
        IProductModel Insert(ProductInfo product, long userId);
        IProductModel Update(ProductInfo product, long userId);
    }
}

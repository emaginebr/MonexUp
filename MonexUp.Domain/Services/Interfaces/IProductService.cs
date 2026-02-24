using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Product;
using MonexUp.DTO.Profile;
using MonexUp.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IProductService
    {
        Task<ProductListPagedResult> Search(ProductSearchInternalParam param);
        IList<IProductModel> ListByNetwork(long networkId);
        IProductModel GetById(long productId);
        IProductModel GetBySlug(string productSlug);
        IProductModel GetByStripeProductId(string stripeProductId);
        IProductModel GetByStripePriceId(string stripePriceId);
        Task<ProductInfo> GetProductInfo(IProductModel product);
        Task<IProductModel> Insert(ProductInfo product, long userId, string token);
        Task<IProductModel> Update(ProductInfo product, long userId, string token);
    }
}

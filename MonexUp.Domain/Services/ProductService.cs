using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Product;
using NAuth.ACL.Interfaces;
using zTools.ACL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class ProductService : IProductService
    {
        private readonly IUserClient _userClient;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IFileClient _fileClient;

        public ProductService(
            IUserClient userClient,
            IUserNetworkDomainFactory userNetworkFactory,
            IProductDomainFactory productFactory,
            IFileClient fileClient
        )
        {
            _userClient = userClient;
            _userNetworkFactory = userNetworkFactory;
            _productFactory = productFactory;
            _fileClient = fileClient;
        }

        private async Task ValidateAccess(long networkId, long userId, string token)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);

            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = await _userClient.GetByIdAsync(userId, token);
                if (user == null)
                {
                    throw new Exception("User not found");
                }
                if (!user.IsAdmin)
                {
                    throw new Exception("Your dont have access to this network");
                }
            }
        }
        public IProductModel GetById(long productId)
        {
            return _productFactory.BuildProductModel().GetById(productId, _productFactory);
        }

        public IProductModel GetBySlug(string productSlug)
        {
            return _productFactory.BuildProductModel().GetBySlug(productSlug, _productFactory);
        }

        public async Task<ProductInfo> GetProductInfo(IProductModel md)
        {
            return new ProductInfo
            {
                ProductId = md.ProductId,
                NetworkId = md.NetworkId,
                Name = md.Name,
                Slug = md.Slug,
                Image = md.Image,
                ImageUrl = await _fileClient.GetFileUrlAsync("monexup", md.Image),
                Description = md.Description,
                Price = md.Price,
                Frequency = md.Frequency,
                Limit = md.Limit,
                Status = md.Status
            };
        }

        private string GenerateSlug(IProductModel md)
        {
            string newSlug;
            int c = 0;
            do
            {
                newSlug = SlugHelper.GerarSlug((!string.IsNullOrEmpty(md.Slug)) ? md.Slug : md.Name);
                if (c > 0)
                {
                    newSlug += c.ToString();
                }
                c++;
            } while (md.ExistSlug(md.ProductId, newSlug));
            return newSlug;
        }

        public async Task<IProductModel> Insert(ProductInfo product, long userId, string token)
        {
            await ValidateAccess(product.NetworkId, userId, token);

            if (string.IsNullOrEmpty(product.Name))
            {
                throw new Exception("Name is empty");
            }
            if (!(product.Price > 0))
            {
                throw new Exception("Price cant be 0");
            }

            var model = _productFactory.BuildProductModel();

            model.ProductId = product.ProductId;
            model.NetworkId = product.NetworkId;
            model.Name = product.Name;
            model.Description = product.Description;
            model.Price = product.Price;
            model.Frequency = product.Frequency;
            model.Limit = product.Limit;
            model.Status = product.Status;
            model.Slug = GenerateSlug(model);

            return model.Insert(_productFactory);
        }

        public async Task<IProductModel> Update(ProductInfo product, long userId, string token)
        {
            await ValidateAccess(product.NetworkId, userId, token);

            if (string.IsNullOrEmpty(product.Name))
            {
                throw new Exception("Name is empty");
            }
            if (!(product.Price > 0))
            {
                throw new Exception("Price cant be 0");
            }

            var model = _productFactory.BuildProductModel();

            model.ProductId = product.ProductId;
            model.NetworkId = product.NetworkId;
            model.Name = product.Name;
            model.Image = product.Image;
            model.Description = product.Description;
            model.Price = product.Price;
            model.Frequency = product.Frequency;
            model.Limit = product.Limit;
            model.Status = product.Status;
            model.Slug = GenerateSlug(model);

            return model.Update(_productFactory);
        }

        public async Task<ProductListPagedResult> Search(ProductSearchInternalParam param)
        {
            var model = _productFactory.BuildProductModel();
            int pageCount = 0;
            var productModels = model.Search(
                param.NetworkId <= 0 ? null : param.NetworkId,
                param.UserId <= 0 ? null : param.UserId,
                param.Keyword,
                param.OnlyActive, param.PageNum,
                out pageCount, _productFactory
                ).ToList();
            var products = new List<ProductInfo>();
            foreach (var x in productModels)
            {
                products.Add(await GetProductInfo(x));
            }
            return new ProductListPagedResult
            {
                Sucesso = true,
                Products = products,
                PageNum = param.PageNum,
                PageCount = pageCount
            };
        }

        public IList<IProductModel> ListByNetwork(long networkId)
        {
            return _productFactory
                .BuildProductModel()
                .ListByNetwork(networkId, _productFactory)
                .OrderBy(x => x.Price)
                .ToList();
        }

        public IProductModel GetByStripeProductId(string stripeProductId)
        {
            return _productFactory.BuildProductModel().GetByStripeProductId(stripeProductId, _productFactory);
        }

        public IProductModel GetByStripePriceId(string stripePriceId)
        {
            return _productFactory.BuildProductModel().GetByStripePriceId(stripePriceId, _productFactory);
        }
    }
}

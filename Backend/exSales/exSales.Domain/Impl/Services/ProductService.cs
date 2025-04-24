using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace exSales.Domain.Impl.Services
{
    public class ProductService : IProductService
    {
        private readonly IUserDomainFactory _userFactory;
        private readonly IUserNetworkDomainFactory _userNetworkFactory;
        private readonly IProductDomainFactory _productFactory;

        public ProductService(IUserDomainFactory userFactory, IUserNetworkDomainFactory userNetworkFactory, IProductDomainFactory productFactory)
        {
            _userFactory = userFactory;
            _userNetworkFactory = userNetworkFactory;
            _productFactory = productFactory;
        }

        private void ValidateAccess(long networkId, long userId)
        {
            var networkAccess = _userNetworkFactory.BuildUserNetworkModel().Get(networkId, userId, _userNetworkFactory);

            if (networkAccess == null)
            {
                throw new Exception("Your dont have access to this network");
            }

            if (networkAccess.Role != DTO.User.UserRoleEnum.NetworkManager)
            {
                var user = _userFactory.BuildUserModel().GetById(userId, _userFactory);
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
        public IList<IProductModel> ListByNetwork(long networkId)
        {
            return _productFactory.BuildProductModel().ListByNetwork(networkId, _productFactory).ToList();
        }
        public IProductModel GetById(long productId)
        {
            return _productFactory.BuildProductModel().GetById(productId, _productFactory);
        }

        public ProductInfo GetProductInfo(IProductModel md)
        {
            return new ProductInfo { 
                ProductId = md.ProductId,
                NetworkId = md.NetworkId,
                Name = md.Name,
                Slug = md.Slug,
                Price = md.Price,
                Frequency = md.Frequency,
                Limit = md.Limit,
                Status = md.Status
            };
        }

        public IProductModel Insert(ProductInfo product, long userId)
        {
            ValidateAccess(product.NetworkId, userId);

            if (string.IsNullOrEmpty(product.Name))
            {
                throw new Exception("Name is empty");
            }

            var model = _productFactory.BuildProductModel();

            model.ProductId = product.ProductId;
            model.NetworkId = product.NetworkId;
            model.Name = product.Name;
            model.Slug = product.Slug;
            model.Price = product.Price;
            model.Frequency = product.Frequency;
            model.Limit = product.Limit;
            model.Status = product.Status;

            return model.Insert(_productFactory);
        }

        public IProductModel Update(ProductInfo product, long userId)
        {
            ValidateAccess(product.NetworkId, userId);

            if (string.IsNullOrEmpty(product.Name))
            {
                throw new Exception("Name is empty");
            }

            var model = _productFactory.BuildProductModel();

            model.ProductId = product.ProductId;
            model.NetworkId = product.NetworkId;
            model.Name = product.Name;
            model.Slug = product.Slug;
            model.Price = product.Price;
            model.Frequency = product.Frequency;
            model.Limit = product.Limit;
            model.Status = product.Status;

            return model.Update(_productFactory);
        }
    }
}

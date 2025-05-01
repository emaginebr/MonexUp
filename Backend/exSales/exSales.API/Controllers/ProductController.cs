using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Product;
using exSales.DTO.Profile;
using exSales.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace exSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController: ControllerBase
    {
        private readonly IUserService _userService;
        private readonly INetworkService _networkService;
        private readonly IProductService _productService;

        public ProductController(IUserService userService, INetworkService networkService, IProductService productService)
        {
            _userService = userService;
            _networkService = networkService;
            _productService = productService;
        }

        [Authorize]
        [HttpPost("insert")]
        public ActionResult<ProductResult> Insert([FromBody] ProductInfo product)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newProfile = _productService.Insert(product, userSession.UserId);
                return new ProductResult()
                {
                    Product = _productService.GetProductInfo(newProfile)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public ActionResult<ProductResult> Update([FromBody] ProductInfo product)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                var newProduct = _productService.Update(product, userSession.UserId);
                return new ProductResult()
                {
                    Product = _productService.GetProductInfo(newProduct)
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        [Authorize]
        public ActionResult<ProductListPagedResult> Search([FromBody] ProductSearchParam param)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return _productService.Search(param.NetworkId, param.Keyword, param.PageNum);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetwork/{networkId}")]
        public ActionResult<ProductListResult> ListByNetwork(long networkId)
        {
            try
            {
                var products = _productService
                    .ListByNetwork(networkId)
                    .Select(x => _productService.GetProductInfo(x))
                    .ToList();
                return new ProductListResult
                {
                    Sucesso = true,
                    Products = products
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetworkSlug/{networkSlug}")]
        public ActionResult<ProductListResult> ListByNetworkSlug(string networkSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }

                var products = _productService
                    .ListByNetwork(network.NetworkId)
                    .Select(x => _productService.GetProductInfo(x))
                    .ToList();
                return new ProductListResult
                {
                    Sucesso = true,
                    Products = products
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{productId}")]
        public ActionResult<ProductResult> GetById(long productId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new ProductResult
                {
                    Sucesso = true,
                    Product = _productService.GetProductInfo(_productService.GetById(productId))
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBySlug/{productSlug}")]
        public ActionResult<ProductResult> GetBySlug(string productSlug)
        {
            try
            {
                return new ProductResult
                {
                    Sucesso = true,
                    Product = _productService.GetProductInfo(_productService.GetBySlug(productSlug))
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}

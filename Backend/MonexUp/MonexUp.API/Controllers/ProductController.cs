using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Product;
using MonexUp.DTO.Profile;
using MonexUp.DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
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
        public ActionResult<ProductListPagedResult> Search([FromBody] ProductSearchParam param)
        {
            try
            {
                /*
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                */
                if (!string.IsNullOrEmpty(param.NetworkSlug) && !(param.NetworkId.HasValue && param.NetworkId.Value > 0))
                {
                    var network = _networkService.GetBySlug(param.NetworkSlug);
                    if (network != null)
                    {
                        param.NetworkId = network.NetworkId;
                    }
                }
                if (!string.IsNullOrEmpty(param.UserSlug) && !(param.UserId.HasValue && param.UserId.Value > 0))
                {
                    var user = _userService.GetBySlug(param.UserSlug);
                    if (user != null)
                    {
                        param.UserId = user.UserId;
                    }
                }
                return _productService.Search(param);
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

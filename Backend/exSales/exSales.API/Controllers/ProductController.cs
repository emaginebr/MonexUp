using exSales.Domain.Impl.Services;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Product;
using exSales.DTO.Profile;
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
        private readonly IProductService _productService;

        public ProductController(IUserService userService, IProductService productService)
        {
            _userService = userService;
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

        [Authorize]
        [HttpGet("listByNetwork/{networkId}")]
        public ActionResult<ProductListResult> ListByNetwork(long networkId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return StatusCode(401, "Not Authorized");
                }
                return new ProductListResult
                {
                    Sucesso = true,
                    Products = _productService.ListByNetwork(networkId)
                    .ToList()
                    .Select(x => _productService.GetProductInfo(x))
                    .ToList()
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

    }
}

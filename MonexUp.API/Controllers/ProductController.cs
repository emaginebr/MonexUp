using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using NAuth.ACL.Interfaces;
using System.Threading.Tasks;
using MonexUp.API.Extensions;

namespace MonexUp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProductController: ControllerBase
    {
        private readonly IUserClient _userService;
        private readonly INetworkService _networkService;
        private readonly IProductService _productService;

        public ProductController(IUserClient userService, INetworkService networkService, IProductService productService)
        {
            _userService = userService;
            _networkService = networkService;
            _productService = productService;
        }

        [Authorize]
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] ProductInfo product)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var newProfile = await _productService.Insert(product, userSession.UserId, token);
                return Ok(await _productService.GetProductInfo(newProfile));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] ProductInfo product)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                var token = HttpContext.GetBearerToken();
                var newProduct = await _productService.Update(product, userSession.UserId, token);
                return Ok(await _productService.GetProductInfo(newProduct));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] ProductSearchParam param)
        {
            try
            {
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
                    var user = await _userService.GetBySlugAsync(param.UserSlug);
                    if (user != null)
                    {
                        param.UserId = user.UserId;
                    }
                }
                return Ok(await _productService.Search(param));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetwork/{networkId}")]
        public async Task<IActionResult> ListByNetwork(long networkId)
        {
            try
            {
                var productModels = _productService
                    .ListByNetwork(networkId);
                var products = new List<ProductInfo>();
                foreach (var x in productModels)
                {
                    products.Add(await _productService.GetProductInfo(x));
                }
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listByNetworkSlug/{networkSlug}")]
        public async Task<IActionResult> ListByNetworkSlug(string networkSlug)
        {
            try
            {
                var network = _networkService.GetBySlug(networkSlug);
                if (network == null)
                {
                    throw new Exception("Network not found");
                }

                var productModels = _productService
                    .ListByNetwork(network.NetworkId);
                var products = new List<ProductInfo>();
                foreach (var x in productModels)
                {
                    products.Add(await _productService.GetProductInfo(x));
                }
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize]
        [HttpGet("getById/{productId}")]
        public async Task<IActionResult> GetById(long productId)
        {
            try
            {
                var userSession = _userService.GetUserInSession(HttpContext);
                if (userSession == null)
                {
                    return Unauthorized();
                }
                return Ok(await _productService.GetProductInfo(_productService.GetById(productId)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBySlug/{productSlug}")]
        public async Task<IActionResult> GetBySlug(string productSlug)
        {
            try
            {
                return Ok(await _productService.GetProductInfo(_productService.GetBySlug(productSlug)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}

using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using MonexUp.DTO.Subscription;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IOrderService _orderService;
        private readonly IStripeService _stripeService;
        private readonly IUserClient _userClient;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IOrderItemDomainFactory _orderItemFactory;

        public SubscriptionService(
            IOrderService orderService,
            IStripeService stripeService,
            IUserClient userClient,
            INetworkDomainFactory networkFactory,
            IProductDomainFactory productFactory,
            IOrderItemDomainFactory orderItemFactory
        )
        {
            _orderService = orderService;
            _stripeService = stripeService;
            _userClient = userClient;
            _networkFactory = networkFactory;
            _productFactory = productFactory;
            _orderItemFactory = orderItemFactory;
        }

        public async Task<SubscriptionInfo> CreateSubscription(long productId, long userId, long? networkId, long? sellerId, string token)
        {
            var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            INetworkModel network = null;
            if (networkId.HasValue && networkId.Value > 0)
            {
                network = _networkFactory.BuildNetworkModel().GetById(networkId.Value, _networkFactory);
            }

            UserInfo seller = null;
            if (sellerId.HasValue && sellerId.Value > 0)
            {
                seller = await _userClient.GetByIdAsync(sellerId.Value, token);
            }

            var order = _orderService.Get(productId, userId, sellerId, OrderStatusEnum.Incoming);
            if (order == null)
            {
                order = _orderService.Insert(new OrderInfo
                {
                    NetworkId = product.NetworkId,
                    UserId = userId,
                    SellerId = sellerId,
                    Status = OrderStatusEnum.Incoming,
                    Items = new List<OrderItemInfo>
                    {
                        new OrderItemInfo {
                            ProductId = productId,
                            Quantity = 1
                        }
                    }
                });
            }
            var user = await _userClient.GetByIdAsync(order.UserId, token);
            var clientSecret = await _stripeService.CreateSubscription(user, product, network, seller);
            return new SubscriptionInfo()
            {
                Order = await _orderService.GetOrderInfo(order, token),
                ClientSecret = clientSecret
            };
        }
    }
}

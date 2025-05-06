using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using MonexUp.DTO.Subscription;
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
        private readonly IUserDomainFactory _userFactory;
        private readonly IProductDomainFactory _productFactory;
        private readonly IOrderItemDomainFactory _orderItemFactory;

        public SubscriptionService(
            IOrderService orderService,
            IStripeService stripeService,
            IUserDomainFactory userFactory,
            IProductDomainFactory productFactory,
            IOrderItemDomainFactory orderItemFactory
        )
        {
            _orderService = orderService;
            _stripeService = stripeService;
            _userFactory = userFactory;
            _productFactory = productFactory;
            _orderItemFactory = orderItemFactory;
        }

        public async Task<SubscriptionInfo> CreateSubscription(long productId, long userId, long? sellerId)
        {
            var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
            if (product == null)
            {
                throw new Exception("Product not found");
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
            var user = order.GetUser(_userFactory);
            var clientSecret = await _stripeService.CreateSubscription(user, product);
            return new SubscriptionInfo()
            {
                Order = _orderService.GetOrderInfo(order),
                ClientSecret = clientSecret
            };
        }

        /*
        public async Task<SubscriptionInfo> CreateInvoice(long productId, long userId)
        {
            var product = _productFactory.BuildProductModel().GetById(productId, _productFactory);
            if (product == null)
            {
                throw new Exception("Product not found");
            }
            var order = _orderService.Get(productId, userId, OrderStatusEnum.Incoming);
            if (order == null)
            {
                order = _orderService.Insert(new OrderInfo
                {
                    NetworkId = product.NetworkId,
                    UserId = userId,
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
            var user = order.GetUser(_userFactory);
            var clientSecret = await _stripeService.CreateInvoice(user, product);
            return new SubscriptionInfo()
            {
                Order = _orderService.GetOrderInfo(order),
                ClientSecret = clientSecret
            };
        }
        */
    }
}

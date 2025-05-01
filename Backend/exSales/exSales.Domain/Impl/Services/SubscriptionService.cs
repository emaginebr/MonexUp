using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Order;
using exSales.DTO.Subscription;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IOrderService _orderService;
        private readonly IStripeService _stripeService;
        private readonly IUserDomainFactory _userFactory;
        private readonly IProductDomainFactory _productFactory;

        public SubscriptionService(
            IOrderService orderService,
            IStripeService stripeService,
            IUserDomainFactory userFactory,
            IProductDomainFactory productFactory
        )
        {
            _orderService = orderService;
            _stripeService = stripeService;
            _userFactory = userFactory;
            _productFactory = productFactory;
        }

        public async Task<SubscriptionInfo> Insert(long productId, long userId)
        {
            var order = _orderService.Get(productId, userId, OrderStatusEnum.Incoming);
            if (order == null)
            {
                order = _orderService.Insert(new OrderInfo
                {
                    ProductId = productId,
                    UserId = userId,
                    Status = OrderStatusEnum.Incoming
                });
            }
            var user = order.GetUser(_userFactory);
            var product = order.GetProduct(_productFactory);
            var clientSecret = await _stripeService.CreateSubscription(user, product);
            return new SubscriptionInfo()
            {
                Order = _orderService.GetOrderInfo(order),
                ClientSecret = clientSecret
            };
        }
    }
}

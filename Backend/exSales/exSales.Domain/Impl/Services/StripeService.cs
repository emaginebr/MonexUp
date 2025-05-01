using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Order;
using Stripe;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Services
{
    public class StripeService: IStripeService
    {
        private const string API_KEY = "sk_test_51QkuslD37qwDaRRT7Xnw3HtnoCVpTKM3cZSBSp9uCvCQlJfCn8fuhokykPmOcRKYdLxFcQFZxe8esAmpCsiYv4et00L5OCzjXe";

        private readonly IProductDomainFactory _productFactory;

        public StripeService(IProductDomainFactory productFactory) {
            _productFactory = productFactory;

            StripeConfiguration.ApiKey = API_KEY;
        }

        public async Task<string> CreateSubscription(IUserModel user, IProductModel product)
        {
            var customerService = new CustomerService();
            var customers = await customerService.ListAsync(new CustomerListOptions { Email = user.Email, Limit = 1 });

            Customer customer;
            if (customers.Data.Any())
            {
                customer = customers.Data.First();
            }
            else
            {
                customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = user.Email,
                    Name = user.Name
                });
            }

            // 2. Criar produto
            var stripeProductService = new Stripe.ProductService();
            Stripe.Product stripeProduct = null;
            if (!string.IsNullOrEmpty(product.StripeProductId))
            {
                var stripeProducts = await stripeProductService.ListAsync(new Stripe.ProductListOptions
                {
                    Ids = new List<string>() { product.StripeProductId }
                });
                if (stripeProducts.Any())
                {
                    stripeProduct = stripeProducts.FirstOrDefault();
                }
            }
            if (stripeProduct == null)
            {
                stripeProduct = await stripeProductService.CreateAsync(new ProductCreateOptions
                {
                    Name = product.Name
                });
                //product.StripeProductId = stripeProduct.Id;
                //product.Update(_productFactory);
            }

            var priceService = new PriceService();
            Price stripePrice = null;
            if (!string.IsNullOrEmpty(product.StripePriceId))
            {
                var prices = await priceService.ListAsync(new PriceListOptions
                {
                    Product = stripeProduct.Id
                });
                stripePrice = prices.Where(x => x.Id == product.StripePriceId).FirstOrDefault();
            }
            if (stripePrice == null)
            {
                var amountInCents = Convert.ToInt64(Math.Truncate(product.Price * 100));

                stripePrice = await priceService.CreateAsync(new PriceCreateOptions
                {
                    UnitAmount = amountInCents, // Exemplo: R$19,90 → 1990
                    Currency = "brl",
                    Recurring = new PriceRecurringOptions
                    {
                        Interval = (product.Frequency == 30) ? "month" : "year" // "month" ou "year"
                    },
                    Product = stripeProduct.Id
                });
            }
            if (string.IsNullOrEmpty(product.StripeProductId) || string.IsNullOrEmpty(product.StripePriceId))
            {
                product.StripeProductId = stripeProduct.Id;
                product.StripePriceId = stripePrice.Id;
                product.Update(_productFactory);
            }


            var options = new Stripe.Checkout.SessionCreateOptions
            {
                Mode = "subscription",
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions> {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        Price = product.StripePriceId,
                        Quantity = 1,
                    },
                },
                UiMode = "embedded",
                ReturnUrl = "https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
            };
            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return session.ClientSecret;
        }
    }
}

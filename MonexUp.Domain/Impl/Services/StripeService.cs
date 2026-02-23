using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.Order;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using Stripe;
using Stripe.Checkout;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Services
{
    public class StripeService: IStripeService
    {
        private readonly IProductDomainFactory _productFactory;
        private readonly IInvoiceDomainFactory _invoiceFactory;
        private readonly IUserClient _userClient;
        private readonly IOrderDomainFactory _orderFactory;

        public StripeService(
            IProductDomainFactory productFactory,
            IInvoiceDomainFactory invoiceFactory,
            IUserClient userClient,
            IOrderDomainFactory orderFactory,
            Microsoft.Extensions.Configuration.IConfiguration configuration
        )
        {
            StripeConfiguration.ApiKey = configuration["STRIPE_SECRET_KEY"]
                ?? throw new InvalidOperationException("STRIPE_SECRET_KEY is not configured.");

            _productFactory = productFactory;
            _invoiceFactory = invoiceFactory;
            _userClient = userClient;
            _orderFactory = orderFactory;
        }

        public async Task<string> CreateInvoice(UserInfo user, IProductModel product)
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

            var amountInCents = Convert.ToInt64(Math.Truncate(product.Price * 100));
            /*
            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "brl",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
                Customer = customer.Id
            };
            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);
            */

            var options = new Stripe.Checkout.SessionCreateOptions
            {
                Mode = "payment",
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions> {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        Price = product.StripePriceId,
                        Quantity = 1,
                    },
                },
                UiMode = "embedded",
                Customer = customer.Id,
                ReturnUrl = "https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
            };
            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return session.ClientSecret;
        }

        private string GetUrlCheckout(string networkSlug, string sellerSlug)
        {
            string url = "https://monexup.com";
            if (!string.IsNullOrEmpty(networkSlug) && string.IsNullOrEmpty(sellerSlug))
            {
                url += $"/{networkSlug}/@/{sellerSlug}";
            }
            else if (!string.IsNullOrEmpty(networkSlug))
            {
                url += $"/{networkSlug}";
            }
            else if (!string.IsNullOrEmpty(sellerSlug))
            {
                url += $"/@/{sellerSlug}";
            }
            url += "/checkout/{CHECKOUT_SESSION_ID}";
            return url;
        }

        public async Task<string> CreateSubscription(UserInfo user, IProductModel product, INetworkModel network, UserInfo seller)
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

                var priceOptions = new PriceCreateOptions
                {
                    UnitAmount = amountInCents, // Exemplo: R$19,90 → 1990
                    Currency = "brl",
                    Product = stripeProduct.Id,
                };
                if (product.Frequency > 0)
                {
                    priceOptions.Recurring = new PriceRecurringOptions
                    {
                        Interval = (product.Frequency == 30) ? "month" : "year" // "month" ou "year"
                    };
                }
                stripePrice = await priceService.CreateAsync(priceOptions);
            }
            if (string.IsNullOrEmpty(product.StripeProductId) || string.IsNullOrEmpty(product.StripePriceId))
            {
                product.StripeProductId = stripeProduct.Id;
                product.StripePriceId = stripePrice.Id;
                product.Update(_productFactory);
            }


            var options = new Stripe.Checkout.SessionCreateOptions
            {
                Mode = product.Frequency == 0 ? "payment" : "subscription",
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions> {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        Price = product.StripePriceId,
                        Quantity = 1,
                    },
                },
                UiMode = "embedded",
                Customer = customer.Id,
                ReturnUrl = GetUrlCheckout(network?.Slug, seller?.Slug),
            };
            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return session.ClientSecret;
        }

        private async Task<IInvoiceModel> ConvertStripeToModel(Invoice invoice)
        {
            var md = _invoiceFactory.BuildInvoiceModel();

            var user = await _userClient.GetByEmailAsync(invoice.CustomerEmail);
            if (user == null)
            {
                throw new Exception(string.Format("User with email {0} not found", invoice.CustomerEmail));
            }
            md.UserId = user.UserId;

            // draft, open, paid, void, uncollectible
            switch (invoice.Status)
            {
                case "draft":
                    md.Status = DTO.Invoice.InvoiceStatusEnum.Draft;
                    break;
                case "open":
                    md.Status = DTO.Invoice.InvoiceStatusEnum.Open;
                    break;
                case "paid":
                    md.Status = DTO.Invoice.InvoiceStatusEnum.Paid;
                    break;
                case "void":
                    md.Status = DTO.Invoice.InvoiceStatusEnum.Cancelled;
                    break;
                case "uncollectible":
                    md.Status = DTO.Invoice.InvoiceStatusEnum.Lost;
                    break;
                default:
                    throw new Exception(string.Format("unknow status '{0}'", invoice.Status));
                    break;
            }

            var invoiceItemService = new InvoiceLineItemService();
            var items = await invoiceItemService.ListAsync(invoice.Id);
            if (items.Count() == 0)
            {
                throw new Exception("Invoice as not itens on stripe");
            }
            if (items.Count() > 1)
            {
                throw new Exception("Invoice as more then one item");
            }
            var item = items.FirstOrDefault();

            var productId = item.Pricing.PriceDetails.Product;

            var product = _productFactory.BuildProductModel().GetByStripeProductId(productId, _productFactory);
            if (product == null)
            {
                throw new Exception(string.Format("Product with id '{0}' not found", productId));
            }

            var order = _orderFactory.BuildOrderModel().Get(product.ProductId, user.UserId, null, OrderStatusEnum.Active, _orderFactory);
            if (order == null)
            {
                order = _orderFactory.BuildOrderModel().Get(product.ProductId, user.UserId, null, OrderStatusEnum.Incoming, _orderFactory);
            }
            if (order == null)
            {
                throw new Exception(string.Format("No active order for user {0} and product {1}", user.Name, product.Name));
            }
            md.OrderId = order.OrderId;
            if (invoice.DueDate.HasValue)
            {
                md.DueDate = invoice.DueDate.GetValueOrDefault();
                //md.PaymentDate = invoice.DueDate.GetValueOrDefault();
            }
            if (invoice.EffectiveAt.HasValue)
            {
                md.PaymentDate = invoice.EffectiveAt.GetValueOrDefault();
                if (!invoice.DueDate.HasValue)
                {
                    invoice.DueDate = invoice.EffectiveAt.GetValueOrDefault();
                }
            }
            md.Price = (double)invoice.AmountDue / 100.0;
            md.StripeId = invoice.Id;

            return md;
        }

        public async Task<IList<IInvoiceModel>> ListInvoices()
        {
            var service = new Stripe.InvoiceService();
            var options = new InvoiceListOptions
            {
                Limit = 100
            };

            var invoicesModel = new List<IInvoiceModel>();

            var invoices = await service.ListAsync(options);
            foreach (var invoice in invoices) {
                try
                {
                    invoicesModel.Add(await ConvertStripeToModel(invoice));
                }
                catch (Exception ex) {
                    Console.WriteLine(ex.Message);
                }
            }
            return invoicesModel;
        }

        public async Task<IInvoiceModel> Checkout(string checkouSessionId)
        {
            var service = new SessionService();
            var session = await service.GetAsync(checkouSessionId); // CHECKOUT_SESSION_ID
            return await ConvertStripeToModel(session.Invoice);
        }
    }
}

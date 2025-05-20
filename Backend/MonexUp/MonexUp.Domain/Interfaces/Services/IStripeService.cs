using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Order;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IStripeService
    {
        Task<string> CreateSubscription(IUserModel user, IProductModel product, INetworkModel network, IUserModel seller);

        Task<string> CreateInvoice(IUserModel user, IProductModel product);
        Task<IInvoiceModel> Checkout(string checkouSessionId);

        Task<IList<IInvoiceModel>> ListInvoices();
    }
}

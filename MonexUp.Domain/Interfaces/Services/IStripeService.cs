using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Order;
using NAuth.DTO.User;
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
        Task<string> CreateSubscription(UserInfo user, IProductModel product, INetworkModel network, UserInfo seller);

        Task<string> CreateInvoice(UserInfo user, IProductModel product);
        Task<IInvoiceModel> Checkout(string checkouSessionId);

        Task<IList<IInvoiceModel>> ListInvoices();
    }
}

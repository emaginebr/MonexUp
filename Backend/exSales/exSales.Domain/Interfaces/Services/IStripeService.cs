using exSales.Domain.Interfaces.Models;
using exSales.DTO.Order;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IStripeService
    {
        Task<string> CreateSubscription(IUserModel user, IProductModel product);

        Task<string> CreateInvoice(IUserModel user, IProductModel product);

        Task<IList<IInvoiceModel>> ListInvoices();
    }
}

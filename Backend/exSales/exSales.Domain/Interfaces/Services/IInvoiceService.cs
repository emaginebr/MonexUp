using exSales.Domain.Interfaces.Models;
using exSales.DTO.Invoice;
using exSales.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Interfaces.Services
{
    public interface IInvoiceService
    {
        IList<IInvoiceModel> List(long networkId, long orderId, long userId, InvoiceStatusEnum? status);
        IInvoiceModel GetById(long invoiceId);
        IInvoiceModel GetByStripeId(string stripeId);
        InvoiceInfo GetInvoiceInfo(IInvoiceModel invoice);
        IInvoiceModel Insert(InvoiceInfo invoice);
        IInvoiceModel Update(InvoiceInfo invoice);
    }
}

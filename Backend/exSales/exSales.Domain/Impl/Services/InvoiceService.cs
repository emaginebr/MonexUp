using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.Domain.Interfaces.Services;
using exSales.DTO.Invoice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Services
{

    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceDomainFactory _invoiceFactory;

        public InvoiceService(IInvoiceDomainFactory invoiceFactory)
        {
            _invoiceFactory = invoiceFactory;
        }

        public IInvoiceModel Insert(InvoiceInfo invoice)
        {
            throw new NotImplementedException();
        }

        public IInvoiceModel GetById(long invoiceId)
        {
            throw new NotImplementedException();
        }

        public InvoiceInfo GetInvoiceInfo(IInvoiceModel invoice)
        {
            throw new NotImplementedException();
        }

        public IList<IInvoiceModel> List(long networkId, long orderId, long userId, InvoiceStatusEnum? status)
        {
            throw new NotImplementedException();
        }

        public IInvoiceModel Update(InvoiceInfo invoice)
        {
            throw new NotImplementedException();
        }

        public IInvoiceModel GetByStripeId(string stripeId)
        {
            throw new NotImplementedException();
        }
    }
}

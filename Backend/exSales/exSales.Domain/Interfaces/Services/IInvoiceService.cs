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
        Task Syncronize();
        void CalculateFee(IInvoiceModel invoice);
        IInvoiceModel Insert(IInvoiceModel invoice);
        IInvoiceModel Pay(IInvoiceModel invoice);
        void ClearFees(IInvoiceModel invoice);
        InvoiceInfo GetInvoiceInfo(IInvoiceModel invoice);
        InvoiceListPagedResult Search(long networkId, long? userId, long? sellerId, int pageNum);
    }
}

using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IInvoiceService
    {
        Task Syncronize();
        void CalculateFee(IInvoiceModel invoice);
        IInvoiceModel Insert(IInvoiceModel invoice);
        IInvoiceModel Pay(IInvoiceModel invoice);
        void ClearFees(IInvoiceModel invoice);
        IInvoiceModel ProcessInvoice(IInvoiceModel invoiceStripe);
        Task<IInvoiceModel> Checkout(string checkoutSessionId);
        Task<InvoiceInfo> GetInvoiceInfo(IInvoiceModel invoice, string token);
        Task<InvoiceListPagedResult> Search(long networkId, long? userId, long? sellerId, int pageNum, string token);
        Task<StatementListPagedResult> SearchStatement(StatementSearchParam param, string token);
        double GetBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);
    }
}

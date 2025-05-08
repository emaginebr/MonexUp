using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Invoice;
using NoobsMuc.Coinmarketcap.Client;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class InvoiceFeeRepository : IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>
    {
        private MonexUpContext _ccsContext;

        private const int PAGE_SIZE = 15;
        private const int INVOICE_STATUS_PAID = 3;

        public InvoiceFeeRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IInvoiceFeeModel DbToModel(IInvoiceFeeDomainFactory factory, InvoiceFee row)
        {
            var md = factory.BuildInvoiceFeeModel();
            md.FeeId = row.FeeId;
            md.InvoiceId = row.InvoiceId;
            md.NetworkId = row.NetworkId;
            md.UserId = row.UserId;
            md.Amount = row.Amount;
            md.PaidAt = row.PaidAt;
            return md;
        }

        private void ModelToDb(IInvoiceFeeModel md, InvoiceFee row)
        {
            row.FeeId = md.FeeId;
            row.InvoiceId = md.InvoiceId;
            row.NetworkId = md.NetworkId;
            row.UserId = md.UserId;
            row.Amount = md.Amount;
            row.PaidAt = md.PaidAt;
        }

        public void DeleteByInvoice(long invoiceId)
        {
            var rows = _ccsContext.InvoiceFees.Where(x => x.InvoiceId == invoiceId).ToList();
            if (rows.Count() == 0)
            {
                return;
            }
            _ccsContext.RemoveRange(rows);
            _ccsContext.SaveChanges();
        }

        public IInvoiceFeeModel Insert(IInvoiceFeeModel model, IInvoiceFeeDomainFactory factory)
        {
            var row = new InvoiceFee();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.FeeId = row.FeeId;
            return model;
        }

        public IEnumerable<IInvoiceFeeModel> ListByInvoice(long invoiceId, IInvoiceFeeDomainFactory factory)
        {
            return _ccsContext.InvoiceFees
                .Where(x => x.InvoiceId == invoiceId)
                .ToList()
                .Select(x => DbToModel(factory, x));
        }

        public IEnumerable<IInvoiceFeeModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, IInvoiceFeeDomainFactory factory)
        {
            var q = _ccsContext.InvoiceFees.AsQueryable();
            if (networkId.HasValue && networkId.Value > 0)
            {
                q = q.Where(x => x.NetworkId == networkId.Value);
            }
            if (userId.HasValue && userId.Value > 0)
            {
                q = q.Where(x => x.UserId == userId.Value);
            }
            if (ini.HasValue && end.HasValue)
            {
                q = q.Where(x => x.Invoice.PaymentDate >= ini.Value && x.Invoice.PaymentDate <= end.Value);
            }
            else if (ini.HasValue)
            {
                q = q.Where(x => x.Invoice.PaymentDate >= ini.Value);
            }
            else if (end.HasValue)
            {
                q = q.Where(x => x.Invoice.PaymentDate <= end.Value);
            }
            q = q.OrderByDescending(x => x.Invoice.PaymentDate);
            var pages = (double)q.Count() / (double)PAGE_SIZE;
            pageCount = Convert.ToInt32(Math.Ceiling(pages));
            var rows = q.Skip((pageNum - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public double GetBalance(long? networkId, long? userId)
        {
            var q = _ccsContext.InvoiceFees.Where(x => !x.PaidAt.HasValue);
            if (networkId.HasValue)
            {
                q = q.Where(x => x.NetworkId == networkId.Value);
            }
            if (userId.HasValue)
            {
                q = q.Where(x => x.UserId == userId.Value);
            }
            if (!networkId.HasValue && !userId.HasValue)
            {
                q = q.Where(x => !x.NetworkId.HasValue && !x.UserId.HasValue);
            }
            return q.Sum(x => x.Amount);
        }

        public double GetAvailableBalance(long userId)
        {
            return _ccsContext
                .InvoiceFees
                .Where(x => x.UserId == userId 
                    && x.Invoice.Status == INVOICE_STATUS_PAID 
                    && !x.PaidAt.HasValue)
                .Select(x => new
                {
                    x.Amount,
                    DueDate = x.Invoice.PaymentDate.GetValueOrDefault().AddDays(x.Invoice.Order.Network.WithdrawalPeriod)
                })
                .ToList()
                .Where(x => x.DueDate <= DateTime.Today)
                .Sum(x => x.Amount);
        }
    }
}

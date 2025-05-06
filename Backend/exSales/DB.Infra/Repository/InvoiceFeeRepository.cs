using Core.Domain.Repository;
using DB.Infra.Context;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Invoice;
using NoobsMuc.Coinmarketcap.Client;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB.Infra.Repository
{
    public class InvoiceFeeRepository : IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>
    {
        private ExSalesContext _ccsContext;

        public InvoiceFeeRepository(ExSalesContext ccsContext)
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
    }
}

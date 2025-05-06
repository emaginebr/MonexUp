using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class InvoiceFeeModel : IInvoiceFeeModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory> _repositoryFee;

        public InvoiceFeeModel(IUnitOfWork unitOfWork, IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory> repositoryFee)
        {
            _unitOfWork = unitOfWork;
            _repositoryFee = repositoryFee;
        }

        public long FeeId { get; set; }
        public long InvoiceId { get; set; }
        public long? NetworkId { get; set; }
        public long? UserId { get; set; }
        public double Amount { get; set; }
        public DateTime? PaidAt { get; set; }

        public void DeleteByInvoice(long invoiceId)
        {
            _repositoryFee.DeleteByInvoice(invoiceId);
        }

        public IInvoiceFeeModel Insert(IInvoiceFeeDomainFactory factory)
        {
            return _repositoryFee.Insert(this, factory);
        }

        public List<IInvoiceFeeModel> ListByInvoice(long invoiceId, IInvoiceFeeDomainFactory factory)
        {
            return _repositoryFee.ListByInvoice(invoiceId, factory).ToList();
        }
    }
}

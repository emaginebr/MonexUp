using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using exSales.DTO.Invoice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Models
{
    public class InvoiceModel : IInvoiceModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory> _repositoryInvoice;

        public InvoiceModel(IUnitOfWork unitOfWork, IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory> repositoryInvoice)
        {
            _unitOfWork = unitOfWork;
            _repositoryInvoice = repositoryInvoice;
        }

        public long InvoiceId { get; set; }
        public long OrderId { get; set; }
        public long UserId { get; set; }
        public long? SellerId { get; set; }
        public double Price { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaymentDate { get; set; }
        public InvoiceStatusEnum Status { get; set; }
        public string StripeId { get; set; }

        public IInvoiceModel Insert(IInvoiceDomainFactory factory)
        {
            return _repositoryInvoice.Insert(this, factory);
        }

        public IInvoiceModel Update(IInvoiceDomainFactory factory)
        {
            return _repositoryInvoice.Update(this, factory);
        }

        public IEnumerable<IInvoiceModel> List(long networkId, long orderId, long userId, InvoiceStatusEnum? status, IInvoiceDomainFactory factory)
        {
            return _repositoryInvoice.List(networkId, orderId, userId, (status.HasValue ? 0 : (int)status), factory);
        }

        public IInvoiceModel GetById(long id, IInvoiceDomainFactory factory)
        {
            return _repositoryInvoice.GetById(id, factory);
        }

        public IInvoiceModel GetByStripeId(string stripeId, IInvoiceDomainFactory factory)
        {
            return _repositoryInvoice.GetByStripeId(stripeId, factory);
        }
    }
}

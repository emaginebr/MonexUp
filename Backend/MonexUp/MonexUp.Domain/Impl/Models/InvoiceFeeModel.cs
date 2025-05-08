using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Models
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

        public double GetAvailableBalance(long userId)
        {
            return _repositoryFee.GetAvailableBalance(userId);
        }

        public double GetBalance(long? networkId, long? userId)
        {
            return _repositoryFee.GetBalance(networkId, userId);
        }

        public IInvoiceFeeModel Insert(IInvoiceFeeDomainFactory factory)
        {
            return _repositoryFee.Insert(this, factory);
        }

        public IList<IInvoiceFeeModel> ListByInvoice(long invoiceId, IInvoiceFeeDomainFactory factory)
        {
            return _repositoryFee.ListByInvoice(invoiceId, factory).ToList();
        }

        public IList<IInvoiceFeeModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, IInvoiceFeeDomainFactory factory)
        {
            return _repositoryFee.Search(networkId, userId, ini, end, pageNum, out pageCount, factory).ToList();
        }
    }
}

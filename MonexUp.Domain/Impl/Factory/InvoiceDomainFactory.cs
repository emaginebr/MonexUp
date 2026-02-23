using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MonexUp.Domain.Impl.Models;

namespace MonexUp.Domain.Impl.Factory
{
    public class InvoiceDomainFactory : IInvoiceDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory> _repositoryInvoice;

        public InvoiceDomainFactory(IUnitOfWork unitOfWork, IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory> repositoryInvoice)
        {
            _unitOfWork = unitOfWork;
            _repositoryInvoice = repositoryInvoice;
        }

        public IInvoiceModel BuildInvoiceModel()
        {
            return new InvoiceModel(_unitOfWork, _repositoryInvoice);
        }
    }
}

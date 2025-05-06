using Core.Domain.Repository;
using Core.Domain;
using exSales.Domain.Impl.Models;
using exSales.Domain.Interfaces.Factory;
using exSales.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace exSales.Domain.Impl.Factory
{
    public class InvoiceFeeDomainFactory: IInvoiceFeeDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory> _repositoryFee;

        public InvoiceFeeDomainFactory(IUnitOfWork unitOfWork, IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory> repositoryFee)
        {
            _unitOfWork = unitOfWork;
            _repositoryFee = repositoryFee;
        }

        public IInvoiceFeeModel BuildInvoiceFeeModel()
        {
            return new InvoiceFeeModel(_unitOfWork, _repositoryFee);
        }
    }
}

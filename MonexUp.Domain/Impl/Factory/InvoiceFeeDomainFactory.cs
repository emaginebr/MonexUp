using Core.Domain.Repository;
using Core.Domain;
using MonexUp.Domain.Impl.Models;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Impl.Factory
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

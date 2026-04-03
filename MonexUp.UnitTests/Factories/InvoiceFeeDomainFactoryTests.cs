using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class InvoiceFeeDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>> _repository;
        private readonly InvoiceFeeDomainFactory _sut;

        public InvoiceFeeDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>>();
            _sut = new InvoiceFeeDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildInvoiceFeeModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildInvoiceFeeModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildInvoiceFeeModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildInvoiceFeeModel();
            Assert.IsAssignableFrom<IInvoiceFeeModel>(result);
        }

        [Fact]
        public void BuildInvoiceFeeModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildInvoiceFeeModel();
            var result2 = _sut.BuildInvoiceFeeModel();
            Assert.NotSame(result1, result2);
        }
    }
}

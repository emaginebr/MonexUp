using Core.Domain;
using Core.Domain.Repository;
using MonexUp.Domain.Impl.Factory;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using Moq;

namespace MonexUp.UnitTests.Factories
{
    public class InvoiceDomainFactoryTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork;
        private readonly Mock<IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory>> _repository;
        private readonly InvoiceDomainFactory _sut;

        public InvoiceDomainFactoryTests()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _repository = new Mock<IInvoiceRepository<IInvoiceModel, IInvoiceDomainFactory>>();
            _sut = new InvoiceDomainFactory(_unitOfWork.Object, _repository.Object);
        }

        [Fact]
        public void BuildInvoiceModel_ShouldReturnNonNull()
        {
            var result = _sut.BuildInvoiceModel();
            Assert.NotNull(result);
        }

        [Fact]
        public void BuildInvoiceModel_ShouldReturnCorrectType()
        {
            var result = _sut.BuildInvoiceModel();
            Assert.IsAssignableFrom<IInvoiceModel>(result);
        }

        [Fact]
        public void BuildInvoiceModel_ShouldReturnNewInstanceEachTime()
        {
            var result1 = _sut.BuildInvoiceModel();
            var result2 = _sut.BuildInvoiceModel();
            Assert.NotSame(result1, result2);
        }
    }
}

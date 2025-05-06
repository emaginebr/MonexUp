using MonexUp.Domain.Interfaces.Factory;
using MonexUp.DTO.Invoice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IInvoiceModel
    {
        long InvoiceId { get; set; }

        long OrderId { get; set; }

        long UserId { get; set; }

        long? SellerId { get; set; }

        double Price { get; set; }

        DateTime DueDate { get; set; }

        DateTime? PaymentDate { get; set; }

        InvoiceStatusEnum Status { get; set; }
        string StripeId { get; set; }

        IOrderModel GetOrder(IOrderDomainFactory factory);
        IUserModel GetUser(IUserDomainFactory factory);
        IUserModel GetSeller(IUserDomainFactory factory);
        IList<IInvoiceFeeModel> ListFees(IInvoiceFeeDomainFactory factory);

        IInvoiceModel Insert(IInvoiceDomainFactory factory);
        IInvoiceModel Update(IInvoiceDomainFactory factory);

        IEnumerable<IInvoiceModel> Search(long networkId, long? userId, long? sellerId, int pageNum, out int pageCount, IInvoiceDomainFactory factory);
        //IEnumerable<IInvoiceModel> List(long networkId, long orderId, long userId, InvoiceStatusEnum? status, IInvoiceDomainFactory factory);
        IInvoiceModel GetById(long id, IInvoiceDomainFactory factory);
        IInvoiceModel GetByStripeId(string stripeId, IInvoiceDomainFactory factory);
    }
}

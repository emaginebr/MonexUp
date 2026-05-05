using System;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IBillingFeeService
    {
        int RecordPaidProxyPayInvoice(long proxypayInvoiceId, long networkId, long paidAmountCents, DateTime paidAt);
        int ReverseProxyPayInvoice(long proxypayInvoiceId, long refundedAmountCents, long originalPaidAmountCents);
    }
}

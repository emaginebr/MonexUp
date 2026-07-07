using MonexUp.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;

namespace MonexUp.Domain.Interfaces.Models
{
    public interface IInvoiceFeeModel
    {
        long FeeId { get; set; }
        long? ProxyPayInvoiceId { get; set; }
        long? NetworkId { get; set; }
        long? UserId { get; set; }
        double Amount { get; set; }
        DateTime? PaidAt { get; set; }
        DateTime? WithdrawalDueDate { get; set; }
        DateTime? ReversedAt { get; set; }

        IInvoiceFeeModel Insert(IInvoiceFeeDomainFactory factory);
        IList<IInvoiceFeeModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, IInvoiceFeeDomainFactory factory);
        double GetBalance(long? networkId, long? userId);
        double GetTotalBalance(long? networkId, long? userId);
        double GetReleasedBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);
    }
}

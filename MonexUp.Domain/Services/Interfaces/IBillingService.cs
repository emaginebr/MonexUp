using MonexUp.DTO.Billing;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IBillingService
    {
        Task<EnsureStoreResult> EnsureStoreAsync(long networkId, long callerUserId, string bearerToken, CancellationToken ct = default);
        BillingListApiResult List(long networkId, long callerUserId, int pageNum, int pageSize);
        Task<PaymentCompletionResult> ProcessPaymentCompletionAsync(PaymentCompletionInfo info, CancellationToken ct = default);
        string BuildCompletionUrl(long networkId, long proxypayInvoiceId);
    }

    public class PaymentCompletionResult
    {
        public BillingApiResult<object> Body { get; set; }
        public int StatusCode { get; set; }
    }

    public class EnsureStoreResult
    {
        public BillingApiResult<EnsureStoreResponse> Body { get; set; }
        public int StatusCode { get; set; }
    }
}

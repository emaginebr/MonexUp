using MonexUp.DTO.Billing;
using MonexUp.DTO.Invoice;
using System.Collections.Generic;
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

        /// <summary>
        /// Idempotently records commission fee rows (network/store cut + seller) for a
        /// ProxyPay invoice that is confirmed paid. Fetches the invoice from ProxyPay to
        /// obtain the paid amount, verifies it is paid and belongs to the network, then
        /// delegates to the billing-fee service (unique-index idempotent). Returns the
        /// number of fee rows inserted (0 if not paid, already recorded, or misconfigured).
        /// Safe to call from any paid-detection path (status poll, webhook, reconciliation).
        /// </summary>
        Task<int> GenerateCommissionForPaidInvoiceAsync(long networkId, long proxypayInvoiceId, CancellationToken ct = default);

        Task<StatementListPagedResult> SearchStatement(StatementSearchParam param, string token);

        /// <summary>
        /// Paginated, role-filtered invoice listing backing <c>POST /Billing/searchInvoices</c>.
        /// Administrator/NetworkManager see all invoices for the network; Seller sees only sales
        /// they closed; User sees only their own purchases. Fetches full invoice data from
        /// ProxyPay per order (N+1 until ProxyPay ships a batch list endpoint — see
        /// <c>docs/PROXYPAY_FIXES_NEEDED.md</c> item 6), then applies keyword/status/date
        /// filters in memory, sorts by CreatedAt desc, and pages the result. Returns
        /// a result with an empty list when the caller has no valid role in the network.
        /// </summary>
        Task<InvoiceListPagedResult> SearchInvoicesAsync(InvoiceSearchParam param, long callerUserId, string token, CancellationToken ct = default);

        double GetBalance(long? networkId, long? userId);
        double GetAvailableBalance(long userId);

        /// <summary>
        /// Commission balance for a member in a single network: total (non-reversed paid),
        /// released (matured), and maturing (total − released). Callers must pass the
        /// session-derived <paramref name="userId"/>; never a client-supplied value.
        /// </summary>
        MemberBalanceInfo GetMemberBalance(long networkId, long userId);

        /// <summary>
        /// Network own-cut balance (rows with UserId IS NULL) for a single network.
        /// Same three sums as <see cref="GetMemberBalance"/>. Ownership (NetworkManager)
        /// must be verified by the caller before invoking.
        /// </summary>
        MemberBalanceInfo GetNetworkBalance(long networkId);
        Task<InvoiceInfo> GetInvoice(long networkId, long proxypayInvoiceId, CancellationToken ct = default);

        /// <summary>
        /// Returns all invoices tied to a given order. Today an order is 1:1 with a
        /// ProxyPay invoice (via <c>Order.ProxyPayInvoiceId</c>), so the list has 0 or 1
        /// items. Kept as a list so recurring subscriptions can grow without a contract change.
        /// Ordered by <see cref="InvoiceInfo.CreatedAt"/> descending. Never throws:
        /// on upstream ProxyPay failure the method logs and returns an empty list.
        /// </summary>
        Task<IList<InvoiceInfo>> ListInvoicesForOrderAsync(long networkId, long? proxyPayInvoiceId, CancellationToken ct = default);
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

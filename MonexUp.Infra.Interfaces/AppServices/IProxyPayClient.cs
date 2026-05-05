using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Infra.Interfaces.AppServices
{
    public class ProxyPayStoreCreatedInfo
    {
        public long StoreId { get; set; }
        public string ClientId { get; set; }
    }

    public class ProxyPayInvoiceStatusInfo
    {
        public long InvoiceId { get; set; }
        public long? StoreId { get; set; }
        public int Status { get; set; }
        public double Amount { get; set; }
        public double RefundedAmount { get; set; }
        public System.DateTime? PaidAt { get; set; }
        public System.DateTime? DueDate { get; set; }
        public string Url { get; set; }
    }

    public interface IProxyPayClient
    {
        /// <summary>
        /// Provisions a new ProxyPay store under the calling user's account.
        /// Authenticated with NAuth bearer (server-side only).
        /// </summary>
        Task<ProxyPayStoreCreatedInfo> InsertStoreAsync(string storeName, string email, string bearerToken, CancellationToken ct = default);

        /// <summary>
        /// Returns the authenticated user's existing ProxyPay store via GraphQL `myStore`.
        /// Returns null if no store exists.
        /// </summary>
        Task<ProxyPayStoreCreatedInfo> GetMyStoreAsync(string bearerToken, CancellationToken ct = default);

        /// <summary>
        /// Reads a single ProxyPay invoice. Anonymous; clientId in URL or query.
        /// </summary>
        Task<ProxyPayInvoiceStatusInfo> GetInvoiceAsync(long proxypayInvoiceId, string clientId, CancellationToken ct = default);

        /// <summary>
        /// Returns invoices on a store that are NOT yet in a terminal status.
        /// Used by the reconciliation poller. Implemented via GraphQL.
        /// </summary>
        Task<IList<ProxyPayInvoiceStatusInfo>> ListPendingInvoicesAsync(long storeId, CancellationToken ct = default);
    }
}

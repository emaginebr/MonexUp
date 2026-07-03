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

    public class ProxyPayInvoiceItemInfo
    {
        public long InvoiceItemId { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public double UnitPrice { get; set; }
        public double Discount { get; set; }
    }

    /// <summary>
    /// Full invoice payload from ProxyPay's `/Invoice/getById/{id}` endpoint.
    /// Distinct from `ProxyPayInvoiceStatusInfo` which is a light polling shape
    /// returned by `/Payment/qrcode/status/{id}`.
    /// </summary>
    public class ProxyPayFullInvoiceInfo
    {
        public long InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public string Notes { get; set; }
        public int Status { get; set; }
        public int PaymentMethod { get; set; }
        public double Discount { get; set; }
        public System.DateTime DueDate { get; set; }
        public System.DateTime? ExpiresAt { get; set; }
        public System.DateTime? PaidAt { get; set; }
        public System.DateTime CreatedAt { get; set; }
        public System.DateTime UpdatedAt { get; set; }
        public string ExternalCode { get; set; }
        public IList<ProxyPayInvoiceItemInfo> Items { get; set; }
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
        /// Reads the full invoice payload including items, invoice number,
        /// discount and dates. Hits ProxyPay's `/Invoice/getById/{id}`.
        /// Returns null when the invoice does not exist.
        /// </summary>
        Task<ProxyPayFullInvoiceInfo> GetFullInvoiceAsync(long proxypayInvoiceId, CancellationToken ct = default);

        /// <summary>
        /// Returns invoices on a store that are NOT yet in a terminal status.
        /// Used by the reconciliation poller. Implemented via GraphQL.
        /// </summary>
        Task<IList<ProxyPayInvoiceStatusInfo>> ListPendingInvoicesAsync(long storeId, CancellationToken ct = default);

        /// <summary>
        /// Sets (write-only) the AbacatePay API key on the given ProxyPay store.
        /// Authenticated with NAuth bearer (server-side only). Throws on non-success.
        /// </summary>
        Task SetAbacatePayApiKeyAsync(long storeId, string apiKey, string bearerToken, CancellationToken ct = default);

        /// <summary>
        /// Returns whether the authenticated user's ProxyPay store has an AbacatePay
        /// API key configured, via GraphQL `myStore { hasAbacatePayApiKey }`.
        /// Returns false on any failure.
        /// </summary>
        Task<bool> GetHasAbacatePayApiKeyAsync(string bearerToken, CancellationToken ct = default);

        /// <summary>
        /// Dev/test only: triggers ProxyPay's simulate-payment for an invoice so it
        /// flips to paid without a real transfer. Anonymous (tenant header). Throws on non-success.
        /// </summary>
        Task SimulatePaymentAsync(long proxypayInvoiceId, CancellationToken ct = default);
    }
}

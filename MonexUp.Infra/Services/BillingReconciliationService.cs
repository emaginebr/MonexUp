using DB.Infra.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.Infra.Interfaces.AppServices;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DB.Infra.Services
{
    public class BillingReconciliationService : IBillingReconciliationService
    {
        private const int STATUS_PAID = 3;
        private const int STATUS_REFUNDED = 6;

        // MonexUp order lifecycle (OrderStatusEnum): Incoming = 1, Active (paid) = 2.
        private const int ORDER_STATUS_INCOMING = 1;
        private const int ORDER_STATUS_ACTIVE = 2;

        private readonly MonexUpContext _context;
        private readonly IProxyPayClient _proxyPayClient;
        private readonly IBillingFeeService _billingFeeService;
        private readonly ILogger<BillingReconciliationService> _logger;

        public BillingReconciliationService(
            MonexUpContext context,
            IProxyPayClient proxyPayClient,
            IBillingFeeService billingFeeService,
            ILogger<BillingReconciliationService> logger)
        {
            _context = context;
            _proxyPayClient = proxyPayClient;
            _billingFeeService = billingFeeService;
            _logger = logger;
        }

        public async Task<ReconciliationOutcome> ReconcileAsync(CancellationToken ct = default)
        {
            var outcome = new ReconciliationOutcome();
            var networks = await _context.Networks
                .Where(n => n.ProxyPayStoreId != null)
                .Select(n => new { n.NetworkId, n.ProxyPayStoreId })
                .ToListAsync(ct);

            foreach (var net in networks)
            {
                outcome.NetworksScanned++;
                try
                {
                    var pendingInvoices = await _proxyPayClient.ListPendingInvoicesAsync(net.ProxyPayStoreId.Value, ct);
                    foreach (var inv in pendingInvoices)
                    {
                        outcome.InvoicesProcessed++;
                        var paidAmountCents = (long)Math.Round(inv.Amount * 100);

                        if (inv.Status == STATUS_PAID)
                        {
                            var existing = await _context.InvoiceFees
                                .AnyAsync(x => x.ProxyPayInvoiceId == inv.InvoiceId, ct);
                            if (!existing)
                            {
                                outcome.FeesRecorded += _billingFeeService.RecordPaidProxyPayInvoice(
                                    inv.InvoiceId, net.NetworkId, paidAmountCents, inv.PaidAt ?? DateTime.UtcNow);
                            }

                            // Backstop for the browser-closed case: advance the order to
                            // Active (paid). Idempotent — only touches Incoming orders.
                            var order = await _context.Orders
                                .FirstOrDefaultAsync(o => o.ProxyPayInvoiceId == inv.InvoiceId, ct);
                            if (order == null)
                            {
                                _logger.LogWarning(
                                    "Paid ProxyPay invoice {InvoiceId} (store {StoreId}) has no matching MonexUp order.",
                                    inv.InvoiceId, net.ProxyPayStoreId);
                            }
                            else if (order.Status == ORDER_STATUS_INCOMING)
                            {
                                order.Status = ORDER_STATUS_ACTIVE;
                                order.UpdatedAt = DateTime.Now;
                                await _context.SaveChangesAsync(ct);
                                outcome.OrdersMarkedPaid++;
                            }
                        }
                        else if (inv.Status == STATUS_REFUNDED)
                        {
                            var refundedCents = (long)Math.Round(inv.RefundedAmount * 100);
                            if (refundedCents > 0)
                            {
                                outcome.FeesReversed += _billingFeeService.ReverseProxyPayInvoice(
                                    inv.InvoiceId, refundedCents, paidAmountCents);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    outcome.Errors++;
                    _logger.LogError(ex, "Reconciliation failed for network {NetworkId} store {StoreId}", net.NetworkId, net.ProxyPayStoreId);
                }
            }

            _logger.LogInformation(
                "ProxyPay reconciliation: networks={Networks} invoices={Invoices} recorded={Recorded} reversed={Reversed} ordersPaid={OrdersPaid} errors={Errors}",
                outcome.NetworksScanned, outcome.InvoicesProcessed, outcome.FeesRecorded, outcome.FeesReversed, outcome.OrdersMarkedPaid, outcome.Errors);

            return outcome;
        }
    }
}

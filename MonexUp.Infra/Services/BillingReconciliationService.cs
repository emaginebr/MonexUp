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
                "ProxyPay reconciliation: networks={Networks} invoices={Invoices} recorded={Recorded} reversed={Reversed} errors={Errors}",
                outcome.NetworksScanned, outcome.InvoicesProcessed, outcome.FeesRecorded, outcome.FeesReversed, outcome.Errors);

            return outcome;
        }
    }
}

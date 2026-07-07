using DB.Infra.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using Npgsql;
using System;
using System.Linq;

namespace DB.Infra.Services
{
    public class BillingFeeService : IBillingFeeService
    {
        private const double PLATAFORM_FEE = 0.05;

        private readonly MonexUpContext _context;
        private readonly INetworkDomainFactory _networkFactory;
        private readonly ILogger<BillingFeeService> _logger;

        public BillingFeeService(MonexUpContext context, INetworkDomainFactory networkFactory, ILogger<BillingFeeService> logger)
        {
            _context = context;
            _networkFactory = networkFactory;
            _logger = logger;
        }

        public int RecordPaidProxyPayInvoice(long proxypayInvoiceId, long networkId, long paidAmountCents, DateTime paidAt)
        {
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null) return 0;

            var order = _context.Orders.FirstOrDefault(x => x.ProxyPayInvoiceId == proxypayInvoiceId);

            // Authoritative commission base = the order's charged total. The ProxyPay
            // invoice amount can arrive as 0 in the status-poll path, which would mint
            // amount=0 fee rows; fall back to the order total in that case.
            var effectiveCents = paidAmountCents;
            if (effectiveCents <= 0 && order != null)
            {
                var orderTotal = _context.OrderItems
                    .Where(oi => oi.OrderId == order.OrderId)
                    .Sum(oi => (oi.Amount ?? 0m) * oi.Quantity);
                effectiveCents = (long)Math.Round(orderTotal * 100m);
            }

            if (effectiveCents <= 0)
            {
                // No positive paid amount → there is no commission to record. Never
                // create amount=0 fee rows.
                _logger.LogWarning(
                    "Commission skipped: no positive paid amount for invoice {InvoiceId} (network {NetworkId}, paidAmountCents={PaidAmountCents}).",
                    proxypayInvoiceId, networkId, paidAmountCents);
                return 0;
            }

            var paidAmount = effectiveCents / 100.0;
            var paidAtUnspec = DateTime.SpecifyKind(paidAt, DateTimeKind.Unspecified);
            var withdrawalDue = DateTime.SpecifyKind(paidAt.Date.AddDays(network.WithdrawalPeriod), DateTimeKind.Unspecified);
            var inserted = 0;

            if (network.Plan == MonexUp.DTO.Network.NetworkPlanEnum.Free)
            {
                inserted += InsertFeeIfAbsent(
                    proxypayInvoiceId,
                    networkId: null,
                    userId: null,
                    role: null,
                    amount: Math.Round(paidAmount * PLATAFORM_FEE, 2),
                    paidAmountCents: effectiveCents,
                    paidAt: paidAtUnspec,
                    withdrawalDueDate: withdrawalDue);
            }

            if (network.Commission > 0)
            {
                inserted += InsertFeeIfAbsent(
                    proxypayInvoiceId,
                    networkId: networkId,
                    userId: null,
                    role: null,
                    amount: Math.Round(paidAmount * (network.Commission / 100.0), 2),
                    paidAmountCents: effectiveCents,
                    paidAt: paidAtUnspec,
                    withdrawalDueDate: withdrawalDue);
            }

            if (order != null && order.SellerId.HasValue && order.SellerId.Value > 0)
            {
                var profile = _context.UserNetworks
                    .Where(un => un.NetworkId == networkId && un.UserId == order.SellerId.Value)
                    .Select(un => un.Profile)
                    .FirstOrDefault();
                if (profile != null && profile.Commission > 0)
                {
                    inserted += InsertFeeIfAbsent(
                        proxypayInvoiceId,
                        networkId: null,
                        userId: order.SellerId.Value,
                        role: null,
                        amount: Math.Round(paidAmount * (profile.Commission / 100.0), 2),
                        paidAmountCents: effectiveCents,
                        paidAt: paidAtUnspec,
                        withdrawalDueDate: withdrawalDue);
                }
            }

            return inserted;
        }

        public int ReverseProxyPayInvoice(long proxypayInvoiceId, long refundedAmountCents, long originalPaidAmountCents)
        {
            if (originalPaidAmountCents <= 0) return 0;
            var nowUnspec = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

            if (refundedAmountCents >= originalPaidAmountCents)
            {
                return _context.Database.ExecuteSqlInterpolated(
                    $@"UPDATE monexup_invoice_fees
                       SET reversed_at = {nowUnspec}
                       WHERE proxypay_invoice_id = {proxypayInvoiceId} AND reversed_at IS NULL");
            }

            var factor = (double)refundedAmountCents / (double)originalPaidAmountCents;
            return _context.Database.ExecuteSqlInterpolated(
                $@"INSERT INTO monexup_invoice_fees
                       (proxypay_invoice_id, network_id, user_id, role, amount, paid_amount_cents_at_record, paid_at, withdrawal_due_date, reversed_at)
                   SELECT proxypay_invoice_id, network_id, user_id, role,
                          ROUND((-amount * {factor})::numeric, 2),
                          paid_amount_cents_at_record, paid_at, withdrawal_due_date, {nowUnspec}
                   FROM monexup_invoice_fees
                   WHERE proxypay_invoice_id = {proxypayInvoiceId} AND reversed_at IS NULL");
        }

        private int InsertFeeIfAbsent(long proxypayInvoiceId, long? networkId, long? userId, int? role, double amount, long paidAmountCents, DateTime paidAt, DateTime withdrawalDueDate)
        {
            // Never mint a zero (or negative) commission row. A fee that computes to 0
            // (no percentage, or an amount too small to round to a cent) is simply "no
            // commission" and must not create a ledger entry.
            if (amount <= 0)
            {
                return 0;
            }

            var row = new InvoiceFee
            {
                ProxyPayInvoiceId = proxypayInvoiceId,
                NetworkId = networkId,
                UserId = userId,
                Role = role,
                Amount = amount,
                PaidAmountCentsAtRecord = paidAmountCents,
                PaidAt = paidAt,
                WithdrawalDueDate = withdrawalDueDate
            };
            try
            {
                _context.Add(row);
                _context.SaveChanges();
                return 1;
            }
            catch (DbUpdateException ex)
            {
                // Detach the failed row so a subsequent SaveChanges (the next fee) isn't
                // re-attempted against the broken entity and cascade-fail.
                _context.Entry(row).State = EntityState.Detached;

                // A unique-index violation (23505) is the expected idempotency signal:
                // this fee was already recorded for (invoice, user, role). Anything else is
                // a real failure (schema drift, FK, connectivity) that must NOT be swallowed
                // silently — otherwise commissions vanish with no trace.
                if (ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation)
                {
                    return 0;
                }

                _logger.LogError(ex,
                    "Failed to record commission fee row. proxypayInvoiceId={InvoiceId}, networkId={NetworkId}, userId={UserId}, role={Role}, amount={Amount}.",
                    proxypayInvoiceId, networkId, userId, role, amount);
                return 0;
            }
        }
    }
}

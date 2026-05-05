using DB.Infra.Context;
using Microsoft.EntityFrameworkCore;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using System;

namespace DB.Infra.Services
{
    public class BillingFeeService : IBillingFeeService
    {
        private const double PLATAFORM_FEE = 0.05;

        private readonly MonexUpContext _context;
        private readonly INetworkDomainFactory _networkFactory;

        public BillingFeeService(MonexUpContext context, INetworkDomainFactory networkFactory)
        {
            _context = context;
            _networkFactory = networkFactory;
        }

        public int RecordPaidProxyPayInvoice(long proxypayInvoiceId, long networkId, long paidAmountCents, DateTime paidAt)
        {
            var network = _networkFactory.BuildNetworkModel().GetById(networkId, _networkFactory);
            if (network == null) return 0;

            var paidAmount = paidAmountCents / 100.0;
            var paidAtUnspec = DateTime.SpecifyKind(paidAt, DateTimeKind.Unspecified);
            var inserted = 0;

            if (network.Plan == MonexUp.DTO.Network.NetworkPlanEnum.Free)
            {
                inserted += InsertFeeIfAbsent(
                    proxypayInvoiceId,
                    networkId: null,
                    userId: null,
                    role: null,
                    amount: Math.Round(paidAmount * PLATAFORM_FEE, 2),
                    paidAmountCents: paidAmountCents,
                    paidAt: paidAtUnspec);
            }

            if (network.Commission > 0)
            {
                inserted += InsertFeeIfAbsent(
                    proxypayInvoiceId,
                    networkId: networkId,
                    userId: null,
                    role: null,
                    amount: Math.Round(paidAmount * (network.Commission / 100.0), 2),
                    paidAmountCents: paidAmountCents,
                    paidAt: paidAtUnspec);
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
                       (proxypay_invoice_id, network_id, user_id, role, amount, paid_amount_cents_at_record, paid_at, reversed_at)
                   SELECT proxypay_invoice_id, network_id, user_id, role,
                          ROUND((-amount * {factor})::numeric, 2),
                          paid_amount_cents_at_record, paid_at, {nowUnspec}
                   FROM monexup_invoice_fees
                   WHERE proxypay_invoice_id = {proxypayInvoiceId} AND reversed_at IS NULL");
        }

        private int InsertFeeIfAbsent(long proxypayInvoiceId, long? networkId, long? userId, int? role, double amount, long paidAmountCents, DateTime paidAt)
        {
            try
            {
                var row = new InvoiceFee
                {
                    ProxyPayInvoiceId = proxypayInvoiceId,
                    NetworkId = networkId,
                    UserId = userId,
                    Role = role,
                    Amount = amount,
                    PaidAmountCentsAtRecord = paidAmountCents,
                    PaidAt = paidAt
                };
                _context.Add(row);
                _context.SaveChanges();
                return 1;
            }
            catch (DbUpdateException)
            {
                return 0;
            }
        }
    }
}

using Core.Domain.Repository;
using DB.Infra.Context;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DB.Infra.Repository
{
    public class InvoiceFeeRepository : IInvoiceFeeRepository<IInvoiceFeeModel, IInvoiceFeeDomainFactory>
    {
        private MonexUpContext _ccsContext;

        private const int PAGE_SIZE = 15;

        public InvoiceFeeRepository(MonexUpContext ccsContext)
        {
            _ccsContext = ccsContext;
        }

        private IInvoiceFeeModel DbToModel(IInvoiceFeeDomainFactory factory, InvoiceFee row)
        {
            var md = factory.BuildInvoiceFeeModel();
            md.FeeId = row.FeeId;
            md.ProxyPayInvoiceId = row.ProxyPayInvoiceId;
            md.NetworkId = row.NetworkId;
            md.UserId = row.UserId;
            md.Amount = row.Amount;
            md.PaidAt = row.PaidAt;
            md.WithdrawalDueDate = row.WithdrawalDueDate;
            md.ReversedAt = row.ReversedAt;
            return md;
        }

        private void ModelToDb(IInvoiceFeeModel md, InvoiceFee row)
        {
            row.FeeId = md.FeeId;
            row.ProxyPayInvoiceId = md.ProxyPayInvoiceId;
            row.NetworkId = md.NetworkId;
            row.UserId = md.UserId;
            row.Amount = md.Amount;
            row.PaidAt = md.PaidAt;
            row.WithdrawalDueDate = md.WithdrawalDueDate;
        }

        public IInvoiceFeeModel Insert(IInvoiceFeeModel model, IInvoiceFeeDomainFactory factory)
        {
            var row = new InvoiceFee();
            ModelToDb(model, row);
            _ccsContext.Add(row);
            _ccsContext.SaveChanges();
            model.FeeId = row.FeeId;
            return model;
        }

        public IEnumerable<IInvoiceFeeModel> Search(long? networkId, long? userId, DateTime? ini, DateTime? end, int pageNum, out int pageCount, IInvoiceFeeDomainFactory factory)
        {
            var q = _ccsContext.InvoiceFees.AsQueryable();
            if (networkId.HasValue && networkId.Value > 0)
            {
                q = q.Where(x => x.NetworkId == networkId.Value);
            }
            if (userId.HasValue && userId.Value > 0)
            {
                q = q.Where(x => x.UserId == userId.Value);
            }
            else
            {
                // Own-cut scope (network manager view): rows with no recipient member.
                // Callers now always pass either a positive member id or null (own-cut);
                // this prevents a manager statement from leaking members' rows.
                q = q.Where(x => x.UserId == null);
            }
            if (ini.HasValue && end.HasValue)
            {
                q = q.Where(x => x.PaidAt >= ini.Value && x.PaidAt <= end.Value);
            }
            else if (ini.HasValue)
            {
                q = q.Where(x => x.PaidAt >= ini.Value);
            }
            else if (end.HasValue)
            {
                q = q.Where(x => x.PaidAt <= end.Value);
            }
            q = q.OrderByDescending(x => x.PaidAt);
            var pages = (double)q.Count() / (double)PAGE_SIZE;
            pageCount = Convert.ToInt32(Math.Ceiling(pages));
            var rows = q.Skip((pageNum - 1) * PAGE_SIZE).Take(PAGE_SIZE).ToList();
            return rows.Select(x => DbToModel(factory, x));
        }

        public double GetBalance(long? networkId, long? userId)
        {
            // Fix: previously filtered `!x.PaidAt.HasValue`, which always summed ~0
            // because every real fee row is written with PaidAt set. A commission
            // counts toward the balance once it is paid and not reversed.
            var q = _ccsContext.InvoiceFees.Where(x => x.PaidAt.HasValue && !x.ReversedAt.HasValue);
            if (networkId.HasValue)
            {
                q = q.Where(x => x.NetworkId == networkId.Value);
            }
            if (userId.HasValue)
            {
                q = q.Where(x => x.UserId == userId.Value);
            }
            if (!networkId.HasValue && !userId.HasValue)
            {
                q = q.Where(x => !x.NetworkId.HasValue && !x.UserId.HasValue);
            }
            return q.Sum(x => x.Amount);
        }

        /// <summary>
        /// Σ amount of non-reversed, paid commissions scoped by network/recipient.
        /// Member view: pass a positive <paramref name="userId"/>. Network own-cut view
        /// (manager): pass <paramref name="userId"/> = null → only rows with UserId IS NULL.
        /// </summary>
        public double GetTotalBalance(long? networkId, long? userId)
        {
            return ScopedBalanceQuery(networkId, userId).Sum(x => x.Amount);
        }

        /// <summary>
        /// Released (withdrawable) portion of <see cref="GetTotalBalance"/>: same scope,
        /// additionally matured (WithdrawalDueDate set and &lt;= today).
        /// </summary>
        public double GetReleasedBalance(long? networkId, long? userId)
        {
            var today = DateTime.Today;
            return ScopedBalanceQuery(networkId, userId)
                .Where(x => x.WithdrawalDueDate.HasValue && x.WithdrawalDueDate.Value <= today)
                .Sum(x => x.Amount);
        }

        private IQueryable<InvoiceFee> ScopedBalanceQuery(long? networkId, long? userId)
        {
            var q = _ccsContext.InvoiceFees.Where(x => x.PaidAt.HasValue && !x.ReversedAt.HasValue);
            if (networkId.HasValue && networkId.Value > 0)
            {
                q = q.Where(x => x.NetworkId == networkId.Value);
            }
            if (userId.HasValue && userId.Value > 0)
            {
                q = q.Where(x => x.UserId == userId.Value);
            }
            else
            {
                // Own-cut scope: network's own commission rows have no recipient member.
                q = q.Where(x => x.UserId == null);
            }
            return q;
        }

        public double GetAvailableBalance(long userId)
        {
            var today = DateTime.Today;
            return _ccsContext
                .InvoiceFees
                .Where(x => x.UserId == userId
                    && x.PaidAt.HasValue
                    && !x.ReversedAt.HasValue
                    && x.WithdrawalDueDate.HasValue
                    && x.WithdrawalDueDate.Value <= today)
                .Sum(x => x.Amount);
        }
    }
}

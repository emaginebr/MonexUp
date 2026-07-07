using DB.Infra.Context;
using DB.Infra.Repository;
using Microsoft.EntityFrameworkCore;

namespace MonexUp.UnitTests.Repository
{
    /// <summary>
    /// Repository-level coverage for the Commission Ledger balance math (feature 011).
    /// The sums are pure EF LINQ (GetTotalBalance / GetReleasedBalance / GetBalance),
    /// so they are exercised against an in-memory MonexUpContext to assert the real
    /// filtering: non-reversed-and-paid, maturity split, and (network,user) scoping.
    /// This also pins the GetBalance predicate-bug regression (old `!PaidAt` filter
    /// summed ~0).
    /// </summary>
    public class InvoiceFeeRepositoryTests
    {
        private static MonexUpContext NewContext()
        {
            var options = new DbContextOptionsBuilder<MonexUpContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new MonexUpContext(options);
        }

        private static InvoiceFee Row(
            long feeId,
            long? networkId,
            long? userId,
            double amount,
            DateTime? paidAt,
            DateTime? withdrawalDue = null,
            DateTime? reversedAt = null)
        {
            return new InvoiceFee
            {
                FeeId = feeId,
                ProxyPayInvoiceId = feeId, // any non-null source id
                NetworkId = networkId,
                UserId = userId,
                Amount = amount,
                PaidAt = paidAt,
                WithdrawalDueDate = withdrawalDue,
                ReversedAt = reversedAt
            };
        }

        private static MonexUpContext SeededContext(params InvoiceFee[] rows)
        {
            var ctx = NewContext();
            ctx.InvoiceFees.AddRange(rows);
            ctx.SaveChanges();
            return ctx;
        }

        // ---- GetTotalBalance ----

        [Fact]
        public void GetTotalBalance_SumsNonReversedPaidRows_ForMember()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid),
                Row(3, networkId: 1, userId: 7, amount: 30, paidAt: paid));
            var repo = new InvoiceFeeRepository(ctx);

            var total = repo.GetTotalBalance(1, 7);

            Assert.Equal(60, total);
        }

        [Fact]
        public void GetTotalBalance_ExcludesReversedRow()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid),
                Row(3, networkId: 1, userId: 7, amount: 30, paidAt: paid),
                // Reversed row must NOT count toward the balance.
                Row(4, networkId: 1, userId: 7, amount: 40, paidAt: paid, reversedAt: DateTime.Today));
            var repo = new InvoiceFeeRepository(ctx);

            Assert.Equal(60, repo.GetTotalBalance(1, 7));
        }

        [Fact]
        public void GetTotalBalance_ExcludesUnpaidRow()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: 7, amount: 50, paidAt: null)); // not yet paid
            var repo = new InvoiceFeeRepository(ctx);

            Assert.Equal(10, repo.GetTotalBalance(1, 7));
        }

        // ---- GetReleasedBalance + maturing complement ----

        [Fact]
        public void GetReleasedBalance_CountsOnlyMaturedRows_AndMaturingIsComplement()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                // Matured: withdrawal due in the past → released.
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(-1)),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid, withdrawalDue: DateTime.Today),
                // Not matured: due in the future → maturing.
                Row(3, networkId: 1, userId: 7, amount: 30, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(10)));
            var repo = new InvoiceFeeRepository(ctx);

            var total = repo.GetTotalBalance(1, 7);
            var released = repo.GetReleasedBalance(1, 7);

            Assert.Equal(60, total);
            Assert.Equal(30, released);          // 10 + 20 matured (due <= today)
            Assert.Equal(30, total - released);  // maturing = 30 (future)
        }

        [Fact]
        public void GetReleasedBalance_ExcludesReversedEvenIfMatured()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(-1)),
                // Matured but reversed → not released.
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: DateTime.Today));
            var repo = new InvoiceFeeRepository(ctx);

            Assert.Equal(10, repo.GetReleasedBalance(1, 7));
        }

        // ---- GetBalance predicate-bug regression ----

        [Fact]
        public void GetBalance_ReturnsNonZeroSumForPaidRows_RegressionOnOldNotPaidPredicate()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid),
                Row(3, networkId: 1, userId: 7, amount: 30, paidAt: paid),
                // Unpaid + reversed rows must be excluded.
                Row(4, networkId: 1, userId: 7, amount: 99, paidAt: null),
                Row(5, networkId: 1, userId: 7, amount: 99, paidAt: paid, reversedAt: DateTime.Today));
            var repo = new InvoiceFeeRepository(ctx);

            var balance = repo.GetBalance(1, 7);

            // Old bug filtered `!PaidAt.HasValue`, which summed ~0. Guard: paid rows sum > 0.
            Assert.True(balance > 0, "GetBalance must sum paid, non-reversed rows (predicate-bug regression)");
            Assert.Equal(60, balance);
        }

        // ---- Scoping: member vs network own-cut ----

        [Fact]
        public void GetTotalBalance_MemberScope_DoesNotLeakNetworkOwnCutRows()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                // Member 7 rows.
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid),
                // Network own-cut rows (UserId IS NULL) in the same network.
                Row(3, networkId: 1, userId: null, amount: 500, paidAt: paid),
                // Another member's rows.
                Row(4, networkId: 1, userId: 8, amount: 777, paidAt: paid));
            var repo = new InvoiceFeeRepository(ctx);

            // Member scope: only user 7's rows.
            Assert.Equal(30, repo.GetTotalBalance(1, 7));
        }

        [Fact]
        public void GetTotalBalance_NetworkOwnCutScope_UsesUserIdNullRowsOnly()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid),
                Row(2, networkId: 1, userId: null, amount: 300, paidAt: paid),
                Row(3, networkId: 1, userId: null, amount: 200, paidAt: paid));
            var repo = new InvoiceFeeRepository(ctx);

            // userId == null → own-cut view: only the UserId IS NULL rows.
            Assert.Equal(500, repo.GetTotalBalance(1, null));
        }

        [Fact]
        public void GetAvailableBalance_SumsMaturedNonReversedForUser()
        {
            var paid = DateTime.Today.AddDays(-10);
            using var ctx = SeededContext(
                Row(1, networkId: 1, userId: 7, amount: 10, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(-1)),
                Row(2, networkId: 1, userId: 7, amount: 20, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(5)),
                Row(3, networkId: 1, userId: 7, amount: 40, paidAt: paid, withdrawalDue: DateTime.Today.AddDays(-1), reversedAt: DateTime.Today));
            var repo = new InvoiceFeeRepository(ctx);

            // Only row 1: matured, non-reversed.
            Assert.Equal(10, repo.GetAvailableBalance(7));
        }
    }
}

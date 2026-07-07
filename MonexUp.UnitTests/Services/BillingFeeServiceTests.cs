using DB.Infra.Context;
using DB.Infra.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.Network;

namespace MonexUp.UnitTests.Services
{
    /// <summary>
    /// Verification tests for the commission generation path
    /// (BillingFeeService.RecordPaidProxyPayInvoice) — feature 011 T017, FR-001/003/004.
    /// The network lookup goes through the mocked INetworkDomainFactory; the order,
    /// user-network and fee writes go through an in-memory MonexUpContext.
    ///
    /// KNOWN UNIT-LEVEL LIMITS (asserted at integration only — see file end):
    ///  - Idempotency depends on the Postgres unique index (proxypay_invoice_id,user_id,role);
    ///    the EF InMemory provider does not enforce unique indexes.
    ///  - ReverseProxyPayInvoice uses raw SQL (ExecuteSqlInterpolated), unsupported by InMemory.
    /// </summary>
    public class BillingFeeServiceTests
    {
        private static MonexUpContext NewContext()
        {
            var options = new DbContextOptionsBuilder<MonexUpContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new MonexUpContext(options);
        }

        private static Mock<INetworkDomainFactory> NetworkFactoryReturning(
            long networkId, NetworkPlanEnum plan, double commission, int withdrawalPeriod)
        {
            var network = new Mock<INetworkModel>();
            network.SetupGet(m => m.Plan).Returns(plan);
            network.SetupGet(m => m.Commission).Returns(commission);
            network.SetupGet(m => m.WithdrawalPeriod).Returns(withdrawalPeriod);

            var factory = new Mock<INetworkDomainFactory>();
            factory.Setup(f => f.BuildNetworkModel()).Returns(network.Object);
            network.Setup(m => m.GetById(networkId, factory.Object)).Returns(network.Object);
            return factory;
        }

        // ---- FR-003: seller commission = profile.Commission% x paid amount ----

        [Fact]
        public void RecordPaidProxyPayInvoice_SellerCommission_IsProfilePercentOfPaidAmount()
        {
            const long networkId = 1;
            const long sellerId = 55;
            const long invoiceId = 9001;

            using var ctx = NewContext();
            // Order links the paid invoice to a seller.
            ctx.Orders.Add(new Order
            {
                OrderId = 1,
                NetworkId = networkId,
                UserId = 200,
                SellerId = sellerId,
                ProxyPayInvoiceId = invoiceId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            // Seller's profile carries a 10% commission.
            var profile = new UserProfile { ProfileId = 10, NetworkId = networkId, Name = "Vendedor", Commission = 10, Level = 2 };
            ctx.UserProfiles.Add(profile);
            ctx.UserNetworks.Add(new UserNetwork
            {
                UserId = sellerId,
                NetworkId = networkId,
                ProfileId = profile.ProfileId,
                Profile = profile,
                Role = 2
            });
            ctx.SaveChanges();

            // Standard plan (no platform fee) + network commission 0 → isolate the seller row.
            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 0, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            // 10000 cents = 100.00 paid → 10% = 10.00.
            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            Assert.Equal(1, inserted);
            var sellerFee = Assert.Single(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
            Assert.Equal(10.0, sellerFee.Amount);
            Assert.Equal(invoiceId, sellerFee.ProxyPayInvoiceId);
            Assert.NotNull(sellerFee.PaidAt);
            Assert.NotNull(sellerFee.WithdrawalDueDate);
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_WithdrawalDueDate_IsPaidDatePlusNetworkPeriod()
        {
            const long networkId = 1;
            const long sellerId = 55;
            const long invoiceId = 9002;
            var paidAt = new DateTime(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);

            using var ctx = NewContext();
            ctx.Orders.Add(new Order { OrderId = 1, NetworkId = networkId, UserId = 200, SellerId = sellerId, ProxyPayInvoiceId = invoiceId, CreatedAt = paidAt, UpdatedAt = paidAt });
            var profile = new UserProfile { ProfileId = 10, NetworkId = networkId, Name = "Vendedor", Commission = 10, Level = 2 };
            ctx.UserProfiles.Add(profile);
            ctx.UserNetworks.Add(new UserNetwork { UserId = sellerId, NetworkId = networkId, ProfileId = profile.ProfileId, Profile = profile, Role = 2 });
            ctx.SaveChanges();

            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 0, withdrawalPeriod: 15);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: paidAt);

            var sellerFee = ctx.InvoiceFees.Single(f => f.UserId == sellerId);
            Assert.Equal(paidAt.Date.AddDays(15), sellerFee.WithdrawalDueDate);
        }

        // ---- FR-001: platform fee (Free plan) + network own-cut rows ----

        [Fact]
        public void RecordPaidProxyPayInvoice_FreePlan_WritesPlatformFeeAndNetworkCut()
        {
            const long networkId = 1;
            const long invoiceId = 9003;

            using var ctx = NewContext();
            // No order/seller → only platform fee + network cut are produced.
            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Free, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            Assert.Equal(2, inserted);

            // Platform fee: NetworkId NULL + UserId NULL, 5% of 100 = 5.
            var platformFee = Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == null && f.UserId == null).ToList());
            Assert.Equal(5.0, platformFee.Amount);

            // Network own-cut: NetworkId set + UserId NULL, 20% of 100 = 20.
            var networkCut = Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            Assert.Equal(20.0, networkCut.Amount);
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_StandardPlan_NoPlatformFee()
        {
            const long networkId = 1;
            const long invoiceId = 9004;

            using var ctx = NewContext();
            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            // Only the network cut, no platform (5%) row.
            Assert.Empty(ctx.InvoiceFees.Where(f => f.NetworkId == null && f.UserId == null).ToList());
            Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_UnknownNetwork_WritesNothing()
        {
            const long networkId = 1;
            using var ctx = NewContext();
            var network = new Mock<INetworkModel>();
            var factory = new Mock<INetworkDomainFactory>();
            factory.Setup(f => f.BuildNetworkModel()).Returns(network.Object);
            network.Setup(m => m.GetById(networkId, factory.Object)).Returns((INetworkModel)null!);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(9005, networkId, 10000, DateTime.UtcNow);

            Assert.Equal(0, inserted);
            Assert.Empty(ctx.InvoiceFees.ToList());
        }

        // ---- Store(network) cut + seller commission MUST both be created ----

        /// <summary>
        /// Seeds an order/seller with a commissioned profile AND a network whose own
        /// Commission > 0, on a Standard plan (no platform fee). A single paid sale must
        /// produce BOTH rows: the network/store cut (UserId NULL) and the seller row.
        /// </summary>
        private static (long networkId, long sellerId, long invoiceId) SeedOrderWithSeller(
            MonexUpContext ctx, double sellerCommission)
        {
            const long networkId = 1;
            const long sellerId = 55;
            const long invoiceId = 9100;

            ctx.Orders.Add(new Order
            {
                OrderId = 1,
                NetworkId = networkId,
                UserId = 200,
                SellerId = sellerId,
                ProxyPayInvoiceId = invoiceId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            var profile = new UserProfile { ProfileId = 10, NetworkId = networkId, Name = "Vendedor", Commission = sellerCommission, Level = 2 };
            ctx.UserProfiles.Add(profile);
            ctx.UserNetworks.Add(new UserNetwork
            {
                UserId = sellerId,
                NetworkId = networkId,
                ProfileId = profile.ProfileId,
                Profile = profile,
                Role = 2
            });
            ctx.SaveChanges();
            return (networkId, sellerId, invoiceId);
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_PaidSale_CreatesBothStoreCutAndSellerRows()
        {
            using var ctx = NewContext();
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 10);

            // Standard plan (no platform fee) + network commission 20% + seller 10%.
            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            // 10000 cents = 100.00 paid → store 20%=20.00, seller 10%=10.00.
            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            Assert.Equal(2, inserted);

            // Network/store cut: NetworkId set + UserId NULL, 20% of 100 = 20.
            var storeCut = Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            Assert.Equal(20.0, storeCut.Amount);
            Assert.Equal(invoiceId, storeCut.ProxyPayInvoiceId);

            // Seller row: UserId == seller, 10% of 100 = 10.
            var sellerFee = Assert.Single(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
            Assert.Equal(10.0, sellerFee.Amount);
            Assert.Equal(invoiceId, sellerFee.ProxyPayInvoiceId);

            // No platform fee row on a Standard plan.
            Assert.Empty(ctx.InvoiceFees.Where(f => f.NetworkId == null && f.UserId == null).ToList());
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_SellerZeroCommission_WritesStoreCutButNoSellerRow()
        {
            using var ctx = NewContext();
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 0);

            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            // Only the store cut — a 0% seller profile produces no seller row.
            Assert.Equal(1, inserted);
            Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            Assert.Empty(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_NetworkZeroCommission_WritesSellerRowButNoStoreCut()
        {
            using var ctx = NewContext();
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 10);

            // network Commission == 0 → no store cut, but seller still earns.
            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 0, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 10000, paidAt: DateTime.UtcNow);

            Assert.Equal(1, inserted);
            Assert.Empty(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            var sellerFee = Assert.Single(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
            Assert.Equal(10.0, sellerFee.Amount);
        }

        // ---- Zero-amount fix: never mint amount=0 commission rows ----

        [Fact]
        public void RecordPaidProxyPayInvoice_ZeroPaidAmountAndNoOrderTotal_CreatesNoRows()
        {
            using var ctx = NewContext();
            // Commissioned seller profile (10%) AND a network cut (20%) are configured,
            // but the ProxyPay poll path reports paidAmountCents=0 and the order carries
            // NO items → there is no positive base from either source.
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 10);

            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 0, paidAt: DateTime.UtcNow);

            // No commission to record → zero rows, not a single amount=0 ledger entry.
            Assert.Equal(0, inserted);
            Assert.Empty(ctx.InvoiceFees.ToList());
            Assert.DoesNotContain(ctx.InvoiceFees.ToList(), f => f.Amount == 0);
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_ZeroPaidAmountButOrderTotalPositive_UsesOrderTotal()
        {
            using var ctx = NewContext();
            // paidAmountCents=0 (status-poll path), but the order total is authoritative:
            // 2 x 100.00 = 200.00 → effectiveCents = 20000.
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 10);
            ctx.OrderItems.Add(new OrderItem { ItemId = 1, OrderId = 1, ProductId = 1, Quantity = 2, Amount = 100.00m });
            ctx.SaveChanges();

            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 20, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 0, paidAt: DateTime.UtcNow);

            Assert.Equal(2, inserted);

            // Store/network cut: 20% of 200.00 = 40.00, base recorded = 20000 cents.
            var storeCut = Assert.Single(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            Assert.Equal(40.0, storeCut.Amount);
            Assert.Equal(20000, storeCut.PaidAmountCentsAtRecord);

            // Seller row: 10% of 200.00 = 20.00, base recorded = 20000 cents.
            var sellerFee = Assert.Single(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
            Assert.Equal(20.0, sellerFee.Amount);
            Assert.Equal(20000, sellerFee.PaidAmountCentsAtRecord);

            // No amount=0 row ever surfaces.
            Assert.DoesNotContain(ctx.InvoiceFees.ToList(), f => f.Amount == 0);
        }

        [Fact]
        public void RecordPaidProxyPayInvoice_FeeRoundsToZero_SkipsThatRow()
        {
            using var ctx = NewContext();
            // Tiny sale: 0.01 paid. The network cut (1%) is 0.0001 → rounds to 0.00 and
            // must be skipped, while the seller cut (60%) is 0.006 → rounds to 0.01 > 0.
            var (networkId, sellerId, invoiceId) = SeedOrderWithSeller(ctx, sellerCommission: 60);

            var factory = NetworkFactoryReturning(networkId, NetworkPlanEnum.Standard, commission: 1, withdrawalPeriod: 30);
            var sut = new BillingFeeService(ctx, factory.Object, NullLogger<BillingFeeService>.Instance);

            var inserted = sut.RecordPaidProxyPayInvoice(invoiceId, networkId, paidAmountCents: 1, paidAt: DateTime.UtcNow);

            // Only the seller row survives; the store cut that rounds to 0.00 is not created.
            Assert.Equal(1, inserted);
            Assert.Empty(ctx.InvoiceFees.Where(f => f.NetworkId == networkId && f.UserId == null).ToList());
            var sellerFee = Assert.Single(ctx.InvoiceFees.Where(f => f.UserId == sellerId).ToList());
            Assert.Equal(0.01, sellerFee.Amount);

            // No amount=0 row ever surfaces.
            Assert.DoesNotContain(ctx.InvoiceFees.ToList(), f => f.Amount == 0);
        }

        // ---- FR-004: idempotency — INTEGRATION ONLY ----

        [Fact(Skip = "Idempotency is enforced by the Postgres unique index (proxypay_invoice_id,user_id,role) " +
                     "which the EF InMemory provider does not honor. RecordPaidProxyPayInvoice relies on " +
                     "InsertFeeIfAbsent swallowing DbUpdateException on the duplicate; this must be verified " +
                     "against a real Postgres (T008 integration / DB-backed test), not a unit test.")]
        public void RecordPaidProxyPayInvoice_ProcessedTwice_DoesNotDuplicateSellerRow()
        {
            // Placeholder documenting the required assertion:
            //   first call  -> inserts the seller/network/platform rows
            //   second call -> InsertFeeIfAbsent hits the unique index, DbUpdateException
            //                  is swallowed, returns 0, no duplicate rows.
        }

        // ---- Refund reversal — INTEGRATION ONLY ----

        [Fact(Skip = "ReverseProxyPayInvoice uses raw SQL (ExecuteSqlInterpolated: UPDATE for full refund, " +
                     "INSERT ... SELECT with a pro-rata negative amount for partial refund). Raw SQL is not " +
                     "supported by the EF InMemory provider, so full-reversal (sets reversed_at) and " +
                     "partial-refund (inserts pro-rata negative rows) must be verified against a real Postgres.")]
        public void ReverseProxyPayInvoice_FullAndPartialRefund_BehaveAsSpecified()
        {
            // full refund   -> reversed_at set on all live rows of the invoice
            // partial refund -> new rows with amount = ROUND(-amount * refunded/original, 2)
        }
    }
}

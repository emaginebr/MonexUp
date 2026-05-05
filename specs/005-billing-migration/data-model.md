# Data Model: Billing Migration to ProxyPay

Phase 1 output. Captures every persistence change introduced by this feature. Per spec FR-002, MonexUp does NOT persist Billing or Invoice — only the network → ProxyPay mapping and the (existing, repurposed) commission ledger.

---

## 1. Modified entity: `monexup_networks`

### Columns added

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `proxypay_store_id` | `BIGINT` | YES | NULL until first Billing/Invoice create. 1:1 with ProxyPay `proxypay_stores.store_id` (in ProxyPay DB; not enforced as FK here). Set atomically via `TrySetProxyPayStore`. |
| `proxypay_client_id` | `VARCHAR(64)` | YES | Companion to `proxypay_store_id`. Returned by ProxyPay `Store/insert` response. Used by the frontend `proxypay-react` ProxyPayProvider config. Both columns set in the same UPDATE so they cannot disagree. |

### Invariants

- `proxypay_store_id IS NULL ⟺ proxypay_client_id IS NULL` (set together, both NULL until first provisioning).
- Once set, both columns are immutable for the lifetime of the network. Re-provisioning is not supported (would require DELETE + INSERT in ProxyPay; out of scope).

### Class shape (Domain)

`NetworkModel.cs` adds:
```csharp
long? ProxyPayStoreId { get; set; }
string ProxyPayClientId { get; set; }
bool TrySetProxyPayStore(long networkId, long storeId, string clientId);  // atomic UPDATE … WHERE proxypay_store_id IS NULL
```

`INetworkModel.cs` adds the matching properties + method.

`Network.cs` (EF entity) adds the matching columns with `[Column("proxypay_store_id")]` / `[Column("proxypay_client_id")]`.

---

## 2. Modified entity: `monexup_invoice_fees`

### Columns changed

| Column | Change | Notes |
|--------|--------|-------|
| `invoice_id` | DROP | Local invoices no longer exist. |
| `proxypay_invoice_id` | ADD `BIGINT NOT NULL` | Replaces `invoice_id`. References ProxyPay's `proxypay_invoices.invoice_id` (cross-DB; no FK). Idempotency key for "did we already record fees for this invoice?" — UNIQUE per invoice + (networkId, userId, role) tuple. |
| `reversed_at` | ADD `TIMESTAMP WITHOUT TIME ZONE NULL` | NULL = active. Non-NULL = reversed (full or partial refund). Reports MUST filter on this. |
| `paid_amount_cents_at_record` | ADD `BIGINT NULL` | Snapshot of the paid amount in cents at the moment the fee row was written. Used to compute pro-rata factor for partial refunds. NULL only for legacy rows. |

### Indexes

| Index | Columns | Notes |
|-------|---------|-------|
| `ix_monexup_invoice_fees_proxypay_invoice_id` | `(proxypay_invoice_id)` | Speeds up lookups on incoming webhook/poll events. NOT unique by itself (multiple fee rows per invoice — one for each beneficiary in the referrer chain). |
| `ix_monexup_invoice_fees_proxypay_invoice_user_role` | `(proxypay_invoice_id, user_id, role)` UNIQUE | Idempotency: prevents writing two fee rows for the same beneficiary on the same invoice. |
| `ix_monexup_invoice_fees_network_unreversed` | `(network_id) WHERE reversed_at IS NULL` | Active-fees report acceleration. |

### State transitions

```
[no row] --paid event--> [active row, reversed_at = NULL]
[active row] --full refund event--> [reversed_at = now()]
[active row] --partial refund event--> NEW reversal row inserted with negative amount + reversed_at = now()  (original row stays active)
```

Fee rows are **append-only**. Status changes happen via:
- Setting `reversed_at` on the original row (full refund), OR
- Inserting a paired negative-amount row (partial refund).

This preserves a complete audit trail without UPDATEs that lose history.

---

## 3. Dropped entities

### `monexup_invoices`

DROP TABLE CASCADE in the same migration. Spec FR-020 (clarification): no read-only freeze, no backfill. Audit export is a manual one-shot before the cleanup PR merges.

### `monexup_subscriptions`

DROP TABLE CASCADE in the same migration.

### Related code artifacts deleted

- Domain: `InvoiceModel`, `IInvoiceModel`, `SubscriptionModel`, `ISubscriptionModel`, `InvoiceDomainFactory`, `SubscriptionDomainFactory`, `IInvoiceService`, `ISubscriptionService`, `InvoiceService`, `SubscriptionService`, `IProxyPayService`, `ProxyPayService` (replaced by `BillingService` + `BillingReconciliationService` + frontend direct calls).
- Infra: `Invoice.cs`, `Subscription.cs`, `InvoiceRepository`, `IInvoiceRepository`, `SubscriptionRepository`, `ISubscriptionRepository`, `InvoiceItem` if any (verify); `ProxyPayAppService.GenerateInvoice` legacy path that wrote to `monexup_invoices`.
- DTO: `MonexUp.DTO/Invoice/*`, `MonexUp.DTO/Subscription/*` (legacy local representations). New `MonexUp.DTO/Billing/*` replaces.
- API: `InvoiceController`, `SubscriptionController` (if present).
- Tests: `InvoiceServiceTests`, `SubscriptionServiceTests`, `ProxyPayServiceTests` (the unit ones — replaced by `BillingServiceTests` + `BillingReconciliationServiceTests`).
- Bruno: `bruno/Invoice/`, `bruno/Subscription/` (replaced by `bruno/Billing/`).

---

## 4. New transient DTOs (no persistence)

These are wire-only types — they live in `MonexUp.DTO/Billing/` but are NOT EF-mapped to any table.

### `BillingCreateRequest`

| Field | Type | Notes |
|-------|------|-------|
| `networkId` | `long` | Routing target. |
| `customerUserId` | `long` | Member being billed. |
| `referrerUserId` | `long?` | Optional. If NULL, derived server-side from `monexup_user_networks` at fee-write time. |
| `frequency` | `BillingFrequencyEnum` | Mirrors ProxyPay enum. |
| `paymentMethod` | `PaymentMethodEnum` | Mirrors ProxyPay enum. |
| `billingStartDate` | `DateTime` | Pass-through to ProxyPay. |
| `items` | `BillingItemRequest[]` | One or more line items. Each has `description`, `quantity`, `unitPrice`, `discount`. |

### `BillingItemRequest`

Mirrors ProxyPay `BillingItemInfo`:

| Field | Type |
|-------|------|
| `description` | `string` |
| `quantity` | `int` |
| `unitPrice` | `double` |
| `discount` | `double` |

### `BillingListItemInfo`

Returned by `GET /Billing/list?networkId=…`. Composed at request time by hitting ProxyPay + joining locally:

| Field | Source | Notes |
|-------|--------|-------|
| `proxypayBillingId` | ProxyPay `BillingInfo.billingId` | |
| `customerName` | ProxyPay | |
| `frequency` | ProxyPay | |
| `nextChargeDate` | ProxyPay | |
| `status` | ProxyPay | |
| `latestInvoiceStatus` | ProxyPay | Optional drill-down. |
| `customerUserId` | MonexUp lookup by ProxyPay customer email → NAuth user | Best-effort (NULL if unmapped). |
| `referrerUserId` | MonexUp `monexup_user_networks` join | Optional. |

### `PaymentCompletionInfo`

Body for `POST /Billing/payment-completed`:

| Field | Type | Notes |
|-------|------|-------|
| `networkId` | `long` | Used to find the right `proxypayClientId`. |
| `proxypayInvoiceId` | `long` | Echoed back from ProxyPay completion redirect. |
| `signature` | `string` | HMAC-SHA256 of `(networkId\|proxypayInvoiceId)` keyed by `ProxyPay:WebhookCallbackSecret`. |

### `BillingFrequencyEnum` / `PaymentMethodEnum`

Re-declared in `MonexUp.DTO/Billing/` mirroring ProxyPay's enums (Monthly=1, Quarterly=2, Semiannual=3, Annual=4 / etc.). Keep the underlying `int` values bit-for-bit identical to avoid runtime translation.

---

## 5. Validation rules (FluentValidation)

`BillingCreateRequestValidator`:
- `NetworkId > 0`
- `CustomerUserId > 0`
- `BillingStartDate >= today`
- `Items.Count >= 1`
- Each item: `Quantity >= 1`, `UnitPrice > 0`, `Discount >= 0`, `Discount <= Quantity * UnitPrice`

Authorization rules (enforced in `BillingService.CreateAsync`, not in the validator):
- Caller MUST be `NetworkManager` or `Administrator` for `networkId` (FR-014).
- `CustomerUserId` MUST be a member of `networkId` (existing `IUserNetworkDomainFactory.Get`).

---

## 6. Migration script preview (PostgreSQL)

```sql
-- 005_billing_migration_to_proxypay.sql
BEGIN;

ALTER TABLE monexup_networks
    ADD COLUMN proxypay_store_id BIGINT NULL,
    ADD COLUMN proxypay_client_id VARCHAR(64) NULL;

ALTER TABLE monexup_invoice_fees
    ADD COLUMN proxypay_invoice_id BIGINT NULL,
    ADD COLUMN reversed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    ADD COLUMN paid_amount_cents_at_record BIGINT NULL;

CREATE INDEX ix_monexup_invoice_fees_proxypay_invoice_id
    ON monexup_invoice_fees (proxypay_invoice_id);

CREATE UNIQUE INDEX ix_monexup_invoice_fees_proxypay_invoice_user_role
    ON monexup_invoice_fees (proxypay_invoice_id, user_id, role)
    WHERE proxypay_invoice_id IS NOT NULL;

CREATE INDEX ix_monexup_invoice_fees_network_unreversed
    ON monexup_invoice_fees (network_id)
    WHERE reversed_at IS NULL;

DROP TABLE IF EXISTS monexup_invoices CASCADE;
DROP TABLE IF EXISTS monexup_subscriptions CASCADE;

ALTER TABLE monexup_invoice_fees DROP COLUMN IF EXISTS invoice_id;

COMMIT;
```

EF will generate the equivalent migration via `dotnet ef migrations add BillingMigrationToProxyPay --project MonexUp.Infra --startup-project MonexUp.API`.

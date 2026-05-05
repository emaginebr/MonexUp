# Research: Billing Migration to ProxyPay

Phase 0 output. Resolves open Technical Context items in `plan.md`.

---

## R1. Status synchronization mechanism

**Decision**: Hybrid — frontend completion-redirect (primary) + backend reconciliation poller (fallback). Outbound ProxyPay → MonexUp webhooks NOT used in this iteration.

**Rationale**: 
- ProxyPay's existing `WebhookController` only **receives** webhooks from upstream PSPs (AbacatePay) — it does not currently publish downstream webhooks to its consumers. Adding outbound webhook delivery is a ProxyPay project change (out of scope per constitution Principle III).
- ProxyPay billing/invoice creation already returns a hosted-payment `url` (Stripe-style). After payment, the customer is redirected to `completionUrl` (configurable per request). MonexUp sets `completionUrl` to `https://<monexup-host>/Billing/payment-completed?invoiceId={id}` — that endpoint validates the invoice with ProxyPay and writes the commission row.
- The redirect-only approach is fragile (closed tabs, mobile browser issues) — a reconciliation poller in `MonexUp.BackgroundService` runs every 5 min, queries ProxyPay for invoices in non-terminal status (`Pending`, `Awaiting Payment`), and updates accordingly.
- 60s SLA (SC-002) is met by the redirect path under normal conditions; the poller acts as a safety net for the long tail (target ≤ 5 min for closed-tab cases).

**Alternatives considered**:
- **Pure polling** — high request volume against ProxyPay even when nothing changes; misses the user-facing "paid" feedback loop on the success page.
- **Webhook from ProxyPay → MonexUp** — best in theory; rejected for this feature because it requires modifying the ProxyPay project.
- **Server-Sent Events / long-poll** — over-engineered for the volumes involved (≤ 10k invoices/month/tenant).

**Implementation notes**:
- `BillingController.PaymentCompleted` is anonymous + state-mutating: protected by a per-network HMAC of `(networkId, invoiceId)` baked into the `completionUrl` query string at billing-create time, validated server-side on receipt.
- The reconciliation poller uses `IDbContextFactory` (transient lifetime per Constitution VII).

---

## R2. ProxyPay authentication model

**Decision**: Two-mode auth.
- **Provisioning** (one-time per network): MonexUp.API → `POST {ProxyPayApiUrl}/Store/insert` with NAuth bearer. Returns `StoreInfo { storeId, clientId, ... }` per ProxyPay's existing `StoreController`. MonexUp persists both fields on `monexup_networks`.
- **Payment ops** (every billing/invoice creation): `proxypay-react` in the browser → `POST {ProxyPayApiUrl}/Payment/billing|invoice|qrcode` with `clientId` (no bearer, no auth header) per ProxyPay's existing `PaymentController` (anonymous endpoints).

**Rationale**: 
- ProxyPay deliberately exposes payment-creation endpoints as anonymous + `clientId`-keyed so storefronts can call them from the browser without leaking server-side credentials.
- `clientId` is per-store and rotatable, scoped to that ProxyPay store only.
- This matches the precedent already in `proxypay-react` (`ProxyPayProvider config={{ apiUrl, clientId }}`).

**Alternatives considered**:
- **Backend proxies every payment call** — adds round-trip latency, doubles request volume on MonexUp.API, no security gain since `clientId` is the auth token ProxyPay accepts anyway.
- **Frontend uses NAuth bearer to call ProxyPay** — ProxyPay's `PaymentController` doesn't validate NAuth; would require ProxyPay project change (rejected per Principle III).

**Implementation notes**:
- `monexup_networks.proxypay_client_id` is **not** a secret in the cryptographic sense — it's an id that scopes calls to a specific store. It can be served to logged-in network members through `GET /Network/getById/{id}` so the frontend can configure `ProxyPayProvider` dynamically.
- For added safety, the frontend MUST verify the user is a member of the network (existing `currentRole >= User`) before mounting the `ProxyPayProvider` for that network's `clientId`.

---

## R3. Network → ProxyPay store provisioning

**Decision**: Lazy, atomic, race-tolerant. Mirror the precedent set by feature 004 (Lofn) for `lofn_store_id`.

**Rationale**: 
- Same problem shape as Lofn: 1:1 link, first-write triggers remote create, concurrent first-writes must converge to one remote store.
- Existing helper `INetworkRepository.TrySetLofnStoreId(long networkId, long storeId)` uses `ExecuteSqlInterpolated` for atomic conditional UPDATE (`SET col = X WHERE id = ? AND col IS NULL`). Add a sibling `TrySetProxyPayStore(networkId, storeId, clientId)`.
- Race losers' remote ProxyPay store becomes orphaned (per Lofn precedent). Operator can clean orphans manually if needed; MonexUp does not attempt to delete remote stores it didn't end up using.

**Alternatives considered**:
- **Distributed lock (Redis/advisory lock)** — overkill; the conditional UPDATE pattern is cheaper and already in use.
- **Eager provisioning at network creation** — wasted ProxyPay store for networks that never charge. Lazy keeps remote-resource hygiene clean.

---

## R4. Commission row write timing

**Decision**: Write `monexup_invoice_fees` rows only when an invoice is observed in status `Paid` (either via completion-redirect or via the poller). Idempotent on `proxypay_invoice_id` (UNIQUE constraint).

**Rationale**:
- Avoids "ghost" commissions on invoices that never settled.
- Idempotency key on `proxypay_invoice_id` makes it safe for the redirect AND the poller to both attempt to write — last writer is a no-op.
- Referrer chain is computed at write time from `monexup_user_networks` (existing graph), so any change in referrer linkage prior to payment is captured.

**Implementation notes**:
- Add `UNIQUE INDEX ix_monexup_invoice_fees_proxypay_invoice_id ON monexup_invoice_fees (proxypay_invoice_id)`.
- `InvoiceFeeService.RecordPaidInvoice(proxypayInvoiceId, networkId, paidAmount, paidAt)` does INSERT … ON CONFLICT DO NOTHING (or find-then-insert pattern same as `ProductLinkRepository.Upsert`).

---

## R5. Refund / partial-refund handling

**Decision**: When ProxyPay reports an invoice transitioning to `Refunded`:
- **Full refund** (`refundedAmount == paidAmount`): mark all `monexup_invoice_fees` rows for that `proxypay_invoice_id` as reversed (set a new `reversed_at TIMESTAMP NULL` column to `now()`). Reporting/payouts MUST exclude reversed rows.
- **Partial refund** (`refundedAmount < paidAmount`): pro-rata reversal. Compute `factor = refundedAmount / paidAmount`. Insert a negative-amount fee row (mirrored hierarchy, `amount = -original.amount * factor`, `reversed_at = now()`) for each original fee row of the invoice.

**Rationale**:
- Resolves the previously-deferred Q4 from `/speckit.clarify`.
- Pro-rata mirrors how ProxyPay/AbacatePay typically settle partial refunds and keeps the reconciliation drift in SC-005 (< 0.01 BRL/network/month) within range.
- A `reversed_at` column instead of `DELETE` preserves audit history and lets reports show original + reversal explicitly.

**Alternatives considered**:
- **Always full reversal** — distorts books when only part of the invoice was refunded (e.g., one item out of three).
- **Manual reconciliation only** — operationally expensive; doesn't scale.
- **Defer to ProxyPay** — ProxyPay does not know MonexUp's referrer chain, so it cannot author the reversal entry; reversal logic must live in MonexUp.

**Implementation notes**:
- Add `reversed_at TIMESTAMP WITHOUT TIME ZONE NULL` column to `monexup_invoice_fees`.
- All `SUM(amount)` reports must add `WHERE reversed_at IS NULL OR include_reversed = true`.

---

## R6. Frontend integration with `proxypay-react`

**Decision**: Add `proxypay-react` to `monexup-app` as a peer-mounted provider. Wrap it inside the existing `<NetworkProvider>` so `clientId` can be sourced from the currently-selected network.

**Pattern**:
```tsx
<NetworkProvider>
  <NetworkAwareProxyPayProvider>   {/* new wrapper that reads selected network */}
    {/* rest of app */}
  </NetworkAwareProxyPayProvider>
</NetworkProvider>
```

The wrapper reads `userNetwork.network.proxypayClientId`. If null, render children without `<ProxyPayProvider>` and let billing-related routes redirect to "ensure store" UX.

**Rationale**:
- `ProxyPayProvider` requires `{ apiUrl, clientId }` at mount time. Different networks have different `clientId` → must remount when selection changes.
- The `NetworkProvider` already exposes the selection (and persists it across sessions per the prior session's work).

**Alternatives considered**:
- **Single global ProxyPayProvider with no clientId, supplied per call** — `proxypay-react`'s API expects `clientId` in config; would require an API change.
- **Direct fetch without proxypay-react** — loses the ergonomic React components (`<BillingPayment>`, `<InvoicePayment>`, `<PixPayment>`) that already exist.

---

## R7. Cleanup migration ordering

**Decision**: Single EF migration `BillingMigrationToProxyPay` performs in order:
1. `ALTER TABLE monexup_networks ADD COLUMN proxypay_store_id BIGINT NULL, ADD COLUMN proxypay_client_id VARCHAR(64) NULL;`
2. `ALTER TABLE monexup_invoice_fees ADD COLUMN proxypay_invoice_id BIGINT NULL, ADD COLUMN reversed_at TIMESTAMP WITHOUT TIME ZONE NULL;`
3. `CREATE UNIQUE INDEX ix_monexup_invoice_fees_proxypay_invoice_id ON monexup_invoice_fees (proxypay_invoice_id) WHERE proxypay_invoice_id IS NOT NULL;`
4. `DROP TABLE monexup_invoices CASCADE;`
5. `DROP TABLE monexup_subscriptions CASCADE;`
6. `ALTER TABLE monexup_invoice_fees DROP COLUMN invoice_id;`

**Rationale**:
- All changes in a single migration → atomic rollout/rollback.
- Per FR-020 (clarification A): legacy tables dropped immediately at cleanup; no read-only freeze, no backfill.
- Order matters: drop the FK column from `monexup_invoice_fees` AFTER dropping the parent `monexup_invoices` to avoid orphan-FK errors.

**Implementation notes**:
- A SQL script `scripts/billing_migration_to_proxypay.sql` is generated alongside (per feature 004 precedent) for environments that apply SQL manually rather than `dotnet ef database update`.

---

## R8. Idempotency key strategy for billing/invoice creation

**Decision**: Use ProxyPay's existing creation endpoints idempotently — on the **client side** (frontend) by disabling the submit button while the request is in-flight + de-duping double-submit at the React component level. Do NOT add MonexUp-side idempotency key.

**Rationale**:
- MonexUp doesn't persist the billing/invoice anymore, so it cannot deduplicate by `(networkId, customerId, schedule, amount)` — that data is in ProxyPay.
- ProxyPay's own idempotency strategy is its own concern.
- FR-009 / FR-010 are satisfied for the user-facing scenario (double-click) by the standard React loading-state pattern already used by `BillingPayment` / `InvoicePayment` from `proxypay-react`.

**Alternatives considered**:
- **MonexUp-issued idempotency token forwarded to ProxyPay** — out of scope; ProxyPay does not currently support an `Idempotency-Key` header.
- **Cache last-N requests in MonexUp memory and dedupe** — fragile, doesn't survive process restart.

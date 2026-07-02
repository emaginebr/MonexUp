# Phase 0 Research: Backend ProxyPay proxy and order lifecycle

Both spec-level unknowns were resolved in `/speckit.clarify` (Session 2026-07-01). This file records the design decisions and the codebase findings that back them.

## Decision 1 — Paid order state

- **Decision**: Paid = `OrderStatusEnum.Active` (2). Transition `Incoming (1) → Active (2)` on confirmed payment.
- **Rationale**: The existing enum has no `Paid` value; `Active` is the natural "purchase settled" state in the MMN model. Reuses the enum → zero data migration, zero change to existing listing/search queries.
- **Alternatives considered**:
  - New `Paid` enum value → cleaner semantics but requires migration + touching every query/report that filters on status. Rejected as over-scoped.
  - `Finished` (4) → implies a closed/terminal order; conflicts with recurring/active semantics. Rejected.

## Decision 2 — Payment detection mechanism

- **Decision**: Two complementary paths writing through one idempotent transition:
  1. **Foreground**: browser polls a MonexUp status endpoint (`GET /Order/checkPixStatus/{invoiceId}`), which queries ProxyPay and, when paid, advances the order to `Active`.
  2. **Backstop**: the existing `BillingReconciliationService` (background) independently detects paid invoices and applies the same transition, covering the browser-closed case.
- **Rationale**: Minimal change — the browser already polls; we only change the target from `proxypay.online` to MonexUp, and add the order side-effect. The background job already lists pending invoices per store, so extending it to advance the order is low-risk. Meets SC-002 (≤60s) and SC-003 (browser-closed).
- **Alternatives considered**:
  - Background-only → simpler but adds status latency for the buyer watching the modal. Rejected (worse UX).
  - Provider webhook → real-time, but ProxyPay is read-only here and may not expose callbacks; would require a change request to the ProxyPay repo. Rejected as a hard dependency; can be added later without breaking this design.

## Codebase findings (current state)

- **Two checkout paths**:
  - `VendorProductPage` → `orderContext.createPixPayment` → `POST /Order/createPixPayment` → `SubscriptionService.CreatePixPayment`, which **inserts an order (`Incoming`) before generating the QR** (`SubscriptionService.cs:142-160`) and stores `ProxyPayInvoiceId` on it. ✅ correct.
  - `StorefrontPage/PixModalContainer` → `proxypay-react`'s `<PixPayment>` creates the invoice **directly on ProxyPay** and polls `https://proxypay.online/api/payment/qrcode/status/{id}` directly (`PixModalContainer.tsx:75-114`). ❌ no MonexUp order; no order status update. **This is the root cause.**
- **Backend already owns most ProxyPay methods**:
  - `IProxyPayAppService.CreateQRCodeAsync` / `CheckQRCodeStatusAsync` (hits `Payment/qrcode` and `Payment/qrcode/status/{id}`).
  - `IProxyPayClient`: `InsertStoreAsync`, `GetMyStoreAsync`, `GetInvoiceAsync`, `ListPendingInvoicesAsync`.
- **Gaps**:
  - **AbacatePay key** exists only in the frontend (`ProxyPayStoreService.tsx`, this branch) hitting ProxyPay directly — **no backend method**. Needs `IProxyPayClient.SetAbacatePayApiKeyAsync` + `GetHasAbacatePayApiKeyAsync` and MonexUp endpoints.
  - `OrderController.CheckPixStatus` calls `_proxyPayService.CheckQRCodeStatus` and returns — **does not update the order**. Needs to advance `Incoming → Active` on paid.
  - `BillingReconciliationService` records fees on paid invoices but does **not** advance the order status. Needs to apply the transition.
  - `ProxyPayAppService.CheckQRCodeStatusAsync` has a non-logging `catch (Exception ex) { ... }` — violates the `CLAUDE.md` no-silent-catch rule; fix while touching.
- **Order lookup for status→order mapping**: `OrderRepository.GetByProxyPayInvoiceId` already exists — use it to find the order from the invoice id in both the status endpoint and reconciliation.
- **Idempotency anchor**: transition only when order is currently `Incoming`; if already `Active`, no-op (satisfies FR-007 / SC-005). Fee recording in reconciliation is separately guarded by existing invoice-fee logic.

## Open implementation choices (defer to /speckit.tasks, non-blocking)

- **Storefront QR rendering**: after routing storefront checkout through `POST /Order/createPixPayment`, render the QR from the backend response `BrCode`/`BrCodeBase64` (already returned by `PixPaymentResult.QrCode`) using a MonexUp-owned component, retiring `proxypay-react`'s `<PixPayment>`. No provider contract change.
- **Simulate-payment (dev)**: currently the browser calls `proxypay.online/api/payment/simulate-payment/{id}`. Optionally add a thin MonexUp dev-only proxy; not a production requirement.

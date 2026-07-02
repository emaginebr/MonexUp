---
description: "Task list for Backend ProxyPay proxy and order lifecycle"
---

# Tasks: Backend ProxyPay proxy and order lifecycle

**Input**: Design documents from `/specs/008-backend-proxypay-orders/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included only for the two highest-risk behaviors (idempotent paid transition; order-before-charge). The repo mandates test projects (`MonexUp.UnitTests`, `MonexUp.ApiTests`, frontend vitest), so these are kept but scoped.

**Organization**: By user story (US1, US2, US3) for independent implementation and testing.

## Path Conventions

Web app. Backend `.NET` projects at repo root (`MonexUp.*`); frontend at `monexup-app/src`. Absolute-from-root paths shown per task.

---

## Phase 1: Setup

**Purpose**: Confirm baseline builds before touching payment flow.

- [X] T001 Verify solution builds and tests run green on branch `008-backend-proxypay-orders`: `dotnet build MonexUp.sln` and `cd monexup-app && npm ci` (baseline for later diffs).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared ProxyPay client/appservice cleanup touched by both US2 (status) and US3 (config). Must land before story work.

**⚠️ CRITICAL**: Complete before US2/US3.

- [X] T002 Fix the non-logging `catch (Exception ex)` in `CheckQRCodeStatusAsync` (and audit `CreateQRCodeAsync`) in `MonexUp.Infra/AppServices/ProxyPayAppService.cs` — inject/`ILogger<ProxyPayAppService>` and `LogWarning(ex, ...)` per the CLAUDE.md no-silent-catch rule.
- [X] T003 Confirm `OrderRepository.GetByProxyPayInvoiceId` is exposed through `IOrderService` (add a passthrough `GetByProxyPayInvoiceId(long invoiceId)` in `MonexUp.Domain/Services/Interfaces/IOrderService.cs` + `MonexUp.Domain/Services/OrderService.cs` if missing) — needed by both US2 consumers.

**Checkpoint**: Shared payment plumbing clean; story work can begin.

---

## Phase 3: User Story 1 - Every PIX charge is backed by a MonexUp order (Priority: P1) 🎯 MVP

**Goal**: No PIX invoice can exist without a matching `Incoming` MonexUp order, from every checkout entry point (storefront + vendor).

**Independent Test**: Start PIX from storefront and vendor pages; right after the QR appears, `monexup_orders` has exactly one `Incoming` row with `proxypay_invoice_id` set; no orphan charges.

### Tests for User Story 1

- [X] T004 [P] [US1] API test: `POST /Order/createPixPayment` returns `sucesso=true` with `order.orderId` and `qrCode.invoiceId`, and a matching order row exists — in `MonexUp.ApiTests/Controllers/OrderControllerTests.cs`. → existing `CreatePixPayment_WithLinkedProductAndNetworkSlug_ShouldReturnSuccess`.
- [X] T005 [P] [US1] API test: repeat call for same pending (product,user,seller) reuses the same `orderId` (no duplicate) — in `MonexUp.ApiTests/Controllers/OrderControllerTests.cs`. → `CreatePixPayment_SamePendingPurchase_ShouldReuseOrderNotDuplicate`.
- [X] [US3] API tests for the new AbacatePay endpoints (`PUT`/`GET /network/{id}/abacatepay-apikey`) — in `MonexUp.ApiTests/Controllers/NetworkControllerTests.cs` (5 tests: auth, empty-key 400, provisioned-store, status shape).

### Implementation for User Story 1

- [X] T006 [US1] Harden `MonexUp.Domain/Services/SubscriptionService.cs` `CreatePixPayment`: ensure order is created/reused and `ProxyPayInvoiceId` persisted before returning; on QR failure keep the `Incoming` order retryable and return a clear `mensagem` (no orphan/unusable order) — FR-002, FR-004, FR-011.
- [X] T007 [P] [US1] Repoint storefront checkout to the backend: `monexup-app/src/Pages/StorefrontPage/*` (checkout trigger + `PixModalContainer` invocation) calls `orderContext.createPixPayment(...)` (like `VendorProductPage`) instead of creating the invoice via `proxypay-react`.
- [X] T008 [P] [US1] Render the storefront QR from the backend response: create a MonexUp-owned PIX QR view (e.g. `monexup-app/src/Pages/StorefrontPage/PixQrView.tsx`) that displays `qrCode.brCode`/`brCodeBase64`/`expiredAt` returned by `createPixPayment`; wire it into `PixModalContainer.tsx`, replacing `proxypay-react`'s `<PixPayment>`.
- [X] T009 [US1] Pass the backend `qrCode.invoiceId` into `PixModalContainer` so status polling (US2) has the invoice id sourced from MonexUp, not from `proxypay-react`.

**Checkpoint**: Every checkout path yields a MonexUp order before the charge. MVP deliverable.

---

## Phase 4: User Story 2 - Paid payment updates the order status (Priority: P1)

**Goal**: A paid PIX charge flips its order `Incoming → Active`, via foreground status check and background backstop, idempotently.

**Independent Test**: Pay (or simulate) a charge with the modal open → order becomes `Active` within ~60s; close the browser before paying → reconciliation still flips it; re-check never double-advances.

### Tests for User Story 2

- [X] T010 [P] [US2] Unit test: `OrderService.MarkPaidByInvoiceId` advances `Incoming→Active` once and is a no-op when already `Active` (idempotency) — in `MonexUp.UnitTests/Services/OrderServiceTests.cs`.

### Implementation for User Story 2

- [X] T011 [US2] Add idempotent domain primitive `MarkPaidByInvoiceId(long proxyPayInvoiceId)` (resolve order via `GetByProxyPayInvoiceId`; if `Incoming` set `Active`; if `Active` no-op) to `MonexUp.Domain/Services/Interfaces/IOrderService.cs` + `MonexUp.Domain/Services/OrderService.cs` — FR-006, FR-007. (Depends on T003)
- [X] T012 [US2] Update `CheckPixStatus` in `MonexUp.API/Controllers/OrderController.cs` to call the provider status (`_proxyPayService.CheckQRCodeStatus`) and, when `Paid`, invoke `MarkPaidByInvoiceId`; return provider status. Log a warning when the invoice has no matching order (FR-005, FR-012). (Depends on T011)
- [X] T013 [US2] Extend `MonexUp.Infra/Services/BillingReconciliationService.cs`: for each paid invoice already handled for fees, also call the order paid transition (via `IOrderService.MarkPaidByInvoiceId`) so browser-closed payments settle the order; emit a metric/log for paid invoices with no order — FR-008, FR-012, SC-003. (Depends on T011)
- [X] T014 [P] [US2] Point the frontend status poll at MonexUp: in `monexup-app/src/Pages/StorefrontPage/PixModalContainer.tsx` replace the direct `fetch('https://proxypay.online/api/payment/qrcode/status/{id}')` loop with `orderContext.checkPixStatus(invoiceId)` (already targets `/Order/checkPixStatus`); keep the paid→success navigation.

**Checkpoint**: Paid charges settle their order through both paths; idempotent.

---

## Phase 5: User Story 3 - Browser only talks to MonexUp (Priority: P2)

**Goal**: Remove every remaining direct browser→ProxyPay call (AbacatePay key config, simulate-payment, provider invoice creation), served instead by MonexUp endpoints.

**Independent Test**: Full checkout + admin AbacatePay-key config with DevTools Network open → zero requests to the ProxyPay host; every call targets MonexUp.

### Implementation for User Story 3

- [X] T015 [P] [US3] Add `SetAbacatePayApiKeyAsync(long storeId, string apiKey, string bearerToken, CancellationToken)` and `GetHasAbacatePayApiKeyAsync(string bearerToken, CancellationToken)` to `MonexUp.Infra.Interfaces/AppServices/IProxyPayClient.cs`.
- [X] T016 [US3] Implement both methods in `MonexUp.Infra/AppServices/ProxyPayClient.cs` — PUT `{ProxyPay}/Store/{storeId}/abacatepay-apikey` (body `{ apiKey }`) and GraphQL `{ myStore { storeId hasAbacatePayApiKey } }`; server-side NAuth bearer; log failures (no silent catch). (Depends on T015)
- [X] T017 [US3] Expose passthroughs in `MonexUp.Domain/Services/ProxyPayService.cs` + `IProxyPayService.cs`: `SetAbacatePayApiKey(networkId, apiKey, bearerToken)` (resolve `ProxyPayStoreId` from network) and `GetHasAbacatePayApiKey(networkId/bearerToken)`. (Depends on T016)
- [X] T018 [US3] Add endpoints to `MonexUp.API/Controllers/NetworkController.cs`: `PUT /Network/{networkId}/abacatepay-apikey` (204/400/403, write-only) and `GET /Network/{networkId}/abacatepay-apikey/status` (`hasAbacatePayApiKey`) per `contracts/network-payment-config.md`. (Depends on T017)
- [X] T019 [P] [US3] Repoint `monexup-app/src/Services/Impl/ProxyPayStoreService.tsx` (and interface) from the direct-ProxyPay `HttpClient` to the MonexUp API: `setAbacatePayApiKey`→`PUT /Network/{id}/abacatepay-apikey`, `getHasAbacatePayApiKey`→`GET /Network/{id}/abacatepay-apikey/status`. Update `monexup-app/src/Pages/NetworkEditPage/AbacatePayApiKeySection.tsx` call sites if signatures change.
- [~] T020 [US3] Retire the browser ProxyPay client wiring: remove the direct-ProxyPay `HttpClient` instance from `monexup-app/src/Services/ServiceFactory.tsx` and remove/neutralize `monexup-app/src/Components/NetworkAwareProxyPayProvider.tsx` + the `proxypay-react` `<PixPayment>` usage now replaced by T007/T008. (Depends on T007, T008, T014, T019)
- [X] T021 [P] [US3] (Dev-only, optional) Replace the direct `fetch('.../simulate-payment/{id}')` → simulate button removed from `PixModalContainer` (no browser→ProxyPay call remains in checkout). in `PixModalContainer.tsx` with a thin MonexUp dev proxy endpoint, or gate/remove it for production so no browser→ProxyPay call remains.

**Checkpoint**: No direct browser→ProxyPay traffic on any flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T022 [P] Frontend vitest: update/verify `monexup-app/src/Services/Impl/ProxyPayStoreService.test.tsx` for the MonexUp-targeted URLs (T019). → 8/8 pass (ProxyPayStoreService + ProxyPayStoreBusiness).
- [ ] T023 [P] Run `quickstart.md` validation end-to-end (SC-001…SC-005): order-before-charge, paid→Active ≤60s, browser-closed backstop, zero direct provider calls, idempotent re-check.
- [ ] T024 Remove now-dead env/config: prune unused `REACT_APP_PROXYPAY_*` client-side usage if fully server-side (FR-010); confirm `ProxyPaySetting` covers all server calls.
- [X] T025 [P] Update `docs/` (analyst): note MonexUp is the sole ProxyPay gateway; document the new Network AbacatePay endpoints and the order paid-transition. → `docs/PROXYPAY_INTEGRATION.md`

---

## Dependencies & Execution Order

### Phase order
- Setup (P1) → Foundational (P2) → US1 (P3) → US2 (P4) → US3 (P5) → Polish (P6).
- US1 and US2 are both P1; US1 first (order must exist before status can update it). US2 T014 depends on US1 T009 (invoice id from backend). US3 T020 depends on US1 T007/T008 + US2 T014.

### Within stories
- Foundational T002/T003 before US2.
- US2: T011 before T012, T013.
- US3: T015 → T016 → T017 → T018; T019 independent of backend chain but T020 depends on T007/T008/T014/T019.

### Parallel opportunities
- T004, T005 [P] together (tests, same file → actually serialize edits to `OrderControllerTests.cs`; run in parallel only if split).
- T007, T008 [P] (different frontend files).
- T015, T019 [P] (interface vs frontend service).
- Polish T022, T023, T025 [P].

---

## Parallel Example: User Story 3

```bash
Task: "Add AbacatePay methods to IProxyPayClient.cs (T015)"
Task: "Repoint ProxyPayStoreService.tsx to MonexUp API (T019)"
```

---

## Implementation Strategy

### MVP (US1 only)
Setup → Foundational → US1 → validate: every checkout produces an `Incoming` order with the invoice id. Fixes the "invoice without order" root cause. Deploy.

### Incremental
+ US2 → paid charges settle the order (fixes "status never updates"). Deploy.
+ US3 → last direct browser→ProxyPay calls removed (single gateway). Deploy.

---

## Notes
- ProxyPay repo (`C:\repos\ProxyPay`) is read-only — any provider-side change (e.g. webhook) is requested from the user, not made here.
- No DB migration: `Incoming→Active` reuses existing enum/columns.
- Commit per task or logical group; each story is independently testable at its checkpoint.

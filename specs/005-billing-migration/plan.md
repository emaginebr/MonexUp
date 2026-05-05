# Implementation Plan: Billing Migration to ProxyPay

**Branch**: `005-billing-migration` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-billing-migration/spec.md`

## Summary

Move every Billing (recorrente) and Invoice (one-off PIX) from MonexUp's local tables to ProxyPay. MonexUp keeps a single FK `monexup_networks.proxypay_store_id` for routing and `monexup_invoice_fees` (with `proxypay_invoice_id`) for commission distribution — nothing else. Frontend uses `proxypay-react` (BillingPayment / InvoicePayment / PixPayment) talking directly to ProxyPay using the network's `clientId`. Backend role narrows to (a) lazy-provisioning the ProxyPay store on first use and (b) reconciling paid invoices into commission rows via a hybrid completion-redirect + background polling strategy. After cutover, all legacy `Subscription`, `Invoice`, `OrderItem`-product-tied PIX, and the in-flight `OrderService` PIX path are deleted (US3).

## Technical Context

**Language/Version**: .NET 8.0 (C# 12) backend; React 18 + TypeScript (CRA) frontend  
**Primary Dependencies**:  
- Backend: ASP.NET Core, EF Core 9 + Npgsql, FluentValidation, NAuth, zTools  
- Frontend: `proxypay-react@^0.2.x` (BillingPayment, InvoicePayment, PixPayment, ProxyPayProvider), `nauth-react`  
**Storage**: PostgreSQL — owned tables: `monexup_networks` (extended with `proxypay_store_id`, `proxypay_client_id`), `monexup_invoice_fees` (column rename `invoice_id` → `proxypay_invoice_id`)  
**Testing**: xUnit + Moq for unit (`MonexUp.Tests`); xUnit + Flurl for API integration (`MonexUp.ApiTests`); Jest for frontend  
**Target Platform**: Linux containers (Docker Compose); Capacitor 7 Android wrapping the same web build  
**Project Type**: Web application (React frontend + .NET backend) + ProxyPay external service  
**Performance Goals**: Billing creation roundtrip ≤ 5s p95 (SC-001); paid-status reflected in MonexUp ≤ 60s (SC-002); zero duplicate billings under retry (SC-003)  
**Constraints**: BRL only; ProxyPay assumed to emit no outbound webhooks today (relies on frontend completion redirect + backend polling); ProxyPay payment endpoints are anonymous and authenticated by `clientId` (NOT NAuth bearer) — bearer is only required for `/Store/insert` provisioning  
**Scale/Scope**: ≤ 1k networks, ≤ 100 active billings/network, ≤ 10k invoices/month/tenant; 1 backend service + 1 frontend SPA + reconciliation hosted job

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | PASS | New `NetworkService.EnsureProxyPayStore` + `BillingService` + `InvoiceFeeService` follow Service → Factory → Repository; no direct DB access in models. |
| II. Frontend em Camadas (React) | PASS | New `Billing` Service/Business/Context/Provider/Page added; `proxypay-react` mounted as wrapper provider in `ContextBuilder`. |
| III. Delegação a Projetos Externos (NON-NEGOTIABLE) | PASS | Spec explicitly transfers Billing/Invoice ownership to ProxyPay; no payment-rule code remains in MonexUp. Commission attribution stays in MonexUp because referrer chain is MonexUp's domain (ProxyPay knows nothing about it). |
| IV. Configuração e Secrets | PASS | New keys `ProxyPay:WebhookCallbackSecret`, `ProxyPay:CompletionUrl`, `ProxyPay:ReturnUrl` go through `IConfiguration`; frontend uses `REACT_APP_PROXYPAY_API_URL` (already present). |
| V. Internacionalização | PASS | All new UI strings under `public/locales/{lang}/translation.json` keyed by `billing.*` and `invoice.*`. Removed strings cleaned in same diff. |
| VI. Banco de Dados e Migrations | PASS | Two columns added to `monexup_networks` + one column rename on `monexup_invoice_fees` + DROP `monexup_invoices`/`monexup_subscriptions` in cleanup migration. EF migration name: `BillingMigrationToProxyPay`. |
| VII. Registro de Dependências | PASS | New `IBillingService`, `IProxyPayClient`, `IInvoiceFeeService`, `IBillingReconciliationService` registered in `Initializer.cs`. Frontend new providers registered in `ContextBuilder`. |

**Result**: All gates green. No constitution violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-billing-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── monexup-billing-endpoints.md
│   └── proxypay-endpoints-used.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
MonexUp.API/
└── Controllers/
    └── BillingController.cs                    # NEW: lazy-provision, list passthrough, completion callback

MonexUp.Domain/
├── Services/
│   ├── BillingService.cs                       # NEW: orchestrates ProxyPay calls + commission writes
│   ├── BillingReconciliationService.cs         # NEW: polls ProxyPay for unsettled invoices
│   ├── InvoiceFeeService.cs                    # KEPT, refactored to consume proxypay_invoice_id
│   ├── InvoiceService.cs                       # DELETED in US3
│   ├── SubscriptionService.cs                  # DELETED in US3
│   └── ProxyPayService.cs                      # DELETED in US3 (replaced by BillingService + frontend direct)
├── Services/Interfaces/
│   ├── IBillingService.cs                      # NEW
│   ├── IBillingReconciliationService.cs        # NEW
│   ├── IInvoiceService.cs                      # DELETED in US3
│   └── ISubscriptionService.cs                 # DELETED in US3
├── Entities/
│   ├── NetworkModel.cs                         # EDIT: add ProxyPayStoreId, ProxyPayClientId, EnsureProxyPayStore method
│   ├── InvoiceModel.cs                         # DELETED in US3
│   └── SubscriptionModel.cs                    # DELETED in US3
└── Factory/
    ├── InvoiceDomainFactory.cs                 # DELETED in US3
    └── SubscriptionDomainFactory.cs            # DELETED in US3

MonexUp.Infra/
├── AppServices/
│   ├── ProxyPayClient.cs                       # NEW: minimal HTTP client (Store/insert + Invoice query)
│   ├── ProxyPayAppService.cs                   # SLIM: keep PIX/QR helpers used today; remove invoice-DB write helpers
│   └── LofnStoreClient.cs                      # UNCHANGED (precedent for ProxyPayClient)
├── Repository/
│   ├── NetworkRepository.cs                    # EDIT: TrySetProxyPayStore (analog of TrySetLofnStoreId)
│   ├── InvoiceRepository.cs                    # DELETED in US3
│   ├── InvoiceFeeRepository.cs                 # KEPT, repointed to proxypay_invoice_id
│   └── SubscriptionRepository.cs               # DELETED in US3
├── Context/
│   ├── Network.cs                              # EDIT: ProxyPayStoreId, ProxyPayClientId
│   ├── Invoice.cs                              # DELETED in US3
│   └── Subscription.cs                         # DELETED in US3
├── MonexUpContext.cs                           # EDIT: drop DbSet<Invoice>/<Subscription>; add columns to Network
└── Migrations/
    └── 2026MMDDhhmmss_BillingMigrationToProxyPay.cs   # NEW

MonexUp.Application/
├── Initializer.cs                              # EDIT: register IBillingService, IProxyPayClient, IBillingReconciliationService; remove Invoice/Subscription registrations
└── Validators/
    └── BillingRequestValidator.cs              # NEW

MonexUp.DTO/
├── Billing/
│   ├── BillingCreateRequest.cs                 # NEW: input from frontend before passthrough
│   ├── BillingListItemInfo.cs                  # NEW: passthrough projection of ProxyPay BillingInfo + MonexUp metadata
│   └── PaymentCompletionInfo.cs                # NEW: callback shape
├── Invoice/                                     # DELETED in US3 (legacy)
└── Subscription/                                 # DELETED in US3 (legacy)

MonexUp.BackgroundService/
└── Schedules/
    └── ProxyPayReconciliationSchedule.cs       # NEW: every 5min, queries unsettled invoices

monexup-app/                                    # frontend
├── src/
│   ├── App.tsx                                 # EDIT: wrap with ProxyPayProvider where clientId is dynamic per network
│   ├── Contexts/
│   │   └── Billing/                            # NEW
│   │       ├── BillingContext.tsx
│   │       └── BillingProvider.tsx
│   ├── DTO/Domain/
│   │   ├── BillingCreateInfo.tsx               # NEW
│   │   └── BillingListItemInfo.tsx             # NEW
│   ├── Services/
│   │   ├── Interfaces/IBillingService.tsx      # NEW
│   │   └── Impl/BillingService.tsx             # NEW (calls MonexUp /Billing endpoints)
│   ├── Business/
│   │   ├── Interfaces/IBillingBusiness.tsx     # NEW
│   │   ├── Impl/BillingBusiness.tsx            # NEW
│   │   └── Factory/BillingFactory.tsx          # NEW
│   └── Pages/
│       ├── BillingManagePage/                  # NEW (manager UX)
│       ├── BillingCheckoutPage/                # NEW (replaces customer Invoice page)
│       ├── InvoiceSearchPage/                  # DELETED in US3
│       └── SubscriptionManagePage/             # DELETED in US3 (if exists)

MonexUp.Tests/
├── Services/
│   ├── BillingServiceTests.cs                  # NEW
│   ├── BillingReconciliationServiceTests.cs    # NEW
│   ├── InvoiceServiceTests.cs                  # DELETED in US3
│   ├── SubscriptionServiceTests.cs             # DELETED in US3
│   └── ProxyPayServiceTests.cs                 # DELETED in US3

MonexUp.ApiTests/
├── Controllers/
│   ├── BillingControllerTests.cs               # NEW
│   ├── InvoiceControllerTests.cs               # DELETED in US3
│   └── (existing NetworkController/Order tests adjusted)

bruno/
├── Billing/                                     # NEW collection
└── Invoice/                                     # DELETED in US3
```

**Structure Decision**: Web application (Option 2). Two existing top-level codebases (`MonexUp.*` .NET solution + `monexup-app/` React) plus the external `C:\repos\ProxyPay\ProxyPay` (read-only reference, not modified). New code lives where the constitution requires (Service → Factory → Repository in Domain/Infra; Service → Business → Context/Provider → Page in frontend). The reconciliation poller goes into the existing `MonexUp.BackgroundService` host.

## Phase 0: Outline & Research → `research.md`

Five open decisions resolved (one deferred from `/speckit.clarify` Q4 reopened to plan):

1. **Status sync mechanism** — completion-redirect callback (primary) + backend polling job (fallback). Webhook from ProxyPay deferred (project doesn't emit downstream yet).
2. **ProxyPay auth model for billing/invoice** — `clientId` (anonymous endpoint) for payment ops; bearer NAuth only for `/Store/insert` provisioning.
3. **Network → store mapping persistence** — `proxypay_store_id` + `proxypay_client_id` columns on `monexup_networks`; lazy + atomic conditional UPDATE (mirrors feature 004 Lofn pattern).
4. **Commission row write timing** — write `monexup_invoice_fees` only when reconciliation observes status `Paid`. Compute referrer chain at write time (idempotent on `proxypay_invoice_id`).
5. **Refund/partial-refund commission behavior** — full reversal of `monexup_invoice_fees` rows for the invoice when ProxyPay reports `Refunded`. Partial refunds: pro-rata reversal proportional to `refundedAmount / paidAmount`. (Resolves deferred Q4.)

Full rationale in `research.md`.

## Phase 1: Design & Contracts

**Generated**:
- `data-model.md` — 1 modified entity (`Network`), 1 modified entity (`InvoiceFee`), 0 new persisted entities, 3 new transient DTOs.
- `contracts/monexup-billing-endpoints.md` — `POST /Billing/ensure-store`, `GET /Billing/list`, `GET /Billing/invoice/{id}`, `POST /Billing/payment-completed`.
- `contracts/proxypay-endpoints-used.md` — every ProxyPay endpoint MonexUp depends on, including the response schemas to deserialize.
- `quickstart.md` — operator-runnable steps to verify end-to-end (create network → ensure store → frontend creates billing → simulate payment → verify commission).

## Complexity Tracking

> No constitution violations. Section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

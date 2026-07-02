# Implementation Plan: Backend ProxyPay proxy and order lifecycle

**Branch**: `008-backend-proxypay-orders` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-backend-proxypay-orders/spec.md`

## Summary

Make MonexUp the single gateway to ProxyPay. Today two checkout paths coexist: the **vendor page** goes through the MonexUp API (`POST /Order/createPixPayment`) and correctly records an order, while the **storefront** uses the browser package `proxypay-react` (`<PixPayment>`) to create the PIX invoice **directly on ProxyPay** — producing an invoice with no MonexUp order. The browser then polls `proxypay.online/api/payment/qrcode/status/{id}` directly, so when the buyer pays, MonexUp is never told and the order (when one exists) stays `Incoming` forever.

Technical approach: route **all** PIX charge creation, status checks, and AbacatePay key configuration through MonexUp endpoints; ensure the status endpoint transitions the order `Incoming → Active` (idempotently) on paid; extend the existing background reconciliation to apply the same transition as a backstop; and repoint the frontend (`PixModalContainer`, storefront checkout, `ProxyPayStoreService`) at MonexUp instead of ProxyPay. The backend already owns most ProxyPay methods (`IProxyPayClient`, `IProxyPayAppService`); the missing pieces are the AbacatePay-key method and the order-status side effects.

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend); TypeScript / React 18 (CRA) (frontend)
**Primary Dependencies**: ASP.NET Core Web API, EF Core 9 (Npgsql), NAuth (auth), `IHttpClientFactory` ("ProxyPay" client); frontend: axios via `HttpClient`, i18next, `proxypay-react` (to be removed from the invoice/status path)
**Storage**: PostgreSQL — `monexup_orders`, `monexup_order_items` (existing); no new tables
**Testing**: xUnit (`MonexUp.UnitTests`), Flurl-based API tests (`MonexUp.ApiTests`); frontend vitest
**Target Platform**: Linux server (API + BackgroundService in Docker); browser SPA
**Project Type**: Web application (backend API + BackgroundService + React frontend)
**Performance Goals**: Paid status reflected on the order within 60s of payment (SC-002); status check is a thin proxy call
**Constraints**: No changes to the ProxyPay repo (`C:\repos\ProxyPay`, read-only — request changes from the user); provider credentials/tenant stay server-side (FR-010); no empty `catch` blocks (log via `ILogger`); order-status transitions must be idempotent (FR-007)
**Scale/Scope**: Small — a handful of endpoints and one background side effect; per-network single ProxyPay store; low checkout volume

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No project constitution is defined (`.specify/memory/constitution.md` absent). No ratified gates to evaluate. Applying the repo's `CLAUDE.md` coding rules as de-facto gates:

- **No empty catch blocks** — the ProxyPay proxy code that is touched MUST log via `ILogger` and/or bubble (current `ProxyPayAppService.CheckQRCodeStatusAsync` has a non-logging catch — fix while in scope). ✅ planned
- **Factory/Repository + DI in `Initializer.cs`** — new client method / service wiring follows existing patterns. ✅ planned
- **No product/template code here** (Lofn/Dedalo external) — unaffected. ✅
- **Config via `IConfiguration`/appsettings** — reuse `ProxyPaySetting`; no `Environment.GetEnvironmentVariable`. ✅

**Result**: PASS (no violations; no Complexity Tracking needed).

## Project Structure

### Documentation (this feature)

```text
specs/008-backend-proxypay-orders/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (endpoint contracts)
│   ├── order-pix.md
│   └── network-payment-config.md
├── checklists/
│   └── requirements.md  # from /speckit.specify
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
MonexUp.API/
└── Controllers/
    ├── OrderController.cs          # createPixPayment (exists) + checkPixStatus (make it update the order)
    └── NetworkController.cs        # add AbacatePay key set + hasKey endpoints (proxy)

MonexUp.Domain/
├── Services/
│   ├── SubscriptionService.cs      # order-before-charge already here; harden; add status→order transition entry point
│   ├── OrderService.cs             # add "mark paid / advance to Active" (idempotent)
│   └── ProxyPayService.cs          # CheckQRCodeStatus (exists); add AbacatePay key proxy passthrough
└── Services/Interfaces/            # matching interface updates

MonexUp.Infra.Interfaces/AppServices/
├── IProxyPayClient.cs              # add SetAbacatePayApiKeyAsync + GetHasAbacatePayApiKeyAsync
└── IProxyPayAppService.cs          # (status/qrcode contracts already present)

MonexUp.Infra/
├── AppServices/ProxyPayClient*.cs  # implement new AbacatePay methods (server-side, NAuth bearer)
├── AppServices/ProxyPayAppService.cs # fix non-logging catch
└── Services/BillingReconciliationService.cs # extend: advance order Incoming→Active on paid (backstop)

MonexUp.Application/Initializer.cs  # DI wiring for any new registrations (if needed)

monexup-app/src/
├── Pages/StorefrontPage/PixModalContainer.tsx  # stop calling proxypay.online directly; poll MonexUp status; render QR from backend BrCode
├── Pages/StorefrontPage/*                       # storefront checkout → POST /Order/createPixPayment (like VendorProductPage)
├── Components/NetworkAwareProxyPayProvider.tsx  # remove/retire direct proxypay-react invoice creation
├── Services/Impl/OrderService.tsx               # checkPixStatus already targets MonexUp — reuse
└── Services/Impl/ProxyPayStoreService.tsx       # repoint AbacatePay key/hasKey from ProxyPay → MonexUp endpoints
```

**Structure Decision**: Web-application layout. Backend follows the existing DDD layering (Controllers → Domain services → Infra clients/repositories, DI in `Initializer.cs`). Frontend follows the existing Service→Business→Factory→Page layering. No new projects, no new tables — this feature closes orchestration gaps in existing components.

## Complexity Tracking

No constitution violations. Table intentionally omitted.

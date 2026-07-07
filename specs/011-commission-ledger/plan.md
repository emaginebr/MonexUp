# Implementation Plan: Commission Ledger (InvoiceFee) — Balance & Statement

**Branch**: `011-commission-ledger` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-commission-ledger/spec.md`

## Summary

The commission subsystem already generates and stores `InvoiceFee` rows on paid sales (single-level seller commission from the profile percentage, idempotent, with refund reversal) and already exposes read endpoints + a dashboard balance card and statement fragment. This feature **verifies** that and **fixes the gaps** so the stated goal holds:

1. **Correct total balance** — the current `GetBalance` sums rows where `PaidAt IS NULL`, but every fee is written with `PaidAt` set, so it returns ~0. Recompute the member's **total** (non-reversed, active-network) balance and expose the **released** (matured) vs **maturing** split.
2. **Ownership scoping** — statement/balance reads currently trust client-supplied `userId`/`networkId`. Scope a member to their own rows in the active network; a Network Manager sees the **network's own-cut** rows for networks they manage.
3. **Reversal visibility** — map `ReversedAt` into the domain read model so the balance excludes reversed rows and the statement marks them.
4. **Dedicated statement page** + **dashboard total** wired to the fixed balance.

**Agent delegation (per request):** backend fixes → `dotnet-senior-developer`; statement page design → `ux-designer` → React via `frontend-react-developer`; dashboard total → `frontend-react-developer`; tests → `qa-developer`.

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend); React 18 + TypeScript (CRA) frontend
**Primary Dependencies**: ASP.NET Core Web API, EF Core 9.x (Npgsql), NAuth (`IUserClient` for names), i18next; **no new dependency**
**Storage**: PostgreSQL — existing `monexup_invoice_fees` table. Columns already present (`reversed_at`, `withdrawal_due_date`, `role`, `paid_amount_cents_at_record`) → **no migration**
**Testing**: xUnit (`MonexUp.UnitTests`) for balance/scoping logic; `MonexUp.ApiTests` for the endpoints; UI via quickstart
**Target Platform**: Web (MonexUp API + monexup-app SPA)
**Project Type**: Web application (backend + frontend monorepo)
**Performance Goals**: balance + statement load within a few seconds for a member with hundreds of entries (SC-007)
**Constraints**: active-network scope; member sees only own data; manager sees network own-cut; reversed excluded from balance; read-only (no withdrawal settlement)
**Scale/Scope**: fix 1 repository query (+add member/available per-network), add ownership enforcement in the billing controller/service, map `ReversedAt` in the read model, extend statement DTO with reversal/status; frontend adds a statement page + menu item and wires the dashboard total

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | PASS | Fixes stay in Repository (balance query), Service (`BillingService` scoping), Controller (session-derived identity), and the `InvoiceFeeModel`/interface (map `ReversedAt`). No repo access from models beyond existing pattern. |
| II. Frontend em Camadas (React) | PASS | Reuses the **Invoice** module (Service/Business/Provider already exist). New `StatementPage` + menu item; dashboard total re-points to the fixed balance. |
| III. Delegação a Projetos Externos (NON-NEGOTIABLE) | PASS | Names via NAuth `IUserClient` (already). Payments stay in ProxyPay — **generation flow unchanged**. No external-domain logic reimplemented. |
| IV. Configuração e Secrets | PASS | No new configuration/secrets. |
| V. Internacionalização | PASS | Statement page + any new labels added to pt/en/es/fr. |
| VI. Banco de Dados e Migrations | PASS | No new table and **no migration** — required columns already exist; only read queries change. |
| VII. Registro de Dependências | PASS | No new service/factory/provider to register (extends existing `BillingService`/`InvoiceFeeRepository`/`InvoiceProvider`). |

**Result**: PASS — no violations. Complexity Tracking not required.

*Post-Phase-1 re-check*: PASS (no new persistence, no external-domain encroachment, generation flow untouched).

## Project Structure

### Documentation (this feature)

```text
specs/011-commission-ledger/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── billing-api.md   # Phase 1 output — fixed/added endpoints
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
MonexUp.Infra/
├── Repository/InvoiceFeeRepository.cs      # FIX GetBalance predicate; add per-network member total/released/maturing + network own-cut sums; map ReversedAt
└── Context/InvoiceFee.cs (POCO unchanged — columns already exist)

MonexUp.Domain/
├── Entities/InvoiceFeeModel.cs (+ Interfaces/IInvoiceFeeModel.cs)   # surface ReversedAt in the read model; balance helpers
└── Services/BillingService.cs (+ interface)                          # ownership scoping: member→own rows, manager→network own-cut; active-network scope

MonexUp.API/
└── Controllers/BillingController.cs         # derive identity from session; add member-balance endpoint; enforce manager-of-network for network figures

MonexUp.DTO/
└── Invoice/                                 # MemberBalanceInfo {total, released, maturing}; StatementInfo += reversed/status

MonexUp.UnitTests/ + MonexUp.ApiTests/
└── balance calculation, ownership scoping, statement status + endpoint tests

monexup-app/src/
├── Services/Impl/InvoiceService.tsx         # add member-balance call; scope statement/balance to active network
├── Business/Impl/InvoiceBusiness.tsx        # (if present) session token + network id
├── Contexts/Invoice/InvoiceProvider.tsx     # expose total/released/maturing + statement (active network)
├── Pages/DashboardPage/                      # wire the (now correct) total into the balance card
├── Pages/Admin/StatementPage/index.tsx       # NEW dedicated statement page
├── Components/AdminSidebar.tsx               # NEW "Extrato" menu item
├── App.tsx                                    # NEW /admin/statement route
└── public/locales/{pt,en,es,fr}/translation.json  # new keys
```

**Structure Decision**: Existing MonexUp monorepo. Backend changes are read-path fixes (query, scoping, read-model field) — no new entity, no migration. Frontend reuses the Invoice module and adds one page + menu item + route, and re-points the dashboard total.

## Complexity Tracking

> No constitution violations — section intentionally empty.

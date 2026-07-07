---
description: "Task list for Commission Ledger — Balance & Statement"
---

# Tasks: Commission Ledger (InvoiceFee) — Balance & Statement

**Input**: Design documents from `/specs/011-commission-ledger/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/billing-api.md

**Tests**: Included (backend unit + API integration per plan). UI verified via quickstart.md.

**Organization**: Verify-and-fix on an existing subsystem. No new DB table/migration (columns already exist). Agent delegation: `dotnet-senior-developer` (backend), `ux-designer` (statement page design), `frontend-react-developer` (React), `qa-developer` (tests), `analyst` (docs).

## Path Conventions

Backend under `MonexUp.*` projects; frontend under `monexup-app/src`. Repo root `C:\repos\MonexUp`.

---

## Phase 1: Setup

- [X] T001 Confirm no EF migration needed (`reversed_at`, `withdrawal_due_date`, `role`, `paid_amount_cents_at_record` already on `monexup_invoice_fees`); review `contracts/billing-api.md` + `data-model.md` before coding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend read-path fixes (balance calc, reversal read-model, ownership scoping, endpoints) + frontend data layer that both US1 and US2 depend on

**⚠️ CRITICAL**: US1 and US2 depend on this phase

### Backend (delegate: dotnet-senior-developer)

- [X] T002 [P] Add `MemberBalanceInfo { total, released, maturing }` and extend `StatementInfo` with `reversed:bool` + `status:string` (released/maturing/reversed) in `MonexUp.DTO/Invoice/`
- [X] T003 [P] Surface `ReversedAt` (DateTime?) in `MonexUp.Domain/Entities/Interfaces/IInvoiceFeeModel.cs` + `MonexUp.Domain/Entities/InvoiceFeeModel.cs`, and map it in `MonexUp.Infra/Repository/InvoiceFeeRepository.cs` `DbToModel`
- [X] T004 Fix + extend `InvoiceFeeRepository` (+ `IInvoiceFeeRepository`): replace `GetBalance` predicate `!PaidAt.HasValue` with `PaidAt.HasValue && !ReversedAt.HasValue`; add scoped sums — total (`PaidAt` set, `ReversedAt` null), released (+ `WithdrawalDueDate <= today`) for `(networkId, userId)` and for network own-cut (`userId IS NULL`, `networkId`); ensure `Search` can carry reversal (via T003 mapping)
- [X] T005 `MonexUp.Domain/Services/BillingService.cs` (+ interface): add member balance (`total`/`released`/`maturing = total-released`) for session user in a network; add network own-cut balance with **NetworkManager-of-network guard**; harden `SearchStatement` — force `userId = session` for members / own-cut for managers, ignore client `userId`, and populate `reversed`/`status` on each `StatementInfo`
- [X] T006 `MonexUp.API/Controllers/BillingController.cs`: add `[Authorize] GET /Billing/my-balance/{networkId}` → `MemberBalanceInfo` (session identity); add `[Authorize] GET /Billing/network-balance/{networkId}` → own-cut (403 if caller is not NetworkManager of it); harden `searchStatement` (derive identity from session, ignore client `userId`); fix `getBalance` identity/scoping
- [X] T007 [P] Unit tests `MonexUp.UnitTests` (balance calc: total/released/maturing, reversed excluded; status derivation; member vs manager scoping; predicate-bug regression → non-zero for paid rows)
- [X] T008 [P] API tests `MonexUp.ApiTests/Controllers/BillingControllerTests.cs` (401 unauth on my-balance/network-balance/searchStatement; member 3 commissions 10/20/30 → total 60; reversed drops total; non-manager network-balance → 403; member cannot read another member's data)

### Frontend data layer (delegate: frontend-react-developer)

- [X] T009 [P] `monexup-app/src` Invoice DTO/types: add `MemberBalanceInfo` and `reversed`/`status` on the statement type; `Services/Impl/InvoiceService.tsx` (+interface) `getMyBalance(networkId)` → GET `/Billing/my-balance/{id}`, `getNetworkBalance(networkId)` → GET `/Billing/network-balance/{id}`; scope statement search to the active network
- [X] T010 `Contexts/Invoice/InvoiceProvider.tsx` (+ Business/interface if present): expose `total`/`released`/`maturing` and the active-network-scoped statement; keep existing methods working

**Checkpoint**: `my-balance`/`network-balance` return correct figures; statement is ownership-scoped with reversal flags; frontend can fetch them

---

## Phase 3: User Story 1 - See my total commission balance (Priority: P1) 🎯 MVP

**Goal**: The member's correct total balance (with released/maturing split) shows on `/admin/dashboard`; manager sees the network own-cut.

**Independent Test**: With paid commissions (some matured, one reversed), open the dashboard and confirm the total equals the sum of non-reversed commissions and reconciles with released+maturing.

- [X] T011 [US1] Wire `monexup-app/src/Pages/DashboardPage` balance card to the fixed provider: Seller → `getMyBalance(activeNetworkId)` showing `total` with `released`/`maturing`; NetworkManager → `getNetworkBalance(activeNetworkId)`; plain User → unchanged (no balance)
- [X] T012 [P] [US1] Add i18n keys for total/released/maturing labels to `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

**Checkpoint**: dashboard shows a correct, reconciling total — MVP shippable

---

## Phase 4: User Story 2 - View my full commission statement (Priority: P1)

**Goal**: A dedicated statement page lists every commission the member received (paged), reversed rows marked, reachable from the menu.

**Independent Test**: Open the statement page as a member with many commissions; confirm each row shows date/source/amount/status, paginates, marks reversed, and reconciles with the balance.

- [X] T013 [US2] `ux-designer`: design the dedicated statement page — list/table of commissions (date, source: network/product/buyer, amount, status chip released/maturing/reversed), reversed-row treatment, header/breadcrumb, empty + loading states, pagination; deliver HTML/CSS + tokens + component spec (no `.tsx`), faithful to the existing admin surface and the current `StatementPart` styling
- [X] T014 [US2] Implement `monexup-app/src/Pages/Admin/StatementPage/index.tsx` per design: read active network from context, page through the scoped statement, render rows with status/reversed marking, loading/empty/error states (reuse/extend `Pages/DashboardPage/StatementPart.tsx` styling)
- [X] T015 [US2] Add an **"Extrato"** `SidebarItem` in `monexup-app/src/Components/AdminSidebar.tsx` (finances group, suitable lucide icon, `active`/`onClick` → `/admin/statement`) and register route `path="admin/statement"` → `StatementPage` in `monexup-app/src/App.tsx`
- [X] T016 [P] [US2] Add i18n keys (menu "Extrato", page title, column labels, status labels released/maturing/reversed, empty-state) to `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

**Checkpoint**: dedicated statement page functional and reconciles with the balance

---

## Phase 5: User Story 3 - Commissions generated correctly on paid sales (Priority: P2)

**Goal**: Verify (not rebuild) that a paid sale records exactly one seller commission = profile% × amount, idempotent, and that a refund reverses it.

**Independent Test**: Mark a sale paid → one seller commission at the profile percentage; re-process → no duplicate; refund → reversed.

- [X] T017 [US3] `qa-developer`: add verification tests around the existing generation path (`MonexUp.Infra/Services/BillingFeeService.RecordPaidProxyPayInvoice`) in `MonexUp.UnitTests` — seller commission = profile.Commission% × paid amount; idempotent on `(proxypay_invoice_id, user_id, role)`; full/partial refund reversal. Report any deviation from spec FR-001/003/004 (do NOT change generation logic unless a defect is confirmed and approved)

**Checkpoint**: generation behaviour confirmed correct (or defects flagged)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Run `quickstart.md` end-to-end: member total/released/maturing, statement completeness + reversal marking, dashboard↔statement reconciliation, manager own-cut, ownership (no leak / 403), active-network switch, i18n (pt/en/es/fr), perf (SC-007) [pending] — **MANUAL / pending user**: requires running API + monexup-app + PostgreSQL + seeded commissions
- [X] T019 [P] Document the commission balance/statement in `docs/` (analyst-owned): balance definitions (total/released/maturing), endpoints, ownership scoping, reversal handling, the GetBalance fix

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (P1)**: none
- **Foundational (P2)**: after Setup — BLOCKS US1 and US2
- **US1 (P3)** and **US2 (P4)**: after Foundational; independent of each other
- **US3 (P5)**: after Setup; independent of US1/US2 (generation unchanged) — can run in parallel with Foundational
- **Polish (P6)**: after US1 + US2

### Within phases

- Backend chain (same files `InvoiceFeeRepository.cs`/`BillingService.cs`/`BillingController.cs`): T002/T003 → T004 → T005 → T006; T007/T008 after T006
- Frontend data: T009 → T010
- US2 UI: T013 (design) → T014; T015 route/menu; T016 i18n

### Parallel Opportunities

- Foundational [P]: T002 (DTOs), T003 (read-model), T009 (frontend types/service) across projects; T007/T008 after the backend chain
- US3 (T017) can proceed independently/early
- US1 [P]: T012 i18n; US2 [P]: T016 i18n
- Backend (dotnet-senior-developer) and frontend data layer (frontend-react-developer) proceed in parallel against the fixed contract (`contracts/billing-api.md`)

---

## Parallel Example: Foundational

```bash
Task: "MemberBalanceInfo + StatementInfo fields (T002)"
Task: "Surface ReversedAt in read model (T003)"
Task: "Invoice frontend types + service calls (T009)"
# after backend chain T004→T006:
Task: "Unit tests balance/scoping (T007)"
Task: "API tests endpoints (T008)"
```

---

## Implementation Strategy

MVP = US1: fix the balance calculation + ownership on the backend (Foundational) and show the correct total on the dashboard. US2 (dedicated statement page) and US3 (generation verification) follow. Backend and frontend-data build in parallel against the fixed contract; the dashboard and statement page assemble once both land.

---

## Notes

- **No migration** — required columns already exist (data-model.md).
- **Do not touch the generation/payment flow** — US3 only verifies it. Changes to `BillingFeeService`/reconciliation are out of scope unless a confirmed defect is approved.
- **Security**: identity is server-derived from the session; never trust a client-supplied `userId`/`networkId` for scoping (FR-007/FR-007a).
- Reversed rows are excluded from balances but shown (flagged) in the statement.
- All user-facing strings via i18n (pt/en/es/fr).
- Stacked on uncommitted 009/010 — recommend committing before/with this work.

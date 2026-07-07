# Phase 0 Research: Commission Ledger — Balance & Statement

Grounded in an as-is investigation of the existing InvoiceFee subsystem (main working tree). All spec clarifications resolved.

## R1. Total-balance calculation (the core bug)

- **Decision**: In `InvoiceFeeRepository.GetBalance`, replace the predicate `!x.PaidAt.HasValue` with `x.PaidAt.HasValue && !x.ReversedAt.HasValue`. Expose the member's **total** (all non-reversed earned in the network) and **released** (matured: `WithdrawalDueDate <= today`) balances; **maturing = total − released**.
- **Rationale**: Every fee row is inserted with `PaidAt` set (`BillingFeeService`), so `!PaidAt` sums nothing → the endpoint returns ~0. The intended "total" is the sum of earned, non-reversed commissions. `GetAvailableBalance` already uses the correct released predicate — reuse its shape.
- **Alternatives**: A separate "settled" flag — rejected; withdrawal is out of scope, so reversal + maturity fully define the states.

## R2. Balance shape & new endpoint

- **Decision**: Add `MemberBalanceInfo { total, released, maturing }` and a `GET /Billing/my-balance/{networkId}` returning it for the **session user** in that network. Add repository sums scoped by `(networkId, userId)`: total (`PaidAt` set, `ReversedAt` null), released (+ `WithdrawalDueDate <= today`). `maturing = total − released`.
- **Rationale**: FR-005/FR-006 need one call giving the full picture per active network; the current two endpoints (`getBalance` broken, `getAvailableBalance` userId-only, no network scope) don't. One DTO keeps the dashboard + statement consistent.
- **Alternatives**: Reuse `getBalance` alone — ambiguous (member vs network semantics) and not split; kept only for the manager path (R4).

## R3. Reversal visibility in the read model

- **Decision**: Add `ReversedAt` to `IInvoiceFeeModel` + `InvoiceFeeModel`, and map it in `InvoiceFeeRepository.DbToModel`. Add `Reversed` (bool) and a derived `Status` (Released / Maturing / Reversed) to `StatementInfo`. The balance queries filter `ReversedAt IS NULL`; the statement keeps reversed rows but flags them.
- **Rationale**: The domain read model currently drops `ReversedAt`, so any consumer can't tell a row is reversed — the statement could show reversed/negative rows with no indication (FR-011). Status derivation: `ReversedAt != null` → Reversed; else `WithdrawalDueDate <= today` → Released; else → Maturing.
- **Alternatives**: Raw SQL in the service — rejected; mapping the column into the existing model is cleaner and reusable.

## R4. Ownership scoping (security)

- **Decision**: Derive identity from the session in `BillingService`/`BillingController`; do not trust client-supplied `userId`.
  - **Member (Seller)** → statement/balance forced to `userId = session.UserId`, `networkId = active network`; client `userId` ignored.
  - **Network Manager** → sees the **network's own-cut** rows (`userId IS NULL`, `networkId = X`) via `GET /Billing/network-balance/{networkId}` and a network-scoped statement — **only for networks they manage** (verify the caller's `UserNetwork.Role == NetworkManager` for `X`, else 403).
- **Rationale**: FR-007/FR-007a. Today `searchStatement`/`getBalance` trust the client, so a member could read another member's or an arbitrary network's data (SC-005). Manager network figures = own-cut per the clarification, not aggregated member earnings.
- **Alternatives**: Client-supplied scoping with a post-filter — rejected (leaks by construction).

## R5. Active-network scope

- **Decision**: All member balance/statement reads are scoped to a single `networkId` (the active/selected network from the frontend's network context). No cross-network aggregation.
- **Rationale**: Clarification — withdrawal maturity is per network and the dashboard already operates on a selected network.

## R6. Frontend — statement page + dashboard total

- **Decision**: Reuse the existing **Invoice** module (`InvoiceService`/`InvoiceProvider`, `BalanceCard`, `StatementPart`). Point the dashboard total at `my-balance` (`total`, with `released`/`maturing` shown). Add a **dedicated** `StatementPage` (route `/admin/statement`, menu item "Extrato" in `AdminSidebar`) that renders the paged statement (reusing/extending `StatementPart`) for the member's active network, marking reversed rows. `ux-designer` designs the page; `frontend-react-developer` implements.
- **Rationale**: FR-009/FR-010. The dashboard already has a balance card + statement fragment; the ask is a correct total and a standalone statement page. No new library.
- **Alternatives**: Build a fresh earnings module — rejected; the Invoice module already exists and is wired.

## R7. Migration?

- **Decision**: **No migration.** `reversed_at`, `withdrawal_due_date`, `role`, `paid_amount_cents_at_record` already exist on `monexup_invoice_fees`. Only read queries, the read model, and DTOs change.
- **Rationale**: Confirmed via `MonexUpContext` config + the EF POCO.

## Out-of-scope confirmations

- Withdrawal settlement, multi-level MMN chain, and changes to the payment-confirmation/generation flow are **not** touched (spec Out of Scope). The generation path (`BillingFeeService.RecordPaidProxyPayInvoice`) is verified but unchanged.

## Resolved unknowns

Balance fix (R1), balance shape/endpoint (R2), reversal read-model (R3), ownership (R4), network scope (R5), frontend surfaces (R6), no-migration (R7). No open unknowns.

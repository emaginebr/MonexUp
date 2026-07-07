# Feature Specification: Commission Ledger (InvoiceFee) — Balance & Statement

**Feature Branch**: `011-commission-ledger`
**Created**: 2026-07-06
**Status**: Draft
**Input**: User description: "Verify the InvoiceFee entity works as intended — it must store commissions earned from sales; when a sale is made and paid it must generate commissions based on the user's profile; commissions are held until withdrawal (withdrawal out of scope now); the total balance must be available to the user; the user must have an account statement page; on the frontend show this total on /admin/dashboard; create a statement page listing all received commissions."

## Context (as-is)

A commission subsystem already exists. Commissions from paid sales are recorded as `InvoiceFee` rows (per network, per user), generated automatically when a ProxyPay invoice is paid — valued from the seller's profile commission percentage — with idempotency and refund reversal. Read endpoints (statement search, balance, available balance) exist and the `/admin/dashboard` already renders a balance card and a statement fragment.

This feature **verifies** that behaviour and **closes the gaps** that prevent the stated goal — a member reliably seeing their **correct total commission balance** and a **complete statement** of commissions earned — and delivers a **dedicated statement page**. It does not rebuild what already works.

## Clarifications

### Session 2026-07-06

- Q: For a Network Manager, what do "network figures" mean (balance/statement)? → A: The network's **own cut** — commission records whose recipient is the network (not individual members), shown separately from members' commissions.
- Q: Is a member's balance/statement scoped to the active network or all their networks? → A: **Active network only** — follows the dashboard's selected-network context (withdrawal maturity is per network).
- Q: Definition of the member's "total balance"? → A: All non-reversed, non-withdrawn commissions (matured + maturing), with the released (matured) portion shown separately.
- Q: Audience for the balance total and statement page? → A: As today — Sellers see personal figures, Network Managers see the network's own-cut figures, plain Users see no balance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See my total commission balance (Priority: P1)

As a member who earns commissions from sales, I want to see the correct total value of the commissions I have accumulated, so I know how much I have earned and will be able to withdraw later.

**Why this priority**: The core promise — "the total balance must be available to the user". Today the total-balance figure is unreliable (returns effectively zero), so this is the highest-value fix.

**Independent Test**: With several paid sales generating commissions for a member, open the dashboard and confirm the displayed total equals the sum of that member's non-reversed commissions; confirm a reversed sale lowers it.

**Acceptance Scenarios**:

1. **Given** a member has 3 paid sales generating commissions of 10, 20, 30, **When** they open `/admin/dashboard`, **Then** their total commission balance shows 60.
2. **Given** one of those sales is later refunded, **When** the member reopens the dashboard, **Then** the total no longer includes that commission.
3. **Given** a member has earned nothing, **When** they open the dashboard, **Then** the total shows 0 (not an error).
4. **Given** part of the balance has matured past its withdrawal-release date and part has not, **When** the member views the balance, **Then** they can see how much is already released for withdrawal versus still maturing.

---

### User Story 2 - View my full commission statement (Priority: P1)

As a member, I want a dedicated statement page listing every commission I have received, so I can audit where my earnings came from.

**Why this priority**: Directly requested ("must have an account statement page"; "create a statement page listing all received commissions"). Complements US1 — the balance is the sum, the statement is the detail.

**Independent Test**: Open the statement page as a member with many commissions and confirm each row shows date, source and amount, paginates, and that the visible amounts reconcile with the balance.

**Acceptance Scenarios**:

1. **Given** a member with commissions across several sales, **When** they open the statement page, **Then** they see a paged list, each entry showing the date paid, the source (network / product / buyer), the amount, and its status (released / maturing / reversed).
2. **Given** a commission was reversed by a refund, **When** the member views the statement, **Then** that entry is clearly marked as reversed (and its effect on the total is evident).
3. **Given** the statement is reached from the navigation menu, **When** the member clicks it, **Then** the statement page opens for their own account.

---

### User Story 3 - Commissions are generated correctly on paid sales (Priority: P2)

As the platform, when a sale is paid, I must record the seller's commission based on their profile, exactly once, so the member's balance and statement are correct and auditable.

**Why this priority**: This behaviour largely exists; the story is to **verify** it and guarantee the balance built on top is correct. It underpins US1/US2 but needs no new user-facing surface.

**Independent Test**: Mark a sale paid and confirm exactly one commission record appears for the seller, valued at the seller's profile percentage of the paid amount; re-processing the same payment creates no duplicate; a refund reverses it.

**Acceptance Scenarios**:

1. **Given** a sale with a seller whose profile commission is 10% and a paid amount of 100, **When** the payment is confirmed, **Then** a commission of 10 is recorded for that seller, held until withdrawal.
2. **Given** the same payment confirmation is processed twice, **When** commissions are recorded, **Then** only one commission record exists for that sale/seller.
3. **Given** a paid sale is refunded, **When** the refund is processed, **Then** the seller's commission is reversed so it no longer counts toward the balance.

---

### Edge Cases

- Seller's profile commission is 0 or the profile is missing → no commission recorded; balance unaffected; no error.
- Payment confirmed but seller cannot be determined → no seller commission recorded (network/platform cuts unaffected).
- A member requests another member's balance or statement, or an arbitrary network's data → the system must not disclose it (a member sees only their own).
- Partial refund → the reversal reduces the balance proportionally.
- Commission earned but not yet matured for withdrawal → included in the total, but shown as still maturing (not yet released).
- Large statement (hundreds of entries) → paginates without degrading load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a sale is paid, the system MUST record a commission for the seller valued as the seller's profile commission percentage applied to the paid amount, held until withdrawal.
- **FR-002**: Commission records MUST persist after being recorded and MUST NOT be consumed/removed by any current process (withdrawal settlement is out of scope); they remain available for balance and statement.
- **FR-003**: The system MUST NOT create duplicate commission records for the same paid sale and seller, even if the payment confirmation is processed more than once.
- **FR-004**: When a paid sale is refunded (fully or partially), the system MUST reverse the corresponding commission (fully or proportionally) so it stops counting toward the balance.
- **FR-005**: The system MUST expose a member's **total commission balance** for the **active network** equal to the sum of that member's commission amounts in that network that are not reversed and not yet withdrawn. *(Fixes the current total-balance calculation, which returns effectively zero.)*
- **FR-006**: The system MUST let the member distinguish the portion of the balance already **released for withdrawal** (matured) from the portion still **maturing**.
- **FR-007**: A member MUST be able to view only **their own** balance and statement, scoped to the **active network**; the system MUST NOT return another member's or an unrelated network's commission data to them.
- **FR-007a**: A **Network Manager** MUST see the **network's own-cut** figures (commission records whose recipient is the network, not individual members) for the active network — shown as the network balance/statement — and MUST NOT be shown individual members' personal commissions as their own balance.
- **FR-008**: The system MUST provide a **statement** of all commissions a member received, each entry showing at least: date paid, source (network, product, buyer/seller as applicable), amount, and status (released / maturing / reversed).
- **FR-009**: The `/admin/dashboard` MUST display the member's total commission balance (US1), reconciling with the statement total.
- **FR-010**: A **dedicated statement page**, reachable from the navigation menu, MUST list all commissions the member received, paged.
- **FR-011**: The statement MUST visually distinguish reversed commissions from active ones, with amounts signed correctly.
- **FR-012**: Monetary values MUST be presented in the network's currency and all user-facing text MUST be localized (pt/en/es/fr).

### Key Entities *(include if feature involves data)*

- **Commission record (InvoiceFee)**: one earned (or reversed) commission tied to a paid sale, a network, and a recipient member; carries the amount, the date paid, a withdrawal-release date (maturity), and a reversal marker. It is the ledger the balance and statement are built from.
- **Member profile (UserProfile)**: defines the commission percentage used to value a seller's commission.
- **Sale/Order**: the paid transaction that triggers commission generation and identifies the seller.
- **Withdrawal** *(referenced, out of scope)*: the future process that would settle matured commissions; today only a maturity date links to it — no settlement occurs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member's displayed total balance equals the exact sum of their non-reversed, non-withdrawn commissions in 100% of test cases (no more phantom-zero balances).
- **SC-002**: After a refund, the member's total balance and statement reflect the reversal on the member's next view.
- **SC-003**: A member can open their statement and see every commission they received, paginated, with each entry's date, source, amount and status.
- **SC-004**: The dashboard total and the statement sum reconcile (agree) for the same member.
- **SC-005**: A member cannot retrieve another member's or an unrelated network's balance or statement.
- **SC-006**: For a paid sale, exactly one seller commission record exists (no duplicates), valued at the profile percentage; a refund reverses it.
- **SC-007**: The balance and statement load within a few seconds for a member with hundreds of commission entries.

## Assumptions

- **Single-level commission**: commission is recorded for the **direct seller** based on their profile percentage, matching the current behaviour and the phrasing "based on the user's profile". Multi-level payout up the referral chain is **not** in scope (see Out of Scope).
- **"Held until withdrawal"**: since withdrawal is out of scope and unimplemented, commissions are simply retained; nothing consumes them. The balance is therefore all non-reversed earned commissions.
- **Balance definition** *(confirmed 2026-07-06)*: the **total** balance includes commissions that have not yet matured for withdrawal, with the released (matured) portion shown separately — so the member sees their full earnings, not only the withdrawable slice.
- **Audience** *(confirmed 2026-07-06)*: the balance total and statement are for members who earn commissions (sellers, personal figures), with network managers seeing the **network's own-cut** figures (recipient = network), consistent with the existing dashboard role gating. Plain "User" role sees no balance.
- **Network scope** *(confirmed 2026-07-06)*: balance and statement are scoped to the **active (selected) network**, not aggregated across all of a member's networks.
- Platform-level and network-level cut records (recipient = platform/network, not an individual member) are excluded from an individual member's personal balance/statement.

## Out of Scope

- **Withdrawal / payout processing** (creating, approving, or settling withdrawals; decrementing commissions on withdrawal).
- **Multi-level (MMN) commission** distribution up the referrer chain and any use of profile Level for tiered payouts. Only the direct seller's commission is in scope.
- Changes to how payments are confirmed (ProxyPay integration, webhook, reconciliation cadence).
- Wiring statement filter controls (date/status/network filters) beyond basic pagination.
- Editing or manually adjusting commissions.

## Dependencies

- Existing payment-confirmation flow that marks sales paid (ProxyPay callback + background reconciliation) — the trigger for commission generation. Unchanged by this feature.
- Referral relationships (feature 009) and profiles are prerequisites for correct seller attribution.

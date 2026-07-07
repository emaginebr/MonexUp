# Quickstart: Commission Ledger — Balance & Statement

Manual verification after implementation. Assumes API + `monexup-app` running, PostgreSQL reachable, and a network with paid sales that generated commissions.

## Prerequisites

- A member (Seller) with several paid sales that produced commissions (some matured past their withdrawal-release date, some not; ideally one refunded/reversed).
- A Network Manager account for the same network.

## Steps — member balance & statement

1. Log in as the Seller, select the network, open `/admin/dashboard`.
2. Confirm the **total commission balance** equals the sum of that member's non-reversed commissions (no longer ~0). Confirm the **released** (withdrawable) and **maturing** figures are shown and `total = released + maturing`.
3. Click **Extrato** in the sidebar → the dedicated statement page opens.
4. Confirm every commission the member received is listed (paged), each with date paid, source (network / product / buyer), amount, and status (released / maturing / reversed).
5. Confirm a reversed commission is clearly marked and is **excluded** from the total balance.
6. Confirm the statement total reconciles with the dashboard total.

## Steps — manager network figures

7. Log in as the Network Manager, open the dashboard → the balance reflects the **network's own cut** (recipient = network), not individual members' earnings.
8. Open the statement → network own-cut rows only.

## Edge / security checks

- **No earnings**: a member with no commissions sees total 0, empty statement, no error.
- **Ownership**: attempting to fetch another member's balance/statement (e.g. tampering the request) returns only the caller's own data — no leak (SC-005).
- **Manager guard**: a non-manager hitting the network-balance endpoint is refused (403).
- **Refund**: reverse a paid sale → the member's total drops and the statement row shows reversed on next view.
- **Active-network scope**: switch the active network → balance/statement reflect only that network.

## i18n check

- Switch language (pt/en/es/fr): menu label "Extrato", statement page title, column labels, status labels (released/maturing/reversed), and empty-state text are all translated.

## Performance check

- Balance + statement load within a few seconds for a member with hundreds of commission entries (SC-007).

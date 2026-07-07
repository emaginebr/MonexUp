# Phase 1 Data Model: Commission Ledger

**No new tables, no migration.** Reuses `monexup_invoice_fees`. Adds transient DTOs and surfaces one existing column (`reversed_at`) in the domain read model.

## Existing entity (reused): InvoiceFee (`monexup_invoice_fees`)

| Column | Type | Role in this feature |
|--------|------|----------------------|
| `fee_id` | long (PK) | Statement row id. |
| `proxypay_invoice_id` | long? | Source paid invoice; part of the idempotency unique index `(proxypay_invoice_id, user_id, role)`. |
| `network_id` | long? | Network scope. `NULL` for platform-level cut. |
| `user_id` | long? | Recipient member. **`NULL` = network's own cut** (the manager view). |
| `amount` | double | Commission value (negative for partial-refund reversal rows). |
| `paid_at` | datetime? | When the source sale was paid. Always set for real rows. |
| `withdrawal_due_date` | datetime? | Maturity: released for withdrawal once `<= today`. |
| `reversed_at` | datetime? | Set when the source sale was refunded (full reversal). **Now surfaced in the read model.** |
| `role` | int? | Recipient role slot (multi-recipient support). Unused by this feature (single-level). |
| `paid_amount_cents_at_record` | long? | Audit of gross paid. Not surfaced. |

### Read-model change

`IInvoiceFeeModel` / `InvoiceFeeModel` gain **`ReversedAt`** (DateTime?), mapped in `InvoiceFeeRepository.DbToModel`. (Currently dropped.)

## Derived: commission status (per row)

Computed, not stored:

- **Reversed** — `reversed_at != null`.
- **Released** — not reversed AND `withdrawal_due_date <= today` (matured, withdrawable).
- **Maturing** — not reversed AND (`withdrawal_due_date` null OR `> today`).

## Balance definitions (per member, per active network)

For `(networkId, userId)` where `userId = session member`:

- **total** = Σ `amount` where `paid_at` set AND `reversed_at` null.
- **released** = same, AND `withdrawal_due_date <= today`.
- **maturing** = total − released.

For a **Network Manager** viewing the network's own cut, the same three sums with `userId IS NULL` and `network_id = X` (only for networks the caller manages).

*Fix*: the current `GetBalance` predicate (`paid_at IS NULL`) is replaced by `paid_at IS NOT NULL AND reversed_at IS NULL`.

## New DTOs (transient)

### MemberBalanceInfo

| Field | Type | Notes |
|-------|------|-------|
| `total` | double | All non-reversed earned in the active network. |
| `released` | double | Matured portion (withdrawable). |
| `maturing` | double | `total − released`. |

### StatementInfo (extended)

Existing fields (feeId, proxyPayInvoiceId, networkId, networkName, userId, buyerName, sellerId, sellerName, description, amount, paidAt, withdrawalDueDate) plus:

| Field | Type | Notes |
|-------|------|-------|
| `reversed` | bool | `reversed_at != null`. |
| `status` | enum/string | `released` / `maturing` / `reversed` (derived, per above). |

## Scoping & invariants

- **Member**: every balance/statement read is forced to `userId = session.UserId` and a single `networkId`; a client-supplied `userId` is ignored (FR-007).
- **Manager**: network own-cut (`userId IS NULL`) figures/statement only for a `networkId` where the caller's `UserNetwork.Role == NetworkManager`; otherwise 403 (FR-007a).
- **Reversed excluded** from all balance sums; **kept** in the statement, flagged.
- **Read-only**: no writes to `monexup_invoice_fees` from this feature; generation/reversal remain owned by the billing/reconciliation services.
- **Active-network scope**: no cross-network aggregation.

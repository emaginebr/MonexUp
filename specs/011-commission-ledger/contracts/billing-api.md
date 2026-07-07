# Contract: Billing / Commission Read Endpoints

Changes on `BillingController` (MonexUp API, base `/Billing`). `NAuth` scheme, JSON camelCase. Generation/payment endpoints are unchanged.

---

## 1. Member balance — `GET /Billing/my-balance/{networkId}` *(new)*

Authorization: `[Authorize]`. Identity = `GetUserInSession`. Returns the **session member's** commission balance in `networkId`.

**Response 200** — `MemberBalanceInfo`
```json
{ "total": 60.0, "released": 40.0, "maturing": 20.0 }
```
- `total` = Σ non-reversed earned (`paid_at` set, `reversed_at` null) for `userId = session`, `networkId`.
- `released` = total portion with `withdrawal_due_date <= today`.
- `maturing` = `total − released`.
- Member with no commissions → all zeros (200, not error).

**Errors**: `401` (no session).

---

## 2. Network own-cut balance — `GET /Billing/network-balance/{networkId}` *(new)*

Authorization: `[Authorize]` **and** caller must be a **Network Manager of `networkId`** (`UserNetwork.Role == NetworkManager`). Returns the network's own-cut balance (`user_id IS NULL`, `network_id = networkId`).

**Response 200** — `MemberBalanceInfo` (same shape; `total/released/maturing` over own-cut rows).
**Errors**: `401` (no session); `403` (caller does not manage `networkId`).

---

## 3. Statement — `POST /Billing/searchStatement` *(scoping + fields hardened)*

Authorization: `[Authorize]`. Identity = session. Request `StatementSearchParam { networkId, pageNum }` (any client-supplied `userId` is **ignored**).

Server-side scoping:
- **Member (Seller)** → results forced to `userId = session.UserId`, `networkId` (member must belong to it).
- **Network Manager of `networkId`** → network own-cut rows (`userId IS NULL`).
- A member requesting a `networkId` they don't belong to → empty / 403 (no leak).

**Response 200** — paged list of `StatementInfo` (existing fields **plus** `reversed: bool`, `status: "released"|"maturing"|"reversed"`), newest first, page size 15. Reversed rows are included and flagged; balance sums exclude them.

---

## 4. `GET /Billing/getBalance` / `GET /Billing/getAvailableBalance` *(fixed)*

- Repository `GetBalance` predicate fixed to `paid_at IS NOT NULL AND reversed_at IS NULL` (was `paid_at IS NULL` → always ~0).
- These remain for backward compatibility; the frontend migrates to `my-balance` (member) and `network-balance` (manager). If retained, their identity/scoping follows the same session-derived rules (no trusting client `userId`).

---

## DTO summary (MonexUp.DTO/Invoice)

| DTO | Fields |
|-----|--------|
| `MemberBalanceInfo` *(new)* | `total:double`, `released:double`, `maturing:double` |
| `StatementInfo` *(extended)* | …existing… + `reversed:bool`, `status:string` |

## Contract test intents (for /speckit.tasks)

- No auth → `401` on `my-balance`, `network-balance`, `searchStatement`.
- Member with 3 non-reversed commissions (10/20/30) in a network → `my-balance.total == 60`; one reversed → total drops accordingly.
- `released` only counts matured rows; `maturing == total − released`.
- Member A cannot obtain Member B's statement/balance (scoping forces session identity) — SC-005.
- Non-manager calling `network-balance` → `403`; manager → own-cut sums.
- Statement marks reversed rows (`reversed=true`, `status="reversed"`); released vs maturing derived correctly.
- `GetBalance` returns a non-zero total for real paid rows (regression on the predicate bug).

# Phase 1 Data Model: Referrer Invite Flow

**No new tables, no migration.** The feature reuses the existing `monexup_user_networks` table and its `referrer_id` column, plus a stateless signed token (no persistence).

## Entities

### UserNetwork (existing — reused)

Junction of a user and a network. Composite PK `(UserId, NetworkId)`.

| Field | Type | Notes |
|-------|------|-------|
| `UserId` | `long` | PK part. NAuth user id. |
| `NetworkId` | `long` | PK part. FK → networks. |
| `ProfileId` | `long` | Lowest profile for the network (set on enrollment). |
| `Role` | `UserRoleEnum` | `Seller` on invited enrollment. |
| `Status` | `UserNetworkStatusEnum` | `WaitForApproval` on invite/join; `Inactive` on decline; `Active` after manager approval. |
| `ReferrerId` | `long?` | **The inviting user's id.** Nullable, no FK (by convention holds a UserId). Empty for self-service joins. |

**Change for this feature**: `ReferrerId` is now populated by the invite flows (previously only by `RequestAccess`). No schema change.

### UserNetworkStatusEnum (existing — reused)

| Value | Numeric | Role in this feature |
|-------|---------|----------------------|
| `Active` | 1 | Final state after manager approval. |
| `WaitForApproval` | 2 | Created on invite (existing account) or join (new account). |
| `Inactive` | 3 | Set on decline. |
| `Blocked` | 4 | Unchanged (not used by this feature). |

### Invite Token (new — transient, not stored)

A stateless signed string carried in the invite URL. Not a database entity.

| Segment | Meaning |
|---------|---------|
| `networkId` | Target network. |
| `inviterUserId` | Referrer (the inviting manager). |
| `targetUserId` | Invited user's id for existing-account invites; `0` for no-account invites. |
| `hasAccount` | `1` = existing-account (accept/decline flow); `0` = new-account (sign-up flow). |
| signature | `HMAC-SHA256(secret, "networkId|inviterUserId|targetUserId|hasAccount")`, verified with `FixedTimeEquals`. |

Format: `base64url(payload) + "." + base64url(signature)`. Secret from `IConfiguration:Invite:Secret`. No expiry; reusable; tamper of any segment invalidates the signature.

## State Transitions (membership)

```text
                 invite (existing account)        manager approve
   (none) ─────────────────────────────────►  WaitForApproval ──────────────► Active
      │      join (new account, post-signup)         │  ▲
      └────────────────────────────────────────────► │  │ re-invite
                                                      │  │
                                          decline ────▼──┘
                                                   Inactive
```

- **Invite (existing account)**: `(none) → WaitForApproval` with `ReferrerId = inviter`. Idempotent: if a row already exists `Active`/`WaitForApproval`, do not create/duplicate (surface existing state).
- **Join (new account)**: after signup + login, `(none) → WaitForApproval` with `ReferrerId = inviter` (idempotent).
- **Accept**: no state change (stays `WaitForApproval`), confirms intent; still requires manager approval.
- **Decline**: `WaitForApproval → Inactive` (only by the invited user).
- **Manager approval**: `WaitForApproval → Active` (existing `ChangeStatus`, manager-authorized). `ReferrerId` preserved across all transitions.
- **Re-invite** of a declined (`Inactive`) user MAY reactivate to `WaitForApproval`.

## Validation Rules

- Email in the invite request MUST be well-formed (reject before generating a link).
- `ReferrerId` MUST equal the inviting user; MUST remain empty for self-service joins.
- Accept/decline MUST be performed by the invited account only (`session.UserId == targetUserId`).
- Duplicate active/pending membership MUST NOT be created by an invite (idempotency check on `(UserId, NetworkId)`).
- Invite generation MUST be authorized to NetworkManager/Administrator of the target network.

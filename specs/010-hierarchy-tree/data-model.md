# Phase 1 Data Model: Hierarchy Tree

**No new tables, no migration.** Reads the existing `monexup_user_networks` table. Adds transient response DTOs for the tree.

## Source entity (existing — reused)

### UserNetwork

| Field | Type | Role in this feature |
|-------|------|----------------------|
| `UserId` | `long` | Node identity; NAuth user id (→ Name). |
| `NetworkId` | `long` | Scope — the active network. |
| `ProfileId` | `long?` | → Profile name (displayed). |
| `Role` | `UserRoleEnum` | Displayed. |
| `Status` | `UserNetworkStatusEnum` | Displayed; **all statuses included** (FR-006a). |
| `ReferrerId` | `long?` | The edge: this member's referrer (parent). Ascend by following it; descend by matching it. |

No schema change. A new **read** query `GetByReferrer(networkId, referrerId)` returns all-status rows whose `ReferrerId` matches (the existing `ListByNetwork` filters Active-only and is not reused).

## Response DTOs (new — transient)

### HierarchyNodeInfo

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `long` | Member id. |
| `name` | `string` | Resolved via NAuth (may be null if unresolved). |
| `profileName` | `string` | Profile display name (nullable). |
| `role` | `UserRoleEnum` | Member role. |
| `status` | `UserNetworkStatusEnum` | Member status. |
| `children` | `HierarchyNodeInfo[]` | Descendants only; present/filled for the down-tree, empty for ancestors and for leaf/depth-limited nodes. |

### HierarchyInfo

| Field | Type | Notes |
|-------|------|-------|
| `networkId` | `long` | The network the tree is scoped to. |
| `ancestors` | `HierarchyNodeInfo[]` | Referrer chain, ordered **immediate referrer first** → up to 3 (index 0 = level −1, last = level −3). Linear (each has one referrer); `children` unused here. |
| `current` | `HierarchyNodeInfo` | The logged-in member (tree center / highlight). |
| `descendants` | `HierarchyNodeInfo[]` | Direct referred members (level +1), each nesting its own `children` down to level +3. |

## Tree shape

```text
ancestors[2]  (level -3)
   └ ancestors[1]  (level -2)
        └ ancestors[0]  (level -1, immediate referrer)
             └ current  (YOU)
                  ├ descendants[0]  (level +1)
                  │    ├ children… (level +2)
                  │    │    └ children… (level +3, leaf — no further children)
                  │    └ …
                  └ descendants[1] …
```

## Rules & invariants

- **Depth bound**: `ancestors.length ≤ 3`; descendant nesting depth ≤ 3 (`children` beyond level +3 omitted).
- **All statuses**: nodes of every `Status` are included (no filtering).
- **Cycle safety**: a `visited` set of user ids prevents re-expanding any member; bad/looping `ReferrerId` data terminates traversal without duplication.
- **Missing/unresolvable referrer**: if an ancestor's membership does not resolve in this network, the chain stops there (no error).
- **Name resolution**: distinct user ids resolved once each via NAuth; `name` may be null when unresolved (node still renders with the other fields).
- **Scope**: built for `session.UserId` in the requested `networkId`, which the caller must belong to.

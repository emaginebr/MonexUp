# Contract: Hierarchy REST Endpoint

New endpoint on `NetworkController` (MonexUp API, base `/Network`). Uses the `NAuth` scheme. JSON, camelCase properties.

---

## Get hierarchy — `GET /Network/hierarchy/{networkId}`

Authorization: `[Authorize]`. Caller = `GetUserInSession(HttpContext)`. The tree is built for the **caller** (`session.UserId`) in `networkId`. The caller must belong to `networkId`.

**Path params**
- `networkId` (long) — the network to scope the tree to (the active network).

**Behavior**
1. Resolve the caller's membership in `networkId` (`Get(networkId, userId)`). If none → `404`/empty result (`sucesso:false`).
2. **Ascend** up to 3 levels: follow `ReferrerId` (each hop: `Get(networkId, referrerId)`), stopping at null / unresolved / after 3 hops. Collect `ancestors` (immediate referrer first).
3. **Descend** up to 3 levels: BFS/DFS via `GetByReferrer(networkId, nodeUserId)`, nesting `children`, bounded at depth 3, guarded by a `visited` set.
4. Resolve each distinct member's **Name** (NAuth `GetByIdAsync`, memoized), **Profile** name (by `ProfileId`), and carry **Role**/**Status** from the membership. All statuses included.

**Response 200** — `HierarchyInfo`
```json
{
  "networkId": 12,
  "current": {
    "userId": 87, "name": "Você", "profileName": "Vendedor",
    "role": 2, "status": 1, "children": []
  },
  "ancestors": [
    { "userId": 40, "name": "Maria (referrer)", "profileName": "Gerente", "role": 4, "status": 1, "children": [] },
    { "userId": 22, "name": "João (nível -2)", "profileName": "Gerente", "role": 4, "status": 1, "children": [] }
  ],
  "descendants": [
    {
      "userId": 91, "name": "Ana", "profileName": "Vendedor", "role": 2, "status": 2,
      "children": [
        { "userId": 102, "name": "Beto", "profileName": "Vendedor", "role": 2, "status": 1, "children": [] }
      ]
    },
    { "userId": 92, "name": "Carlos", "profileName": "Vendedor", "role": 2, "status": 3, "children": [] }
  ]
}
```

- `ancestors`: ordered immediate-referrer-first, length ≤ 3.
- `descendants`: nested `children`, depth ≤ 3.
- `role` is `UserRoleEnum`, `status` is `UserNetworkStatusEnum` (numeric).
- `name`/`profileName` may be `null` if unresolved — node still valid.

**Errors**: `401` (no session); `404`/`sucesso:false` when the caller is not a member of `networkId`.

---

## DTO summary (MonexUp.DTO/Network)

| DTO | Fields |
|-----|--------|
| `HierarchyNodeInfo` | `userId:long`, `name:string`, `profileName:string`, `role:UserRoleEnum`, `status:UserNetworkStatusEnum`, `children:HierarchyNodeInfo[]` |
| `HierarchyInfo` | `networkId:long`, `current:HierarchyNodeInfo`, `ancestors:HierarchyNodeInfo[]`, `descendants:HierarchyNodeInfo[]` |

## Contract test intents (for /speckit.tasks)

- Member with ≥3 ancestors and ≥3 descendant levels → `ancestors.length == 3`; descendant nesting stops at depth 3.
- Member with no referrer → `ancestors == []`, `current` present.
- Member who referred no one → `descendants == []`.
- Non-Active descendant (WaitForApproval/Inactive/Blocked) → still present in the tree with its `status`.
- Looping `ReferrerId` data → traversal terminates (no infinite/duplicate), depth still bounded.
- Caller not a member of `networkId` → not-found/`sucesso:false`, no leak of another network's tree.
- Every returned node carries `name` (or null), `profileName` (or null), `role`, `status`.

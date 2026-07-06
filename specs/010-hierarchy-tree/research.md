# Phase 0 Research: Hierarchy Tree

Decisions from a codebase investigation (backend repository, NAuth, frontend menu/libs). All spec clarifications resolved in `/speckit.clarify`.

## R1. Querying the tree from `UserNetworks.ReferrerId`

- **Decision**: Add a repository read `GetByReferrer(long networkId, long referrerId)` to `UserNetworkRepository` (+ `IUserNetworkModel`/model + `IUserNetworkRepository`) returning **all statuses** in the network whose `ReferrerId == referrerId`. Ascend by reusing the existing `Get(networkId, userId)` (returns a single membership, no status filter) and following `ReferrerId`. Descend by BFS calling `GetByReferrer` per node.
- **Rationale**: The existing `ListByNetwork(networkId)` filters `Status == 1` (Active only) — it CANNOT be reused because FR-006a requires all statuses. `Get` has no status filter, so the upward chain is fine. A targeted `GetByReferrer` avoids loading the whole network and returns non-Active descendants.
- **Alternatives considered**: Reuse `ListByNetwork` and build the tree in memory — rejected (drops non-Active members). Load all rows unfiltered and build in memory — workable but heavier; `GetByReferrer` is more precise and index-friendly.

## R2. Resolving Name / Profile / Role / Status per node

- **Decision**: Role and Status come directly from the `UserNetwork` row. Profile name comes from the existing profile lookup (`ProfileService.GetUserProfileInfo` / `UserProfile` by `ProfileId`). **Name** resolves via NAuth `IUserClient.GetByIdAsync(userId, token)`. During tree assembly, collect **distinct** user ids and resolve each name once (memoize in a dictionary) to avoid duplicate NAuth calls.
- **Rationale**: Mirrors `NetworkService.GetUserNetworkInfo`, which already assembles exactly these four fields (User/Profile/Role/Status). Constitution III: identity/name is owned by NAuth. Deduping bounds NAuth calls to the number of distinct members in the tree.
- **Tradeoff**: Name resolution is the cost driver (one NAuth call per distinct member). The tree is depth-bounded (3 up + 3 down), which caps realistic size; the frontend collapse is display-only and does not reduce the backend fetch. If a single node has very many children, resolution cost grows — acceptable for v1; a future lazy/expand-on-demand endpoint could optimize. Logged as a known tradeoff.
- **Alternatives considered**: Lazy per-expand child loading (frontend fetches children on expand) — more endpoints/complexity, deferred. A NAuth batch-by-ids call — `IUserClient` exposes no batch-by-ids method (only `GetByIdAsync`, `GetByEmailAsync`, `ListAsync(take)`), so per-id resolution with dedup is the pragmatic choice.

## R3. Bounded, cycle-safe traversal

- **Decision**: Ascend at most 3 hops; stop early if `ReferrerId` is null or the referrer membership does not resolve in this network. Descend BFS/DFS at most 3 levels. Maintain a `visited` set of user ids across the whole traversal; never expand a user id already visited (guards accidental loops and prevents infinite/duplicate expansion).
- **Rationale**: Satisfies FR-009 (bounded + loop-safe). Referrer chains are normally acyclic, but the guard makes traversal robust to bad data.
- **Alternatives considered**: Trusting acyclicity without a visited set — rejected (a single bad row could hang the request).

## R4. Frontend visualization (no graph library)

- **Decision**: Build a **custom collapsible tree** component (no new dependency). The project has **no** graph/tree library installed (checked `package.json`: no react-flow/xyflow/d3/dagre/reaflow/mermaid). Render ancestors as a vertical stack above the current user and descendants as a nested, indented/branching structure below, using CSS (flex/grid) + simple connector styling; nodes with many children start collapsed with an expand/collapse toggle (local component state). `ux-designer` defines the node card + tree visual language; `frontend-react-developer` implements it.
- **Rationale**: Constitution stack is Bootstrap 5 + MUI 6; adding a heavy graph lib is unjustified for a bounded 3+1+3 tree. Collapse is local UI state over data already returned by the endpoint.
- **Alternatives considered**: Add `react-d3-tree`/`@xyflow/react` — richer but a new heavy dependency and design mismatch; rejected for v1.

## R5. Menu placement & routing

- **Decision**: Add a `SidebarItem` labeled **"Hierarquia"** (i18n key) in the existing **"my_network"** `SidebarGroup` of `AdminSidebar.tsx` (next to `team-structure` and `teams`), navigating to a new admin route `/admin/hierarchy` (page under the admin layout). Use a suitable lucide icon (e.g., `Network`/`Share2`/`GitBranch`).
- **Rationale**: Matches the existing sidebar structure and admin routing; the hierarchy is a per-network admin/member view like Teams.
- **Note**: There is already a `team-structure` item ("Estrutura da Equipe") — that is profile-level structure, distinct from this **referrer** tree; this feature is a separate "Hierarquia" item. (Flag for the user if consolidation is later desired.)

## R6. Data source & scope

- **Decision**: Fetch the tree for `session.UserId` in the **active network** (`networkContext.network`), via a single `GET /Network/hierarchy/{networkId}`. Read-only.
- **Rationale**: FR-010/FR-011 — own position, active network, consistent with other admin pages.

## Resolved unknowns

All Technical Context unknowns resolved: repository query (R1), field resolution + perf tradeoff (R2), traversal bounds/cycle safety (R3), frontend rendering approach (R4), menu/route (R5), scope (R6). No open unknowns remain.

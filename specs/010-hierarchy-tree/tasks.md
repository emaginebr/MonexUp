---
description: "Task list for Hierarchy Tree"
---

# Tasks: Hierarchy Tree ("Árvore Hierárquica")

**Input**: Design documents from `/specs/010-hierarchy-tree/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hierarchy-api.md

**Tests**: Backend unit tests included for the tree-building logic (per plan.md). UI verified via quickstart.md.

**Organization**: Single user story (US1). No new DB table/migration — reuses `user_networks` (`ReferrerId`/`ProfileId`/`Role`/`Status`). Agent delegation per the request: `dotnet-senior-developer` (backend), `ux-designer` (design), `frontend-react-developer` (React).

## Path Conventions

Web monorepo: backend under `MonexUp.*` projects; frontend under `monexup-app/src`. Absolute repo root: `C:\repos\MonexUp`.

---

## Phase 1: Setup

- [X] T001 Confirm no new NuGet/npm dependency and no EF migration are needed (feature reads existing `user_networks`); review `contracts/hierarchy-api.md` + `data-model.md` before coding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend data path (repo query → service → endpoint) and frontend data layer that the page depends on

**⚠️ CRITICAL**: US1 page work depends on this phase

### Backend (delegate: dotnet-senior-developer)

- [X] T002 [P] Create DTOs `HierarchyInfo` and `HierarchyNodeInfo` (camelCase `JsonPropertyName`; `role:UserRoleEnum`, `status:UserNetworkStatusEnum`, nested `children`) in `MonexUp.DTO/Network/`
- [X] T003 [P] Add `GetByReferrer(long networkId, long referrerId)` returning **all statuses** to `IUserNetworkRepository`, `IUserNetworkModel`, `MonexUp.Domain/.../UserNetworkModel.cs`, and `MonexUp.Infra/Repository/UserNetworkRepository.cs` (do NOT reuse `ListByNetwork` — it filters `Status==1`)
- [X] T004 Add `Task<HierarchyInfo> BuildHierarchy(long networkId, long userId, string token)` signature to `MonexUp.Domain/Services/Interfaces/INetworkService.cs`
- [X] T005 Implement `NetworkService.BuildHierarchy` in `MonexUp.Domain/Services/NetworkService.cs`: ascend ≤3 via `Get(networkId, referrerId)` following `ReferrerId`; descend ≤3 (BFS) via `GetByReferrer`; maintain a `visited` set (cycle-safe); resolve Name via `IUserClient.GetByIdAsync` memoized per distinct userId, Profile name via the existing profile lookup, carry Role/Status from the membership; include all statuses; return `{ networkId, current, ancestors(immediate-first), descendants(nested) }`; not-a-member → `sucesso:false`/empty
- [X] T006 Add `[Authorize] GET /Network/hierarchy/{networkId}` endpoint (caller from `GetUserInSession`, bearer via `GetBearerToken`) in `MonexUp.API/Controllers/NetworkController.cs`
- [X] T007 [P] Unit tests `MonexUp.UnitTests/Services/NetworkServiceHierarchyTests.cs`: 3-deep both ways bounded; no-referrer → empty ancestors; no-descendant → empty descendants; non-Active descendant included with its status; looping `ReferrerId` terminates (no infinite/duplicate); caller not a member → not-found; every node carries role/status (name/profile may be null)

### Frontend data layer (delegate: frontend-react-developer)

- [X] T008 [P] Create `HierarchyInfo`/`HierarchyNodeInfo` TS types in `monexup-app/src/DTO/Domain/HierarchyInfo.tsx`
- [X] T009 Add `getHierarchy(networkId)` through the **Network** module: `Services/Impl/NetworkService.tsx` (+interface, `doGetAuth` to `/Network/hierarchy/{networkId}`), `Business/Impl/NetworkBusiness.tsx` (+interface, session token), and `Contexts/Network/NetworkProvider.tsx` (+`NetworkContext`/`INetworkProvider`)

**Checkpoint**: `GET /Network/hierarchy/{id}` returns the tree and the frontend can fetch it

---

## Phase 3: User Story 1 - View my referrer chain and referred members (Priority: P1) 🎯 MVP

**Goal**: Member opens "Hierarquia" and sees the 3-up/3-down referrer flowchart centered on themselves, each node showing Name/Profile/Role/Status, wide nodes collapsible, all statuses shown.

**Independent Test**: Log in as a member with referrers above and referred members below in the active network, open the page, confirm ≤3 levels each way, current user centered, all four fields per node, collapse/expand works (quickstart).

- [X] T010 [US1] `ux-designer`: design the Hierarquia page — tree/flowchart layout (ancestors above, current user centered/highlighted, descendants below), node card showing Name/Profile/Role/Status, collapse/expand affordance, empty/loading states, connectors; deliver HTML/CSS + tokens + component spec (no `.tsx`)
- [X] T011 [US1] Implement the collapsible tree node component in `monexup-app/src/Pages/Admin/HierarchyPage/TreeNode.tsx` per the design (renders a node card + its `children`; nodes with many children start collapsed with an expand/collapse toggle)
- [X] T012 [US1] Implement `monexup-app/src/Pages/Admin/HierarchyPage/index.tsx` (title "Árvore Hierárquica"): read active network from `NetworkContext`, call `networkContext.getHierarchy(networkId)`, render ancestors → current (highlighted) → descendants using `TreeNode`, with loading/empty/error states (role/status gating consistent with other admin pages)
- [X] T013 [US1] Add a **"Hierarquia"** `SidebarItem` in the `my_network` `SidebarGroup` of `monexup-app/src/Components/AdminSidebar.tsx` (suitable lucide icon, `active`/`onClick` → `/admin/hierarchy`) and register the route `path="admin/hierarchy"` → `HierarchyPage` in `monexup-app/src/App.tsx`
- [X] T014 [P] [US1] Add i18n keys (menu "Hierarquia", page title, node field labels Nome/Profile/Role/Status, empty-state text, expand/collapse labels) to `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

**Checkpoint**: Feature fully functional — MVP shippable

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T015 [P] Run `quickstart.md` end-to-end: depth (≤3 up/down), current-user highlight, collapse/expand, no-referrer, no-descendant, non-Active node, active-network switch, non-member (no leak), i18n (pt/en/es/fr), perf (SC-005) — **MANUAL / pending user**: requires running API + monexup-app + PostgreSQL + NAuth (Docker inaccessible in this CLI)
- [X] T016 [P] Document the hierarchy feature in `docs/` (analyst-owned): overview, endpoint, per-network scope, depth/cycle rules

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — BLOCKS US1
- **US1 (Phase 3)**: after Foundational (page consumes the endpoint + provider)
- **Polish (Phase 4)**: after US1

### Within phases

- Backend chain (same file `NetworkService.cs` / `NetworkController.cs`): T002/T003 → T004 → T005 → T006; T007 after T005
- Frontend data layer: T008 → T009 (types before the module methods)
- US1 UI: T010 (design) → T011 → T012 (need T009 provider + T010 design); T013 route/menu independent of T011/T012 wiring but needs `HierarchyPage` to exist; T014 i18n independent

### Parallel Opportunities

- Foundational [P]: T002 (DTOs), T003 (repo query), T008 (TS types), and T007 (tests, after T005) can run in parallel across backend/frontend/projects
- US1 [P]: T014 (i18n) parallel with component/page work
- Backend (dotnet-senior-developer) and frontend data layer (frontend-react-developer) can proceed in parallel once the contract is fixed (it is — `contracts/hierarchy-api.md`)

---

## Parallel Example: Foundational

```bash
# Backend + frontend types together (distinct files/projects):
Task: "HierarchyInfo/HierarchyNodeInfo DTOs (T002)"
Task: "GetByReferrer repository query (T003)"
Task: "HierarchyInfo TS types (T008)"
# then after T005:
Task: "NetworkServiceHierarchyTests (T007)"
```

---

## Implementation Strategy

Single-story MVP: complete Setup → Foundational (backend endpoint + frontend data layer) → US1 (design → tree component → page → menu/route → i18n) → validate via quickstart. Backend and frontend-data can be built in parallel against the fixed contract; the page assembles once both land.

---

## Notes

- No DB migration — reuse `user_networks.ReferrerId` (data-model.md). Populated by feature 009 (still uncommitted — commit 009 before/with this work to avoid mixing branches).
- `ListByNetwork` filters Active-only; the tree MUST use the new all-status `GetByReferrer` (+ `Get` for the up-chain).
- Name is server-resolved via NAuth (deduped); never trust client-supplied identity.
- All user-facing strings via i18n (pt/en/es/fr). No hardcoded text.
- Read-only feature — no referrer edits from this page.

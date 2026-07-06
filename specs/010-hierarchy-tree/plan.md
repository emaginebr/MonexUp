# Implementation Plan: Hierarchy Tree ("Árvore Hierárquica")

**Branch**: `010-hierarchy-tree` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-hierarchy-tree/spec.md`

## Summary

A read-only page ("Árvore Hierárquica", menu label **"Hierarquia"**) that renders a top-to-bottom flowchart of the logged-in member's referrer relationships **within the active network**: up to 3 referrer levels above and up to 3 referred levels below, centered on the current user. Each node shows **Name, Profile, Role, Status**. Wide descendant levels render collapsed with expand/collapse; all member statuses are shown.

Data comes from `UserNetworks.ReferrerId` (populated by feature 009). The backend builds the bounded tree: ascend by following `ReferrerId` (≤3), descend by querying members whose `ReferrerId` is each node's user id (≤3, branching), cycle-safe. Names resolve via NAuth (`IUserClient`), Profile via the existing profile lookup, Role/Status from the membership. A single new `GET /Network/hierarchy/{networkId}` endpoint returns the tree; the frontend renders it with a custom collapsible tree component.

**Agent delegation (per the request):** `ux-designer` produces the page/tree/node visual design; `frontend-react-developer` implements it in React; `dotnet-senior-developer` implements the backend endpoint/service/repository query.

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend); React 18 + TypeScript (CRA) frontend
**Primary Dependencies**: ASP.NET Core Web API, EF Core 9.x (Npgsql), NAuth (`IUserClient`), i18next; **no new frontend graph/tree library** (none installed — custom collapsible tree)
**Storage**: PostgreSQL — existing `monexup_user_networks` (reuse `ReferrerId`, `ProfileId`, `Role`, `Status`); **no new table, no migration**
**Testing**: xUnit (`MonexUp.UnitTests`) for the tree-building service logic (depth bound, cycle safety, all-status inclusion); UI via quickstart
**Target Platform**: Web (MonexUp API + monexup-app SPA)
**Project Type**: Web application (backend + frontend monorepo)
**Performance Goals**: Hierarchy view loads within a few seconds for a fully populated 3-up/3-down tree (SC-005)
**Constraints**: bounded to 3 up / 3 down; cycle-safe; per active network; all statuses included; read-only
**Scale/Scope**: 1 new backend endpoint + 1 service method + 1 repository query; 1 new frontend page + tree component + menu item; i18n for pt/en/es/fr

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | PASS | Tree assembly in `NetworkService`; a new `GetByReferrer` query on `UserNetworkRepository` (+ model/interface); controller endpoint in API. No repo access from models. |
| II. Frontend em Camadas (React) | PASS | Reuses the **Network** module (add `getHierarchy` to Service/Business/Provider); new `HierarchyPage` + a presentational tree component. No new entity module needed. |
| III. Delegação a Projetos Externos (NON-NEGOTIABLE) | PASS | Member **Name** resolved via **NAuth** `IUserClient.GetByIdAsync`. No auth/user data reimplemented. |
| IV. Configuração e Secrets | PASS | No new configuration/secrets. |
| V. Internacionalização | PASS | Menu label "Hierarquia" + all page strings added to pt/en/es/fr. |
| VI. Banco de Dados e Migrations | PASS | No new entity/DbSet; adds a read query on the existing table. No migration. |
| VII. Registro de Dependências | PASS | No new service/factory/provider to register (extends existing `NetworkService` + `NetworkProvider`). Repository query needs no new DI. |

**Result**: PASS — no violations, Complexity Tracking not required.

*Post-Phase-1 re-check*: PASS (no new projects, no new persistence, no external-domain encroachment).

## Project Structure

### Documentation (this feature)

```text
specs/010-hierarchy-tree/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── hierarchy-api.md # Phase 1 output — REST contract
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
MonexUp.API/
└── Controllers/NetworkController.cs        # + GET hierarchy/{networkId}

MonexUp.Domain/
├── Services/NetworkService.cs              # + BuildHierarchy(networkId, userId, token)
└── Services/Interfaces/INetworkService.cs  # + signature

MonexUp.Domain (models/interfaces) + MonexUp.Infra/Repository/UserNetworkRepository.cs
└── + GetByReferrer(networkId, referrerId)  # all-status query (ListByNetwork filters Active only, so it can't be reused)

MonexUp.DTO/
└── Network/                                # + HierarchyInfo, HierarchyNodeInfo

MonexUp.UnitTests/
└── Services/NetworkServiceHierarchyTests.cs

monexup-app/src/
├── DTO/Domain/HierarchyInfo.tsx            # tree types
├── Services/Impl/NetworkService.tsx        # + getHierarchy
├── Business/Impl/NetworkBusiness.tsx       # + getHierarchy (session token)
├── Contexts/Network/NetworkProvider.tsx    # + getHierarchy + Context/IProvider
├── Pages/Admin/HierarchyPage/index.tsx     # page (title "Árvore Hierárquica")
├── Pages/Admin/HierarchyPage/TreeNode.tsx  # collapsible node/tree component
├── Components/AdminSidebar.tsx             # + "Hierarquia" item (my_network group)
├── App.tsx                                 # + /admin/hierarchy route
└── public/locales/{pt,en,es,fr}/translation.json  # new keys
```

**Structure Decision**: Existing MonexUp monorepo. The feature adds one read endpoint + one service method + one repository query on the backend, and one page + tree component + menu item on the frontend, reusing the Network module. No structural change, no new module, no migration.

## Complexity Tracking

> No constitution violations — section intentionally empty.

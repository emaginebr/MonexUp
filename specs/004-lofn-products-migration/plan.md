# Implementation Plan: Migrate Products to Lofn

**Branch**: `004-lofn-products-migration` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-lofn-products-migration/spec.md`

## Summary

Move all product catalog ownership out of MonexUp into the existing Lofn project. The MonexUp frontend talks to the Lofn API directly for product CRUD (via `lofn-react`). Lofn is treated as a black box — no schema, API or auth change is requested in Lofn. MonexUp keeps two new responsibilities: (1) the 1:1 link `Network.LofnStoreId` plus a lazy provisioning call to Lofn on the first product CREATE for a network, and (2) a new `ProductLink` table that stores `(LofnProductId, NetworkId, UserId)` exposed by an idempotent endpoint. All MonexUp-side product domain code (model, service, factory, repository, DTOs, controller, frontend service/business/context/provider) is removed; the `LofnProductRepository` is replaced with a thinner `LofnStoreClient` used only for store provisioning.

## Technical Context

**Language/Version**: .NET 8.0 (backend) · TypeScript 5.x on React 18 (frontend, CRA → Vite migration in progress)
**Primary Dependencies**:
- Backend: ASP.NET Core Web API, Entity Framework Core 9.x (Npgsql), FluentValidation, NAuth (NuGet), zTools (NuGet)
- Frontend: `nauth-react`, `proxypay-react`, **`lofn-react`** (NEW — replaces in-house product service)
- External: Lofn API (`REACT_APP_LOFN_API_URL`, `Lofn:ApiURL`) — black box for this feature
**Storage**: PostgreSQL via EF Core. New table `ProductLinks`. Altered table `Networks` (one nullable column `LofnStoreId`).
**Testing**: xUnit unit tests (`MonexUp.Tests`) + xUnit external API tests (`MonexUp.ApiTests`, Flurl + FluentAssertions).
**Target Platform**: Linux server (containerized), web frontend, Capacitor 7 Android wrapper.
**Project Type**: Web application (.NET backend + React frontend in same repo).
**Performance Goals**: Match current product flows — listing call ≤ 500 ms p95 from frontend (Lofn-side concern); link endpoint ≤ 100 ms p95.
**Constraints**:
- Lofn MUST NOT be modified (constitution Principle III + clarification 2026-05-04 Q1).
- Tenant header `X-Tenant-Id: monexup` propagates end-to-end (clarification Q1).
- Product CRUD bypasses MonexUp backend entirely; only store-provisioning and product-link calls hit MonexUp (clarification Q4).
- Orphan `ProductLink` rows are tolerated; cleanup is a separate out-of-scope service (clarification Q5).
**Scale/Scope**: ~50 networks today, single-digit thousands of products at steady state, ~100 representatives per network upper bound.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Arquitetura em Camadas (DDD) | ✅ | New `ProductLink` follows `Model → Service → Factory → Repository → Interface → DTO`. `LofnStoreClient` is an Infra adapter, not a domain entity. |
| II. Frontend em Camadas (React) | ✅ | Existing in-house Product layers are **deleted** and replaced by `lofn-react`. New thin `ProductLinkService → ProductLinkBusiness → ProductLinkContext → ProductLinkProvider` covers the link endpoint. |
| III. Delegação a Projetos Externos (NON-NEGOTIABLE) | ✅ | Products move fully to Lofn. Frontend uses `lofn-react`. MonexUp keeps only the cross-link table. Lofn source-of-truth is preserved. |
| IV. Configuração e Secrets | ✅ | New backend setting `Lofn:ApiURL` already exists. Frontend `REACT_APP_LOFN_API_URL` already exists. Tenant id `REACT_APP_TENANT_ID` already in use. No new env names required. |
| V. Internacionalização | ✅ | All new user-visible strings (provisioning errors, link retry messages) added to `pt/en/es/fr` translation.json. |
| VI. Banco de Dados e Migrations | ✅ | One EF migration: add `Networks.LofnStoreId` (nullable int) + create `ProductLinks` table. |
| VII. Registro de Dependências | ✅ | `ProductLinkRepository`, `ProductLinkService`, `ProductLinkDomainFactory`, `LofnStoreClient` registered in `MonexUp.Application/Initializer.cs`. Frontend `ProductLinkService` in `ServiceFactory.tsx`; `ProductLinkProvider` in `ContextBuilder` array. |

**Result: PASS.** No deviations require Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
specs/004-lofn-products-migration/
├── plan.md                 # This file
├── spec.md                 # Approved spec (with Clarifications section)
├── research.md             # Phase 0 output
├── data-model.md           # Phase 1 output
├── quickstart.md           # Phase 1 output
├── contracts/              # Phase 1 output
│   ├── product-link.openapi.yaml
│   └── lofn-store-provisioning.md
├── checklists/
│   └── requirements.md     # Created by /speckit.specify, updated by /speckit.clarify
└── tasks.md                # Created by /speckit.tasks
```

### Source Code (repository root)

```text
# Backend (.NET 8.0)
MonexUp.API/
├── Controllers/
│   └── ProductLinkController.cs                  # NEW — idempotent upsert + delete-by-network
│   └── ProductController.cs                      # REMOVED (if exists)

MonexUp.Application/
└── Initializer.cs                                # MODIFIED — register ProductLink + LofnStoreClient; unregister Product*

MonexUp.Domain/
├── Entities/
│   ├── NetworkModel.cs                           # MODIFIED — add LofnStoreId property
│   ├── ProductLinkModel.cs                       # NEW
│   ├── ProductModel.cs                           # REMOVED
│   └── Interfaces/
│       ├── IProductLinkModel.cs                  # NEW
│       └── IProductModel.cs                      # REMOVED
├── Factory/
│   ├── ProductLinkDomainFactory.cs               # NEW
│   ├── ProductDomainFactory.cs                   # REMOVED
│   └── Interfaces/
│       ├── IProductLinkDomainFactory.cs          # NEW
│       └── IProductDomainFactory.cs              # REMOVED
└── Services/
    ├── ProductLinkService.cs                     # NEW
    ├── LofnStoreProvisioningService.cs           # NEW (orchestrates lazy store creation on Network)
    ├── ProductService.cs                         # REMOVED
    └── Interfaces/
        ├── IProductLinkService.cs                # NEW
        ├── ILofnStoreProvisioningService.cs      # NEW
        └── IProductService.cs                    # REMOVED

MonexUp.Infra.Interfaces/
├── Repository/
│   ├── IProductLinkRepository.cs                 # NEW
│   └── IProductRepository.cs                     # REMOVED (if exists)
└── AppServices/
    └── ILofnStoreClient.cs                       # NEW

MonexUp.Infra/
├── Context/MonexUpContext.cs                     # MODIFIED — add DbSet<ProductLinkModel>; remove DbSet<ProductModel>
├── Migrations/
│   └── YYYYMMDDHHMMSS_LofnProductsMigration.cs   # NEW — Networks.LofnStoreId + ProductLinks table
├── Repository/
│   ├── ProductLinkRepository.cs                  # NEW
│   └── LofnProductRepository.cs                  # REMOVED
└── AppServices/
    └── LofnStoreClient.cs                        # NEW (HTTP client for Lofn /Store endpoints)

MonexUp.DTO/
├── ProductLink/                                  # NEW folder
│   ├── ProductLinkInfo.cs
│   └── ProductLinkInsertInfo.cs
└── Product/                                      # REMOVED folder
    ├── ProductInfo.cs
    ├── ProductListPagedResult.cs
    ├── ProductSearchInternalParam.cs
    ├── ProductSearchParam.cs
    └── ProductStatusEnum.cs

# Frontend (React/TypeScript)
monexup-app/src/
├── DTO/Domain/
│   ├── ProductLinkInfo.tsx                       # NEW
│   ├── ProductInfo.tsx                           # REMOVED (if exists; otherwise lofn-react owns it)
│   └── ...
├── Services/
│   ├── Interfaces/IProductLinkService.tsx        # NEW
│   ├── Impl/ProductLinkService.tsx               # NEW
│   ├── Interfaces/IProductService.tsx            # REMOVED
│   ├── Impl/ProductService.tsx                   # REMOVED
│   └── ServiceFactory.tsx                        # MODIFIED — register ProductLinkService; drop ProductService
├── Business/
│   ├── Interfaces/IProductLinkBusiness.tsx       # NEW
│   ├── Impl/ProductLinkBusiness.tsx              # NEW
│   ├── Factory/ProductLinkFactory.tsx            # NEW
│   ├── Interfaces/IProductBusiness.tsx           # REMOVED
│   ├── Impl/ProductBusiness.tsx                  # REMOVED
│   └── Factory/ProductFactory.tsx                # REMOVED
├── Contexts/
│   ├── ProductLink/
│   │   ├── ProductLinkContext.tsx                # NEW
│   │   └── ProductLinkProvider.tsx               # NEW
│   └── Product/                                  # REMOVED folder
├── Pages/
│   └── ProductPage/                              # MODIFIED — switch to lofn-react components + call ProductLinkContext.upsertLink after create
└── App.tsx                                       # MODIFIED — drop ProductProvider from ContextBuilder; add ProductLinkProvider; LofnProvider from lofn-react if package requires it

monexup-app/package.json                           # MODIFIED — add lofn-react dependency

# Tests
MonexUp.Tests/                                    # MODIFIED — drop Product unit tests; add ProductLink + LofnStoreProvisioning tests
MonexUp.ApiTests/                                 # MODIFIED — drop Product API tests; add ProductLink controller tests
```

**Structure Decision**: Web application (Option 2) — backend + frontend in same repo, both touched by this feature. Concrete dirs above already exist; the migration is delete-heavy on the MonexUp side and add-light on Lofn-integration.

## Phase 0: Outline & Research

Output target: `research.md`.

Topics to resolve (no `NEEDS CLARIFICATION` survived clarify session — these are best-practice / integration-pattern items):

1. **`lofn-react` package surface**. Confirm exposed components/hooks for product list, create, edit, delete, image upload. Confirm config props (apiUrl, tenantId). Confirm whether the package owns its own provider (à la `nauth-react`) so the frontend integration matches the existing pattern.
2. **Lofn store-creation endpoint shape**. Verify the existing `POST /Store` (or equivalent) endpoint payload (`StoreInsertInfo` has `Name` only — see `c:\repos\Lofn\Lofn\Lofn\DTO\Store\StoreInsertInfo.cs`). Confirm response includes the store id, used to populate `Network.LofnStoreId`.
3. **Idempotency strategy for `ProductLink` upsert**. Best-practice for upsert by natural key (`LofnProductId`) on PostgreSQL with EF Core: `ON CONFLICT … DO UPDATE` via raw SQL OR `Find-then-Insert/Update` inside a transaction. Decide which fits this codebase's existing repository style.
4. **Concurrent provisioning idempotency (FR-003)**. Race window when two Network Manager requests both call "first product CREATE" simultaneously. Approaches: optimistic concurrency on `Networks.LofnStoreId`, advisory lock on `(NetworkId)` during provisioning, or a unique partial index. Pick one.
5. **Tenant header propagation in `lofn-react`**. Confirm whether the package accepts a `headers`/`tenantId` prop or relies on the host configuring an axios default. Mirror the pattern already used for `nauth-react` (`headers: { 'X-Tenant-Id': tenantId }`) so behavior is consistent.
6. **Frontend transactional retry for the link endpoint**. Define the retry contract for "Lofn create succeeded → MonexUp link call failed": retry budget, idempotency key (the `LofnProductId` itself), user-facing error messaging. No backend orchestration is required because the frontend drives both sides.
7. **Data migration of any existing MonexUp-owned product rows**. Inspect current schema and data (assumption in spec is "trivially small or empty" — confirm before deleting `ProductModel` migration history). If non-empty, document a one-time SQL move to Lofn (out of this feature's scope but flagged).

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete.

### 1. Data model — `data-model.md`

Captures:

- **`Networks`** — adds `LofnStoreId` (nullable int). Indexed for joins with `ProductLinks`. Behavior on provisioning: optimistic write inside transaction; if already set, skip create. Behavior on network delete (FR-011): null out plus cascade-delete `ProductLinks` rows for that network.
- **`ProductLinks`** — new table. PK `Id` (int identity). Columns: `LofnProductId` (long, NOT NULL, **unique**), `NetworkId` (int, NOT NULL, FK→Networks), `UserId` (int, NOT NULL, FK→Users via NAuth schema), `CreatedAt` (timestamptz). Unique index on `LofnProductId` enforces idempotency. Composite index `(NetworkId, UserId)` for ownership queries.
- **`ProductLinkInsertInfo`** DTO — `LofnProductId`, `NetworkId`, `UserId`. Validation via FluentValidation: all required, all > 0.
- **`ProductLinkInfo`** DTO — read-side projection adding `CreatedAt`.

### 2. Contracts — `contracts/`

**`product-link.openapi.yaml`** (MonexUp REST):

- `POST /api/productLink` — body `ProductLinkInsertInfo`. **Idempotent**: if a row with the same `LofnProductId` already exists, return 200 with the existing record; otherwise return 201 with the new record. Error envelope: `{ sucesso, mensagemErro, mensagem }`. Auth: NAuth bearer token; the resolved `UserId` from the bearer SHOULD match the body's `UserId` (server validates).
- `DELETE /api/productLink/by-network/{networkId}` — internal/admin endpoint used only by network deletion flow. Removes all link rows for the network. Auth: NAuth bearer + Network Manager role on the target network.
- `GET /api/productLink/by-network/{networkId}` — list link rows by network (used by the frontend "products of network" surface). Auth: NAuth bearer + membership in network.
- `GET /api/productLink/by-user/{userId}` — list link rows by user. Auth: NAuth bearer + (self OR Network Manager).

**`lofn-store-provisioning.md`** (internal interaction with Lofn, no API of our own):

- Trigger: backend resolves "this Network has no `LofnStoreId` AND a product CREATE was just attempted by the frontend". Backend calls `POST {Lofn:ApiURL}/Store` with `StoreInsertInfo { Name = network.Name }` and tenant header. Persists the returned store id on `Networks.LofnStoreId` inside the same transaction. Concurrency: optimistic + retry; second concurrent request observes the now-set `LofnStoreId` and short-circuits.
- Failure: if Lofn returns non-2xx, backend returns 503 with retryable error envelope. The frontend MAY retry the original product CREATE flow.

### 3. Quickstart — `quickstart.md`

Step-by-step instructions for a developer pulling this branch:

1. `git pull && git checkout 004-lofn-products-migration`.
2. `cd monexup-app && npm install` (pulls `lofn-react`).
3. Backend: `dotnet restore && dotnet build MonexUp.sln`.
4. Apply EF migration: `dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API`.
5. Set `REACT_APP_LOFN_API_URL` in `monexup-app/.env` to the local Lofn API URL.
6. Verify Lofn is up at that URL with `X-Tenant-Id: monexup`.
7. Run tests: `dotnet test MonexUp.sln` + `npm test --prefix monexup-app`.
8. Spin up: `dotnet run --project MonexUp.API` + `npm start --prefix monexup-app`.
9. Manual smoke test path: login → open a network → Products section → create product → confirm row in `ProductLinks` and Lofn product list.

### 4. Agent context update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude` to append the new tech and conventions (Lofn integration boundary, `ProductLink` entity) to `CLAUDE.md` while preserving manual additions.

**Output**: `data-model.md`, `contracts/product-link.openapi.yaml`, `contracts/lofn-store-provisioning.md`, `quickstart.md`, agent file updated.

## Complexity Tracking

> Constitution Check passed without deviation. No entries.

---
description: "Task list for feature 004-lofn-products-migration"
---

# Tasks: Migrate Products to Lofn

**Input**: Design documents from `C:\repos\MonexUp\specs\004-lofn-products-migration\`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

**Tests**: Tests are included because the spec defines acceptance scenarios per user story and the project already has `MonexUp.Tests` (xUnit) and `MonexUp.ApiTests` (xUnit + Flurl + FluentAssertions) suites — see constitution Principle II (frontend) and `dotnet-test`/`dotnet-test-api` skills. Test tasks are gated per story so each story stays independently demonstrable.

**Organization**: Tasks are grouped by user story (P1 → P2 → P3) so each can be implemented and demonstrated independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3); omitted in Setup, Foundational, Polish phases
- File paths are absolute or anchored at the repo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project-level wiring before any domain work.

- [X] T001 Add `lofn-react` dependency in `monexup-app/package.json` (`npm install lofn-react`) and verify the lock file updates.
- [X] T002 [P] Add backend `Lofn:ApiURL` setting to `MonexUp.API/appsettings.Development.json`, `MonexUp.API/appsettings.Docker.json`, and `MonexUp.API/appsettings.Production.json` (matching the existing key in production envs; leave a placeholder for staging if missing).
- [X] T003 [P] Confirm `REACT_APP_LOFN_API_URL` and `REACT_APP_TENANT_ID` are documented in `monexup-app/.env.example` (already present from feature 003 — verify only).
- [X] T004 Run pre-flight legacy-data audit query against the dev database — `SELECT COUNT(*) FROM "Products";` — record the result in a note inside `specs/004-lofn-products-migration/research.md` under R7. If non-zero, STOP and open a separate data-move ticket before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend domain scaffolding and DB migration that EVERY user story depends on.

**⚠️ CRITICAL**: User-story phases cannot start until this phase is complete.

- [X] T005 Add nullable `LofnStoreId` (long?) property to `MonexUp.Domain/Entities/NetworkModel.cs` and the corresponding interface `MonexUp.Domain/Entities/Interfaces/INetworkModel.cs`.
- [X] T006 Update `MonexUp.Infra/Context/MonexUpContext.cs`: configure `LofnStoreId` column on the `Networks` entity (`HasIndex(n => n.LofnStoreId)` non-unique) and remove the `DbSet<ProductModel>` if present.
- [X] T007 [P] Create new DTO `MonexUp.DTO/ProductLink/ProductLinkInsertInfo.cs` with fields `LofnProductId (long)`, `NetworkId (int)`, `UserId (int)` per data-model.md §3.
- [X] T008 [P] Create new DTO `MonexUp.DTO/ProductLink/ProductLinkInfo.cs` with fields `Id`, `LofnProductId`, `NetworkId`, `UserId`, `CreatedAt` per data-model.md §3.
- [X] T009 [P] Create domain interface `MonexUp.Domain/Entities/Interfaces/IProductLinkModel.cs` exposing the same fields as `ProductLinkInfo` plus a setter contract used by the factory.
- [X] T010 Create domain entity `MonexUp.Domain/Entities/ProductLinkModel.cs` implementing `IProductLinkModel`. Methods receive `IProductLinkDomainFactory` per `dotnet-architecture` skill (no direct repository access in models).
- [X] T011 [P] Create factory interface `MonexUp.Domain/Factory/Interfaces/IProductLinkDomainFactory.cs`.
- [X] T012 Create factory `MonexUp.Domain/Factory/ProductLinkDomainFactory.cs` implementing `IProductLinkDomainFactory`.
- [X] T013 [P] Create infra repository interface `MonexUp.Infra.Interfaces/Repository/IProductLinkRepository.cs` with `Upsert(long lofnProductId, int networkId, int userId, CancellationToken ct)`, `GetByNetwork(int networkId)`, `GetByUser(int userId)`, `DeleteByNetwork(int networkId)`.
- [X] T014 Create infra repository `MonexUp.Infra/Repository/ProductLinkRepository.cs` — implements find-then-insert idempotency, catches unique-violation and re-reads (research R3). Single transaction per upsert.
- [X] T015 [P] Create app-service contract `MonexUp.Infra.Interfaces/AppServices/ILofnStoreClient.cs` with method `Task<long> InsertAsync(string storeName, string bearerToken, CancellationToken ct)` returning the new Lofn store id.
- [X] T016 Create HTTP client `MonexUp.Infra/AppServices/LofnStoreClient.cs` calling `POST {Lofn:ApiURL}/api/Store/insert` with header `X-Tenant-Id: monexup` and `Authorization: Bearer <token>`. Reads URL via `IConfiguration` per constitution Principle IV.
- [X] T017 [P] Create domain service interface `MonexUp.Domain/Services/Interfaces/IProductLinkService.cs` exposing `Upsert`, `GetByNetwork`, `GetByUser`, `DeleteByNetwork` returning `ApiResponse<...>`.
- [X] T018 [P] Create domain service interface `MonexUp.Domain/Services/Interfaces/ILofnStoreProvisioningService.cs` exposing `Task<long> EnsureStoreAsync(int networkId, string bearerToken, CancellationToken ct)`.
- [X] T019 Create EF migration `LofnProductsMigration` via `dotnet ef migrations add LofnProductsMigration --project MonexUp.Infra --startup-project MonexUp.API`. Validate `Up`/`Down` reflect data-model.md §4 (`Networks.LofnStoreId` + index, new `ProductLinks` table with PK + unique `LofnProductId` + FK `NetworkId` cascade + FK `UserId` restrict + composite indexes, drop legacy `Products` table only if T004 confirmed empty).
- [X] T020 [P] Add FluentValidation validator `MonexUp.Application/Validators/ProductLinkInsertInfoValidator.cs` per `dotnet-fluent-validation` skill: all three fields `> 0`.
- [X] T021 Register all new components in `MonexUp.Application/Initializer.cs` (constitution Principle VII): `IProductLinkRepository → ProductLinkRepository`, `IProductLinkDomainFactory → ProductLinkDomainFactory`, `IProductLinkService → ProductLinkService`, `ILofnStoreProvisioningService → LofnStoreProvisioningService`, `ILofnStoreClient → LofnStoreClient` (HttpClient registered via `AddHttpClient<ILofnStoreClient, LofnStoreClient>`), and the new validator. Lifetimes: Scoped on API, Transient on BackgroundService.

**Checkpoint**: Backend foundation ready. Migration applied locally. User-story phases can now proceed (P1 first, then P2, then P3).

---

## Phase 3: User Story 1 — Network owner manages products through Lofn (Priority: P1) 🎯 MVP

**Goal**: A Network Manager can list, create, edit and delete products through `lofn-react` against the Lofn API, with the MonexUp store-provisioning happening transparently on first product CREATE.

**Independent Test** (per spec.md): Sign in as Network Manager → open Products → confirm empty list (no Lofn store yet) → save first product → confirm `Networks.LofnStoreId` is populated and the product appears.

### Tests for User Story 1 ⚠️

> Write FIRST, ensure they FAIL before implementation.

- [ ] T022 [P] [US1] Unit test `MonexUp.Tests/Domain/Services/LofnStoreProvisioningServiceTests.cs`: covers (a) network with `LofnStoreId IS NULL` triggers `LofnStoreClient.InsertAsync` and persists the returned id; (b) network with `LofnStoreId` already set returns existing id without calling Lofn; (c) concurrent calls converge to a single id (mock the clock and HTTP).
- [ ] T023 [P] [US1] Unit test `MonexUp.Tests/Infra/AppServices/LofnStoreClientTests.cs`: asserts the request includes header `X-Tenant-Id: monexup`, the bearer is forwarded, the URL is taken from `Lofn:ApiURL`, and a 5xx surfaces a recoverable exception.
- [ ] T024 [P] [US1] API integration test `MonexUp.ApiTests/Controllers/ProductLinkControllerTests.cs::Create_FirstProduct_ProvisionsStore`: hits `POST /api/productLink` against a network with no store, expects 201 + `Networks.LofnStoreId` populated. Uses the shared NAuth login fixture per `dotnet-test-api` skill.

### Implementation for User Story 1

- [X] T025 [US1] Implement `MonexUp.Domain/Services/LofnStoreProvisioningService.cs`: lazy provisioning via NetworkRepository.TrySetLofnStoreId atomic UPDATE (research R4 — controlled-orphan if race, per Q2).
- [X] T026 [US1] Implement `MonexUp.Domain/Services/ProductLinkService.cs::Upsert` to: (a) call `LofnStoreProvisioningService.EnsureStoreAsync(networkId, bearer, ct)` to guarantee the network has a store before linking, (b) call `ProductLinkRepository.Upsert(...)`. Returns 200 if existing, 201 if new (controller maps).
- [X] T027 [US1] Implement `MonexUp.API/Controllers/ProductLinkController.cs` with `POST /api/productLink` per `contracts/product-link.openapi.yaml`. Apply NAuth auth attribute, 401/403 mapping, idempotent 200/201 distinction. Document with `dotnet-doc-controller` skill.
- [X] T028 [P] [US1] In `monexup-app/src/App.tsx`: import `LofnProvider` from `lofn-react` and wrap the `<ContextContainer>` with it, configured `{ apiUrl: process.env.REACT_APP_LOFN_API_URL, tenantId, getToken: () => authToken, headers: { 'X-Tenant-Id': tenantId } }`. Reuse the existing `tenantId` constant.
- [X] T029 [P] [US1] Create frontend service interface `monexup-app/src/Services/Interfaces/IProductLinkService.tsx` and impl `monexup-app/src/Services/Impl/ProductLinkService.tsx` with method `upsertLink(payload: ProductLinkInsertInfo): Promise<ApiResponse<ProductLinkInfo>>`. Register both in `monexup-app/src/Services/ServiceFactory.tsx` per constitution Principle VII.
- [X] T030 [P] [US1] Create frontend DTO `monexup-app/src/DTO/Domain/ProductLinkInfo.tsx` and `monexup-app/src/DTO/Domain/ProductLinkInsertInfo.tsx` matching the backend DTOs.
- [X] T031 [P] [US1] Create frontend business `monexup-app/src/Business/Interfaces/IProductLinkBusiness.tsx`, `monexup-app/src/Business/Impl/ProductLinkBusiness.tsx`, factory `monexup-app/src/Business/Factory/ProductLinkFactory.tsx` per `react-arch` skill.
- [X] T032 [P] [US1] Create frontend context+provider `monexup-app/src/Contexts/ProductLink/ProductLinkContext.tsx`, `monexup-app/src/Contexts/ProductLink/ProductLinkProvider.tsx`. Provider exposes `upsertLink(lofnProductId, networkId, userId)` with the retry+backoff contract from research R6 (3 retries, 200ms→600ms→1.4s exponential). Add `ProductLinkProvider` to `ContextBuilder` array in `App.tsx`.
- [X] T033 [US1] Created NEW manager-only page `monexup-app/src/Pages/Admin/ProductManagePage/index.tsx` rendering `lofn-react`'s `<ProductList />` + `<ProductForm />`. (Existing `Pages/ProductPage` is the customer checkout page — kept unchanged.) Wired to `/admin/products` route. Calls `productLinkContext.upsert(lofnProduct.productId, networkId, userId)` after Lofn save.
- [X] T034 [US1] Added i18n keys (`product_link_*`, `product_manage_*`) in `pt/en/es/fr` translation.json.

**Checkpoint**: User Story 1 fully functional. Network Manager can create/list/edit/delete products via Lofn; first CREATE provisions the store and writes a `ProductLink`.

---

## Phase 4: User Story 2 — Product carries explicit Network and User ownership in MonexUp (Priority: P2)

**Goal**: MonexUp is the source of truth for "products of network N" and "products created by user U", served from the `ProductLinks` table — not Lofn.

**Independent Test**: After creating a product (US1), query `GET /api/productLink/by-network/{id}` and `GET /api/productLink/by-user/{id}`; both return the link row. Idempotent retry of `POST /api/productLink` returns 200 with the same row.

### Tests for User Story 2 ⚠️

- [ ] T035 [P] [US2] Unit test `MonexUp.Tests/Domain/Services/ProductLinkServiceTests.cs::Upsert_DuplicateLofnProductId_IsIdempotent`: same `LofnProductId` twice → exactly one row.
- [ ] T036 [P] [US2] Unit test `MonexUp.Tests/Infra/Repository/ProductLinkRepositoryTests.cs::Upsert_HandlesUniqueViolation`: simulate concurrent inserts (two parallel tasks), assert both observe a successful return and only one DB row.
- [ ] T037 [P] [US2] API integration test `MonexUp.ApiTests/Controllers/ProductLinkControllerTests.cs::GetByNetwork_ReturnsOnlyOwnNetworkProducts`: links seeded across two networks, query for one returns only that network's links (FR-006, SC-005).
- [ ] T038 [P] [US2] API integration test `MonexUp.ApiTests/Controllers/ProductLinkControllerTests.cs::PostLink_RetryReturns200`: same payload twice → first 201, second 200, single row in DB.
- [ ] T039 [P] [US2] API integration test `MonexUp.ApiTests/Controllers/ProductLinkControllerTests.cs::PostLink_ForbiddenWhenUserNotMember`: non-member user → 403.

### Implementation for User Story 2

- [X] T040 [US2] Extend `MonexUp.API/Controllers/ProductLinkController.cs` with `GET /api/productLink/by-network/{networkId}` (network-membership check) and `GET /api/productLink/by-user/{userId}` (self OR Network Manager check) per OpenAPI contract.
- [X] T041 [US2] Extend `ProductLinkService` with `GetByNetwork(int networkId, int callerUserId)` and `GetByUser(int userId, int callerUserId)` returning `ApiResponse<List<ProductLinkInfo>>`. Authorization is enforced in service layer.
- [X] T042 [P] [US2] Add helpers in `ProductLinkBusiness`/`ProductLinkProvider` (frontend) for `listByNetwork(networkId)` and `listByUser(userId)`. Wire into the Products page so "my products in this network" and "products I created" queries hit MonexUp, not Lofn.
- [X] T043 [US2] Frontend retry harness: persist a "pending link" object in `localStorage` under `mnx.productLink.pending` (mirrors the `mnx.*` convention) so a tab reload still allows manual retry of an unrecorded Lofn product. Surface a toast (skill `react-alert`) with a "Tentar novamente" button.

**Checkpoint**: MonexUp owns the ownership relation. Idempotent upsert is provable; orphan tolerance is documented but not yet exercised (US3).

---

## Phase 5: User Story 3 — Legacy product code is removed from MonexUp (Priority: P3)

**Goal**: After cut-over of US1+US2, every MonexUp file whose responsibility is now owned by Lofn is deleted. Only `ProductLink*` (MonexUp side) and `lofn-react` (vendor) remain.

**Independent Test**: `git grep` for legacy product class names returns zero hits across `MonexUp.*` projects and `monexup-app/src/`. Solution still builds. All tests still pass.

### Tests for User Story 3 ⚠️

- [ ] T044 [P] [US3] DEFERRED — see scope note below.
- [ ] T045 [P] [US3] DEFERRED — see scope note below.

### Implementation for User Story 3

> **Scope note (2026-05-04)**: The cleanup as drafted assumes ProductService/ProductModel/LofnProductRepository can be deleted. In practice, **OrderController + OrderService + ProxyPayService** still depend on `IProductService.GetBySlug` / `IProductDomainFactory` / `IProductModel` to fetch a product for the customer-facing PIX checkout flow (`/Order/createPixPayment/{productSlug}`). Frontend `Pages/ProductPage`, `Pages/SellerPage`, `Pages/NetworkPage` likewise rely on `ProductContext` for read-side display. Feature 003 already replaced the EF-backed product persistence with `LofnProductRepository` (HTTP shim to Lofn). Deleting the surviving read-side surface would break checkout without a parallel rewrite of OrderService/checkout pages to use lofn-react directly. That refactor is **out of scope** for feature 004's stated goal (add product-link table + lofn-react manage page). Re-open these tasks once the checkout migration is scheduled.

- [ ] T046 [US3] DEFERRED — backend `IProductService`/`LofnProductRepository`/etc. are load-bearing for OrderController+OrderService (checkout/PIX). Cannot delete without parallel checkout rewrite.
- [X] T047 [US3] No-op confirmed: `MonexUp.API/Controllers/ProductController.cs` does not exist.
- [ ] T048 [US3] DEFERRED — Initializer registrations support T046 surface; deletion paired with T046.
- [ ] T049 [US3] DEFERRED — frontend `Pages/ProductPage`/`SellerPage`/`NetworkPage` consume `ProductContext.getBySlug`/`search`. Re-open with checkout rewrite.
- [ ] T050 [US3] DEFERRED — paired with T049.
- [X] T051 [US3] No-op confirmed: `MonexUpContext` had no `DbSet<ProductModel>` (Products were never persisted in MonexUp post-feature-003). T019 migration is the source of truth.
- [X] T052 [US3] DB-level FK cascade (`monexup_fk_product_link_network` ON DELETE CASCADE — see migration T019) handles ProductLinks cleanup when a `Networks` row is deleted. `NetworkService` has no `Delete` method today, so no service-level wiring is needed. Re-open if/when an explicit delete-network flow is introduced.
- [ ] T053 [P] [US3] DEFERRED — grep verification cannot pass while T046/T049 are deferred.

**Checkpoint**: Cleanup ships. SC-006 satisfied. All three user stories functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and documentation after the three stories land.

- [X] T054 [P] Updated `docs/LOFN_INTEGRATION.md` with new boundary section (feature 004 — 2026-05-04): `monexup_product_links`, lazy provisioning, source-of-truth split.
- [X] T055 [P] Updated `CLAUDE.md` "Lofn Integration" section: distinguishes backend-reads-via-LofnProductRepository (checkout) vs MonexUp-owned tables/endpoints (ProductLinks + LofnStoreClient).
- [ ] T056 [P] DEFERRED — controller documentation gen pending (manual section in LOFN_INTEGRATION.md is sufficient for now).
- [X] T057 [P] Added Bruno collection `bruno/ProductLink/` with `Upsert`, `Get By Network`, `Get By User`, `Delete By Network`.
- [ ] T058 PENDING (user) — run `quickstart.md` manually after applying migration.
- [ ] T059 PENDING (user) — SC-005 audit + SC-006 grep require deployed env.
- [ ] T060 PENDING (user) — perf p95 check requires deployed env.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks ALL user stories.
- **Phase 3 (US1, P1) 🎯 MVP**: Depends on Phase 2.
- **Phase 4 (US2, P2)**: Depends on Phase 2. May start in parallel with Phase 3 only after Phase 3's `ProductLinkController POST` lands (T027) — the GET extension and frontend listings reuse the same controller surface.
- **Phase 5 (US3, P3)**: Depends on Phases 3 AND 4 — cleanup is only safe after the new path is proven in production.
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational.
- **US2 (P2)**: Builds on US1's controller skeleton (T027) but exercises new endpoints + retry; can demo independently.
- **US3 (P3)**: Strictly after US1 + US2 are observed working in real environments.

### Within Each User Story

- Tests written and observed FAILING before implementation.
- Models → Repositories → Services → Controllers → Frontend.
- Backend wiring before frontend wiring.
- One story complete and demoable before moving to the next priority.

### Parallel Opportunities

- T002, T003 in Phase 1 (different files, independent).
- T007, T008, T009, T011, T013, T015, T017, T018, T020 in Phase 2 (different files, no inter-deps within the batch).
- T022, T023, T024 in US1 (different test files, no inter-deps).
- T028, T029, T030, T031, T032 in US1 frontend (different files; only T033 depends on the chain).
- T035–T039 in US2 (different test files).
- T044, T045 in US3 (different test files).
- T054–T057 in Polish (different docs/folders).

---

## Parallel Example: User Story 1 launch

```bash
# Backend tests fired together (run in parallel):
Task: "Unit test LofnStoreProvisioningServiceTests in MonexUp.Tests/Domain/Services/"
Task: "Unit test LofnStoreClientTests in MonexUp.Tests/Infra/AppServices/"
Task: "API test ProductLinkControllerTests::Create_FirstProduct_ProvisionsStore in MonexUp.ApiTests/Controllers/"

# Frontend scaffolding fired together (different files, none depending on T033):
Task: "Wire LofnProvider in monexup-app/src/App.tsx (T028)"
Task: "Service interface + impl in monexup-app/src/Services/{Interfaces,Impl}/ProductLinkService.tsx (T029)"
Task: "DTOs in monexup-app/src/DTO/Domain/ProductLink*.tsx (T030)"
Task: "Business + factory in monexup-app/src/Business/... (T031)"
Task: "Context + provider in monexup-app/src/Contexts/ProductLink/ (T032)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup) — T001–T004.
2. Phase 2 (Foundational) — T005–T021.
3. Phase 3 (US1) — T022–T034.
4. **STOP and validate**: smoke test sections 1–9 of `quickstart.md`. Demo product CRUD via Lofn with lazy store provisioning. Ship MVP.

### Incremental Delivery

1. MVP shipped (US1).
2. Add US2 (T035–T043) — exposes ownership endpoints, hardens retry. Demo idempotency + cross-network isolation.
3. Add US3 (T044–T053) — delete legacy product code, run guard tests + grep verification.
4. Phase 6 (Polish) — docs, Bruno, performance check, SC verification.

### Parallel Team Strategy

- Dev A: Phase 2 backend (T005–T021), then Phase 3 backend (T025–T027).
- Dev B: Phase 3 frontend (T028–T034) once backend foundational tasks ship.
- Dev C: Phase 4 tests (T035–T039) while Dev A/B finish Phase 3, then take Phase 4 implementation.
- Phase 5 (cleanup) is single-dev work to avoid merge churn — schedule it as a focused sprint after US1+US2 are in production.

---

## Notes

- Constitution Principle III: Lofn is a black box. Any task that even smells like "patch Lofn" is out of scope — escalate to a separate Lofn-side ticket.
- Constitution Principle VII: every new service/repository/factory MUST be in `Initializer.cs` (T021). Frontend mirror in `ServiceFactory.tsx` (T029) and `ContextBuilder` (T032).
- Skills to consult during execution: `dotnet-architecture` (backend layering), `dotnet-fluent-validation` (T020), `dotnet-doc-controller` (T056), `dotnet-test`/`dotnet-test-api` (test tasks), `react-arch` (frontend entity scaffold), `react-alert` (T033, T043), `add-react-i18n` (T034).
- Idempotency contract for `POST /api/productLink`: 201 on first hit, 200 on retry — verified by T038. The client retries on 5xx but never on 4xx (R6).
- `[P]` tasks act on different files. Tasks acting on `App.tsx`, `ServiceFactory.tsx`, `Initializer.cs`, `MonexUpContext.cs`, or controller files are intentionally NOT marked `[P]` because they cause merge conflicts.
- Each `[P]` group can be split across team members; non-`[P]` tasks must be sequenced.
- Commit at each completed task or logical group; never bundle multi-story changes in one commit.

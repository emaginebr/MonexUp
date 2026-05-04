# Phase 0 Research — Migrate Products to Lofn

**Feature**: 004-lofn-products-migration
**Date**: 2026-05-04

All research items below feed the Phase 1 design. Each entry follows: Decision · Rationale · Alternatives considered.

---

## R1. `lofn-react` package surface

**Decision**: Use `lofn-react` exclusively for product UX. Mount its top-level `<LofnProvider config={...}>` inside the `ContextBuilder` chain in `App.tsx`. Use the package's `ProductProvider`, `StoreProvider`, `ProductList`, `ProductForm`, and `ProductService` to render and operate the catalog.

**Rationale**: Inspection of `c:\repos\Lofn\lofn-react\dist\index.d.ts` confirms a complete React surface: `LofnConfig { apiUrl, tenantId?, getToken?, timeout?, headers? }`, `LofnProvider`, `ProductProvider`, `ProductForm`, `ProductList`, `ProductService`, `StoreProvider`, `StoreService`, `CategoryProvider`. The package mirrors the `nauth-react`/`proxypay-react` integration pattern already present in the repo, so the wiring in `App.tsx` and `ServiceFactory.tsx` follows the same recipe (constitution Principle II).

**Alternatives considered**:

- *Hand-roll an axios client to Lofn from MonexUp.* Rejected: duplicates the entire `lofn-react` surface, violates constitution Principle III (delegate to external project), and locks us into maintaining two implementations of the catalog UX.
- *Keep the current `LofnProductRepository` HTTP shim and a thin frontend service.* Rejected: it forces every product call to round-trip MonexUp backend, contradicting the clarification that the frontend talks to Lofn directly (Q4).

---

## R2. Lofn store-creation endpoint shape

**Decision**: Backend store provisioning calls `POST {Lofn:ApiURL}/api/Store/insert` with payload `StoreInsertInfo { Name }` and tenant header `X-Tenant-Id: monexup`. The response is `StoreInfo`, which contains the new store's primary key. Persist that key as `Networks.LofnStoreId`.

**Rationale**: Confirmed against `c:\repos\Lofn\Lofn\Lofn.API\Controllers\StoreController.cs` (`[HttpPost("insert")] public async Task<ActionResult<StoreInfo>> Insert([FromBody] StoreInsertInfo store)`) and the DTO `c:\repos\Lofn\Lofn\Lofn\DTO\Store\StoreInsertInfo.cs` (only `Name` is required). No Lofn change needed (clarification Q1, constitution Principle III).

**Alternatives considered**:

- *Have the frontend call `POST /Store` directly and then ship the store id back to MonexUp via the link endpoint.* Rejected: the store id is a Network-level fact (1:1) and naturally lives on the `Networks` row, which only the backend writes. Routing this through the frontend leaks ownership and creates a window where an attacker could mint a Lofn store and bind it to someone else's network.

---

## R3. Idempotency strategy for `ProductLink` upsert

**Decision**: `ProductLinkRepository.Upsert(LofnProductId, NetworkId, UserId)` uses **EF Core "find-then-insert" inside a transaction**, leaning on a **unique index on `LofnProductId`** to make concurrent inserts safe. On unique-violation exception, the repository re-reads the row and returns it, so the operation is observably idempotent.

**Rationale**:

- The codebase consistently uses EF Core LINQ + repositories (see `MonexUp.Infra/Repository/*`), not raw SQL `ON CONFLICT`. Matching that pattern keeps `dotnet-architecture` skill compliance and tests stay readable.
- The unique index on `LofnProductId` is the structural guarantee; the find-then-insert wrapper is the ergonomic layer. If the index is dropped by mistake, tests that exercise concurrent retries surface the regression immediately.
- The `MonexUp.ApiTests` project (Flurl + FluentAssertions per `dotnet-test-api` skill) covers idempotent retry: same payload twice → 200 the second time, single row in DB.

**Alternatives considered**:

- *Raw `INSERT ... ON CONFLICT (LofnProductId) DO UPDATE`.* Faster path, but requires raw SQL inside a repository whose other methods are LINQ — an inconsistency hit with no measurable payoff at current scale.
- *Application-level lock on `LofnProductId`.* Rejected: in-memory locks don't survive multi-instance deployment; `INSERT ... DO NOTHING` and a unique index already handle the concurrency case at the DB tier.

---

## R4. Concurrent provisioning idempotency for `Networks.LofnStoreId`

**Decision**: Wrap provisioning in `LofnStoreProvisioningService.EnsureStoreAsync(networkId)` with this contract:

1. Begin a serializable transaction on `Networks` for the row matching `networkId`.
2. Re-read `LofnStoreId`. If non-null, commit and return it.
3. Otherwise call `LofnStoreClient.InsertAsync(network.Name)`, persist the returned id back to the row, commit.
4. On unique-key conflict during write, the loser re-reads and returns the winner's id (same idempotency dance as R3).

**Rationale**:

- The race window is narrow (only on the very first product CREATE for a network), but the cost of two stores in Lofn for one Network would be silent data fragmentation. A serializable transaction on the single-row update is cheap and correct.
- Aligns with constitution Principle III: provisioning is **MonexUp-side** orchestration over Lofn's existing API. Lofn is not asked to enforce uniqueness it doesn't own.

**Alternatives considered**:

- *Postgres advisory lock keyed on `networkId`.* More plumbing than the row-level transaction needs.
- *Event-driven outbox pattern.* Overkill for a 1:1 link populated at most once per network.

---

## R5. Tenant header propagation in `lofn-react`

**Decision**: Configure `<LofnProvider config={{ apiUrl: REACT_APP_LOFN_API_URL, tenantId: REACT_APP_TENANT_ID, getToken: () => nauthToken }}>` in `App.tsx`. The package consumes `tenantId` and propagates `X-Tenant-Id` automatically; if a deployment ever needs an override header, the same `headers` field accepts it.

**Rationale**: `LofnConfig` (file `c:\repos\Lofn\lofn-react\dist\index.d.ts`) explicitly exposes both `tenantId?: string` and `headers?: Record<string, string>`. Nothing has to be hand-wired beyond mirroring the `nauthConfig.headers` pattern already in `App.tsx`. The approved spec already includes `REACT_APP_TENANT_ID` in `.env`, `.env.example`, and `vite-env.d.ts`.

**Alternatives considered**:

- *Inject the header through a global axios interceptor on whatever axios instance `lofn-react` uses internally.* Rejected: brittle, depends on the package's internal client identity, and breaks the moment the package upgrades or swaps its HTTP client.

---

## R6. Frontend transactional retry for the link endpoint

**Decision**: After a successful Lofn product create, `ProductLinkContext.upsertLink(lofnProductId, networkId, userId)` is invoked. The provider:

1. Tries the `POST /api/productLink` call.
2. On 5xx or network failure, retries up to 3 times with exponential back-off (200 ms, 600 ms, 1.4 s).
3. On 4xx, surfaces the error envelope to the user via `react-alert` (skill `react-alert`).
4. On all-retries-exhausted, displays a "Retry pending" badge on the just-created product card and stores the pending link in component state so the user can manually retry; nothing is silently dropped.

The endpoint is idempotent on `LofnProductId` (R3), so retrying after a partial failure cannot corrupt state.

**Rationale**: Matches the in-house pattern (`react-alert` for user-facing failure, `aria-live` polite for non-blocking retries), satisfies FR-009, keeps the rollback boundary tight (no Lofn cleanup is attempted because Lofn is the source of truth and orphan products there are already a Lofn-side concern, per Q5).

**Alternatives considered**:

- *Roll back the Lofn product when the MonexUp link fails.* Rejected: violates the "frontend writes to Lofn directly, MonexUp link is the second leg" architecture; would require the frontend to perform compensation, increasing complexity and creating a window where a buggy retry deletes a real product.

---

## R7. Existing MonexUp-owned product data

**Decision**: Treat the legacy product table as **empty** and remove the `ProductModel` `DbSet` plus its history in the same migration that adds `Networks.LofnStoreId` and `ProductLinks`. A pre-migration assertion will run against the production database (in a one-off SQL audit script kept in `scripts/`) to confirm zero rows; if the audit returns ≥1 row, the migration is blocked and a separate one-time data-move ticket is opened.

**Rationale**:

- The repository already routes products through `LofnProductRepository` → Lofn (per `CLAUDE.md` Lofn integration section). Any local `Products` table is residual and almost certainly empty.
- The audit script is a 5-minute safeguard that trades zero engineering cost for a guaranteed safe drop. Aligned with constitution Principle VI (migrations are explicit) and the "Tool Limitations" note (Docker/DB cannot be poked from this CLI; the script is run by a human).

**Alternatives considered**:

- *Write a one-time mover that ships every legacy product into Lofn before dropping the table.* Rejected pre-emptively: would only be needed if the audit returns ≥1 row. Build it then, not now.

**Audit result (T004, 2026-05-04)**: `MonexUp.Infra/Migrations/20260223191527_InitialCreate.cs` — `grep "Products"` returns zero hits. `MonexUpContext` has no `DbSet<ProductModel>`. There is no `Products` table in the schema, so the legacy-data audit is satisfied automatically. No `DROP TABLE` is needed in the new migration.

---

## Summary

All seven items are decided with no remaining `NEEDS CLARIFICATION`. Phase 1 can proceed.

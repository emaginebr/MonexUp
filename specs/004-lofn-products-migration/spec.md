# Feature Specification: Migrate Products to Lofn

**Feature Branch**: `004-lofn-products-migration`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: "Alterar a parte de Products para usar outro projeto: usar projeto Lofn para gerenciar produtos (C:\repos\Lofn\Lofn). Cada rede deve criar de forma automatica e transparente uma store no Lofn. Deve existir relacionamento do produto com a rede (Network) e com o usuario. Remover arquivos relacionados com produtos substituidos pelo Lofn."

## Clarifications

### Session 2026-05-04

- Q: How does the Lofn Store reference back to a MonexUp Network? → A: Lofn is NOT changed. MonexUp Network carries the Lofn Store id (reverse FK). Tenant header `X-Tenant-Id: monexup` propagates from MonexUp to Lofn unchanged.
- Q: When a Network is deleted in MonexUp, what happens to its Lofn Store? → A: Controlled orphan — MonexUp clears its own `Network.LofnStoreId`. The Lofn store is left intact (no Lofn API call). Since no MonexUp record routes to that store anymore, its products stop being listed; the store stays in Lofn as an audit/history record.
- Q: When does MonexUp provision the Lofn Store for a network? → A: Lazy on first product CREATE only. Reads (list/view) of an empty catalog do NOT trigger store creation. Networks that never attempt a product create never get a Lofn store. This applies uniformly to new and legacy networks.
- Q: How does Product creation flow and where do the Product↔Network and Product↔User relationships live? → A: Product CREATE (and image upload) goes directly from the frontend to the Lofn API — MonexUp backend is NOT in that path. After Lofn returns the new product id, the frontend calls a MonexUp endpoint that records the relationship `(LofnProductId, NetworkId, UserId)` in a MonexUp-owned link table. The two relationships (product↔network and product↔user) live in MonexUp, not in Lofn. Image upload partial-failure is Lofn's concern, not MonexUp's.
- Q: When a product is deleted/updated in Lofn, how is the MonexUp ProductLink kept in sync? → A: MonexUp tolerates orphan links. No symmetric unlink endpoint, no Lofn webhook. Frontend deletes products directly in Lofn and does NOT call MonexUp on delete. Product UPDATE does not touch the link (catalog data only). MonexUp queries are resilient to dangling links. Periodic cleanup of orphans is a separate service, out of scope for this feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Network owner manages products through Lofn (Priority: P1)

A network owner (Network Manager) wants to add, edit, list, and remove products that belong to their network. The owner expects products to be visible to representatives and end-buyers immediately. The owner does not need to know that storage and catalog logic are delegated to a separate product service — the experience inside MonexUp must remain unchanged.

**Why this priority**: Product catalog is the revenue surface of every network. Without product CRUD, a network cannot operate. This is the core value of the migration: the same product experience, backed by a dedicated catalog service, with no regression for existing networks.

**Independent Test**: Sign in as a Network Manager, open the Products section, create a product with name/price/image, save, refresh the page, confirm the product is listed and can be opened, edited, and removed. The product must remain associated to the same network across logout/login and across browser sessions.

**Acceptance Scenarios**:

1. **Given** a Network Manager logged into a network that did not previously have a Lofn store, **When** the Network Manager opens the Products section, **Then** the system shows an empty product list (no Lofn store is created yet — read flows do not provision).
2. **Given** the same Network Manager from scenario 1, **When** they save their first product, **Then** the system silently provisions a Lofn store for that network and persists the product in it.
3. **Given** a Network Manager with an existing Lofn store for their network, **When** the Network Manager creates a product, **Then** the product is persisted in Lofn and appears in the Products list scoped to that network only.
4. **Given** two networks each with their own Lofn store, **When** a user views products of network A, **Then** they only see products that belong to network A's store — never products from network B.
5. **Given** a Network Manager edits or removes a product, **When** the change is saved, **Then** the change is reflected in Lofn and the next listing call returns the updated state.

---

### User Story 2 - Product carries explicit Network and User ownership in MonexUp (Priority: P2)

When a product is created, MonexUp records who created it (the user) and which network it belongs to. Product CREATE itself goes straight to Lofn from the frontend; once Lofn returns the new product id, the frontend calls a MonexUp endpoint that links the product to the current network and the current user. From that moment on, MonexUp can answer "which products belong to network A?" and "which products were created by user X?" without depending on Lofn for that mapping.

**Why this priority**: Without the explicit product↔network and product↔user links in MonexUp, the platform cannot attribute a product to a specific seller for commission, audit, or ownership flows. P2 because the catalog (P1) ships first; the ownership table is the next layer that unlocks commissions.

**Independent Test**: Sign in as a Network Manager on network A, create a product. Confirm the product exists in Lofn AND a MonexUp link record exists for `(LofnProductId, NetworkId=A, UserId=current user)`. Query MonexUp for products of network A → product appears. Query MonexUp for products created by the current user → product appears.

**Acceptance Scenarios**:

1. **Given** a Network Manager creates a product (frontend posts to Lofn directly, then calls the MonexUp link endpoint), **When** Lofn returns the new product id and the MonexUp link call succeeds, **Then** MonexUp persists `(LofnProductId, NetworkId, UserId)` in its link table.
2. **Given** the product was created above, **When** any MonexUp consumer asks "which products belong to network A?", **Then** the link table is the source of truth and returns the product.
3. **Given** Lofn returns success but the MonexUp link call fails, **When** the user retries, **Then** the system either completes the link (idempotent retry by `LofnProductId`) or surfaces a clear, actionable error — it MUST NOT leave a Lofn product with no MonexUp link silently.

---

### User Story 3 - Legacy product code is removed from MonexUp (Priority: P3)

The team wants the MonexUp codebase to stop carrying product domain logic that has been replaced by Lofn. After the migration, only the thin client layer that calls Lofn remains in MonexUp.

**Why this priority**: Cleanup pays a long-term maintenance dividend (smaller codebase, no two sources of truth, no drift). It can ship after P1 and P2 are stable in production because removal is safe only once Lofn is the verified source of truth.

**Independent Test**: After the cut-over, search the MonexUp solution for product domain classes (model, factory, service, DTO duplicates, controller endpoints). Confirm the only remaining product-related artefacts are the Lofn HTTP client, the read-side adapter exposed to the frontend, and the request/response shapes the frontend already consumes. No EF migration, table, or repository for products remains in MonexUp.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** running a full solution build, **Then** no MonexUp project references a `ProductModel`, `ProductService`, `ProductRepository`, or product `DbSet` other than the Lofn HTTP adapter.
2. **Given** the migration is complete, **When** inspecting the database schema of MonexUp, **Then** there is no `Products` table (or any equivalent product table) owned by MonexUp; product persistence is entirely in Lofn.
3. **Given** the migration is complete, **When** the frontend reads or writes product data, **Then** every product call resolves through the Lofn integration; no MonexUp endpoint serves product persistence anymore.

---

### Edge Cases

- A network created **before** this migration has no Lofn store. The system must lazily provision one **on the first product CREATE** for that network — never on read flows. There must be no broken state and no manual one-off migration script required.
- Lofn is unreachable when a product call is made. The user must see a clear, retryable error instead of a partial save (no orphan product, no orphan store, no orphan store-user link).
- A network is deleted in MonexUp. MonexUp clears the Network's reference to its Lofn store (orphan strategy). No Lofn API call is made; the Lofn store stays intact for audit purposes. Because no MonexUp record routes to that store anymore, its products stop being listed end-to-end.
- Two requests provision a Lofn store for the same network concurrently (e.g. two Network Managers click at once). Exactly one store must end up linked to the network — duplicates must not be created.
- A representative is approved on multiple networks. They must end up linked to multiple Lofn stores (one per network) and never see products that belong to a network they do not have access to.
- The MonexUp link endpoint fails after Lofn has already created the product. The frontend MUST retry idempotently (Lofn returns the same product id on safe retry, MonexUp link is idempotent on `LofnProductId`) OR surface a clear retryable error. A product MUST NOT remain in Lofn with no MonexUp link silently.
- An image upload to Lofn fails. This is **out of MonexUp's transactional contract** — Lofn defines the rollback / image-pending contract for its own catalog. MonexUp does not retry, rollback, or otherwise compensate.
- A product is deleted directly in Lofn. The corresponding MonexUp `ProductLink` row remains until a separate (out-of-scope) cleanup service reconciles it. MonexUp queries gracefully skip dangling links — no fatal error, no missing-product crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist the entire product catalog (products, prices, images, status, types) in the Lofn project. The MonexUp frontend MUST call the Lofn API directly for product CRUD; the MonexUp backend MUST NOT proxy product CRUD calls and MUST NOT keep its own product table.
- **FR-002**: System MUST automatically create a Lofn store for a network on the **first product CREATE** that network attempts (lazy provisioning, write-triggered only). Read flows (listing or viewing an empty catalog) MUST NOT create a store. Networks that never create a product never get a Lofn store. The same trigger applies uniformly to legacy and newly created networks — no eager creation at network insert and no backfill script.
- **FR-003**: System MUST guarantee that a network has at most one active Lofn store. Concurrent provisioning attempts MUST converge to a single store.
- **FR-004**: Each MonexUp Network record MUST persist the identifier of its Lofn store (1:1, MonexUp owns the link). Lofn is not modified to know about MonexUp networks.
- **FR-005**: System MUST expose a MonexUp endpoint that records the link `(LofnProductId, NetworkId, UserId)` after a product is created in Lofn. The endpoint MUST be **idempotent on `LofnProductId`** so a retry following a transient network error does not create duplicate link rows. This endpoint is the only place that establishes both the product↔network and product↔user relationships.
- **FR-006**: MonexUp MUST be the source of truth for "which products belong to network N" and "which products were created by user U". Both queries are answered from the MonexUp link table — Lofn is not consulted to derive ownership.
- **FR-007**: System MUST surface product CRUD operations to network operators with the same UX they have today — operators MUST NOT need to know a different service handles persistence.
- **FR-008**: System MUST propagate the tenant header `X-Tenant-Id: monexup` on every Lofn call, end to end (frontend → Lofn directly, and MonexUp backend → Lofn for store provisioning). The same tenant identifier is used on both sides — Lofn is not altered to recognize a different identifier.
- **FR-009**: When the link call to MonexUp fails after Lofn has already created the product, the frontend MUST retry the link operation idempotently OR surface a clear, retryable error to the user — it MUST NOT silently leave a Lofn product without its MonexUp link. Image-upload partial failures are owned by Lofn and out of MonexUp's transactional contract.
- **FR-010**: System MUST remove every MonexUp source file whose responsibility is now owned by Lofn — the product domain model, factory, service, repository (product persistence), DTO duplicates, EF entity configuration, and migrations specific to products. The thin Lofn HTTP adapter (used by the backend only for store provisioning) and the new product-link table/endpoint are the only product-related code that remains in MonexUp.
- **FR-011**: When a network is deleted in MonexUp, System MUST clear the Network record's reference to its Lofn store (controlled orphan) and MUST also remove the corresponding rows from the MonexUp product-link table for that network. No Lofn API call is required; because routing and ownership are owned by MonexUp, the products stop being listed automatically. The Lofn store and its product records are intentionally preserved as an audit/history record.
- **FR-012**: System MUST tolerate orphan rows in the MonexUp product-link table (a row whose `LofnProductId` no longer exists in Lofn because the product was deleted directly there). MonexUp MUST NOT crash, throw, or surface a fatal error when a link points at a missing Lofn product — list/detail flows MUST skip or gracefully degrade for missing items. A periodic cleanup service that reconciles orphan links against Lofn is **out of scope** for this feature.

### Key Entities

- **Network (MonexUp, source of truth)**: A network is a marketing organization owned by a Network Manager. It has a unique identity, a slug, and a set of representatives. After this feature, every Network record persists the identifier of its associated Lofn store — the MonexUp side owns the link between the two.
- **Store (Lofn, source of truth for catalog)**: A Lofn store is the catalog container that holds products. Lofn is **not modified** for this feature: stores remain identified by Lofn's own primary key. The mapping back to a MonexUp network lives only in MonexUp (on the Network record).
- **Product (Lofn, source of truth for catalog data)**: A product is a sellable item created and persisted entirely in Lofn (name, price, images, status, type). MonexUp does not duplicate this data; it only stores the Lofn product identifier in its link table.
- **ProductLink (MonexUp, source of truth for ownership)**: A new MonexUp-owned table that persists `(LofnProductId, NetworkId, UserId)` per product. One row per Lofn product. This table answers "which products belong to network N?" and "which products were created by user U?" without consulting Lofn. Idempotent on `LofnProductId`.
- **User (MonexUp, source of truth)**: Identity remains in MonexUp/NAuth. The `UserId` referenced in `ProductLink` is the MonexUp user identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of product reads and writes performed by MonexUp resolve through Lofn after the cut-over. No product data is read from or written to a MonexUp-owned table.
- **SC-002**: Every network that attempts to create at least one product after cut-over ends up with exactly one linked Lofn store. Networks that never create a product correctly have no Lofn store — that is the expected steady state, not a bug.
- **SC-003**: For every network that has a Lofn store, every active representative of that network has exactly one corresponding Lofn store-user link. Networks without a store correctly have no rep-store links — that is the expected steady state.
- **SC-004**: A Network Manager can create their first product on a brand-new network in under two minutes — including any first-time store provisioning — without seeing a setup wizard, error, or empty state worse than today.
- **SC-005**: Zero cross-network product leaks: in audit testing, a "products of network A" query (resolved via the MonexUp link table) never returns a product whose link row points at network B, across at least 1,000 sampled requests.
- **SC-006**: After cleanup ships, the MonexUp codebase contains no source files implementing product persistence — only the thin integration adapter that talks to Lofn. A code-level audit confirms zero duplicate product domain logic across the two projects.
- **SC-007**: Product-related support tickets that root-cause to "duplicate source of truth" or "MonexUp/Lofn out of sync" drop to zero within 30 days of cleanup.

## Assumptions

- The Lofn project at `C:\repos\Lofn\Lofn` is treated as a black box for this feature: no schema, API, or auth change is requested in Lofn. The MonexUp Network record is the single place that holds the Lofn store identifier.
- The frontend already consumes products through a Lofn-aware service (see `LofnProductRepository` and the `REACT_APP_LOFN_API_URL` env var); the frontend therefore does not require a refactor for this migration — only the backend boundary moves.
- MonexUp tenant isolation header `X-Tenant-Id: monexup` is the agreed cross-service trust mechanism; no new auth scheme is introduced.
- When a network is removed in MonexUp, MonexUp does not call Lofn — it just clears its own Network→LofnStoreId pointer (controlled orphan). The Lofn store remains intact in Lofn for historical/audit purposes; products stop being listed because nothing routes to that store anymore. If a hard cleanup of orphaned Lofn stores is needed later, that is a separate Lofn-side housekeeping concern.
- The cut-over happens in three phases corresponding to the three priorities: P1 (network catalog) → P2 (representative link) → P3 (cleanup). Each phase is independently shippable and reversible until P3.
- Product images continue to live in the existing object storage bucket; only metadata moves to Lofn. If Lofn requires its own image storage, that decision is captured by the Lofn team and is out of scope for this MonexUp-side specification.
- Existing products in the MonexUp database (if any) are migrated as part of the cut-over by a one-time data move executed by the team, not by end users; this specification does not detail the migration script because the legacy product table may already be empty or trivially small.

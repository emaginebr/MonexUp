# Phase 1 Data Model — Migrate Products to Lofn

**Feature**: 004-lofn-products-migration
**Date**: 2026-05-04

Scope: only entities owned by **MonexUp**. Lofn entities (`Store`, `Product`) are referenced by their Lofn primary key; their schema is unchanged and is not duplicated here.

---

## 1. `Networks` (modified)

Existing entity. One column added.

| Column          | Type          | Constraints                                  | Notes                                                                 |
| --------------- | ------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| (existing cols) | …             | …                                            | unchanged                                                             |
| `LofnStoreId`   | `bigint NULL` | nullable; indexed (B-tree, non-unique)       | The Lofn store identifier returned by `POST /api/Store/insert`. Null until the network's first product CREATE. |

**Lifecycle**:

- `INSERT` of a Network starts with `LofnStoreId = NULL` (no eager provisioning — clarification Q3).
- First product CREATE for the network → `LofnStoreProvisioningService.EnsureStoreAsync` calls Lofn, then `UPDATE Networks SET LofnStoreId = ? WHERE Id = ? AND LofnStoreId IS NULL` inside a serializable transaction (research R4).
- Network DELETE (FR-011) → set `LofnStoreId = NULL` and cascade-delete `ProductLinks` rows whose `NetworkId` matches. The Lofn store itself is intentionally NOT deleted (controlled-orphan strategy, clarification Q2).

**Validation**:

- `LofnStoreId` MUST be `> 0` when set.
- A network MUST have a `Name` already (existing rule); the provisioning call uses `network.Name` as the Lofn store name.

---

## 2. `ProductLinks` (new)

Tracks ownership of a Lofn product on the MonexUp side.

| Column          | Type           | Constraints                                                   | Notes                                                                 |
| --------------- | -------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Id`            | `int PK identity` | NOT NULL                                                   | Surrogate primary key.                                                |
| `LofnProductId` | `bigint`       | NOT NULL · **UNIQUE INDEX** (`ix_productlinks_lofnproductid`) | Idempotency key for upsert. Matches `Lofn.Product.Id` type.           |
| `NetworkId`     | `int`          | NOT NULL · FK→`Networks(Id)` ON DELETE CASCADE                | Owning network. Cascade aligns with FR-011.                          |
| `UserId`        | `int`          | NOT NULL · FK→`Users(Id)` from NAuth schema · ON DELETE RESTRICT | Creator of the product. Restrict so user delete fails loudly if links remain (forces explicit cleanup). |
| `CreatedAt`     | `timestamptz`  | NOT NULL · default `now() AT TIME ZONE 'UTC'`                 | Audit timestamp; useful for "products created by user U in last 30d". |

**Indexes**:

- `ix_productlinks_lofnproductid` — UNIQUE on `LofnProductId` (FR-005 idempotency contract).
- `ix_productlinks_network_user` — non-unique on `(NetworkId, UserId)` for "products by user X in network N" lookups.
- `ix_productlinks_user` — non-unique on `(UserId)` for "products by user X across all networks".

**Validation rules** (FluentValidation on `ProductLinkInsertInfo`):

- `LofnProductId > 0`
- `NetworkId > 0`
- `UserId > 0`
- The authenticated user MUST be `UserId` OR a Network Manager of `NetworkId`. Enforced in `ProductLinkService` after the controller-level NAuth validation.

**State transitions**:

- `Insert(LofnProductId, NetworkId, UserId)` → row created.
- `Insert(LofnProductId, …)` again → returns existing row (idempotent).
- `DeleteByNetwork(NetworkId)` → all rows for that network removed (called from network deletion flow).
- `DeleteByLofnProductId` is intentionally NOT exposed — the frontend does not call MonexUp on product delete (clarification Q5). Orphan rows are tolerated.

---

## 3. DTOs (new)

### `ProductLinkInsertInfo` (`MonexUp.DTO/ProductLink/ProductLinkInsertInfo.cs`)

```csharp
public class ProductLinkInsertInfo
{
    public long LofnProductId { get; set; }
    public int NetworkId      { get; set; }
    public int UserId         { get; set; }
}
```

### `ProductLinkInfo` (`MonexUp.DTO/ProductLink/ProductLinkInfo.cs`)

```csharp
public class ProductLinkInfo
{
    public int       Id            { get; set; }
    public long      LofnProductId { get; set; }
    public int       NetworkId     { get; set; }
    public int       UserId        { get; set; }
    public DateTime  CreatedAt     { get; set; }
}
```

> No paged-result DTO — listing is naturally bounded by network or user scope.

---

## 4. EF migration outline

**Migration name**: `LofnProductsMigration` (timestamped by `dotnet ef migrations add`).

**Up**:

1. `ALTER TABLE "Networks" ADD COLUMN "LofnStoreId" bigint NULL;`
2. `CREATE INDEX "ix_networks_lofnstoreid" ON "Networks" ("LofnStoreId");`
3. `CREATE TABLE "ProductLinks" (...);` with PK, FKs, defaults, indexes as above.
4. (If audit confirms empty) `DROP TABLE IF EXISTS "Products" CASCADE;` and remove its `DbSet` from `MonexUpContext`.

**Down**:

1. Recreate `Products` table from prior migration (auto-generated).
2. `DROP TABLE "ProductLinks";`
3. `DROP INDEX "ix_networks_lofnstoreid";`
4. `ALTER TABLE "Networks" DROP COLUMN "LofnStoreId";`

**Pre-flight audit** (manual, not part of the migration):

```sql
SELECT COUNT(*) AS legacy_products FROM "Products";  -- expect 0
```

If non-zero, block the migration and open a separate data-move ticket (research R7).

---

## 5. Relationship summary

```text
Networks (1) ────────────── (0..1) Lofn.Stores
   │                                    │
   │ has many                            │ owns
   ▼                                    ▼
ProductLinks (n) ──────────────── (1) Lofn.Products
   ▲
   │ created by
   │
NAuth.Users (1) ──── (n) ProductLinks
```

- One Network → at most one Lofn Store (1:1 once provisioned).
- One Network → many ProductLinks.
- One User → many ProductLinks across networks.
- One Lofn Product → at most one MonexUp ProductLink (uniqueness on `LofnProductId`).
- Reverse: one ProductLink → exactly one Lofn Product (FK to a system MonexUp does not own; orphans tolerated per Q5).

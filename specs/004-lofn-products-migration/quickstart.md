# Quickstart — Migrate Products to Lofn

**Feature**: 004-lofn-products-migration
**Date**: 2026-05-04

This document is the developer-onboarding path for anyone pulling this branch and wanting to run/test the feature end-to-end.

---

## 1. Prereqs

- .NET 8.0 SDK
- Node.js 18+ and npm
- PostgreSQL 14+ running locally on port 5432
- A local Lofn API up at `http://localhost:5001` (adjust as needed) accepting `X-Tenant-Id: monexup`
- A local NAuth API per `submodules/NAuth/...` setup (already required by MonexUp)

## 2. Pull and install

```bash
git fetch
git checkout 004-lofn-products-migration

# Backend
dotnet restore MonexUp.sln
dotnet build MonexUp.sln

# Frontend
cd monexup-app
npm install            # pulls lofn-react
cd ..
```

## 3. Configure

### Backend — `MonexUp.API/appsettings.Development.json`

Add or confirm:

```json
{
  "Lofn": {
    "ApiURL": "http://localhost:5001"
  }
}
```

### Frontend — `monexup-app/.env`

Confirm or add:

```env
REACT_APP_LOFN_API_URL=http://localhost:5001
REACT_APP_TENANT_ID=monexup
```

(`REACT_APP_TENANT_ID` was added in feature 003 — already present.)

## 4. Pre-flight database audit (one-time)

Before applying the migration, confirm there is no legacy product data on the MonexUp side (research R7):

```sql
SELECT COUNT(*) AS legacy_products FROM "Products";
```

- `0` → safe to proceed.
- `>0` → STOP. Open a separate data-move ticket; this feature does not migrate existing rows.

## 5. Apply EF migration

```bash
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API
```

This creates `Networks.LofnStoreId` (nullable) and the new `ProductLinks` table. It also drops the legacy `Products` table if R7's audit returned 0.

## 6. Run

In separate terminals:

```bash
# Backend (port 5000 by default)
dotnet run --project MonexUp.API/MonexUp.API.csproj

# Lofn API (assumed running on 5001 already)

# Frontend (port 3000 by default)
cd monexup-app && npm start
```

## 7. Smoke test (User Story 1 + 2 happy path)

1. Sign in as a Network Manager.
2. Open the Network's Products section. Confirm the `lofn-react` `<ProductList />` renders an empty state — **no Lofn store has been created yet** for this network. Verify `Networks.LofnStoreId IS NULL` in the database.
3. Click "Add product" and create a product (name, price, image). The `<ProductForm />` POSTs to Lofn directly.
4. On Lofn success, the frontend immediately calls `POST {API}/api/productLink` with `(LofnProductId, NetworkId, UserId)`. Confirm the row in `ProductLinks`. Confirm `Networks.LofnStoreId` is now populated (the link endpoint triggered `EnsureStoreAsync` before persisting).
5. Refresh the page. Product list still shows the product (data lives in Lofn; ownership lives in MonexUp).
6. Edit the product (name change). Confirm the change is reflected on next listing — only Lofn was hit; MonexUp `ProductLinks` is unchanged (it tracks ownership, not catalog data).
7. Delete the product. Confirm Lofn no longer returns it. Confirm `ProductLinks` row remains (orphan-tolerated, clarification Q5).

## 8. Idempotency test (User Story 2 retry path)

1. With the product created above (or any), call `POST /api/productLink` again with the same `LofnProductId` and `(NetworkId, UserId)`. Expect HTTP 200 with the existing record (research R3, FR-005).
2. Confirm there is still **exactly one** row in `ProductLinks` with that `LofnProductId`.

## 9. Concurrency test (User Story 1 + research R4)

Two terminals, two `curl` calls fired in parallel (use `&` or two windows):

```bash
curl -H 'X-Tenant-Id: monexup' -H 'Authorization: Bearer <token>' \
  -X POST http://localhost:5000/api/productLink \
  -H 'Content-Type: application/json' \
  -d '{ "lofnProductId": 1001, "networkId": 7, "userId": 42 }' &

curl -H 'X-Tenant-Id: monexup' -H 'Authorization: Bearer <token>' \
  -X POST http://localhost:5000/api/productLink \
  -H 'Content-Type: application/json' \
  -d '{ "lofnProductId": 1002, "networkId": 7, "userId": 42 }' &

wait
```

(Each call corresponds to a different Lofn product but both target a network with `LofnStoreId IS NULL`.) Expect:

- Both 201 (links created).
- `Networks.Id = 7` ends up with **exactly one** `LofnStoreId`.
- Lofn has **exactly one** Store created with `name = network.Name`.

If two stores end up in Lofn, R4's serializable transaction is broken — bug.

## 10. Network-delete cleanup (FR-011)

1. Delete a network that owns ≥1 product.
2. Confirm `ProductLinks` rows for that network are gone.
3. Confirm the corresponding Lofn store still exists (orphan-tolerated audit, clarification Q2).

## 11. Tests

```bash
# Backend unit + API tests
dotnet test MonexUp.sln

# Frontend
cd monexup-app && npm test -- --watchAll=false
```

Expected suites:

- `MonexUp.Tests/.../ProductLinkServiceTests.cs` — domain-level idempotency, validation.
- `MonexUp.Tests/.../LofnStoreProvisioningServiceTests.cs` — concurrency, lazy trigger.
- `MonexUp.ApiTests/Controllers/ProductLinkControllerTests.cs` — POST 201/200, 400 invalid body, 401 missing token, 403 wrong role.

All previous `Product*Tests` suites have been removed (FR-010).

## 12. Cleanup acceptance (User Story 3, FR-010)

```bash
# From the repo root, no matches expected:
git grep -nE 'ProductService|ProductDomainFactory|ProductRepository|class ProductModel|DbSet<ProductModel>'
git grep -nE 'src/Services/(Interfaces|Impl)/ProductService\.tsx|src/Business/(Interfaces|Impl)/ProductBusiness\.tsx|src/Contexts/Product/'
```

Each grep MUST return zero results. The only product-shaped names that survive are `ProductLink*` (MonexUp side) and `lofn-react`'s own surface (vendor code under `node_modules/`).

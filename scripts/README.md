# Migration scripts — feature 004-lofn-products-migration

Two PostgreSQL scripts cover the same target schema. Pick the one that matches
the current DB state.

## Decide which script to run

```sql
-- Run this query first to check your DB state:
SELECT to_regclass('public.products')               AS legacy_products_exists,
       to_regclass('public.networks')               AS prefixless_networks_exists,
       to_regclass('public.monexup_networks')       AS prefixed_networks_exists,
       to_regclass('public.monexup_product_links')  AS product_links_already_exists;
```

| legacy_products | prefixless_networks | prefixed_networks | Use script |
| --------------- | ------------------- | ----------------- | ---------- |
| not null        | not null            | null              | `lofn_products_migration.sql` (full) |
| null            | null                | not null          | `lofn_products_migration_minimal.sql` |
| null            | null                | not null + product_links_already_exists | nothing — already applied |

## Pre-flight (mandatory)

1. **Backup the database.**
2. Run the legacy-data audit (T004):
   ```sql
   SELECT COUNT(*) FROM "Products";  -- if the table exists; expect 0
   ```
   If `>0`: STOP. Open a separate ticket to move the rows into Lofn before
   dropping the table.
3. Confirm the app process(es) are stopped or in maintenance mode if you are
   running the FULL script (it renames tables and will break running queries).

## Run

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/lofn_products_migration.sql
# OR (if your DB is already on the monexup_* prefix):
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/lofn_products_migration_minimal.sql
```

Both scripts are idempotent and transaction-wrapped — re-running is a no-op.

## Verify (post-apply)

```sql
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'monexup_networks' AND column_name = 'lofn_store_id';

SELECT to_regclass('monexup_product_links');                       -- not null

SELECT indexname FROM pg_indexes WHERE tablename = 'monexup_product_links';
-- expect: monexup_product_links_pkey,
--         ix_monexup_product_links_lofn_product_id,
--         ix_monexup_product_links_network_user,
--         ix_monexup_product_links_user

SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId" DESC LIMIT 1;
-- expect: 20260504172626_LofnProductsMigration
```

## Rollback

The full script's reverse is in
`MonexUp.Infra/Migrations/20260504172626_LofnProductsMigration.cs::Down`. Easiest:

```bash
dotnet ef database update 20260223191527_InitialCreate \
  --project MonexUp.Infra --startup-project MonexUp.API
```

For the minimal script:

```sql
BEGIN;
DROP TABLE IF EXISTS monexup_product_links;
DROP INDEX  IF EXISTS ix_monexup_networks_lofn_store_id;
ALTER TABLE monexup_networks DROP COLUMN IF EXISTS lofn_store_id;
DELETE FROM "__EFMigrationsHistory"
 WHERE "MigrationId" = '20260504172626_LofnProductsMigration';
COMMIT;
```

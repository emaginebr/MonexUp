-- =============================================================================
-- Migration: 20260504172626_LofnProductsMigration
-- Feature:   004-lofn-products-migration
-- Generated: dotnet ef migrations script (idempotent, transaction-wrapped)
-- Target:    PostgreSQL
--
-- WHAT IT DOES (when applied to a DB at state 20260223191527_InitialCreate):
--   1. Drops legacy tables: products, templates, template_pages, template_parts,
--      template_vars (migrated to Lofn/Dedalo external services).
--   2. Renames every MonexUp table to monexup_* prefix (drift-fix from feature 003).
--   3. Adds monexup_networks.lofn_store_id (bigint NULL) + index.
--   4. Creates monexup_product_links (id, lofn_product_id UNIQUE, network_id FK
--      cascade, user_id, created_at) with composite/secondary indexes.
--   5. Recreates sequences with monexup_* prefix.
--   6. Inserts row in __EFMigrationsHistory.
--
-- IDEMPOTENT: each statement is gated by `IF NOT EXISTS(...) FROM __EFMigrationsHistory`,
-- so re-running has no effect once the migration row is recorded.
--
-- BEFORE RUNNING:
--   * Backup the database.
--   * Confirm the legacy `products` table is empty (audit T004):
--       SELECT COUNT(*) FROM "Products";  -- expect 0
--     If non-zero, STOP and migrate the rows to Lofn first.
--
-- ROLLBACK: see C:\repos\MonexUp\MonexUp.Infra\Migrations\20260504172626_LofnProductsMigration.cs
--          method Down(MigrationBuilder), or run:
--          dotnet ef database update 20260223191527_InitialCreate
-- =============================================================================
START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoice_fees DROP CONSTRAINT fk_fee_invoice;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoice_fees DROP CONSTRAINT fk_fee_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoices DROP CONSTRAINT fk_invoice_order;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE order_items DROP CONSTRAINT fk_order_item;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE orders DROP CONSTRAINT fk_order_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_networks DROP CONSTRAINT fk_user_network_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_networks DROP CONSTRAINT fk_user_network_profile;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profile_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE withdrawals DROP CONSTRAINT fk_withdrawal_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP TABLE products;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP TABLE template_parts;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP TABLE template_vars;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP TABLE template_pages;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP TABLE templates;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE withdrawals DROP CONSTRAINT withdrawals_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_networks DROP CONSTRAINT pk_user_network;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_documents DROP CONSTRAINT user_documents_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE orders DROP CONSTRAINT orders_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE networks DROP CONSTRAINT networks_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_pkey;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoice_fees DROP CONSTRAINT pk_invoice_fee;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE orders DROP COLUMN stripe_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoices DROP COLUMN stripe_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP SEQUENCE invoice_commission_commission_id_seq;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP SEQUENCE network_id_seq;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    DROP SEQUENCE profile_id_seq;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE withdrawals RENAME TO monexup_withdrawals;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_profiles RENAME TO monexup_user_profiles;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_networks RENAME TO monexup_user_networks;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE user_documents RENAME TO monexup_user_documents;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE orders RENAME TO monexup_orders;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE order_items RENAME TO monexup_order_items;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE networks RENAME TO monexup_networks;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoices RENAME TO monexup_invoices;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE invoice_fees RENAME TO monexup_invoice_fees;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_withdrawals_network_id" RENAME TO "IX_monexup_withdrawals_network_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_user_profiles_network_id" RENAME TO "IX_monexup_user_profiles_network_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_user_networks_profile_id" RENAME TO "IX_monexup_user_networks_profile_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_user_networks_network_id" RENAME TO "IX_monexup_user_networks_network_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_orders_network_id" RENAME TO "IX_monexup_orders_network_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_order_items_order_id" RENAME TO "IX_monexup_order_items_order_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_invoices_order_id" RENAME TO "IX_monexup_invoices_order_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_invoice_fees_network_id" RENAME TO "IX_monexup_invoice_fees_network_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER INDEX "IX_invoice_fees_invoice_id" RENAME TO "IX_monexup_invoice_fees_invoice_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE SEQUENCE monexup_invoice_commission_id_seq START WITH 1 INCREMENT BY 1 NO CYCLE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE SEQUENCE monexup_network_id_seq START WITH 1 INCREMENT BY 1 NO CYCLE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE SEQUENCE monexup_profile_id_seq START WITH 1 INCREMENT BY 1 NO CYCLE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_profiles ALTER COLUMN profile_id SET DEFAULT (nextval('monexup_profile_id_seq'::regclass));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_networks ALTER COLUMN network_id SET DEFAULT (nextval('monexup_network_id_seq'::regclass));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_networks ADD lofn_store_id bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoice_fees ALTER COLUMN fee_id SET DEFAULT (nextval('monexup_invoice_commission_id_seq'::regclass));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_withdrawals ADD CONSTRAINT monexup_withdrawals_pkey PRIMARY KEY (withdrawal_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_profiles ADD CONSTRAINT monexup_user_profiles_pkey PRIMARY KEY (profile_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_networks ADD CONSTRAINT monexup_pk_user_network PRIMARY KEY (user_id, network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_documents ADD CONSTRAINT monexup_user_documents_pkey PRIMARY KEY (document_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_orders ADD CONSTRAINT monexup_orders_pkey PRIMARY KEY (order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_order_items ADD CONSTRAINT monexup_order_items_pkey PRIMARY KEY (item_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_networks ADD CONSTRAINT monexup_networks_pkey PRIMARY KEY (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoices ADD CONSTRAINT monexup_invoices_pkey PRIMARY KEY (invoice_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoice_fees ADD CONSTRAINT monexup_pk_invoice_fee PRIMARY KEY (fee_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE TABLE monexup_product_links (
        id integer GENERATED BY DEFAULT AS IDENTITY,
        lofn_product_id bigint NOT NULL,
        network_id bigint NOT NULL,
        user_id bigint NOT NULL,
        created_at timestamp without time zone NOT NULL DEFAULT ((now() at time zone 'utc')),
        CONSTRAINT monexup_product_links_pkey PRIMARY KEY (id),
        CONSTRAINT monexup_fk_product_link_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE INDEX ix_monexup_networks_lofn_store_id ON monexup_networks (lofn_store_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE UNIQUE INDEX ix_monexup_product_links_lofn_product_id ON monexup_product_links (lofn_product_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE INDEX ix_monexup_product_links_network_user ON monexup_product_links (network_id, user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    CREATE INDEX ix_monexup_product_links_user ON monexup_product_links (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoice_fees ADD CONSTRAINT monexup_fk_fee_invoice FOREIGN KEY (invoice_id) REFERENCES monexup_invoices (invoice_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoice_fees ADD CONSTRAINT monexup_fk_fee_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_invoices ADD CONSTRAINT monexup_fk_invoice_order FOREIGN KEY (order_id) REFERENCES monexup_orders (order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_order_items ADD CONSTRAINT monexup_fk_order_item FOREIGN KEY (order_id) REFERENCES monexup_orders (order_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_orders ADD CONSTRAINT monexup_fk_order_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_networks ADD CONSTRAINT monexup_fk_user_network_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_networks ADD CONSTRAINT monexup_fk_user_network_profile FOREIGN KEY (profile_id) REFERENCES monexup_user_profiles (profile_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_user_profiles ADD CONSTRAINT monexup_fk_user_profile_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    ALTER TABLE monexup_withdrawals ADD CONSTRAINT monexup_fk_withdrawal_network FOREIGN KEY (network_id) REFERENCES monexup_networks (network_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260504172626_LofnProductsMigration') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260504172626_LofnProductsMigration', '9.0.8');
    END IF;
END $EF$;
COMMIT;



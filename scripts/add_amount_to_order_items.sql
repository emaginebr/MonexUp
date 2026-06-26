-- =============================================================================
-- Migration: add `amount` column to `monexup_order_items`
-- Target:    PostgreSQL
--
-- Stores the unit amount actually paid for the item. Mirrors product.Price
-- when the product has a fixed price, or the buyer-typed donation value when
-- the product has no price (open-amount donations from Lofn). Nullable so
-- pre-existing rows keep their semantics (price was derived from product).
--
-- ROLLBACK:
--   ALTER TABLE monexup_order_items DROP COLUMN IF EXISTS amount;
-- =============================================================================

BEGIN;

ALTER TABLE monexup_order_items
    ADD COLUMN IF NOT EXISTS amount numeric NULL;

COMMIT;

-- Smoke check:
--   SELECT column_name, data_type
--     FROM information_schema.columns
--    WHERE table_name = 'monexup_order_items' AND column_name = 'amount';

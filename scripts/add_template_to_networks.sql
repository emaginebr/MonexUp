-- =============================================================================
-- Migration: add `template` column to `monexup_networks`
-- Target:    PostgreSQL
--
-- Adds a varchar(20) NULL column that stores the visual template identifier
-- selected per network/store. Idempotent.
--
-- ROLLBACK:
--   ALTER TABLE monexup_networks DROP COLUMN IF EXISTS template;
-- =============================================================================

BEGIN;

ALTER TABLE monexup_networks
    ADD COLUMN IF NOT EXISTS template varchar(20) NULL;

COMMIT;

-- Smoke check:
--   SELECT column_name, data_type, character_maximum_length
--     FROM information_schema.columns
--    WHERE table_name = 'monexup_networks' AND column_name = 'template';

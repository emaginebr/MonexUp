-- ===========================================================================
-- clean-monexup-db.sql
-- ---------------------------------------------------------------------------
-- Apaga TODOS os registros do banco do MonexUp, preservando o schema e
-- reiniciando as sequences de identidade (IDs voltam a 1).
--
-- Como rodar no DBeaver:
--   1. Abra a conexao do banco  monexup_db.
--   2. Cole este script no SQL Editor.
--   3. Execute o script inteiro (Alt+X).
--
-- CASCADE resolve a ordem das FKs automaticamente.
-- Envolto em transacao: se algo falhar, faca ROLLBACK.
-- ===========================================================================

BEGIN;

TRUNCATE TABLE
    monexup_invoice_fees,
    monexup_order_items,
    monexup_orders,
    monexup_product_links,
    monexup_withdrawals,
    monexup_user_networks,
    monexup_user_profiles,
    monexup_networks
RESTART IDENTITY CASCADE;

COMMIT;

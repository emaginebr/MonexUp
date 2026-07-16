-- ===========================================================================
-- clean-services-db.sql
-- ---------------------------------------------------------------------------
-- Limpa os registros dos servicos externos usados pelo MonexUp.
-- Cada bloco roda em UM banco diferente -> use a conexao correspondente no
-- DBeaver e execute SOMENTE o bloco daquele banco (selecione o bloco e Ctrl+Enter,
-- ou abra 3 SQL Editors, um por conexao).
--
--   Bloco 1 -> conexao  emagine_db   (NAuth)
--   Bloco 2 -> conexao  lofn_db      (Lofn)
--   Bloco 3 -> conexao  proxypay_db  (ProxyPay)
--
-- ATENCAO: nao rode o arquivo inteiro numa unica conexao -- as tabelas de um
-- servico nao existem no banco do outro e o script falharia.
-- Cada bloco esta em transacao: em caso de erro, faca ROLLBACK.
-- ===========================================================================


-- ===========================================================================
-- BLOCO 1 -- NAuth  (rodar na conexao: emagine_db)
-- Apaga todos os usuarios e seus dependentes, EXCETO user_id = 1.
-- O catalogo 'roles' (definicoes) NAO e apagado.
-- Para preservar outro id, troque o 1 nos 5 comandos abaixo.
-- ===========================================================================
BEGIN;

DELETE FROM user_roles      WHERE user_id <> 1;
DELETE FROM user_addresses  WHERE user_id <> 1;
DELETE FROM user_phones     WHERE user_id <> 1;
DELETE FROM user_documents  WHERE user_id <> 1;
DELETE FROM users           WHERE user_id <> 1;

COMMIT;


-- ===========================================================================
-- BLOCO 2 -- Lofn  (rodar na conexao: lofn_db)
-- TRUNCATE de todas as tabelas lofn_*.
-- ===========================================================================
BEGIN;

TRUNCATE TABLE
    lofn_product_filter_values,
    lofn_product_images,
    lofn_products,
    lofn_categories,
    lofn_product_type_customization_options,
    lofn_product_type_customization_groups,
    lofn_product_type_filter_allowed_values,
    lofn_product_type_filters,
    lofn_product_types,
    lofn_store_users,
    lofn_stores
RESTART IDENTITY CASCADE;

COMMIT;


-- ===========================================================================
-- BLOCO 3 -- ProxyPay  (rodar na conexao: proxypay_db)
-- TRUNCATE de todas as tabelas proxypay_*.
-- ===========================================================================
BEGIN;

TRUNCATE TABLE
    proxypay_billing_items,
    proxypay_billings,
    proxypay_invoice_items,
    proxypay_invoices,
    proxypay_transactions,
    proxypay_customers,
    proxypay_stores
RESTART IDENTITY CASCADE;

COMMIT;

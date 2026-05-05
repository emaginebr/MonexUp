# Quickstart: Billing Migration to ProxyPay

End-to-end runbook for an operator/developer to verify the new flow on a fresh dev environment.

## Prerequisites

- PostgreSQL up (docker compose).
- ProxyPay API reachable at `ProxyPay:ApiUrl` (default `https://proxypay.online/api`).
- Lofn API reachable (still used for product reads).
- NAuth API reachable.
- Bearer token for a test user with `IsAdmin = true`.
- `MonexUp.API` configured with `appsettings.Development.json` containing valid `ProxyPay:*`, `NAuth:*`, `Lofn:*`.

## 1. Apply the migration

```bash
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API
```

OR run manually:

```bash
psql -h localhost -U monexup_user -d monexup_db -f scripts/billing_migration_to_proxypay.sql
```

Verify:

```sql
\d monexup_networks   -- should now show proxypay_store_id, proxypay_client_id
\d monexup_invoice_fees   -- should show proxypay_invoice_id, reversed_at, paid_amount_cents_at_record (no invoice_id)
SELECT to_regclass('public.monexup_invoices');     -- expect NULL
SELECT to_regclass('public.monexup_subscriptions'); -- expect NULL
```

## 2. Start MonexUp

```bash
docker compose up -d --build monexup-api
docker compose logs -f monexup-api
```

API listens on `http://localhost:5000`.

## 3. Create a test network

```bash
TOKEN=<bearer-token>
curl -X POST http://localhost:5000/network/insert \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: monexup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Quickstart Net","email":"qs@example.com","commission":10,"plan":1}'
```

Capture `networkId` from response.

## 4. Provision the ProxyPay store

```bash
curl -X POST http://localhost:5000/Billing/ensure-store \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: monexup" \
  -H "Content-Type: application/json" \
  -d "{\"networkId\": $NETWORK_ID}"
```

Expected response includes `proxypayStoreId` and `proxypayClientId`. DB check:

```sql
SELECT network_id, proxypay_store_id, proxypay_client_id FROM monexup_networks WHERE network_id = <NETWORK_ID>;
```

Re-run the same curl — should return the SAME store id (idempotent).

## 5. Create a Billing from the frontend

In a browser:
1. `cd monexup-app && npm start`.
2. Login as the test user.
3. Pick the "Quickstart Net" network in the network selector.
4. Open `/billing/new`.
5. Fill recipient email + items (`description`, `quantity`, `unitPrice`).
6. Pick frequency = Monthly.
7. Click "Create Billing".
8. Browser is redirected to `https://proxypay.online/pay/...`.

Verify on ProxyPay side:

```sql
-- on ProxyPay DB
SELECT billing_id, store_id, frequency, status FROM proxypay_billings ORDER BY created_at DESC LIMIT 1;
SELECT invoice_id, store_id, status FROM proxypay_invoices ORDER BY created_at DESC LIMIT 1;
```

The `store_id` of both rows MUST equal `monexup_networks.proxypay_store_id`.

## 6. Simulate payment

ProxyPay has a sandbox simulate endpoint:

```bash
curl -X POST {ProxyPayApiUrl}/Payment/simulate-payment/<INVOICE_ID> \
  -H "X-Tenant-Id: monexup"
```

Returns 200 + `paidAt`. Status on ProxyPay side moves to `Paid`.

## 7. Trigger the completion callback

The browser would normally hit:
```
GET https://localhost:5000/Billing/payment-completed?n=<NETWORK_ID>&i=<INVOICE_ID>&s=<HMAC>
```

Manual call (signature computation example below):

```bash
SECRET=$(grep WebhookCallbackSecret MonexUp.API/appsettings.Development.json | cut -d'"' -f4)
PAYLOAD="${NETWORK_ID}|${INVOICE_ID}"
SIG=$(printf "%s" "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

curl -X POST http://localhost:5000/Billing/payment-completed \
  -H "Content-Type: application/json" \
  -d "{\"networkId\": $NETWORK_ID, \"proxypayInvoiceId\": $INVOICE_ID, \"signature\": \"$SIG\"}"
```

Expected: 200 + `"sucesso": true`.

## 8. Verify commission rows

```sql
SELECT fee_id, network_id, user_id, amount, paid_amount_cents_at_record, reversed_at, proxypay_invoice_id
FROM monexup_invoice_fees
WHERE proxypay_invoice_id = <INVOICE_ID>;
```

Expected: 1+ rows (one per beneficiary in the referrer chain), all with `reversed_at IS NULL`.

Re-run the callback — same SQL should still show the same rows (idempotent, no duplicates).

## 9. Verify partial-refund handling

(Manual on ProxyPay; depends on AbacatePay refund ergonomics.) After a partial refund event, expect:
- Original fee row: still active (`reversed_at IS NULL`).
- New fee row: `amount < 0`, `reversed_at = now()`, mirrors the proportion `refundedAmount / paidAmount`.

## 10. Run the reconciliation poller manually

```bash
docker compose run --rm monexup-bg dotnet MonexUp.BackgroundService.dll --once
```

(or trigger via the existing scheduling service)

Logs should show "ProxyPayReconciliationSchedule: scanned X pending invoices, settled Y".

## 11. Verify legacy endpoints are gone (after US3 cleanup)

```bash
curl -i http://localhost:5000/Invoice/listAll  # expect 404
curl -i http://localhost:5000/Subscription/list # expect 404
```

Solution build:
```bash
dotnet build MonexUp.sln
dotnet test MonexUp.Tests
dotnet test MonexUp.ApiTests
```

All green, no references to deleted classes.

## Smoke-test checklist (US-mapped)

| US | Step in this guide | Pass criterion |
|----|--------------------|----------------|
| US1 | §3 + §4 + §5 | Billing created in ProxyPay; `monexup_networks` has store id; idempotent re-run of `ensure-store` |
| US2 | §6 + §7 + §8 | Commission rows present after paid event; idempotent under retry |
| US3 | §11 | Build green; legacy endpoints 404; legacy tables absent |

## Rollback

If the new flow misbehaves in production:

1. Stop traffic to `/Billing/*`.
2. Re-deploy previous container image (legacy `Invoice`/`Subscription` controllers still active).
3. The migration is one-way: `monexup_invoices` and `monexup_subscriptions` are dropped, **not** restored. Restoration requires a DB snapshot from before the migration. Schedule the migration only after verifying a fresh snapshot exists (operator gate, NOT in the script).

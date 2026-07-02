# Quickstart: Backend ProxyPay proxy and order lifecycle

## What this feature does
Every PIX purchase is recorded as a MonexUp order **before** the charge is created, and the order flips `Incoming → Active` when paid. The browser talks only to MonexUp; ProxyPay is reached server-side.

## Prerequisites
- Backend running: `dotnet run --project MonexUp.API/MonexUp.API.csproj`
- BackgroundService running (for the reconciliation backstop): `dotnet run --project MonexUp.BackgroundService/MonexUp.BackgroundService.csproj`
- Frontend: `cd monexup-app && npm start`
- `ProxyPaySetting` (ApiUrl, TenantId) configured in appsettings; a network with a provisioned ProxyPay store.

## Happy path (foreground)
1. Log in as a buyer; open a storefront or vendor product page for a network with a ProxyPay store.
2. Start a PIX purchase (fill CPF).
3. **Verify order-before-charge**: right after the QR appears, query
   ```sql
   SELECT order_id, status, proxypay_invoice_id, created_at
   FROM monexup_orders ORDER BY order_id DESC LIMIT 5;
   ```
   → a new `Incoming` (status=1) row exists with `proxypay_invoice_id` set. (SC-001)
4. Pay the PIX (or use the dev simulate). The open modal polls `GET /Order/checkPixStatus/{invoiceId}` on MonexUp.
5. **Verify paid transition**: within ~60s the same order shows `status=2` (`Active`). (SC-002)

## Backstop path (browser closed)
1. Repeat steps 1–3, then **close the browser tab** before paying.
2. Pay the PIX charge.
3. Wait for the reconciliation cycle; the order still flips to `Active`. (SC-003)

## Single-gateway check
- With the DevTools Network tab open through a full checkout + AbacatePay-key configuration, confirm **zero** requests to `proxypay.online` / the ProxyPay host — every call targets the MonexUp API. (SC-004)

## Idempotency check
- Call `GET /Order/checkPixStatus/{invoiceId}` several times after payment. The order stays `Active`; no duplicate settlement/fee entries. (SC-005)

## AbacatePay key (admin)
- In `/admin/network`, set the AbacatePay key. The request goes to `PUT /Network/{id}/abacatepay-apikey` on MonexUp (not ProxyPay). The indicator (`GET .../abacatepay-apikey/status`) shows "Configurada". The value is never returned.

## Acceptance mapping
| Check | Requirement / Criterion |
|-------|--------------------------|
| Order exists before charge | FR-001/002, US1, SC-001 |
| Reuse pending order on retry | FR-004, US1 |
| Paid → Active | FR-006, US2, SC-002 |
| Browser-closed still paid | FR-008, US2, SC-003 |
| No direct provider calls | FR-001/009/010, US3, SC-004 |
| Idempotent re-check | FR-007, SC-005 |

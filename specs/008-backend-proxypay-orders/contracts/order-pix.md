# Contract: Order PIX endpoints (MonexUp API)

All endpoints require NAuth bearer auth. The browser calls **only** these; MonexUp relays to ProxyPay server-side. Portuguese response field names follow the existing DTO convention (`sucesso`, `mensagem`).

## POST /Order/createPixPayment  (exists — storefront must adopt it)

Creates/reuses a MonexUp order (`Incoming`) **before** generating the PIX charge, then returns the QR.

**Request**
```json
{
  "networkSlug": "string|null",
  "productSlug": "string",
  "sellerSlug": "string|null",
  "documentId": "string (CPF, required)",
  "cellphone": "string|null",
  "amount": "number|null   // required only for open-amount donations"
}
```

**Response 200**
```json
{
  "sucesso": true,
  "order": { "orderId": 0, "status": 1, "...": "OrderInfo" },
  "qrCode": {
    "invoiceId": 0,
    "brCode": "string",
    "brCodeBase64": "string",
    "expiredAt": "datetime|null"
  }
}
```

**Response 400** — `{ "sucesso": false, "mensagem": "Network not found | CPF é obrigatório | Produto não encontrado | ..." }`

**Guarantees (FR-001, FR-002, FR-004, FR-011)**
- An order exists (linked via `qrCode.invoiceId` → `order.proxyPayInvoiceId`) whenever `sucesso=true`.
- Re-invoking for the same still-`Incoming` (product, user, seller) reuses the existing order.
- On any pre-charge validation failure, returns a reason and leaves no orphan order/charge.

## GET /Order/checkPixStatus/{proxyPayInvoiceId}  (exists — MUST now update the order)

Proxies the provider status check **and** advances the matched order to `Active` when paid.

**Response 200**
```json
{ "sucesso": true, "status": "PAID|PENDING|EXPIRED|...", "paid": true, "expiresAt": "datetime|null" }
```

**Side effects (FR-005, FR-006, FR-007)**
- Resolve order via `ProxyPayInvoiceId`. If `paid` and order is `Incoming` → set `Active`.
- If order already `Active` → no state change (idempotent), still returns `paid: true`.
- If not paid → no state change.
- Unknown invoice / no matching order → `sucesso: true` with provider status, but log a warning (charge without order = reconciliation candidate, FR-012).

## Background reconciliation (no HTTP contract — BillingReconciliationService)

**Behavior (FR-008 path b, FR-012, SC-003)**
- Periodically lists pending invoices per store; for each paid invoice, resolve the order via `ProxyPayInvoiceId` and apply the same `Incoming → Active` transition (idempotent).
- Emits a log/metric for paid charges with no matching MonexUp order.

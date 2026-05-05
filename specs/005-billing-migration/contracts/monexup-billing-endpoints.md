# Contract: MonexUp Billing Endpoints (NEW)

These are the only HTTP endpoints MonexUp exposes for the new billing flow. All other billing/invoice operations happen frontend → ProxyPay directly (see `proxypay-endpoints-used.md`).

Base path: `/Billing` (route attribute `[Route("[controller]")]`).

---

## 1. `POST /Billing/ensure-store`

Lazy-provision the ProxyPay store for a network. Idempotent (concurrent first-callers converge to one store).

### Authorization
`[Authorize]`. Caller MUST be `NetworkManager` or `Administrator` of `networkId`.

### Request

```json
{
  "networkId": 42
}
```

### Response — 200 OK

```json
{
  "sucesso": true,
  "data": {
    "proxypayStoreId": 12345,
    "proxypayClientId": "abc123def456..."
  }
}
```

### Response — 503 Service Unavailable

ProxyPay unreachable. `proxypay_store_id` left NULL. Caller may retry.

### Behavior

1. Verify caller authorization.
2. Read `monexup_networks.proxypay_store_id`. If non-NULL, return existing values (200, fast path).
3. Else: `POST {ProxyPay:ApiURL}/Store/insert` with NAuth bearer + body `{ name, email }` derived from network row.
4. Read response `StoreInfo { storeId, clientId, ... }`.
5. Atomic UPDATE `monexup_networks SET proxypay_store_id = ?, proxypay_client_id = ? WHERE network_id = ? AND proxypay_store_id IS NULL`. If `rows == 0` (race lost), re-read and return the winner's values.
6. Return 200 with the stored values.

---

## 2. `GET /Billing/list?networkId={id}`

Passthrough listing of billings for a network. Composes ProxyPay data + MonexUp user mapping.

### Authorization
`[Authorize]`. Caller MUST be `User`, `Seller`, `NetworkManager`, or `Administrator` of `networkId`.

### Query
- `networkId` (required) — `long`
- `pageNum` (optional, default 1)
- `pageSize` (optional, default 20)

### Response — 200 OK

```json
{
  "sucesso": true,
  "data": {
    "items": [
      {
        "proxypayBillingId": 9001,
        "customerName": "...",
        "customerUserId": 102,
        "referrerUserId": 50,
        "frequency": 1,
        "nextChargeDate": "2026-06-04T00:00:00Z",
        "status": 1,
        "latestInvoiceStatus": 1
      }
    ],
    "pageNum": 1,
    "pageSize": 20,
    "totalCount": 12
  }
}
```

### Behavior

1. Authorize caller against `networkId`.
2. Read `proxypay_store_id`/`proxypay_client_id` from network. If NULL → return empty list.
3. Call ProxyPay's billing-listing endpoint (TBD — ProxyPay currently only supports GraphQL queries; if no list endpoint exists at plan execution time, this gets implemented as a GraphQL query against `ProxyPay.GraphQL`).
4. For each item, look up `customerUserId` via NAuth user-by-email and `referrerUserId` via `monexup_user_networks`.
5. Return composed list.

---

## 3. `GET /Billing/invoice/{proxypayInvoiceId}`

Single-invoice detail passthrough.

### Authorization
`[Authorize]`. Caller MUST be a member of the network that owns the invoice (computed from `proxypay_store_id`).

### Response — 200 OK

```json
{
  "sucesso": true,
  "data": {
    "proxypayInvoiceId": 9015,
    "status": 2,
    "amount": 99.90,
    "paidAt": "2026-05-04T13:22:11Z",
    "url": "https://proxypay.online/pay/abc..."
  }
}
```

### Behavior

1. Call ProxyPay to fetch invoice.
2. Verify `invoice.storeId == userNetwork.proxypay_store_id` for caller's network membership.
3. Return mapped DTO.

---

## 4. `POST /Billing/payment-completed`

Anonymous + HMAC-protected callback. Hit by the customer's browser after ProxyPay-hosted payment success redirect.

### Authorization

Anonymous endpoint. Body MUST contain a valid HMAC-SHA256 signature of `${networkId}|${proxypayInvoiceId}` keyed by `ProxyPay:WebhookCallbackSecret` (from `IConfiguration`). Wrong signature → 401.

### Request

```json
{
  "networkId": 42,
  "proxypayInvoiceId": 9015,
  "signature": "base64-hmac"
}
```

### Response — 200 OK

```json
{
  "sucesso": true,
  "mensagemSucesso": "Commission recorded."
}
```

(Or `"Already recorded."` for idempotent duplicate.)

### Behavior

1. Validate HMAC.
2. Read `monexup_networks.proxypay_store_id` for `networkId`.
3. Call ProxyPay to fetch invoice; verify `invoice.storeId == network.proxypay_store_id` (cross-tenant safety, FR-016).
4. Verify `invoice.status == Paid`. If not (e.g., the customer hit completion URL but payment hadn't actually settled), return 200 + flag for poller to handle (no fee row yet).
5. Compute referrer chain from `monexup_user_networks`.
6. INSERT fee row(s) into `monexup_invoice_fees` with `proxypay_invoice_id`, `paid_amount_cents_at_record`, idempotent by UNIQUE constraint.
7. Return 200.

**Note**: This same write path is also called by `BillingReconciliationService` (background poller) for the long-tail case where the customer never returned to MonexUp.

---

## 5. Removed endpoints (US3)

The following endpoints from the legacy flow are deleted in the cleanup phase:

- `POST /Invoice/insert`
- `POST /Invoice/update`
- `GET /Invoice/getById/{id}`
- `POST /Invoice/search`
- `GET /Invoice/listByUser`
- `POST /Subscription/insert`
- `POST /Subscription/update`
- `GET /Subscription/getById/{id}`
- `POST /Subscription/search`
- All `POST /Order/*` paths that wrote to `monexup_invoices` indirectly via `OrderService`/`ProxyPayService.GenerateInvoice`.

The Bruno collection's `Invoice/` and `Subscription/` directories are removed.

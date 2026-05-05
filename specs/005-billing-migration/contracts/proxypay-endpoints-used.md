# Contract: ProxyPay Endpoints Consumed by MonexUp

Read-only reference. ProxyPay project at `C:\repos\ProxyPay\ProxyPay` is the source of truth — these contracts MUST NOT be modified in MonexUp's code; the table here just enumerates everything MonexUp depends on so changes upstream surface as build/test failures here.

Base URL: `IConfiguration["Lofn:ApiURL"]` is **wrong** here — billing uses `IConfiguration["ProxyPay:ApiUrl"]`. Existing config key already wired into `appsettings.{Env}.json` (`ProxyPay:ApiUrl`, `ProxyPay:ClientId`, `ProxyPay:TenantId`).

Common headers: `X-Tenant-Id: monexup` on every request (FR-021).

---

## 1. `POST {ProxyPayApiUrl}/Store/insert`

**Auth**: NAuth bearer required (this is the only authenticated ProxyPay endpoint MonexUp consumes; called server-side, not from browser).

**Request body**:
```json
{ "name": "Network display name" }
```

**Response 200** (`StoreInfo`):
```json
{
  "storeId": 12345,
  "slug": "network-display-name",
  "name": "Network display name",
  "ownerId": 87,
  "logo": null,
  "logoUrl": null,
  "status": 1,
  "clientId": "abc123def456..."
}
```
*(NOTE: the `clientId` field is read from this response. Verified in `ProxyPay.Domain.Mappers.StoreMapper.ToInfo` at plan execution.)*

**Used by**: `BillingController.EnsureStore` (only).

---

## 2. `POST {ProxyPayApiUrl}/Payment/billing`

**Auth**: ANONYMOUS. Body carries `clientId`.

**Request body** (`BillingRequest`):
```json
{
  "clientId": "abc123def456...",
  "frequency": 1,
  "paymentMethod": 1,
  "billingStartDate": "2026-06-04T00:00:00Z",
  "completionUrl": "https://monexup.example/Billing/payment-completed?n=42&i={INVOICE_ID}&s=BASE64_HMAC",
  "returnUrl": "https://monexup.example/billing/cancelled",
  "customer": {
    "name": "...",
    "email": "...",
    "documentId": "12345678901",
    "cellphone": "..."
  },
  "items": [
    { "description": "...", "quantity": 1, "unitPrice": 99.90, "discount": 0 }
  ]
}
```

**Response 200** (`BillingResponse`):
```json
{
  "billingId": 9001,
  "invoiceId": 9015,
  "invoiceNumber": "INV-2026-0001",
  "url": "https://proxypay.online/pay/abc..."
}
```

**Caller**: `proxypay-react` `<BillingPayment>` component in the browser. NOT called server-side.

---

## 3. `POST {ProxyPayApiUrl}/Payment/invoice`

**Auth**: ANONYMOUS. Body carries `clientId`.

**Request body** (`InvoiceRequest`):
```json
{
  "clientId": "...",
  "customer": { ... },
  "paymentMethod": 1,
  "completionUrl": "...",
  "returnUrl": "...",
  "notes": "...",
  "discount": 0,
  "dueDate": "2026-06-04T00:00:00Z",
  "items": [ ... ]
}
```

**Response 200** (`InvoiceResponse`):
```json
{
  "invoiceId": 9015,
  "invoiceNumber": "INV-2026-0001",
  "url": "https://proxypay.online/pay/abc..."
}
```

**Caller**: `proxypay-react` `<InvoicePayment>` (one-off charges that replace the legacy MonexUp PIX flow).

---

## 4. `POST {ProxyPayApiUrl}/Payment/qrcode`

**Auth**: ANONYMOUS. Body carries `clientId`.

**Used by**: `proxypay-react` `<PixPayment>` for inline PIX QR Code (instead of redirecting to a hosted page).

Request/response shapes per existing `proxypay-react` types — already wired into MonexUp's checkout today (PIX QR Code generation has been the integration since before this feature).

---

## 5. `GET {ProxyPayApiUrl}/Payment/qrcode/status/{invoiceId}`

**Auth**: ANONYMOUS.

**Response 200** (`QRCodeStatusResponse`): includes `status` (Pending / Paid / Expired) and `paidAt`.

**Caller**: 
- `proxypay-react` `<PixPayment>` polls this every few seconds while the QR is shown.
- `BillingReconciliationService` calls it for invoices in non-terminal status.

---

## 6. ProxyPay listing/search (GraphQL)

ProxyPay exposes a GraphQL surface (`ProxyPay.GraphQL` project, `/graphql` endpoint). MonexUp uses it from `BillingController.List` to fetch billings and invoices filtered by `storeId`. Specific queries:

```graphql
query BillingsByStore($storeId: Long!, $skip: Int, $take: Int) {
  billings(where: { storeId: { eq: $storeId } }, skip: $skip, take: $take) {
    items {
      billingId
      customerId
      frequency
      billingStartDate
      status
      customer { name email }
      items { description quantity unitPrice }
    }
    totalCount
  }
}

query InvoicesByStore($storeId: Long!, $statusIn: [Int!], $skip: Int, $take: Int) {
  invoices(where: { storeId: { eq: $storeId }, status: { in: $statusIn } }, skip: $skip, take: $take) {
    items {
      invoiceId
      status
      paidAt
      dueDate
      items { total }
    }
  }
}
```

The exact query field names will be confirmed against `ProxyPay.GraphQL` schema during implementation. If GraphQL is not adequate for MonexUp's needs, a thin REST listing endpoint may be requested as a follow-up to the ProxyPay project (out of scope for this feature).

---

## 7. Webhook (NOT used)

ProxyPay's `WebhookController.AbacatePayWebhook` (`POST /Webhook/abacatepay`) is for **inbound** webhooks from AbacatePay → ProxyPay. ProxyPay does NOT publish webhooks downstream to its consumers (see `research.md` R1). MonexUp does not subscribe.

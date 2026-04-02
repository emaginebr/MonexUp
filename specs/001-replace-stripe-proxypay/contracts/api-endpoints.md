# API Contracts: Substituir Stripe pelo ProxyPay

**Date**: 2026-04-02

## Endpoints Modified

### OrderController

#### `POST /Order/createPixPayment/{productSlug}` (NEW — replaces createSubscription)

**Authorization**: Required

**Query Parameters**:
- `networkSlug` (string, optional) — slug da rede
- `sellerSlug` (string, optional) — slug do representante

**Request Body**:
```json
{
  "documentId": "12345678900"
}
```

**Response** (200 OK):
```json
{
  "sucesso": true,
  "mensagem": "",
  "order": {
    "orderId": 1,
    "status": 1
  },
  "qrCode": {
    "invoiceId": "abc-123",
    "brCode": "00020126...",
    "brCodeBase64": "data:image/png;base64,...",
    "expiredAt": "2026-04-02T15:30:00Z"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "sucesso": false,
  "mensagem": "CPF inválido"
}
```

**Flow**:
1. Validates CPF format
2. Gets product by slug (via Lofn)
3. Gets authenticated user
4. Gets optional network/seller
5. Creates or reuses Order with status Incoming
6. Creates Invoice with status Draft
7. Calls ProxyPay `POST /payment/qrcode` with customer + items
8. Returns QR Code data to frontend

---

#### `GET /Order/checkPixStatus/{proxyPayInvoiceId}` (NEW)

**Authorization**: Required

**Response** (200 OK):
```json
{
  "sucesso": true,
  "status": "PAID",
  "paid": true
}
```

**Flow**:
1. Calls ProxyPay `GET /payment/qrcode/status/{invoiceId}`
2. If paid: updates Invoice to Paid, calculates fees, updates Order to Active
3. Returns status to frontend

---

#### `GET /Order/createSubscription/{productSlug}` (REMOVED)

Endpoint removed. Was used for Stripe checkout session creation.

---

### InvoiceController

#### `GET /Invoice/syncronize` (MODIFIED)

**Authorization**: Required

**Response**: Same as before (200 OK)

**Flow changed**:
- Before: Fetched all invoices from Stripe API
- After: Iterates pending invoices in DB, calls ProxyPay `GET /payment/qrcode/status/{invoiceId}` for each, updates status if changed

Note: Invoices without a ProxyPay reference (legacy Stripe invoices) are skipped during sync.

---

#### `GET /Invoice/checkout/{checkoutSessionId}` (REMOVED)

Endpoint removed. Was used for Stripe checkout callback.

---

## Endpoints Unchanged

All other endpoints in NetworkController, ProfileController, ImageController remain unchanged.

## Backend Service Changes

### IProxyPayService (NEW — replaces IStripeService)

```
CreateQRCode(user, product, network?, seller?, documentId) → QRCodeResponse
CheckQRCodeStatus(proxyPayInvoiceId) → QRCodeStatusResponse
SyncPendingInvoices() → void
```

### IStripeService (REMOVED)

All methods removed: CreateSubscription, CreateInvoice, Checkout, ListInvoices.

### SubscriptionService (MODIFIED)

Method `CreateSubscription` replaced with `CreatePixPayment` that uses IProxyPayService instead of IStripeService.

### InvoiceService (MODIFIED)

- Method `Synchronize()` updated to use IProxyPayService.SyncPendingInvoices()
- Method `Checkout()` removed
- Method `ProcessInvoice()` adapted for ProxyPay status updates
- Fee calculation logic unchanged

## Frontend API Calls (OrderService)

### Modified Methods

```typescript
// BEFORE
createSubscription(productSlug, token) → GET /Order/createSubscription/{productSlug}

// AFTER
createPixPayment(productSlug, documentId, networkSlug?, sellerSlug?, token) → POST /Order/createPixPayment/{productSlug}
checkPixStatus(proxyPayInvoiceId, token) → GET /Order/checkPixStatus/{proxyPayInvoiceId}
```

### Removed Methods

```typescript
createInvoice(productSlug, token) // Removed — Stripe-specific
```

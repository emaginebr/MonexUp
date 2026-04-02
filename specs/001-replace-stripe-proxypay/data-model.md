# Data Model: Substituir Stripe pelo ProxyPay

**Date**: 2026-04-02
**Feature**: 001-replace-stripe-proxypay

## Entities Modified

### Invoice (existing — columns removed)

| Field | Change | Notes |
|-------|--------|-------|
| StripeId | **REMOVED** | Migration drop column `stripe_id` |

Status mapping remains: Pending (Draft=1), Open=2, Paid=3, Cancelled=4, Expired (Lost=5)

No new fields added. ProxyPay invoice IDs are transient (used only during QR Code polling).

### Order (existing — columns removed)

| Field | Change | Notes |
|-------|--------|-------|
| StripeId | **REMOVED** | Migration drop column `stripe_id` |

Status flow remains: Incoming=1 → Active=2 → Suspended=3/Finished=4/Expired=5

### Product (existing — columns removed, managed by Lofn)

| Field | Change | Notes |
|-------|--------|-------|
| StripeProductId | **REMOVED** | Migration drop column `stripe_product_id` |
| StripePriceId | **REMOVED** | Migration drop column `stripe_price_id` |

Note: Products are managed by the Lofn API. These fields were Stripe-specific and have no equivalent in ProxyPay.

## Entities Unchanged

### InvoiceFee
No changes. Commission calculation logic remains the same — triggered when an Invoice transitions to Paid status.

### Network
No changes. Commission percentage and withdrawal settings are unaffected.

### UserNetwork
No changes.

### UserProfile
No changes. Profile commission percentages remain the same.

## State Transitions

### Payment Flow (PIX)

```
Order: (new) → Incoming → Active (on payment confirmed)
Invoice: (new) → Draft → Paid (on PIX polling success or sync)
                       → Expired (on QR Code expiration without payment)
                       → Cancelled (on manual cancellation)
```

### Sync Flow

```
Invoice: Draft/Open → Paid (if ProxyPay reports paid)
                    → Expired (if ProxyPay reports expired)
                    → (no change if still pending)
```

## Migration Required

**Migration name**: `RemoveStripeFields`

```
DROP COLUMN invoices.stripe_id
DROP COLUMN orders.stripe_id
DROP COLUMN products.stripe_product_id (if exists in MonexUp DB — may be Lofn-only)
DROP COLUMN products.stripe_price_id (if exists in MonexUp DB — may be Lofn-only)
```

Note: Product fields may only exist in the Lofn database. Verify before generating migration. If product is Lofn-managed and these columns don't exist in MonexUpContext, skip product columns.

## No New Entities

This feature does not create new database entities. All payment processing is delegated to the ProxyPay external service.

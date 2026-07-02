# Phase 1 Data Model: Backend ProxyPay proxy and order lifecycle

No new tables or columns. This feature exercises existing entities. Documented here for state-transition clarity.

## Order (`monexup_orders`)

| Field | Type | Notes |
|-------|------|-------|
| OrderId | long (PK) | `order_id` |
| NetworkId | long (FK → monexup_networks) | required |
| UserId | long | buyer (NAuth user) |
| SellerId | long? | optional vendor |
| ProxyPayInvoiceId | long? | `proxypay_invoice_id`; links order ↔ provider charge (indexed) |
| Status | int → `OrderStatusEnum` | default 1 (`Incoming`) |
| CreatedAt / UpdatedAt | timestamp | |

**Relationships**: 1 Order → N OrderItems; Order → Network (FK).

### State transitions (this feature)

```
Incoming (1) ──payment confirmed──▶ Active (2)      [paid]
Incoming (1) ──charge expired─────▶ Expired (5)     [unpaid, provider says expired]  (optional, reconciliation)
Active (2)   ──(any re-check)─────▶ Active (2)      [no-op, idempotent]
```

**Rules**
- Transition to `Active` occurs **only** from `Incoming` and **only** when the provider reports the charge as paid.
- A re-check on an already-`Active` order is a no-op (FR-007, SC-005). No second settlement side effect.
- The order-to-charge match is always via `ProxyPayInvoiceId` (use `OrderRepository.GetByProxyPayInvoiceId`).
- `Active` transition is applied identically by (a) the foreground status endpoint and (b) background reconciliation.

## Order Item (`monexup_order_items`)

| Field | Type | Notes |
|-------|------|-------|
| ItemId | long (PK) | |
| OrderId | long (FK) | |
| ProductId | long | Lofn product id |
| Quantity | int | default 1 |
| Amount | numeric | effective unit amount for the purchase |

No changes; listed for completeness (order is created with one item at checkout).

## Payment Charge (external — ProxyPay, not persisted in MonexUp)

Represented in MonexUp only by `Order.ProxyPayInvoiceId`. Provider owns amount, BR code, paid/expired status. Read via `IProxyPayClient.GetInvoiceAsync` / `IProxyPayAppService.CheckQRCodeStatusAsync`.

## Network Payment Configuration (`monexup_networks` columns, existing)

| Field | Notes |
|-------|-------|
| ProxyPayStoreId | `proxypay_store_id` — provisioned lazily |
| ProxyPayClientId | `proxypay_client_id` |
| AbacatePay API key | **stored in ProxyPay, not in MonexUp** — write-only; MonexUp exposes a set + a `hasKey` indicator, relayed to the provider |

No MonexUp schema change for the AbacatePay key (it lives in ProxyPay's store record).

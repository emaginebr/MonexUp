# Feature Specification: Backend ProxyPay proxy and order lifecycle

**Feature Branch**: `008-backend-proxypay-orders`
**Created**: 2026-07-01
**Status**: Draft
**Input**: User description: "Atualmente o frontend do monexup está acessando a API do monexup e do proxypay. Preciso que os metodos usados no proxypay seja recriados no monexup. Atualmente o sistema está criando uma invoice no proxypay, sem criar a order no monexup. E quando o pagamento é efetuado no proxypay pelo /api/payment/qrcode/status/<invoice-id> e monexup não atualiza o status da order"

## Context & Problem

Today the storefront/checkout experience talks to two payment backends at once: the MonexUp API and the ProxyPay API. Part of the purchase flow goes through MonexUp (which records an order), but the storefront PIX flow generates the charge **directly against ProxyPay from the browser** and then **checks the payment status directly against ProxyPay** as well. As a result:

1. A payment charge (invoice) can exist in ProxyPay with **no corresponding order** recorded in MonexUp.
2. When the buyer pays, the browser sees the "paid" status straight from ProxyPay and moves on — MonexUp is never told, so the order (when one exists) **stays in its initial state forever**.

This breaks order tracking, commission/settlement, and any manager-facing reporting, because MonexUp's records do not reflect what actually happened in the payment provider.

The goal is to make MonexUp the **single source of truth and single point of contact** for the payment provider: the browser only ever talks to MonexUp, every payment charge is backed by a MonexUp order, and payment confirmation is reflected on the order.

## Clarifications

### Session 2026-07-01

- Q: Which order lifecycle state represents "paid"? → A: `Active` (2) — reuse the existing enum (`Incoming`→`Active` on payment), no new state / no migration.
- Q: Primary mechanism to detect payment? → A: Browser polls a MonexUp status endpoint that queries the provider and updates the order; background reconciliation is the backstop for the browser-closed case.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every PIX charge is backed by a MonexUp order (Priority: P1)

A buyer opens a product/storefront page and starts a PIX purchase. The moment a payment charge is generated, MonexUp already holds an order for that purchase, tied to the buyer, the network, the seller (when present), the product, and the amount.

**Why this priority**: Without this, MonexUp has orphan charges it cannot see, reconcile, or report on. This is the root of the reported bug and the foundation every other outcome depends on.

**Independent Test**: Start a PIX purchase from every checkout entry point (storefront and vendor page). Confirm that immediately after the QR code appears, exactly one order exists in MonexUp for that purchase, linked to the payment charge identifier, with no charge left without an order.

**Acceptance Scenarios**:

1. **Given** a buyer on the storefront PIX flow, **When** the QR code is generated, **Then** a MonexUp order exists for that buyer/product/network with the payment charge identifier attached.
2. **Given** a buyer on the vendor product page PIX flow, **When** the QR code is generated, **Then** a MonexUp order exists for that purchase with the payment charge identifier attached.
3. **Given** any PIX charge that exists in the payment provider, **When** MonexUp records are inspected, **Then** there is a matching order (no orphan charges).
4. **Given** a buyer who retries the same pending purchase, **When** a new QR is requested, **Then** the existing pending order is reused instead of creating duplicates.

---

### User Story 2 - Paid payment updates the order status (Priority: P1)

After the buyer pays the PIX charge, MonexUp's order for that purchase moves from "awaiting payment" to "paid", automatically, without anyone editing it by hand.

**Why this priority**: A paid purchase that MonexUp still shows as unpaid is functionally the same as a lost sale for reporting, commissions, and fulfillment. This is the second half of the reported bug.

**Independent Test**: Pay (or simulate paying) a PIX charge and confirm the corresponding MonexUp order transitions to the paid state within the expected window, and that a subsequent status check reports the order as paid.

**Acceptance Scenarios**:

1. **Given** an order in "awaiting payment" with a known charge, **When** the payment is confirmed at the provider, **Then** the MonexUp order transitions to the paid state.
2. **Given** an order that has already been marked paid, **When** the status is checked again, **Then** the order stays paid and is not double-processed.
3. **Given** a charge that is still unpaid, **When** the status is checked, **Then** the order remains in "awaiting payment".
4. **Given** a charge that expired without payment, **When** the status is checked, **Then** the order reflects the expired/unpaid outcome and is not marked paid.

---

### User Story 3 - Browser only talks to MonexUp (Priority: P2)

Every payment-provider capability the browser needs — generating the charge, checking payment status, and any store/payment configuration used from admin screens — is served by MonexUp endpoints. The browser no longer makes direct calls to the payment provider.

**Why this priority**: Centralizing the integration removes the split-brain that caused the bug, keeps provider credentials/tenant handling on the server, and lets MonexUp enforce the "order-before-charge" and "status-updates-order" rules for every path. It is P2 because Stories 1 and 2 deliver the core correctness even before the last direct calls are removed.

**Independent Test**: Inspect all outbound network traffic from the browser during checkout and admin payment configuration. Confirm no request goes to the payment provider directly — every call targets MonexUp.

**Acceptance Scenarios**:

1. **Given** a buyer completing a full PIX purchase, **When** browser traffic is inspected, **Then** no request is sent directly to the payment provider.
2. **Given** a network manager configuring payment settings in admin, **When** browser traffic is inspected, **Then** the configuration call targets MonexUp, which relays it to the provider.
3. **Given** a payment-provider capability previously called from the browser, **When** the feature is complete, **Then** an equivalent MonexUp-served capability exists for it.

---

### Edge Cases

- **Charge generation fails at the provider**: MonexUp must not leave a broken/half-created order that can never be paid; the buyer sees a clear failure and can retry.
- **Order exists but charge generation fails**: the order stays in "awaiting payment" and can be retried without creating duplicates.
- **Status is checked before payment / while pending**: order stays "awaiting payment"; repeated checks are safe.
- **Duplicate paid notifications**: paying the same charge is recorded once; the order is not advanced twice or double-counted for settlement.
- **Payment arrives after the buyer closed the browser**: the order still becomes paid without the buyer's browser being open (MonexUp does not depend solely on the browser to learn about payment).
- **Missing buyer data (e.g., CPF) or missing network/seller**: MonexUp rejects the purchase with a clear reason before any charge is generated, and no orphan order is left behind.
- **Charge exists in the provider with no order (legacy/pre-fix)**: reconciliation can still associate or flag it rather than silently ignoring it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The browser MUST obtain PIX charges exclusively through MonexUp; MonexUp MUST be the component that talks to the payment provider to generate the charge.
- **FR-002**: MonexUp MUST record an order for a purchase **before or atomically with** generating the payment charge, so that no charge can exist without a corresponding order.
- **FR-003**: Each order MUST store the payment charge identifier so the order and the provider charge can always be matched.
- **FR-004**: When a buyer retries a still-pending purchase for the same buyer/product/seller, MonexUp MUST reuse the existing pending order rather than create a duplicate.
- **FR-005**: MonexUp MUST expose a way for the browser to check the payment status of a charge, and that check MUST go through MonexUp (not the provider directly).
- **FR-006**: When a charge is confirmed paid, MonexUp MUST transition the associated order from `Incoming` (awaiting payment) to `Active`, which represents the paid state. No new lifecycle state is introduced.
- **FR-007**: Order status transitions MUST be idempotent — a charge already recorded as paid MUST NOT advance the order again or double-count it for settlement.
- **FR-008**: Payment detection MUST work through two complementary paths: (a) while the buyer is on the checkout, the browser polls a MonexUp status endpoint that queries the provider and updates the associated order; (b) a MonexUp background reconciliation process independently detects and applies payments so confirmation does not depend on the browser being open. Both paths MUST update the order through the same idempotent transition.
- **FR-009**: MonexUp MUST recreate, as MonexUp-served capabilities, every payment-provider method the frontend currently calls directly — at minimum: generate PIX charge/QR, check charge/payment status, and the payment/store configuration used by admin screens (including the AbacatePay API key setup).
- **FR-010**: MonexUp MUST keep payment-provider credentials, tenant identification, and endpoints on the server side; these MUST NOT be required by or exposed to the browser.
- **FR-011**: When a purchase cannot be completed (missing required buyer data, unresolved network/seller, or provider failure), MonexUp MUST return a clear reason and MUST NOT leave an orphan charge or an unusable order.
- **FR-012**: Reconciliation MUST be able to detect and surface charges that are paid at the provider but not yet reflected on their MonexUp order, so no confirmed payment is permanently lost.
- **FR-013**: The order's paid state MUST be visible to existing order listing/search/reporting so managers see accurate, up-to-date order status.

### Key Entities *(include if feature involves data)*

- **Order**: A buyer's purchase within a network. Holds buyer, network, optional seller, status (awaiting payment → paid, plus expired/cancelled outcomes), and the payment charge identifier. Central record that must exist for every charge.
- **Order Item**: The product(s) and amount within an order.
- **Payment Charge (Invoice/QR)**: The PIX charge created at the payment provider for an order; identified by a charge identifier that the order references.
- **Payment Status**: The provider's current state of a charge (pending, paid, expired), consumed by MonexUp to drive the order's status.
- **Network Payment Configuration**: Per-network payment-provider store settings (store identity and the AbacatePay API key) managed via admin, relayed through MonexUp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of PIX charges generated through the product/storefront/vendor flows have a matching MonexUp order (zero orphan charges) across a full test pass.
- **SC-002**: 100% of paid charges result in their MonexUp order showing the paid state within 60 seconds of payment confirmation.
- **SC-003**: A paid order remains correctly recorded even when the buyer closes the browser immediately after paying (verified by paying with no open checkout session).
- **SC-004**: During a complete checkout and admin payment-configuration session, zero browser requests go directly to the payment provider.
- **SC-005**: Re-checking the status of an already-paid charge never advances the order twice or duplicates settlement entries (idempotency verified over repeated checks).
- **SC-006**: Managers viewing order listings see the correct paid/unpaid status for every test purchase, with no manual correction needed.

## Assumptions

- The MonexUp backend already has an order/payment domain (orders, order items, PIX charge creation, and a reconciliation process) that this feature extends rather than replaces; the primary work is closing the gaps that let charges bypass order creation and let payments bypass status updates.
- The payment provider (ProxyPay) remains the system of record for the actual money movement; MonexUp mirrors charge status onto its own orders.
- The "paid" order state maps onto the existing order lifecycle: `Incoming` is the "awaiting payment" initial state and `Active` is the paid state (confirmed in clarifications).
- Existing per-network payment store provisioning and the AbacatePay API key configuration are in scope for being served through MonexUp (they are currently reachable from the browser).
- The dev-only "simulate payment" capability is a testing aid and is not a production requirement, but it must still flow through MonexUp if retained.
- Buyer authentication and the buyer-profile completion (e.g., CPF/phone) already handled by MonexUp continue to apply; this feature does not change who may purchase.

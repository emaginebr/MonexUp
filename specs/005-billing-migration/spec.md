# Feature Specification: Billing Migration to ProxyPay

**Feature Branch**: `005-billing-migration`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Alterar a parte de pagamentos para usar outro projeto: Use o projeto ProxyPay para gerenciar os invoices e subscriptions (mude para Billing, igual o proxyPay), a pasta dele se encontra em C:\repos\ProxyPay\ProxyPay. Use o ProxyPay para resolver a parte de invoices e subscriptions. Remova os arquivos relacionados com invoices e subscriptions que foram substituidos pelo ProxyPay."

## Clarifications

### Session 2026-05-04

- Q: Escopo do "Invoice" migrado — só recorrente, ou também PIX one-off (compra avulsa via OrderService)? → A: Migrar AMBOS. PIX one-off também passa a ser invoice no ProxyPay; `monexup_invoices` e `monexup_subscriptions` ambos eliminados.
- Q: Mecanismo de sincronização de status (webhook vs polling) → A: Adiada — decisão de planejamento.
- Q: Onde fica o estado de Billing/Invoice — link table local em MonexUp ou só em ProxyPay? → A: Apenas em ProxyPay. MonexUp NÃO mantém `BillingLink` nem `InvoiceLink`. Único elo local é `monexup_networks.proxypay_store_id` (1:1 lazy). Listagens por rede passam direto para ProxyPay filtrando por `storeId`. Commissions (`monexup_invoice_fees`) referenciam `proxypayInvoiceId` diretamente.
- Q: Cancelamento de Billing recorrente — política em MonexUp? → A: Resolvido inteiramente por ProxyPay. MonexUp encaminha o pedido de cancelamento ao endpoint correspondente do ProxyPay; comportamento (próximas invoices, invoices em aberto, reembolso) segue a política do ProxyPay, sem regras adicionais em MonexUp.
- Q: Reembolso parcial — comissão pro-rata, total, ou nunca? → A: Adiada — decisão de planejamento. Provavelmente alinhada à política de reembolso do ProxyPay; regra final será definida em `/speckit.plan` quando o contrato de webhook/eventos do ProxyPay estiver detalhado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Network Manager creates a recurring Billing through ProxyPay (Priority: P1)

A Network Manager wants to charge their members on a recurring schedule (monthly subscription, weekly fee, etc.). Today the recurrence rules and the resulting invoices are stored locally inside MonexUp under "Subscription" and "Invoice" entities. After this migration, the Network Manager continues to start the recurring charge from inside MonexUp, but the recurrence + future invoices are owned by the ProxyPay project (under the term "Billing"). MonexUp keeps a lightweight reference back to the ProxyPay billing so the manager can still see status, totals, and history inside the network's dashboard.

**Why this priority**: This is the entry point of the entire payment flow. Without this story, no recurring revenue can be captured. It also drives the foundational changes (rename "Subscription" → "Billing", lazy-provision the network's ProxyPay store, keep an idempotent local link) that every other story depends on.

**Independent Test**: Sign in as Network Manager → open the Billing area → start a new recurring billing for a member → ProxyPay returns a billingId → MonexUp displays the new billing in the network's billing list with status "Awaiting first payment". The flow can be exercised end-to-end without touching invoice viewing, customer self-service, or legacy data cleanup.

**Acceptance Scenarios**:

1. **Given** a network with no prior ProxyPay store, **When** a Network Manager creates the first Billing for a member, **Then** the system provisions the network's ProxyPay store transparently (the manager never sees the provisioning step) AND returns the new billing in under 5 seconds.
2. **Given** a Network Manager retries the same billing creation (same member, same recurrence, same amount) within seconds because of a slow network, **When** the second request reaches the system, **Then** no duplicate billing is created in ProxyPay and the manager sees the originally created billing.
3. **Given** ProxyPay is temporarily unavailable, **When** a Network Manager attempts to create a billing, **Then** the manager receives a clear, actionable error message (not a cryptic 500) and no half-saved local row remains.

---

### User Story 2 - Customer pays a Billing invoice and status syncs back to MonexUp (Priority: P2)

When a Billing run produces an invoice (one period of charges), the customer receives a PIX/QR-Code/payment link from ProxyPay. After the customer pays, the network's dashboard inside MonexUp must reflect the new "Paid" status without the manager having to leave MonexUp or click "Refresh" against ProxyPay manually.

**Why this priority**: P2 because the system can ship without it (manager can manually re-check status), but the experience is poor and commission settlement (invoice_fees) cannot run automatically without it. This story unlocks downstream commission calculation that already exists in MonexUp.

**Independent Test**: Create a Billing (US1) → trigger the invoice run → simulate a payment on ProxyPay's sandbox endpoint → wait at most 60 seconds → confirm the corresponding MonexUp dashboard view shows "Paid" with the payment timestamp.

**Acceptance Scenarios**:

1. **Given** an invoice issued by ProxyPay against a MonexUp-tracked billing, **When** the customer pays the invoice, **Then** MonexUp reflects the "Paid" state within 60 seconds without the manager taking any action.
2. **Given** an invoice that becomes overdue on ProxyPay, **When** the overdue state is recorded on ProxyPay, **Then** MonexUp's dashboard shows the same "Overdue" indicator and offers the existing dunning/follow-up actions.
3. **Given** an invoice that is refunded on ProxyPay, **When** the refund completes, **Then** MonexUp clears the linked `invoice_fees` row(s) so the network is not paid commission on the refunded invoice.

---

### User Story 3 - Decommission legacy Invoice/Subscription artifacts in MonexUp (Priority: P3)

After Stories 1 + 2 are running in production and verified, the legacy Invoice/Subscription code paths inside MonexUp that have been replaced by ProxyPay calls must be removed: legacy DTOs, services, controllers, repositories, EF entities, validators, factories, unit tests, and DB tables that no longer back any feature. This is the "remove the old artifacts" part of the user request.

**Why this priority**: P3 because nothing user-facing depends on it — the new flow already works once Stories 1 + 2 are in. Cleanup is what closes the migration and removes ongoing dead-code maintenance cost.

**Independent Test**: After Stories 1 + 2 have been live for at least one billing cycle and zero traffic is observed against the legacy endpoints (`/Invoice/*`, `/Subscription/*`), the cleanup PR can be merged and the project still builds, all remaining tests pass, and no consumer (frontend, API tests, mobile app, Bruno collection) references a removed name.

**Acceptance Scenarios**:

1. **Given** the cleanup is complete, **When** the solution is built and the test suite is executed, **Then** the build succeeds and all tests pass.
2. **Given** the cleanup is complete, **When** any code or documentation searches the repository for the removed legacy class names, **Then** zero hits are returned (except inside Git history).
3. **Given** the cleanup is complete, **When** the public OpenAPI / Bruno collection is loaded, **Then** the legacy `/Invoice/*` and `/Subscription/*` endpoints are no longer listed.

---

### Edge Cases

- **Lazy-provision race**: Two managers of the same network create their first Billing within the same second. Only one ProxyPay store must be linked to that network; the second request must reuse the first store, not create a duplicate.
- **ProxyPay billing already exists for a different MonexUp network** (operator manually created the same email there earlier): the system MUST refuse to silently link to it; the manager should see "this billing is owned by a different network" so cross-tenant data is impossible.
- **Webhook arrives before the link row is committed**: the inbound payment-status notification finds no local row yet. The system MUST not lose the event — it MUST retry or queue the update until the link is visible.
- **Customer pays partial / over-paid amount**: behavior depends on ProxyPay's settled value. MonexUp must treat the ProxyPay-reported amount as authoritative when computing commission.
- **Network is deleted while billings exist**: deleting a network with active billings MUST be either prevented OR cascaded to ProxyPay (cannot leave orphan billings charging customers for a network that no longer exists in MonexUp).
- **Currency**: assume BRL for all networks (matches existing MonexUp + ProxyPay deployment); if a future network requires another currency, it is out of scope for this feature.
- **Existing historical data** in `monexup_invoices` / `monexup_subscriptions`: discarded at cleanup time per FR-020.

## Requirements *(mandatory)*

### Functional Requirements

#### Domain ownership

- **FR-001**: ProxyPay MUST be the sole system of record for billing schedules (recurrence rules, next-charge date, total iterations) AND for every invoice — both invoices generated by a recurring Billing AND one-off PIX invoices (today produced by `OrderService` → `ProxyPayService.GenerateInvoice`).
- **FR-002**: MonexUp MUST NOT keep its own Billing or Invoice tables (no `BillingLink`, no `InvoiceLink`, no mirror cache). The single local link is `monexup_networks.proxypay_store_id` (1:1, lazy). All Billing and Invoice reads/writes are passthroughs to ProxyPay scoped by the network's `storeId`. MonexUp-side metadata that ProxyPay does not know about (e.g., `referrerId` for commission attribution) MUST travel with the request as ProxyPay-supported custom fields/metadata on the Billing/Invoice payload, NOT in a local table.
- **FR-003**: MonexUp MUST NOT store billing-rule fields (recurrence, due-date, period) anywhere; any UI display reads ProxyPay live (or via short-lived in-memory cache, not a persisted table).

#### Terminology

- **FR-004**: The MonexUp UI, API surface, DTOs, and database link table MUST use the term "Billing" (matching ProxyPay) for what was previously called "Subscription".
- **FR-005**: Anywhere a single occurrence of a charge is shown (one period of a Billing), MonexUp MUST use the term "Invoice" exactly as ProxyPay does.

#### Lazy provisioning

- **FR-006**: The first Billing created for a network MUST cause the system to ensure that network has a ProxyPay store, transparently, with no extra click or screen.
- **FR-007**: Concurrent first-Billing requests for the same network MUST result in exactly one ProxyPay store being linked; race losers MUST reuse the winner's store.
- **FR-008**: A network whose ProxyPay store creation fails MUST surface the failure cleanly to the manager and MUST NOT leave a partial link in MonexUp.

#### Idempotency

- **FR-009**: Creating a Billing with the same `(networkId, customerId, schedule, amount)` more than once within a short window MUST result in only one ProxyPay billing.
- **FR-010**: Creating an Invoice (one-time charge) with the same `(networkId, customerId, externalReference)` more than once MUST result in only one ProxyPay invoice.

#### Status synchronization

- **FR-011**: When ProxyPay marks an invoice "Paid" / "Overdue" / "Refunded" / "Cancelled", MonexUp MUST reflect the same status within 60 seconds.
- **FR-012**: Commission rows in `monexup_invoice_fees` MUST be created exactly once when an invoice transitions to "Paid", and MUST be reversed when the same invoice is later "Refunded".
- **FR-013**: Status sync MUST be resilient to out-of-order events (e.g., a "Refunded" event arriving before the "Paid" event was processed) — final state must be consistent regardless of arrival order.

#### Authorization & multi-tenancy

- **FR-014**: Only a network's `NetworkManager` (or `Administrator`) MUST be able to create or cancel a Billing for that network. Cancellation in MonexUp is a passthrough call to ProxyPay's cancel endpoint — MonexUp does not enforce any cancellation policy of its own (next-iteration handling, open-invoice cascade, refund timing, etc. are all defined and executed by ProxyPay).
- **FR-015**: A user MUST be able to view only the Billings/Invoices belonging to networks they are a member of.
- **FR-016**: Cross-network leakage MUST be impossible: a Network Manager of network A cannot read or modify network B's billings.

#### Removal scope

- **FR-017**: After the new flow is live and verified, MonexUp MUST delete the local Invoice CRUD endpoints, the Subscription CRUD endpoints, the legacy one-off PIX invoice path inside `ProxyPayService.GenerateInvoice`/`OrderService` that writes to `monexup_invoices`, plus the corresponding services / repositories / DTOs / validators / factories / EF entities / unit tests / Bruno calls.
- **FR-018**: The DB tables `monexup_invoices` and `monexup_subscriptions` (and any junction/fee tables exclusively backing them) MUST be dropped or repurposed to the new link-table shape.
- **FR-019**: The frontend MUST stop calling the removed endpoints; the user-visible billing/invoice screens MUST instead read through the new ProxyPay-backed flow.

#### Backwards-incompatible / data

- **FR-020**: Historical rows that already exist in `monexup_invoices` / `monexup_subscriptions` at migration time MUST be discarded immediately when the cleanup of US3 ships — no read-only window, no backfill into ProxyPay. The legacy tables are dropped as part of the same release. Stakeholders accept the loss of legacy billing history inside MonexUp; if past records are needed for audit they can be exported once before the cleanup PR is merged.

#### Error handling & operability

- **FR-021**: All ProxyPay calls MUST tag the request with the network's `X-Tenant-Id: monexup` so ProxyPay can isolate per-tenant state.
- **FR-022**: When ProxyPay is unreachable, the system MUST return a 503-class error to the manager (not a 5xx leak), and `monexup_networks.proxypay_store_id` MUST stay NULL on failed first-time provisioning (no half-provisioned state).

### Key Entities *(include if feature involves data)*

- **NetworkProxyPayLink** (extension, MonexUp-owned): a 1:1 link from `monexup_networks` to a ProxyPay store, lazily provisioned on first Billing/Invoice create. Stored as a nullable `proxypay_store_id BIGINT` column on `monexup_networks`, mirroring the `lofn_store_id` precedent from feature 004. **This is the ONLY MonexUp-side persistence introduced by this feature.**
- **Billing** (REMOTE-ONLY, owned by ProxyPay): never persisted in MonexUp. List/read by calling ProxyPay filtered by `storeId`. Carries: schedule, amount, currency, customer, status.
- **Invoice** (REMOTE-ONLY, owned by ProxyPay): never persisted in MonexUp. Carries: amount, due date, payment date, status. The `proxypayInvoiceId` is the canonical identifier referenced from `monexup_invoice_fees`.
- **InvoiceFee** (REPURPOSED, MonexUp-owned): the existing `monexup_invoice_fees` table continues to record commission amounts. Its `invoice_id` column is renamed/repurposed to `proxypay_invoice_id BIGINT` (no FK — ProxyPay invoice lives in another DB). Holds the MonexUp-side hierarchy fields (`networkId`, `userId`, `referrerId`, `amount`, `paidAt`) computed at payment time from ProxyPay's webhook payload + the network's commission rules. This table is the **single source of truth** for commission distribution; ProxyPay knows nothing about referrer chains.
- **ProxyPay-side metadata fields** (NOT a separate entity): when MonexUp calls ProxyPay to create a Billing or Invoice, MonexUp MUST attach `networkId`, `referrerId` (when applicable), and `monexupOrderId` (for one-offs originating from `monexup_orders`) inside ProxyPay's metadata/custom-fields payload, so the webhook events can carry them back when computing commissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Network Manager can create a recurring Billing in under 30 seconds from the moment they click "New Billing", measured at the 95th percentile.
- **SC-002**: 99% of paid-invoice events are reflected on the manager's MonexUp dashboard within 60 seconds of payment.
- **SC-003**: Zero duplicate Billings are produced under retry / double-click conditions (target: 0 occurrences in a 1,000-retry stress run).
- **SC-004**: After the cleanup phase, the MonexUp solution contains zero references to the deleted legacy Invoice/Subscription type names (verified by full-text search) and the build remains green.
- **SC-005**: Commission rows generated by `monexup_invoice_fees` continue to balance against the total of paid invoices reported by ProxyPay, with reconciliation drift below 0.01 BRL per network per month.
- **SC-006**: Webhook-driven status updates have at-least-once delivery and converge to a consistent final state in 100% of test scenarios, including out-of-order and duplicate event delivery.

## Assumptions

- ProxyPay project at `C:\repos\ProxyPay\ProxyPay` is the same deployment already integrated for PIX QR-Code generation today; same auth scheme, same `X-Tenant-Id: monexup` header, same `ClientId`.
- The same NAuth bearer token currently used for PIX calls is also accepted by the ProxyPay billing/invoice endpoints (single SSO posture).
- Network → ProxyPay store mapping is 1:1 and lazy, mirroring the precedent established by feature 004 (Lofn) for ProductLink. The implementation MAY share helpers with the Lofn provisioning code.
- "Billing" terminology in the user request is interpreted as the ProxyPay-side noun for what MonexUp called "Subscription"; both are recurring charge schedules.
- Webhook delivery from ProxyPay → MonexUp is used for status synchronization (preferred over polling). If the deployment forbids inbound webhooks, polling is the fallback (out of scope to design here).
- All current MonexUp networks transact in BRL; multi-currency is out of scope.
- Mobile (Capacitor) app reads the new billing surface through the same REST endpoints as the web — no separate mobile-only path.
- Bruno collection (`bruno/`) and the API test project (`MonexUp.ApiTests/`) will receive new "BillingLink" entries equivalent to "ProductLink" once implementation begins.
- The `monexup_invoice_fees` table stays in MonexUp because commission rules are MonexUp's own business concern and ProxyPay knows nothing about referral hierarchy.

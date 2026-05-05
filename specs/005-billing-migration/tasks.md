# Tasks: Billing Migration to ProxyPay

**Branch**: `005-billing-migration` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Each task carries an exact path. `[P]` = parallel-safe. `[USx]` = belongs to User Story x.

---

## Phase 1: Setup

- [X] T001 Bump `proxypay-react` to latest 0.2.x in `monexup-app/package.json` and run `npm install`
- [X] T002 [P] Add config keys `ProxyPay:WebhookCallbackSecret`, `ProxyPay:CompletionUrlBase`, `ProxyPay:ReturnUrlBase` to `MonexUp.API/appsettings.Development.json`, `appsettings.Docker.json`, `appsettings.Production.json`
- [X] T003 [P] Add `.env` and `.env.example` entries `PROXYPAY_WEBHOOK_CALLBACK_SECRET=`, `PROXYPAY_COMPLETION_URL_BASE=`, `PROXYPAY_RETURN_URL_BASE=` plus matching `${...}` mappings in `docker-compose.yml` (`environment:` block of `monexup-api`)
- [X] T004 [P] Add frontend `REACT_APP_PROXYPAY_API_URL` confirmation and document in `monexup-app/.env.example`
- [ ] T005 Audit current state of `monexup_invoices` and `monexup_subscriptions`: `SELECT count(*) FROM monexup_invoices; SELECT count(*) FROM monexup_subscriptions;` — record numbers in commit message; produce CSV export if non-zero (legacy data is being discarded per FR-020) — **DEFERRED to user (DB access required)**

---

## Phase 2: Foundational (BLOCKING — must complete before US1)

### Database

- [X] T010 Add `ProxyPayStoreId` (`long?`) and `ProxyPayClientId` (`string?`) properties to `MonexUp.Infra/Context/Network.cs` with `[Column("proxypay_store_id")]` / `[Column("proxypay_client_id")]`
- [X] T011 Configure new columns in `MonexUp.Infra/Context/MonexUpContext.cs` `OnModelCreating` for the `Network` entity
- [X] T012 Add `ProxyPayInvoiceId` (`long`), `ReversedAt` (`DateTime?`), `PaidAmountCentsAtRecord` (`long?`) properties to `MonexUp.Infra/Context/InvoiceFee.cs`; remove `InvoiceId` property and the `Invoice` navigation
- [X] T013 Update `MonexUp.Infra/Context/MonexUpContext.cs` to remove `DbSet<Invoice>` and `DbSet<Subscription>` references in foundational scaffolding (deletion of the entity classes happens in US3); add fluent config for the three new `InvoiceFee` columns + the unique index `(proxypay_invoice_id, user_id, role)` and the partial index `(proxypay_invoice_id) WHERE proxypay_invoice_id IS NOT NULL`
- [X] T014 Generate EF migration: `dotnet ef migrations add BillingMigrationToProxyPay --project MonexUp.Infra --startup-project MonexUp.API` and review the generated file under `MonexUp.Infra/Migrations/`
- [ ] T015 Hand-tune the generated migration to also `DROP TABLE monexup_invoices CASCADE` and `DROP TABLE monexup_subscriptions CASCADE` in `Up()`, and recreate empty placeholders in `Down()` so the rollback compiles (only structure; data not preserved) — **DEFERRED to US3**
- [ ] T016 [P] Author equivalent SQL script `scripts/billing_migration_to_proxypay.sql` from the EF migration body for environments without dotnet ef — **DEFERRED**
- [X] T017 [P] Update canonical schema `monexup.sql`: add the two new `monexup_networks` columns; replace `monexup_invoice_fees` definition with the new shape; remove `monexup_invoices` + `monexup_subscriptions` blocks

### Domain interfaces & shared models

- [X] T020 Add `LofnStoreId`-style `ProxyPayStoreId` / `ProxyPayClientId` properties + `bool TrySetProxyPayStore(long networkId, long storeId, string clientId)` method to `MonexUp.Domain/Entities/Interfaces/INetworkModel.cs`
- [X] T021 Implement `TrySetProxyPayStore` in `MonexUp.Domain/Entities/NetworkModel.cs` (delegates to repository)
- [X] T022 Add `bool TrySetProxyPayStore(long networkId, long storeId, string clientId)` to `MonexUp.Infra.Interfaces/Repository/INetworkRepository.cs`
- [X] T023 Implement `TrySetProxyPayStore` in `MonexUp.Infra/Repository/NetworkRepository.cs` using `_ccsContext.Database.ExecuteSqlInterpolated` with conditional UPDATE (`WHERE network_id = ? AND proxypay_store_id IS NULL`); pattern mirrors existing `TrySetLofnStoreId`

### DTOs

- [X] T030 [P] Create `MonexUp.DTO/Billing/BillingFrequencyEnum.cs` (Monthly=1, Quarterly=2, Semiannual=3, Annual=4 — bit-for-bit identical to `ProxyPay.DTO.Billing.BillingFrequencyEnum`)
- [X] T031 [P] Create `MonexUp.DTO/Billing/PaymentMethodEnum.cs` (mirror of ProxyPay's enum values)
- [X] T032 [P] Create `MonexUp.DTO/Billing/BillingItemRequest.cs` with `description`, `quantity`, `unitPrice`, `discount` and `[JsonPropertyName]` attributes
- [X] T033 [P] Create `MonexUp.DTO/Billing/BillingCreateRequest.cs` per `data-model.md` §4 (`networkId`, `customerUserId`, `referrerUserId?`, `frequency`, `paymentMethod`, `billingStartDate`, `items`)
- [X] T034 [P] Create `MonexUp.DTO/Billing/BillingListItemInfo.cs` per `data-model.md` §4
- [X] T035 [P] Create `MonexUp.DTO/Billing/PaymentCompletionInfo.cs` per `data-model.md` §4
- [X] T036 [P] Create `MonexUp.DTO/Billing/EnsureStoreRequest.cs` (`{ networkId }`) and `EnsureStoreResponse.cs` (`{ proxypayStoreId, proxypayClientId }`)
- [X] T037 [P] Create `MonexUp.DTO/Billing/BillingApiResult.cs` and `BillingListApiResult.cs` (mirrors of `ProductLinkApiResult` shape with `sucesso`, `mensagemErro`, `mensagemSucesso`, `data`)

### Infra HTTP client

- [X] T040 Add `IProxyPayClient` interface in `MonexUp.Infra.Interfaces/AppServices/IProxyPayClient.cs` with methods `Task<EnsureStoreResponse> InsertStoreAsync(string name, string bearerToken, CancellationToken ct)`, `Task<InvoiceStatusInfo> GetInvoiceAsync(long proxypayInvoiceId, string clientId, CancellationToken ct)`, `Task<IList<InvoiceStatusInfo>> ListPendingInvoicesAsync(long storeId, CancellationToken ct)`
- [X] T041 Implement `ProxyPayClient` in `MonexUp.Infra/AppServices/ProxyPayClient.cs` using `IHttpClientFactory`, `IConfiguration["ProxyPay:ApiUrl"]`, `X-Tenant-Id: monexup`. Use absolute URL composition (`{baseUrl}/Store/insert`) — same fix pattern as the LofnStoreClient correction; do NOT rely on `HttpClient.BaseAddress` + leading-slash relative path

### DI registration

- [X] T050 Register `IProxyPayClient` → `ProxyPayClient` in `MonexUp.Application/Initializer.cs` `AddTransient`/`AddScoped` (Scoped for API, Transient for BG service per Constitution VII)

---

## Phase 3: User Story 1 — Network Manager creates a recurring Billing through ProxyPay (P1)

**Story goal**: A NetworkManager can start a recurring Billing for a member; ProxyPay store is lazy-provisioned the first time; idempotent under retry; transparent to the manager.

**Independent test**: Login as Manager → open `/billing/new` → fill recipient + items → click Create Billing → browser redirects to `https://proxypay.online/pay/...`; rerunning `POST /Billing/ensure-store` returns the SAME `proxypayStoreId`.

### Backend

- [X] T100 [US1] Create `MonexUp.Domain/Services/Interfaces/IBillingService.cs` with method signatures: `Task<EnsureStoreResponse> EnsureStoreAsync(long networkId, long callerUserId, string bearerToken, CancellationToken ct)`, `Task<BillingListApiResult> ListAsync(long networkId, long callerUserId, int pageNum, int pageSize, CancellationToken ct)`, `Task<InvoiceStatusInfo> GetInvoiceAsync(long proxypayInvoiceId, long callerUserId, CancellationToken ct)`
- [X] T101 [US1] Create `MonexUp.Domain/Services/BillingService.cs` implementing `IBillingService`. `EnsureStoreAsync`: authorize caller as `NetworkManager`/`Administrator`; read network; if `ProxyPayStoreId` set → return; else call `_proxyPayClient.InsertStoreAsync` → call `INetworkModel.TrySetProxyPayStore` → on race-loss reread network and return winner's values
- [X] T102 [US1] Register `IBillingService` → `BillingService` in `MonexUp.Application/Initializer.cs`
- [X] T103 [US1] Create `MonexUp.Application/Validators/EnsureStoreRequestValidator.cs` (FluentValidation) — `NetworkId > 0`
- [X] T104 [US1] Register validator in `MonexUp.Application/Initializer.cs`
- [X] T105 [US1] Create `MonexUp.API/Controllers/BillingController.cs` with `[Route("[controller]")]`, `[Authorize]` on `POST /ensure-store` and `GET /list`. Inject `IBillingService`, `IUserClient`, `IValidator<EnsureStoreRequest>`. Implement `EnsureStore`, `List` per `contracts/monexup-billing-endpoints.md`. Use `BuildErrorMessage(Exception)` helper from `ProductLinkController` precedent so inner exceptions surface in error body

### Frontend — service/business plumbing

- [X] T110 [P] [US1] Create `monexup-app/src/DTO/Domain/BillingCreateInfo.tsx` mirroring `BillingCreateRequest`
- [X] T111 [P] [US1] Create `monexup-app/src/DTO/Domain/BillingListItemInfo.tsx`
- [X] T112 [P] [US1] Create `monexup-app/src/DTO/Domain/EnsureStoreResponse.tsx`
- [X] T113 [P] [US1] Create `monexup-app/src/Services/Interfaces/IBillingService.tsx` with methods `ensureStore`, `list`
- [X] T114 [P] [US1] Create `monexup-app/src/Services/Impl/BillingService.tsx` calling MonexUp `/Billing/*` endpoints via existing `HttpClient` infra
- [X] T115 [P] [US1] Create `monexup-app/src/Business/Interfaces/IBillingBusiness.tsx`
- [X] T116 [P] [US1] Create `monexup-app/src/Business/Impl/BillingBusiness.tsx` (delegates to service, handles `BizResult` envelope used by other businesses)
- [X] T117 [US1] Create `monexup-app/src/Business/Factory/BillingFactory.tsx` registering `BillingBusiness` (depends on T116)
- [X] T118 [US1] Register the new service in `monexup-app/src/Business/Factory/ServiceFactory.tsx`

### Frontend — context + provider

- [X] T120 [US1] Create `monexup-app/src/Contexts/Billing/BillingContext.tsx`
- [X] T121 [US1] Create `monexup-app/src/Contexts/Billing/BillingProvider.tsx` exposing `ensureStore(networkId)`, `list(networkId)`, plus loading flags. Pattern follows `Contexts/ProductLink/ProductLinkProvider.tsx`

### Frontend — proxypay-react integration

- [X] T130 [US1] Add `<ProxyPayProvider>` wrapper in `monexup-app/src/App.tsx` keyed off the currently selected network's `proxypayClientId`. Wrapper component is `NetworkAwareProxyPayProvider` (NEW file `monexup-app/src/Components/NetworkAwareProxyPayProvider.tsx`): reads `networkContext.userNetwork?.network?.proxypayClientId`; if NULL renders children without ProxyPayProvider; if non-null mounts `<ProxyPayProvider config={{ apiUrl: process.env.REACT_APP_PROXYPAY_API_URL, clientId }}>`
- [X] T131 [US1] Extend `monexup-app/src/DTO/Domain/NetworkInfo.tsx` to include `proxypayClientId?: string` (returned by backend `/network/getById/{id}` and `/network/listByUser`)
- [X] T132 [US1] Update `MonexUp.DTO/Network/NetworkInfo.cs` to expose `ProxyPayClientId` (string, nullable). Backend mapper in `MonexUp.Domain/Services/NetworkService.cs` `GetNetworkInfo` includes it. Manager-only field — for non-managers return null

### Frontend — UI page

- [X] T140 [US1] Create `monexup-app/src/Pages/BillingManagePage/index.tsx`: lists existing billings via `BillingProvider.list`, "New Billing" button opens `BillingManagePage/NewBillingForm.tsx`
- [X] T141 [US1] Create `monexup-app/src/Pages/BillingManagePage/NewBillingForm.tsx`: collects customer email, items, frequency, payment method, billing start date. On submit: (a) calls `billingProvider.ensureStore(networkId)` if `userNetwork.network.proxypayClientId` is null → reload network; (b) renders `<BillingPayment customer items frequency paymentMethod billingStartDate completionUrl returnUrl onError>` from `proxypay-react`. Apply skill `react-modal` for confirm dialog and `react-alert` for errors; localized strings via i18n
- [X] T142 [US1] Add route `/admin/billing` → `BillingManagePage` in `monexup-app/src/App.tsx` routes table; gate by `currentRole >= NetworkManager`
- [X] T143 [US1] Add menu link in `monexup-app/src/Components/AdminSidebar.tsx` (or equivalent admin menu) pointing at `/admin/billing`

### i18n

- [X] T150 [P] [US1] Add billing keys to `monexup-app/public/locales/pt/translation.json`: `billing.new`, `billing.list`, `billing.frequency.monthly`, etc.
- [X] T151 [P] [US1] Add same keys to `monexup-app/public/locales/en/translation.json`
- [X] T152 [P] [US1] Add same keys to `monexup-app/public/locales/es/translation.json`
- [X] T153 [P] [US1] Add same keys to `monexup-app/public/locales/fr/translation.json`

### Tests

- [ ] T160 [P] [US1] `MonexUp.Tests/Services/BillingServiceTests.cs`: `EnsureStoreAsync_WhenStoreAlreadySet_ReturnsExisting`, `_WhenStoreUnset_CallsClientAndPersists`, `_WhenRaceLost_RereadsAndReturnsWinner`, `_WhenCallerNotManager_ReturnsForbidden`. Use Moq for `IProxyPayClient`, `INetworkRepository`, `IUserNetworkDomainFactory`
- [ ] T161 [P] [US1] `MonexUp.Tests/Repositories/NetworkRepositoryTests.cs`: extend with `TrySetProxyPayStore_FirstCall_Returns1AndSetsBoth`, `_SecondConcurrentCall_Returns0`
- [ ] T162 [US1] `MonexUp.ApiTests/Controllers/BillingControllerTests.cs`: add `EnsureStore_WithoutAuth_ShouldReturn401`, `EnsureStore_WithAuth_ShouldProvisionAndReturnIds`, `EnsureStore_RepeatedCall_ShouldReturnSameStore`, `List_WithoutAuth_ShouldReturn401`. Mirror style of `ProductLinkControllerTests`
- [ ] T163 [US1] `MonexUp.ApiTests/Helpers/TestDataHelper.cs`: add `CreateEnsureStoreRequest(long networkId)` factory
- [ ] T164 [US1] `bruno/Billing/Ensure Store.bru`: bearer auth, X-Tenant-Id, body `{ "networkId": 1 }`

---

## Phase 4: User Story 2 — Customer pays a Billing invoice and status syncs back to MonexUp (P2)

**Story goal**: After a customer pays a ProxyPay-hosted invoice, MonexUp records the corresponding `monexup_invoice_fees` rows within 60s without manager intervention. Refunds reverse the fees pro-rata.

**Independent test**: Create a Billing (US1) → simulate payment via `POST {ProxyPayApiUrl}/Payment/simulate-payment/{invoiceId}` → trigger `/Billing/payment-completed` (or wait for poller) → verify fee rows in `monexup_invoice_fees`.

### Backend — completion callback

- [X] T200 [US2] Add `RecordPaidInvoiceAsync(long proxypayInvoiceId, long networkId, long paidAmountCents, DateTime paidAt, CancellationToken ct)` method to `MonexUp.Domain/Services/Interfaces/IInvoiceFeeService.cs` (extend existing service if present, else create `IInvoiceFeeService.cs`)
- [X] T201 [US2] Implement `RecordPaidInvoiceAsync` in `MonexUp.Domain/Services/InvoiceFeeService.cs`: looks up referrer chain via `IUserNetworkDomainFactory` from the customer who paid; for each beneficiary inserts fee row `(proxypay_invoice_id, network_id, user_id, role, amount, paid_amount_cents_at_record, paid_at)`; idempotent via UNIQUE index `(proxypay_invoice_id, user_id, role)` — catch `DbUpdateException` and treat as no-op
- [X] T202 [US2] Add `Task<ReversalResult> ReverseInvoiceAsync(long proxypayInvoiceId, long refundedAmountCents, long originalPaidAmountCents, CancellationToken ct)` method to `IInvoiceFeeService.cs`
- [X] T203 [US2] Implement `ReverseInvoiceAsync` in `InvoiceFeeService.cs`: if `refundedAmountCents == originalPaidAmountCents` → UPDATE all rows for invoice SET `reversed_at = now()`; else for each active row INSERT a paired negative-amount row `(amount = -original.amount * factor, reversed_at = now())` where `factor = refundedAmountCents / originalPaidAmountCents`
- [X] T204 [US2] Add `Task<PaymentCompletionResult> ProcessPaymentCompletionAsync(PaymentCompletionInfo info, CancellationToken ct)` to `IBillingService.cs`
- [X] T205 [US2] Implement `ProcessPaymentCompletionAsync` in `BillingService.cs`: validate HMAC-SHA256 signature against `IConfiguration["ProxyPay:WebhookCallbackSecret"]`; call `IProxyPayClient.GetInvoiceAsync` to fetch authoritative status + amount; if `status != Paid` → return 200 + flag for poller; if Paid → derive `networkId` from invoice's `storeId` via `monexup_networks` lookup; cross-tenant check (info.networkId == derived); call `_invoiceFeeService.RecordPaidInvoiceAsync`
- [X] T206 [US2] Add `[AllowAnonymous] POST /Billing/payment-completed` to `MonexUp.API/Controllers/BillingController.cs` — body deserialized from `PaymentCompletionInfo`. Returns 401 on bad signature, 200 with idempotent message otherwise. NEVER returns 500 — wrap in try/catch and surface inner via `BuildErrorMessage`
- [X] T207 [US2] Generate `completionUrl` builder in `BillingService.cs`: helper `BuildCompletionUrl(long networkId, long expectedInvoiceId)` that returns `{ProxyPay:CompletionUrlBase}?n={networkId}&i={invoiceId-placeholder}&s={hmac}`. Frontend uses this when constructing the `<BillingPayment>` props

### Backend — reconciliation poller

- [X] T210 [US2] Create `MonexUp.Domain/Services/Interfaces/IBillingReconciliationService.cs` with `Task ReconcileAsync(CancellationToken ct)`
- [X] T211 [US2] Implement `BillingReconciliationService` in `MonexUp.Domain/Services/BillingReconciliationService.cs`: enumerate all `monexup_networks` with `proxypay_store_id IS NOT NULL`; for each, call `IProxyPayClient.ListPendingInvoicesAsync(storeId)`; for each non-terminal invoice with status `Paid` and no existing fee row → `_invoiceFeeService.RecordPaidInvoiceAsync`; for invoices in status `Refunded` not yet reversed → `ReverseInvoiceAsync`. Logs counts at Information level
- [X] T212 [US2] Register `IBillingReconciliationService` → `BillingReconciliationService` in `MonexUp.Application/Initializer.cs` (AddTransient + AddScoped variants per host)
- [X] T213 [US2] Add `MonexUp.BackgroundService/Schedules/ProxyPayReconciliationSchedule.cs` (NCrontab `*/5 * * * *` — every 5 min) that resolves `IBillingReconciliationService` via `IDbContextFactory` scope and calls `ReconcileAsync`. Pattern follows existing schedules in that project
- [X] T214 [US2] Register the new schedule in `MonexUp.BackgroundService/Program.cs` (or its scheduling registration block — confirm during impl)

### Frontend — completion-redirect landing page

- [X] T220 [US2] Create `monexup-app/src/Pages/BillingPaymentCompletedPage/index.tsx`: route `/billing/payment-completed`. Reads query params `n`, `i`, `s`. POSTs to MonexUp `/Billing/payment-completed` with `{ networkId, proxypayInvoiceId, signature }`. Shows success / pending / error UI per response. Uses `react-alert` skill
- [X] T221 [US2] Add route to `monexup-app/src/App.tsx`

### Tests

- [ ] T230 [P] [US2] `MonexUp.Tests/Services/InvoiceFeeServiceTests.cs`: `RecordPaidInvoice_FirstCall_InsertsRowsForChain`, `_DuplicateCall_NoExtraRows` (idempotency), `ReverseInvoice_FullRefund_SetsReversedAtOnAll`, `ReverseInvoice_PartialRefund_InsertsNegativePairedRows`
- [ ] T231 [P] [US2] `MonexUp.Tests/Services/BillingServiceTests.cs` (extend file from T160): `ProcessPaymentCompletion_BadHmac_Returns401`, `_StatusNotPaid_ReturnsPendingNoFees`, `_PaidStatus_RecordsFees`, `_CrossTenantInvoice_Refused`
- [ ] T232 [P] [US2] `MonexUp.Tests/Services/BillingReconciliationServiceTests.cs`: `Reconcile_WithPaidInvoice_RecordsFees`, `Reconcile_WithRefundedInvoice_TriggersReversal`, `Reconcile_WithNoNetworks_NoOp`
- [ ] T233 [US2] `MonexUp.ApiTests/Controllers/BillingControllerTests.cs` (extend T162): `PaymentCompleted_WithBadSignature_ShouldReturn401`, `PaymentCompleted_WithValidSignaturePaidInvoice_ShouldRecordFees_Idempotent`
- [ ] T234 [US2] `MonexUp.ApiTests/Helpers/TestDataHelper.cs`: add `CreatePaymentCompletionInfo(long networkId, long invoiceId, string secret)` that computes the HMAC server-side
- [ ] T235 [US2] `bruno/Billing/Payment Completed.bru` with HMAC pre-request script and `bruno/Billing/Reconcile.bru` placeholder

---

## Phase 5: User Story 3 — Decommission legacy Invoice/Subscription artifacts (P3)

**Story goal**: After US1 + US2 are live and verified, every legacy artifact replaced by the new flow is deleted. Build green, tests green, no consumer references a removed name.

**Independent test**: `dotnet build MonexUp.sln` + `dotnet test MonexUp.Tests` + `dotnet test MonexUp.ApiTests` all green; `Grep` for any of the removed type names yields zero hits in production source dirs.

### Backend deletes

- [ ] T300 [P] [US3] Delete `MonexUp.API/Controllers/InvoiceController.cs`
- [ ] T301 [P] [US3] Delete `MonexUp.API/Controllers/SubscriptionController.cs` (if present)
- [ ] T302 [P] [US3] Delete `MonexUp.Domain/Services/InvoiceService.cs`, `MonexUp.Domain/Services/Interfaces/IInvoiceService.cs`
- [ ] T303 [P] [US3] Delete `MonexUp.Domain/Services/SubscriptionService.cs`, `ISubscriptionService.cs`
- [ ] T304 [P] [US3] Delete `MonexUp.Domain/Services/ProxyPayService.cs`, `IProxyPayService.cs` (replaced by `BillingService` + `BillingReconciliationService`)
- [ ] T305 [P] [US3] Delete `MonexUp.Domain/Entities/InvoiceModel.cs`, `IInvoiceModel.cs`
- [ ] T306 [P] [US3] Delete `MonexUp.Domain/Entities/SubscriptionModel.cs`, `ISubscriptionModel.cs`
- [ ] T307 [P] [US3] Delete `MonexUp.Domain/Factory/InvoiceDomainFactory.cs`, `IInvoiceDomainFactory.cs`
- [ ] T308 [P] [US3] Delete `MonexUp.Domain/Factory/SubscriptionDomainFactory.cs`, `ISubscriptionDomainFactory.cs`
- [ ] T309 [P] [US3] Delete `MonexUp.Infra/Repository/InvoiceRepository.cs`, `IInvoiceRepository.cs`
- [ ] T310 [P] [US3] Delete `MonexUp.Infra/Repository/SubscriptionRepository.cs`, `ISubscriptionRepository.cs`
- [ ] T311 [P] [US3] Delete `MonexUp.Infra/Context/Invoice.cs`, `MonexUp.Infra/Context/Subscription.cs`
- [ ] T312 [US3] Strip `ProxyPayAppService.GenerateInvoice`-style legacy paths from `MonexUp.Infra/AppServices/ProxyPayAppService.cs`. Keep only PIX QR helpers still used by anything else (verify call sites first; if all removed, delete the whole file)
- [ ] T313 [P] [US3] Delete `MonexUp.DTO/Invoice/*.cs` and `MonexUp.DTO/Subscription/*.cs`
- [ ] T314 [US3] Update `MonexUp.Application/Initializer.cs`: remove DI registrations for `IInvoiceService`, `ISubscriptionService`, `IProxyPayService`, `IInvoiceDomainFactory`, `ISubscriptionDomainFactory`, `IInvoiceRepository`, `ISubscriptionRepository`, related validators
- [ ] T315 [US3] Update `MonexUp.Domain/Services/OrderService.cs`: remove the legacy invoice-emission code path; if Order still needs to charge, route through the same `BillingService.CreateOneOffInvoiceAsync` flow (defer to runtime: if OrderService is no longer needed end-to-end, mark it for deletion; otherwise keep as the order/cart layer that talks to `BillingService` for payment)
- [ ] T316 [US3] If `OrderService` deletion is the right call (verified at impl time), delete `MonexUp.Domain/Services/OrderService.cs`, `IOrderService.cs`, `MonexUp.API/Controllers/OrderController.cs`, related DTOs and entities; otherwise leave a TODO + spec follow-up

### Frontend deletes

- [ ] T320 [P] [US3] Delete `monexup-app/src/Pages/InvoiceSearchPage/` directory
- [ ] T321 [P] [US3] Delete `monexup-app/src/Pages/SubscriptionPage/` and any other Subscription-named page (verify via Glob `monexup-app/src/Pages/Subscription*`)
- [ ] T322 [P] [US3] Delete `monexup-app/src/Contexts/Invoice/`, `monexup-app/src/Contexts/Subscription/` directories
- [ ] T323 [P] [US3] Delete `monexup-app/src/Services/Interfaces/IInvoiceService.tsx`, `Impl/InvoiceService.tsx`, `Interfaces/ISubscriptionService.tsx`, `Impl/SubscriptionService.tsx`
- [ ] T324 [P] [US3] Delete `monexup-app/src/Business/Interfaces/IInvoiceBusiness.tsx`, `Impl/InvoiceBusiness.tsx`, `Factory/InvoiceFactory.tsx` and Subscription equivalents
- [ ] T325 [P] [US3] Delete `monexup-app/src/DTO/Domain/InvoiceInfo.tsx`, `SubscriptionInfo.tsx`, related search-param/list-result DTOs
- [ ] T326 [US3] Update `monexup-app/src/Business/Factory/ServiceFactory.tsx` to remove deleted Invoice/Subscription registrations
- [ ] T327 [US3] Update `monexup-app/src/App.tsx` `ContextBuilder` array to remove deleted providers; remove deleted routes
- [ ] T328 [US3] Update `monexup-app/src/Components/AdminSidebar.tsx` (or equivalent menu) to remove links to deleted pages
- [ ] T329 [P] [US3] Strip Invoice/Subscription i18n keys from `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

### Test deletes

- [ ] T340 [P] [US3] Delete `MonexUp.Tests/Services/InvoiceServiceTests.cs`
- [ ] T341 [P] [US3] Delete `MonexUp.Tests/Services/SubscriptionServiceTests.cs`
- [ ] T342 [P] [US3] Delete `MonexUp.Tests/Services/ProxyPayServiceTests.cs`
- [ ] T343 [P] [US3] Delete `MonexUp.ApiTests/Controllers/InvoiceControllerTests.cs`
- [ ] T344 [P] [US3] Delete `MonexUp.ApiTests/Controllers/SubscriptionControllerTests.cs` if present
- [ ] T345 [US3] Delete obsolete entries from `MonexUp.ApiTests/Helpers/TestDataHelper.cs`: `CreateInvoiceSearchParam`, `CreateOrderInfo` (if Order goes), etc. — only those whose factories are now orphaned

### Bruno + docs

- [ ] T350 [P] [US3] Delete `bruno/Invoice/`, `bruno/Subscription/` directories
- [ ] T351 [P] [US3] Update `docs/` if any reference legacy Invoice/Subscription tables — replace with note pointing to ProxyPay project; create `docs/PROXYPAY_INTEGRATION.md` summarizing the new boundary (mirrors `docs/LOFN_INTEGRATION.md`)
- [ ] T352 [US3] Update `CLAUDE.md` (root): rewrite the "Payment" / "Subscription" sections to read "Owned by ProxyPay" with brief pointers (mirror Lofn paragraph style)

### Verification

- [ ] T360 [US3] `dotnet build MonexUp.sln` — green
- [ ] T361 [US3] `dotnet test MonexUp.Tests` — green
- [ ] T362 [US3] `dotnet test MonexUp.ApiTests --filter Billing` — green; legacy controllers' tests already deleted
- [ ] T363 [US3] `cd monexup-app && npm run build` — green; `npm test -- --watchAll=false` — green
- [ ] T364 [US3] Grep verification: `Grep` for `InvoiceModel`, `SubscriptionModel`, `IInvoiceService`, `ISubscriptionService`, `IProxyPayService` in `MonexUp.*` and `monexup-app/src/` — must return zero matches

---

## Phase 6: Polish & Cross-Cutting

- [ ] T400 [P] Run `dotnet ef database update` against staging DB; capture output in PR description
- [ ] T401 [P] Smoke-run `quickstart.md` end-to-end against staging; record screenshots / log snippets
- [ ] T402 [P] Update `bruno/collection.bru` to remove obsolete environment variables and add `webhookCallbackSecret` if needed for testing the callback locally
- [ ] T403 Performance check: 1,000-iteration loop hitting `POST /Billing/ensure-store` to confirm SC-003 (zero duplicate stores). Record p95 in PR description (target SC-001 ≤ 5s)
- [ ] T404 Reconciliation drift check after one full billing cycle in staging: `SELECT SUM(amount) FROM monexup_invoice_fees WHERE network_id = X AND reversed_at IS NULL` vs ProxyPay reported total — confirm SC-005 (< 0.01 BRL drift)
- [ ] T405 Update `MEMORY.md` (auto-memory) with a new pointer `project_proxypay_billing_integration.md` documenting the boundary (Network → ProxyPay store, fees in MonexUp, sync via redirect+poller)
- [ ] T406 Tag and create release note: list of removed endpoints, migration steps, rollback procedure (mirrors `docker-compose.yml` env additions)

---

## Dependencies

```
Phase 1 (Setup) ─────────────► Phase 2 (Foundational)
                                       │
                                       ▼
                                Phase 3 (US1 — P1)
                                       │
                                       ▼
                                Phase 4 (US2 — P2)
                                       │
                                       ▼
                                Phase 5 (US3 — P3)
                                       │
                                       ▼
                                Phase 6 (Polish)
```

- US1 depends ONLY on Foundational (T010–T050).
- US2 depends on US1 (cannot record fees without a store + clientId; cannot test completion redirect without a billing).
- US3 MUST be last — deleting code before US2 is verified breaks the rollback path.
- Within Phase 3: T100–T105 must precede T110+; T130–T132 must precede T140+ (frontend can't render `<BillingPayment>` without proxypayClientId on NetworkInfo).
- Within Phase 4: T200–T207 (callback) and T210–T214 (poller) are independent; test tasks T230–T235 depend on their respective production tasks.
- Within Phase 5: All `[P]` deletes can happen in parallel but T360–T364 verification MUST run last.

---

## Parallel execution opportunities

**Phase 1**: T002, T003, T004 in parallel (separate files).

**Phase 2**: T030–T037 (DTOs) all `[P]`. T016 + T017 (SQL + canonical schema) `[P]` after T015.

**Phase 3 / US1**: T110–T116 (frontend service/business plumbing) all `[P]`. T150–T153 (i18n locales) all `[P]`. T160–T161 (backend tests) `[P]`.

**Phase 4 / US2**: T230–T232 (unit tests across three services) `[P]`. Frontend landing page (T220–T221) independent of backend tasks (T200–T214).

**Phase 5 / US3**: Almost the entire phase is `[P]` deletes; only the post-delete updates (T314, T315, T326, T327, T328) must run after their parallel deletes complete. The four verification tasks (T360–T364) MUST run sequentially at the very end of the phase.

**Phase 6**: T400, T401, T402, T403, T404, T405 all `[P]`.

---

## Implementation strategy

**MVP scope**: US1 alone. Network managers can create billings; commissions are stale (fees not recorded yet). Useful for showcasing the ProxyPay integration end-to-end before investing in reconciliation.

**Incremental delivery**:
1. Ship US1 to staging → verify frontend can create a billing and customer reaches the ProxyPay payment page.
2. Add US2 → simulate payment, verify fees recorded, verify partial refund pro-rata.
3. Run staging traffic for at least one full billing cycle.
4. Ship US3 cleanup PR → drop legacy tables, delete code, ship.

**Cutover safety**: Phase 5 is destructive (DROP TABLE). Operator gate before merging US3:
- Confirm staging has been on US1+US2 for ≥ 7 days with zero traffic on legacy `/Invoice/*` and `/Subscription/*`.
- Snapshot prod DB before applying the migration.
- Apply migration during low-traffic window.

**Rollback**:
- US1 only → revert PR; no DB damage.
- US1+US2 → revert PR; the new columns on `monexup_networks` and `monexup_invoice_fees` are backwards-compatible (additive); legacy code still works.
- After US3 → restore from DB snapshot. Not recoverable without it.

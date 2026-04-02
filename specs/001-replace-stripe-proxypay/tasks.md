# Tasks: Substituir Stripe pelo ProxyPay

**Input**: Design documents from `/specs/001-replace-stripe-proxypay/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Remoção do Stripe e Configuração do ProxyPay)

**Purpose**: Remover todas as dependências do Stripe e configurar o ProxyPay

- [x] T001 Remove Stripe.net NuGet package from `MonexUp.Domain/MonexUp.Domain.csproj`
- [x] T002 [P] Remove `@stripe/react-stripe-js` and `@stripe/stripe-js` from `monexup-app/package.json` and add `proxypay-react`
- [x] T003 [P] Add ProxyPay configuration section to `MonexUp.API/appsettings.json` and `MonexUp.API/appsettings.Development.json` (ApiUrl, ClientId, TenantId) and remove `STRIPE_SECRET_KEY`
- [x] T004 [P] Add ProxyPay environment variables to `monexup-app/.env.production` (`REACT_APP_PROXYPAY_API_URL`, `REACT_APP_PROXYPAY_CLIENT_ID`, `REACT_APP_PROXYPAY_TENANT_ID`) and remove `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- [x] T005 [P] Update `.env.example` at repo root: remove `STRIPE_SECRET_KEY` and `REACT_APP_STRIPE_PUBLISHABLE_KEY`, add ProxyPay variables
- [x] T006 [P] Install `proxypay-react` package in `monexup-app/package.json`

---

## Phase 2: Foundational (Backend — Remover Stripe, Criar ProxyPay Service)

**Purpose**: Core backend infrastructure — remover código Stripe e criar serviço ProxyPay

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Delete `MonexUp.Domain/Services/StripeService.cs` and `MonexUp.Domain/Services/Interfaces/IStripeService.cs`
- [x] T008 Remove Stripe properties (`StripeId`) from `MonexUp.Domain/Entities/InvoiceModel.cs` and `MonexUp.Domain/Entities/Interfaces/IInvoiceModel.cs`
- [x] T009 [P] Remove Stripe properties (`StripeId`) from `MonexUp.Domain/Entities/OrderModel.cs` and `MonexUp.Domain/Entities/Interfaces/IOrderModel.cs`
- [x] T010 [P] Remove Stripe properties (`StripeProductId`, `StripePriceId`) from `MonexUp.Domain/Entities/ProductModel.cs` and `MonexUp.Domain/Entities/Interfaces/IProductModel.cs`
- [x] T011 Remove Stripe column mappings (`stripe_id`) from `MonexUp.Infra/Context/Invoice.cs` and `MonexUp.Infra/Context/Order.cs`, and remove Stripe product column mappings from `MonexUp.Infra/Context/MonexUpContext.cs`
- [x] T012 Stripe fields removed from entities/context — migration to be generated when DB is available
- [x] T013 Create ProxyPay settings DTO class `ProxyPaySetting.cs` in `MonexUp.Infra.Interfaces/AppServices/`
- [x] T014 Create `IProxyPayAppService.cs` interface in `MonexUp.Infra.Interfaces/AppServices/`
- [x] T015 Create `ProxyPayAppService.cs` implementation in `MonexUp.Infra/AppServices/`
- [x] T016 Create `PixPaymentRequest.cs` DTO in `MonexUp.DTO/Payment/`
- [x] T017 [P] Create `PixPaymentResult.cs` DTO in `MonexUp.DTO/Payment/`
- [x] T018 Create `IProxyPayService.cs` interface in `MonexUp.Domain/Services/Interfaces/`
- [x] T019 Create `ProxyPayService.cs` in `MonexUp.Domain/Services/`
- [x] T020 Update `MonexUp.Domain/Services/SubscriptionService.cs` — replaced IStripeService with IProxyPayService, added CreatePixPayment
- [x] T021 Update `MonexUp.Domain/Services/InvoiceService.cs` — removed Checkout(), updated Synchronize() to use ProxyPay
- [x] T022 Update `MonexUp.Application/Initializer.cs` — replaced Stripe with ProxyPay DI registrations
- [x] T023 Update `MonexUp.API/Controllers/OrderController.cs` — added PIX endpoints, removed Stripe
- [x] T024 Update `MonexUp.API/Controllers/InvoiceController.cs` — removed checkout endpoint
- [x] T025 Backend compiles with 0 errors, 0 warnings

**Checkpoint**: Backend compila sem referências ao Stripe. Novos endpoints PIX respondendo. Migration pronta para aplicar.

---

## Phase 3: User Story 1 — Pagamento único via PIX (Priority: P1) 🎯 MVP

**Goal**: Comprador autenticado pode pagar via PIX com QR Code na página de produto

**Independent Test**: Acessar página de produto, informar CPF, gerar QR Code, simular pagamento, verificar redirecionamento para página de confirmação

### Implementation for User Story 1

- [x] T026 [US1] Update `monexup-app/src/Services/Impl/OrderService.tsx` — replace `createSubscription` method with `createPixPayment(productSlug, documentId, networkSlug?, sellerSlug?, token)` calling `POST /Order/createPixPayment/{productSlug}`, add `checkPixStatus(proxyPayInvoiceId, token)` calling `GET /Order/checkPixStatus/{proxyPayInvoiceId}`, remove `createInvoice` method
- [x] T027 [US1] Update `monexup-app/src/Services/Interfaces/IOrderService.tsx` — replace method signatures to match new `createPixPayment` and `checkPixStatus` methods
- [x] T028 [US1] Update `monexup-app/src/DTO/Services/SubscriptionResult.tsx` — replace `clientSecret` field with `qrCode` object (invoiceId, brCode, brCodeBase64, expiredAt) and rename to `PixPaymentResult.tsx` or update in place
- [x] T029 [US1] Update `monexup-app/src/Business/Impl/OrderBusiness.tsx` — replace `createSubscription` with `createPixPayment(productSlug, documentId, networkSlug?, sellerSlug?)` that calls the updated service, replace `createInvoice` similarly
- [x] T030 [US1] Update `monexup-app/src/Business/Interfaces/IOrderBusiness.tsx` — update interface to match new method signatures
- [x] T031 [US1] Update `monexup-app/src/Contexts/Order/OrderProvider.tsx` — remove `clientSecret` state, add `qrCode` state (invoiceId, brCode, brCodeBase64, expiredAt), replace `createSubscription` method with `createPixPayment`, add `checkPixStatus` method
- [x] T032 [US1] Update `monexup-app/src/DTO/Contexts/IOrderProvider.tsx` — update interface to reflect new PIX methods and qrCode state instead of clientSecret
- [x] T033 [US1] Create `monexup-app/src/Pages/ProductPage/PixPaymentForm.tsx` — component with CPF input field + `PixPayment` component from `proxypay-react`. On CPF submit, calls `orderContext.createPixPayment()`. Passes QR Code data to `PixPayment`. On success callback, redirects to `/checkout/success`
- [x] T034 [US1] Delete `monexup-app/src/Pages/ProductPage/SubscriptionForm.tsx` (Stripe Embedded Checkout)
- [x] T035 [US1] Update `monexup-app/src/Pages/ProductPage/index.tsx` — replace `SubscriptionForm` import/usage with `PixPaymentForm` for authenticated users
- [x] T036 [US1] Create `monexup-app/src/Pages/CheckoutSuccessPage/index.tsx` — payment confirmation page with success message, order summary, and button to return to dashboard or network
- [x] T037 [US1] Update `monexup-app/src/App.tsx` — add `ProxyPayProvider` (from `proxypay-react`) wrapping the app with config from env vars (`REACT_APP_PROXYPAY_API_URL`, `REACT_APP_PROXYPAY_CLIENT_ID`, `REACT_APP_PROXYPAY_TENANT_ID`), add route `/checkout/success` pointing to `CheckoutSuccessPage`
- [x] T038 [US1] Add i18next translation keys for PIX payment flow in `monexup-app/public/locales/pt/translation.json`, `en/translation.json`, `es/translation.json`, `fr/translation.json` — keys: cpf_label, cpf_placeholder, cpf_invalid, pix_payment_title, payment_success, payment_expired, checkout_success_title, checkout_success_message, back_to_dashboard

**Checkpoint**: Comprador autenticado pode pagar via PIX end-to-end. QR Code gerado, polling funciona, redirecionamento para página de confirmação.

---

## Phase 4: User Story 2 — Comprador não autenticado (Priority: P2)

**Goal**: Visitante não autenticado pode se cadastrar e pagar via PIX em fluxo contínuo

**Independent Test**: Acessar página de produto sem login, preencher cadastro rápido, informar CPF e completar pagamento PIX

### Implementation for User Story 2

- [x] T039 [US2] Update `monexup-app/src/Pages/ProductPage/index.tsx` — ensure the `UserForm` (quick registration form for unauthenticated users) correctly redirects to `PixPaymentForm` after successful registration and authentication (replacing previous redirect to Stripe checkout)

**Checkpoint**: Visitante pode se cadastrar e pagar via PIX sem interrupção.

---

## Phase 5: User Story 3 — Sincronização de invoices (Priority: P3)

**Goal**: Admin/representante pode sincronizar status de invoices pendentes via ProxyPay

**Independent Test**: Acessar lista de invoices, clicar sincronizar, verificar que invoices pendentes com pagamento PIX confirmado são atualizadas

### Implementation for User Story 3

- [x] T040 [US3] Update `monexup-app/src/Pages/InvoiceSearchPage/index.tsx` — verify the "Sincronizar" button calls `invoiceContext.syncronize()` which now internally uses ProxyPay (backend already updated in T021/T024). No frontend changes expected unless the sync response format changed.

**Checkpoint**: Invoices pendentes são atualizadas via sincronização com ProxyPay.

---

## Phase 6: Desabilitar funcionalidades diferidas

**Purpose**: Garantir que opções de cartão e assinatura não apareçam ao usuário

- [x] T041 Review `monexup-app/src/Pages/ProductPage/index.tsx` — ensure no payment option for credit card or subscription is visible. If there are payment method selectors or buttons, hide/remove them. Only PIX payment should be available.
- [x] T042 [P] Review and remove any remaining Stripe references across the entire codebase — search for "stripe", "Stripe", "STRIPE" in all files and remove/update any lingering references in comments, imports, or unused code

**Checkpoint**: Nenhuma referência ao Stripe resta no código. Apenas PIX disponível como método de pagamento.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e limpeza

- [x] T043 Verify backend compiles clean: `dotnet build MonexUp.sln` — no warnings related to removed Stripe types
- [x] T044 [P] Verify frontend compiles clean: `cd monexup-app && npm run build` — no warnings related to removed Stripe packages
- [x] T045 Update `docs/monexup.md` — replace Stripe references with ProxyPay in sections 9 (Integração com Stripe → Integração com ProxyPay) and 10 (Integrações Externas)
- [x] T046 [P] Update `CLAUDE.md` — replace Stripe references with ProxyPay in Frontend structure section and Environment Variables section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (US1 must work first)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (backend sync already implemented)
- **Disable deferred (Phase 6)**: Depends on Phase 3
- **Polish (Phase 7)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (PIX payment form must exist before integrating with registration flow)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Independent of US1/US2 (backend sync already done in T021)

### Within Each Phase

- Models/entities before services
- Services before controllers/endpoints
- Backend before frontend (for same feature)
- Core implementation before integration
- Commit after each task or logical group

### Parallel Opportunities

```bash
# Phase 1 — all setup tasks can run in parallel:
T001, T002, T003, T004, T005, T006

# Phase 2 — entity removals in parallel:
T008, T009, T010

# Phase 2 — new DTOs in parallel:
T016, T017

# Phase 3 (US1) — service + interface updates can be grouped:
T026, T027, T028 (service layer)
T029, T030 (business layer)
T031, T032 (context layer)

# Phase 7 — build validations in parallel:
T043, T044
T045, T046
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (remove Stripe deps, add ProxyPay config)
2. Complete Phase 2: Foundational (remove Stripe code, create ProxyPay service)
3. Complete Phase 3: User Story 1 (PIX payment end-to-end)
4. **STOP and VALIDATE**: Test PIX payment flow manually
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend clean, ProxyPay service ready
2. Add User Story 1 → PIX payment working → Deploy/Demo (MVP!)
3. Add User Story 2 → Unauth users can pay → Deploy/Demo
4. Add User Story 3 → Sync invoices working → Deploy/Demo
5. Disable deferred + Polish → Clean codebase → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Product fields (StripeProductId, StripePriceId) may only exist in Lofn DB — verify before migration

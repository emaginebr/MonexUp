# Tasks: Testes Unitarios e Testes de API Externa

**Input**: Design documents from `/specs/003-unit-api-tests/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar os dois projetos de teste, configurar dependencias e adicionar a solution

- [x] T001 Create MonexUp.UnitTests project with xUnit + Moq dependencies in MonexUp.UnitTests/MonexUp.UnitTests.csproj (references: MonexUp.Domain, MonexUp.DTO, MonexUp.Infra.Interfaces)
- [x] T002 [P] Create MonexUp.ApiTests project with xUnit + Flurl.Http + FluentAssertions dependencies in MonexUp.ApiTests/MonexUp.ApiTests.csproj (references: MonexUp.DTO)
- [x] T003 Add both test projects to MonexUp.sln
- [x] T004 [P] Create folder structure for MonexUp.UnitTests: Services/, Factories/, Utils/
- [x] T005 [P] Create folder structure for MonexUp.ApiTests: Fixtures/, Controllers/, Helpers/

**Checkpoint**: Ambos os projetos compilam com `dotnet build` e `dotnet test` executa sem erros (0 testes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura compartilhada dos testes de API que bloqueia todas as user stories de API

- [x] T006 Create appsettings.Test.json with ApiBaseUrl, Auth (Email, Password, LoginEndpoint), and Timeout in MonexUp.ApiTests/appsettings.Test.json
- [x] T007 Create ApiTestFixture with IAsyncLifetime that authenticates once via NAuth login endpoint and exposes BaseUrl + Token in MonexUp.ApiTests/Fixtures/ApiTestFixture.cs
- [x] T008 Create ApiTestCollection with CollectionDefinition for shared fixture in MonexUp.ApiTests/Fixtures/ApiTestCollection.cs
- [x] T009 [P] Create TestDataHelper with factory methods for test DTOs (NetworkInsertInfo, OrderSearchParam, etc.) in MonexUp.ApiTests/Helpers/TestDataHelper.cs

**Checkpoint**: ApiTestFixture autentica com sucesso contra a API externa e disponibiliza token JWT

---

## Phase 3: User Story 1 - Testes Unitarios da Camada de Dominio (Priority: P1)

**Goal**: Testes unitarios dos 7 servicos de dominio com mocks de todas as dependencias

**Independent Test**: `dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~Services"`

### Implementation for User Story 1

- [x] T010 [US1] Implement InvoiceServiceTests with tests for CalculateFee (platform fee 2% on Free plan, network commission, seller fee, rounding), Insert, Pay, GetBalance, GetAvailableBalance, and error scenarios (commission already paid) in MonexUp.UnitTests/Services/InvoiceServiceTests.cs
- [x] T011 [P] [US1] Implement OrderServiceTests with tests for Insert (validation: NetworkId > 0, UserId > 0, Items not empty), Update (OrderId > 0), GetById, Get, List, Search in MonexUp.UnitTests/Services/OrderServiceTests.cs
- [x] T012 [P] [US1] Implement ProductServiceTests with tests for Insert (access validation, name/price validation, slug generation), Update, GetById, GetBySlug, GetProductInfo, Search, ListByNetwork in MonexUp.UnitTests/Services/ProductServiceTests.cs
- [x] T013 [P] [US1] Implement NetworkServiceTests with tests for Insert (name/email validation, duplicate check, slug generation, default profiles creation), Update, RequestAccess, ChangeStatus, Promote, Demote, GetById, GetBySlug, ListByStatus in MonexUp.UnitTests/Services/NetworkServiceTests.cs
- [x] T014 [P] [US1] Implement ProfileServiceTests with tests for Insert (access validation, non-empty name), Update, Delete (prevent if users linked), GetById, ListByNetwork in MonexUp.UnitTests/Services/ProfileServiceTests.cs
- [x] T015 [P] [US1] Implement ProxyPayServiceTests with tests for CreateQRCode (request construction, success/failure), CheckQRCodeStatus, SyncPendingInvoices in MonexUp.UnitTests/Services/ProxyPayServiceTests.cs
- [x] T016 [P] [US1] Implement SubscriptionServiceTests with tests for CreatePixPayment (product not found, existing order reuse, new order creation, invoice creation, QR code failure handling), CreateSubscription (NotSupportedException) in MonexUp.UnitTests/Services/SubscriptionServiceTests.cs

**Checkpoint**: Todos os testes de servicos passam. `dotnet test --filter "FullyQualifiedName~Services"` verde.

---

## Phase 4: User Story 2 - Testes Unitarios das Fabricas de Dominio (Priority: P1)

**Goal**: Testes unitarios das 8 fabricas de dominio validando criacao correta de entidades

**Independent Test**: `dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~Factories"`

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement InvoiceDomainFactoryTests testing BuildInvoiceModel creates valid IInvoiceModel in MonexUp.UnitTests/Factories/InvoiceDomainFactoryTests.cs
- [x] T018 [P] [US2] Implement InvoiceFeeDomainFactoryTests testing BuildInvoiceFeeModel creates valid IInvoiceFeeModel in MonexUp.UnitTests/Factories/InvoiceFeeDomainFactoryTests.cs
- [x] T019 [P] [US2] Implement OrderDomainFactoryTests testing BuildOrderModel creates valid IOrderModel in MonexUp.UnitTests/Factories/OrderDomainFactoryTests.cs
- [x] T020 [P] [US2] Implement OrderItemDomainFactoryTests testing BuildOrderItemModel creates valid IOrderItemModel in MonexUp.UnitTests/Factories/OrderItemDomainFactoryTests.cs
- [x] T021 [P] [US2] Implement ProductDomainFactoryTests testing BuildProductModel creates valid IProductModel in MonexUp.UnitTests/Factories/ProductDomainFactoryTests.cs
- [x] T022 [P] [US2] Implement NetworkDomainFactoryTests testing BuildNetworkModel creates valid INetworkModel in MonexUp.UnitTests/Factories/NetworkDomainFactoryTests.cs
- [x] T023 [P] [US2] Implement UserNetworkDomainFactoryTests testing BuildUserNetworkModel creates valid IUserNetworkModel in MonexUp.UnitTests/Factories/UserNetworkDomainFactoryTests.cs
- [x] T024 [P] [US2] Implement UserProfileDomainFactoryTests testing BuildUserProfileModel creates valid IUserProfileModel in MonexUp.UnitTests/Factories/UserProfileDomainFactoryTests.cs

**Checkpoint**: Todos os testes de fabricas passam. `dotnet test --filter "FullyQualifiedName~Factories"` verde.

---

## Phase 5: User Story 3 - Testes de API Externa (Priority: P2)

**Goal**: Testes de integracao dos 5 controladores usando Flurl.Http + FluentAssertions contra API externa

**Independent Test**: `dotnet test MonexUp.ApiTests/MonexUp.ApiTests.csproj` (requer API acessivel)

### Implementation for User Story 3

- [x] T025 [US3] Implement NetworkControllerTests with tests for: listAll (public, no auth), getBySlug (public), getSellerBySlug (public), insert (auth + validation), update (auth), listByUser (auth), getById (auth + not found), requestAccess (auth), changeStatus (auth + permission check), promote/demote (auth), and 401 tests for all auth endpoints in MonexUp.ApiTests/Controllers/NetworkControllerTests.cs
- [x] T026 [P] [US3] Implement OrderControllerTests with tests for: createPixPayment (auth + product slug), checkPixStatus (auth), update (auth + invalid data), search (auth + pagination), list (auth + filters), getById (auth + not found), and 401 tests in MonexUp.ApiTests/Controllers/OrderControllerTests.cs
- [x] T027 [P] [US3] Implement InvoiceControllerTests with tests for: syncronize (auth), search (auth + pagination), searchStatement (auth + filters), getBalance (auth), getAvailableBalance (auth), and 401 tests in MonexUp.ApiTests/Controllers/InvoiceControllerTests.cs
- [x] T028 [P] [US3] Implement ProfileControllerTests with tests for: insert (auth + validation), update (auth), delete (auth + users linked check), listByNetwork (auth), getById (auth + not found), and 401 tests in MonexUp.ApiTests/Controllers/ProfileControllerTests.cs
- [x] T029 [P] [US3] Implement ImageControllerTests with tests for: uploadImageUser (auth + multipart file), uploadImageNetwork (auth + networkId + file), and 401 tests in MonexUp.ApiTests/Controllers/ImageControllerTests.cs

**Checkpoint**: Todos os testes de API passam contra a URL configurada. `dotnet test MonexUp.ApiTests` verde.

---

## Phase 6: User Story 4 - Testes Unitarios dos Utilitarios (Priority: P2)

**Goal**: Testes das classes utilitarias do Core.Domain com dados validos e invalidos

**Independent Test**: `dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~Utils"`

### Implementation for User Story 4

- [x] T030 [P] [US4] Implement DocumentUtilsTests with tests for ValidarCpfOuCnpj: valid CPF (11 digits, checksum ok), invalid CPF (wrong checksum, wrong length, all same digits), valid CNPJ (14 digits, checksum ok), invalid CNPJ (wrong checksum, wrong length), null/empty input in MonexUp.UnitTests/Utils/DocumentUtilsTests.cs
- [x] T031 [P] [US4] Implement EmailValidatorTests with tests for IsValidEmail: valid emails (standard, subdomains), invalid emails (no @, no domain, spaces, multiple @), null/empty/whitespace input in MonexUp.UnitTests/Utils/EmailValidatorTests.cs
- [x] T032 [P] [US4] Implement SlugHelperTests with tests for GerarSlug: accented chars removal, special chars removal, space to hyphen, lowercase conversion, trim hyphens, empty input in MonexUp.UnitTests/Utils/SlugHelperTests.cs
- [x] T033 [P] [US4] Implement StringUtilsTests with tests for OnlyNumbers (mixed input, no numbers, empty), GenerateShortUniqueString (non-null, uniqueness across calls, base62 charset) in MonexUp.UnitTests/Utils/StringUtilsTests.cs

**Checkpoint**: Todos os testes de utilitarios passam. `dotnet test --filter "FullyQualifiedName~Utils"` verde.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final e integracao

- [x] T034 Run full unit test suite and verify all pass: `dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj`
- [x] T035 [P] Run full API test suite and verify all pass: `dotnet test MonexUp.ApiTests/MonexUp.ApiTests.csproj`
- [x] T036 Verify both projects build cleanly with no warnings: `dotnet build MonexUp.sln`
- [x] T037 Add .gitignore entries if needed for test output (TestResults/, bin/, obj/) in MonexUp.UnitTests/.gitignore and MonexUp.ApiTests/.gitignore

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on T002 (ApiTests project) - BLOCKS US3 (API tests)
- **US1 - Services (Phase 3)**: Depends on T001 (UnitTests project) - can start after Phase 1
- **US2 - Factories (Phase 4)**: Depends on T001 (UnitTests project) - can run parallel with US1
- **US3 - API Tests (Phase 5)**: Depends on Phase 2 (fixture + config) - can run parallel with US1/US2
- **US4 - Utils (Phase 6)**: Depends on T001 (UnitTests project) - can run parallel with US1/US2
- **Polish (Phase 7)**: Depends on all phases complete

### User Story Dependencies

- **US1 (Services)**: Independent - no dependency on other stories
- **US2 (Factories)**: Independent - no dependency on other stories
- **US3 (API Tests)**: Depends on Phase 2 (Foundational) for fixture - independent of US1/US2/US4
- **US4 (Utils)**: Independent - no dependency on other stories

### Within Each User Story

- All tasks marked [P] within a story can run in parallel
- Services tests (US1): all 7 test files are independent and parallel
- Factory tests (US2): all 8 test files are independent and parallel
- API tests (US3): NetworkControllerTests first (creates test data), then others in parallel
- Utils tests (US4): all 4 test files are independent and parallel

### Parallel Opportunities

- After Phase 1: US1, US2, and US4 can all start in parallel (all use MonexUp.UnitTests)
- After Phase 2: US3 can start in parallel with US1/US2/US4
- Within US1: T010-T016 can all run in parallel (7 independent test files)
- Within US2: T017-T024 can all run in parallel (8 independent test files)
- Within US3: T026-T029 can run parallel after T025
- Within US4: T030-T033 can all run in parallel (4 independent test files)

---

## Parallel Example: User Story 1 (Services)

```bash
# Launch all service tests in parallel (7 independent files):
Task T010: "InvoiceServiceTests in MonexUp.UnitTests/Services/InvoiceServiceTests.cs"
Task T011: "OrderServiceTests in MonexUp.UnitTests/Services/OrderServiceTests.cs"
Task T012: "ProductServiceTests in MonexUp.UnitTests/Services/ProductServiceTests.cs"
Task T013: "NetworkServiceTests in MonexUp.UnitTests/Services/NetworkServiceTests.cs"
Task T014: "ProfileServiceTests in MonexUp.UnitTests/Services/ProfileServiceTests.cs"
Task T015: "ProxyPayServiceTests in MonexUp.UnitTests/Services/ProxyPayServiceTests.cs"
Task T016: "SubscriptionServiceTests in MonexUp.UnitTests/Services/SubscriptionServiceTests.cs"
```

## Parallel Example: User Story 2 (Factories)

```bash
# Launch all factory tests in parallel (8 independent files):
Task T017-T024: All factory test files are independent
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 3: US1 - Service Tests (T010-T016)
3. **STOP and VALIDATE**: `dotnet test MonexUp.UnitTests --filter "FullyQualifiedName~Services"`
4. Core business logic validated with 7 service test classes

### Incremental Delivery

1. Setup (Phase 1) → Projects compile
2. US1 (Services) → Core domain logic validated (MVP!)
3. US2 (Factories) → Entity creation validated
4. US4 (Utils) → Utility functions validated
5. Phase 2 (Foundational) + US3 (API) → External API validated
6. Polish (Phase 7) → Full green suite

### Parallel Team Strategy

With multiple developers after Phase 1:
- Developer A: US1 (Services) + US2 (Factories)
- Developer B: Phase 2 (Foundational) → US3 (API Tests)
- Developer C: US4 (Utils) + Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MonexUp.UnitTests tests do NOT require API or database running
- MonexUp.ApiTests tests REQUIRE external API accessible at configured URL

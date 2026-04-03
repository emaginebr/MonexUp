# Implementation Plan: Testes Unitarios e Testes de API Externa

**Branch**: `003-unit-api-tests` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-unit-api-tests/spec.md`

## Summary

Criar dois projetos de teste separados para o MonexUp: (1) `MonexUp.UnitTests` com testes unitarios da camada de dominio usando xUnit + Moq, cobrindo 7 servicos, 8 fabricas e 4 classes utilitarias; (2) `MonexUp.ApiTests` com testes de API externa usando xUnit + Flurl.Http + FluentAssertions, cobrindo 5 controladores com fixture de autenticacao compartilhada via NAuth.

## Technical Context

**Language/Version**: C# / .NET 8.0  
**Primary Dependencies**: xUnit 2.9+, Moq 4.20+, Flurl.Http 4.x, FluentAssertions 7.x  
**Storage**: N/A (testes nao usam banco)  
**Testing**: xUnit (dotnet test)  
**Target Platform**: .NET 8.0 (cross-platform)  
**Project Type**: Test libraries (2 projetos .csproj)  
**Performance Goals**: Testes unitarios < 30s total  
**Constraints**: Testes de API requerem URL externa acessivel  
**Scale/Scope**: ~50+ testes unitarios, ~30+ testes de API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Status | Notas |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | PASS | Testes unitarios espelham camadas do dominio. Nao altera camadas existentes. |
| II. Frontend em Camadas (React) | N/A | Feature e apenas backend (.NET). |
| III. Delegacao a Projetos Externos | PASS | Submodules (NAuth, zTools) sao mockados, nao modificados. |
| IV. Configuracao e Secrets | PASS | Testes de API usam appsettings.Test.json + IConfiguration. Sem Environment.GetEnvironmentVariable(). |
| V. Internacionalizacao | N/A | Sem strings visíveis ao utilizador. |
| VI. Banco de Dados e Migrations | N/A | Testes nao alteram DB. Unitarios usam mocks. |
| VII. Registro de Dependencias | N/A | Projetos de teste nao registram servicos no Initializer.cs. |

**Gate Result**: PASS — Nenhuma violacao. Projetos de teste sao additive e nao alteram codigo existente.

## Project Structure

### Documentation (this feature)

```text
specs/003-unit-api-tests/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 - decisoes tecnicas
├── data-model.md        # Phase 1 - entidades testadas
├── quickstart.md        # Phase 1 - guia rapido
├── contracts/
│   └── api-test-endpoints.md  # Phase 1 - endpoints a testar
├── checklists/
│   └── requirements.md  # Checklist de qualidade
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
MonexUp.UnitTests/                    # NOVO - Projeto de testes unitarios
├── MonexUp.UnitTests.csproj
├── Services/
│   ├��─ InvoiceServiceTests.cs        # CalculateFee, Insert, Pay, GetBalance
│   ├── OrderServiceTests.cs          # Insert, Update, GetById, List
│   ├── ProductServiceTests.cs        # Insert, Update, GetBySlug, Search
│   ├── NetworkServiceTests.cs        # Insert, RequestAccess, ChangeStatus, Promote/Demote
│   ├── ProfileServiceTests.cs        # Insert, Update, Delete, ValidateAccess
│   ├── ProxyPayServiceTests.cs       # CreateQRCode, CheckQRCodeStatus
│   └── SubscriptionServiceTests.cs   # CreatePixPayment (orquestracao)
├── Factories/
│   ├── InvoiceDomainFactoryTests.cs
│   ├── InvoiceFeeDomainFactoryTests.cs
│   ├── OrderDomainFactoryTests.cs
│   ├── OrderItemDomainFactoryTests.cs
│   ├── ProductDomainFactoryTests.cs
│   ├── NetworkDomainFactoryTests.cs
│   ├── UserNetworkDomainFactoryTests.cs
│   └── UserProfileDomainFactoryTests.cs
└── Utils/
    ├── DocumentUtilsTests.cs         # ValidarCpfOuCnpj (CPF e CNPJ)
    ├── EmailValidatorTests.cs        # IsValidEmail
    ├── SlugHelperTests.cs            # GerarSlug
    └��─ StringUtilsTests.cs           # OnlyNumbers, GenerateShortUniqueString

MonexUp.ApiTests/                     # NOVO - Projeto de testes de API externa
├── MonexUp.ApiTests.csproj
├── appsettings.Test.json
├── Fixtures/
│   ├── ApiTestFixture.cs             # IAsyncLifetime - login NAuth
│   └���─ ApiTestCollection.cs          # CollectionDefinition
├── Controllers/
│   ├── OrderControllerTests.cs       # 6 endpoints (GET + POST)
│   ├── InvoiceControllerTests.cs     # 5 endpoints
│   ├── NetworkControllerTests.cs     # 11 endpoints (publicos + autenticados)
│   ├── ProfileControllerTests.cs     # 5 endpoints
│   └── ImageControllerTests.cs       # 2 endpoints (multipart upload)
└── Helpers/
    └── TestDataHelper.cs             # Factory de dados de teste
```

**Structure Decision**: Dois projetos de teste na raiz da solution, seguindo a convencao .NET. `MonexUp.UnitTests` referencia Domain, DTO e Infra.Interfaces. `MonexUp.ApiTests` referencia apenas DTO (para tipagem de request/response). Ambos adicionados ao MonexUp.sln.

## Complexity Tracking

Nenhuma violacao da constitution a justificar. Os dois projetos adicionais sao projetos de teste (nao de producao) e nao alteram a arquitetura existente.

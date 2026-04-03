# Research: 003-unit-api-tests

**Date**: 2026-04-02

## R1: Estrutura de Projetos de Teste xUnit em .NET 8

**Decision**: Dois projetos separados na raiz da solution: `MonexUp.UnitTests` e `MonexUp.ApiTests`.

**Rationale**: Separacao permite executar testes unitarios rapidos no CI sem depender de API externa, e rodar testes de API sob demanda ou em pipelines especificos. Seguem a convencao .NET de projetos `.Tests` na mesma solution.

**Alternatives considered**:
- Projeto unico com categorias (TraitAttribute) — descartado por dificultar execucao seletiva no CI
- Pasta tests/ com subprojetos — descartado por nao seguir convencao do repositorio atual (projetos na raiz)

## R2: Bibliotecas e Versoes

**Decision**:
- xUnit 2.9+ (framework de testes)
- Moq 4.20+ (mocking para testes unitarios)
- Flurl.Http 4.x (cliente HTTP para testes de API)
- FluentAssertions 7.x (assertions fluentes para testes de API)

**Rationale**: xUnit e o padrao .NET. Moq escolhido pelo utilizador. Flurl.Http e FluentAssertions tambem escolhidos pelo utilizador. Versoes mais recentes compativeis com .NET 8.

**Alternatives considered**:
- NSubstitute — descartado por escolha do utilizador (Moq)
- HttpClient nativo — descartado em favor de Flurl.Http (solicitado)

## R3: Padrao de Mocking dos Entity Models

**Decision**: Os models do MonexUp usam o padrao Factory — metodos como `Insert()`, `Update()`, `GetById()` estao nos proprios models e recebem factories como parametro. Para testes unitarios, os models serao mockados via suas interfaces (IOrderModel, IInvoiceModel, etc.) usando Moq.

**Rationale**: Os servicos nao acessam repositorios diretamente — eles criam models via factories e chamam metodos nos models. O mock deve estar nas interfaces dos models e factories para isolar a logica de negocio dos servicos.

**Alternatives considered**:
- Mock apenas dos repositorios — insuficiente pois servicos interagem com models, nao repositorios
- In-memory database — desnecessario para testes unitarios de servicos

## R4: Autenticacao nos Testes de API

**Decision**: Fixture compartilhada (xUnit IAsyncLifetime via CollectionFixture) que autentica uma vez no NAuth no inicio da colecao de testes e reutiliza o token JWT.

**Rationale**: Reduz chamadas de autenticacao, acelera execucao dos testes, e simula cenario real de sessao.

**Alternatives considered**:
- Token estatico em variavel de ambiente — descartado por ser menos flexivel e exigir geracao manual
- Login por teste — descartado por ser lento e desnecessario

## R5: Configuracao de URL e Credenciais

**Decision**: Arquivo `appsettings.Test.json` no projeto de testes de API com URL base, credenciais de login (email/password) e timeout. Valores podem ser sobrescritos por variaveis de ambiente para CI/CD.

**Rationale**: Padrao .NET de configuracao via IConfiguration. Permite configuracao local (appsettings) e em pipeline (env vars).

**Alternatives considered**:
- .env file — descartado por nao ser padrao .NET para projetos de teste
- Apenas env vars — descartado por dificultar desenvolvimento local

## R6: Organizacao de Testes Unitarios

**Decision**: Estrutura espelhando o projeto fonte:
- `Services/` — testes dos servicos de dominio (InvoiceServiceTests, OrderServiceTests, etc.)
- `Factories/` — testes das fabricas de dominio
- `Utils/` — testes dos utilitarios (DocumentUtils, EmailValidator, SlugHelper, StringUtils)

**Rationale**: Espelhar a estrutura do codigo fonte facilita navegacao e identificacao de cobertura.

## R7: Organizacao de Testes de API

**Decision**: Estrutura por controlador:
- `Controllers/` — um arquivo de testes por controlador (OrderControllerTests, NetworkControllerTests, etc.)
- `Fixtures/` — fixture de autenticacao e configuracao base
- `appsettings.Test.json` — configuracao

**Rationale**: Cada controlador e um grupo logico de endpoints. CollectionFixture compartilha autenticacao entre todos.

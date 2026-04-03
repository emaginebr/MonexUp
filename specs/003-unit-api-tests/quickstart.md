# Quickstart: 003-unit-api-tests

**Date**: 2026-04-02

## Estrutura dos Projetos

```text
MonexUp.UnitTests/                    # Projeto de testes unitarios
├── MonexUp.UnitTests.csproj
├── Services/
│   ├── InvoiceServiceTests.cs
│   ├── OrderServiceTests.cs
│   ├── ProductServiceTests.cs
│   ├── NetworkServiceTests.cs
│   ├── ProfileServiceTests.cs
│   ├── ProxyPayServiceTests.cs
│   └── SubscriptionServiceTests.cs
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
    ├── DocumentUtilsTests.cs
    ├── EmailValidatorTests.cs
    ├── SlugHelperTests.cs
    └── StringUtilsTests.cs

MonexUp.ApiTests/                     # Projeto de testes de API externa
├── MonexUp.ApiTests.csproj
├── appsettings.Test.json
├── Fixtures/
│   ├── ApiTestFixture.cs             # IAsyncLifetime - login NAuth
│   └── ApiTestCollection.cs          # CollectionDefinition
├── Controllers/
│   ├── OrderControllerTests.cs
│   ├── InvoiceControllerTests.cs
│   ├── NetworkControllerTests.cs
│   ├── ProfileControllerTests.cs
│   └── ImageControllerTests.cs
└── Helpers/
    └── TestDataHelper.cs             # Dados de teste reutilizaveis
```

## Dependencias dos Projetos

### MonexUp.UnitTests.csproj
- xUnit 2.9+
- xunit.runner.visualstudio
- Moq 4.20+
- Microsoft.NET.Test.Sdk
- References: MonexUp.Domain, MonexUp.DTO, MonexUp.Infra.Interfaces

### MonexUp.ApiTests.csproj
- xUnit 2.9+
- xunit.runner.visualstudio
- Flurl.Http 4.x
- FluentAssertions 7.x
- Microsoft.Extensions.Configuration
- Microsoft.Extensions.Configuration.Json
- Microsoft.Extensions.Configuration.EnvironmentVariables
- Microsoft.NET.Test.Sdk
- References: MonexUp.DTO (para DTOs de request/response)

## Comandos

```bash
# Executar testes unitarios
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj

# Executar testes de API (requer API em execucao)
dotnet test MonexUp.ApiTests/MonexUp.ApiTests.csproj

# Executar todos os testes
dotnet test MonexUp.sln

# Executar com verbosidade
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj -v normal

# Filtrar por classe de teste
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~InvoiceServiceTests"
```

## Configuracao dos Testes de API

Arquivo `MonexUp.ApiTests/appsettings.Test.json`:
```json
{
  "ApiBaseUrl": "https://api.monexup.com",
  "Auth": {
    "Email": "test@monexup.com",
    "Password": "test-password",
    "LoginEndpoint": "/auth/login"
  },
  "Timeout": 30
}
```

Variaveis de ambiente para sobrescrever (CI/CD):
- `ApiBaseUrl` — URL base da API
- `Auth__Email` — Email de autenticacao
- `Auth__Password` — Senha de autenticacao

## Padrao de Teste Unitario (Exemplo)

```csharp
public class InvoiceServiceTests
{
    private readonly Mock<IInvoiceDomainFactory> _invoiceFactory;
    private readonly Mock<IInvoiceFeeDomainFactory> _feeFactory;
    private readonly Mock<IUserClient> _userClient;
    // ... outros mocks
    private readonly InvoiceService _sut;

    public InvoiceServiceTests()
    {
        _invoiceFactory = new Mock<IInvoiceDomainFactory>();
        _feeFactory = new Mock<IInvoiceFeeDomainFactory>();
        _userClient = new Mock<IUserClient>();
        // ... setup mocks
        _sut = new InvoiceService(
            _invoiceFactory.Object,
            _feeFactory.Object,
            _userClient.Object,
            // ...
        );
    }

    [Fact]
    public void CalculateFee_WithFreePlan_ShouldIncludePlatformFee() { }

    [Fact]
    public void CalculateFee_WithNetworkCommission_ShouldCreateNetworkFee() { }
}
```

## Padrao de Teste de API (Exemplo)

```csharp
[Collection("ApiTests")]
public class NetworkControllerTests
{
    private readonly ApiTestFixture _fixture;

    public NetworkControllerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ListAll_ShouldReturnActiveNetworks()
    {
        var result = await _fixture.BaseUrl
            .AppendPathSegment("/network/listAll")
            .GetJsonAsync<List<NetworkInfo>>();

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetById_WithoutAuth_ShouldReturn401()
    {
        var action = () => _fixture.BaseUrl
            .AppendPathSegment("/network/getById/1")
            .GetAsync();

        await action.Should().ThrowAsync<FlurlHttpException>()
            .Where(e => e.StatusCode == 401);
    }
}
```

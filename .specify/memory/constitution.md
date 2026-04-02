<!--
Sync Impact Report
===================
- Version change: N/A → 1.0.0 (initial constitution)
- Modified principles: N/A (first version)
- Added sections:
  - Core Principles (7 principles)
  - Stack Tecnológico
  - Convenções de Desenvolvimento
  - Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ compatible (phase structure aligns)
  - .specify/templates/commands/ — no files present
- Follow-up TODOs: none
-->

# MonexUp Constitution

## Core Principles

### I. Arquitetura em Camadas (DDD)

Toda feature DEVE seguir a arquitetura Domain-Driven Design em camadas:

- **API** → Controllers REST, middleware de autenticação
- **Application** → Registro de DI/IoC (`Initializer.cs`), `ConfigurationParam`
- **Domain** → Lógica de negócio: Services, Models, Factories, Interfaces
- **Infra.Interfaces** → Contratos de Repository e AppServices
- **Infra** → Implementações: EF Core DbContext, Repositories, AppServices
- **DTO** → Objetos de transferência de dados, Enums

Models DEVEM receber Factories nos métodos — acesso direto a repositórios
é proibido dentro de Models. Toda nova entidade DEVE seguir a skill
`dotnet-architecture`.

### II. Frontend em Camadas (React)

O frontend DEVE seguir a arquitetura Service → Business → Context/Provider → Pages:

- **Services** → Chamadas HTTP à API (interface + implementação)
- **Business** → Lógica de domínio frontend (interface + implementação + factory)
- **Contexts** → Gerenciamento de estado via React Context API
- **Pages** → Componentes de página

Toda nova entidade frontend DEVE seguir a skill `react-architecture`.
Alertas DEVEM usar a skill `react-alert`. Modais DEVEM usar a skill
`react-modal`. Decisões de layout DEVEM seguir a skill `frontend-design`.

### III. Delegação a Projetos Externos (NON-NEGOTIABLE)

Funcionalidades de domínios específicos são gerenciadas por projetos
externos e NUNCA devem ser implementadas neste repositório:

- **NAuth** → Autenticação, ACL, criação de usuários (pacote NuGet NAuth;
  frontend: `nauth-react`). Consultar skill `nauth-guide`. Código-fonte de
  referência: `c:/repos/NAuth/NAuth` (backend), `c:/repos/NAuth/nauth-react`
  (frontend).
- **Lofn** → Produtos e e-commerce (API externa; frontend: pacote npm
  `lofn-react`). Código-fonte de referência: `c:/repos/Lofn/Lofn` (backend),
  `c:/repos/Lofn/lofn-react` (frontend).
- **Dedalo** → Templates e CMS (API externa). Implementações DEVEM ser
  feitas no projeto Dedalo, NÃO neste. Código-fonte de referência:
  `c:/repos/Dedalo/Dedalo` (backend), `c:/repos/Dedalo/dedalo-app`
  (frontend).
- **zTools** → Email (MailerSend), upload S3 (DO Spaces), slugs, validação
  de documentos (pacote NuGet). Consultar skill `ztools-guide`.
  Código-fonte de referência: `c:/repos/zTools`.
- **ProxyPay** → Pagamentos (frontend: pacote npm `proxypay-react`).
  Código-fonte de referência: `c:/repos/ProxyPay/ProxyPay` (backend),
  `c:/repos/ProxyPay/proxypay-react` (frontend).

### IV. Configuração e Secrets

- Toda configuração DEVE vir via `IConfiguration` (injetada pelo ASP.NET
  Core). NUNCA usar `Environment.GetEnvironmentVariable()` no código.
- Secrets DEVEM estar em `appsettings.{Environment}.json` ou `.env`
  (gitignored). Em Docker, variáveis de ambiente com separador `__` são
  mapeadas automaticamente.
- Frontend: variáveis DEVEM usar prefixo `REACT_APP_` (convenção CRA).

### V. Internacionalização

- O frontend DEVE suportar 4 idiomas: pt, en, es, fr via `i18next`.
- Arquivos de tradução: `public/locales/{lang}/translation.json`.
- Toda string visível ao usuário DEVE usar chaves de tradução, nunca
  texto hardcoded.
- DTOs de resposta da API usam campos em português (`sucesso`,
  `mensagemErro`, `mensagem`).

### VI. Banco de Dados e Migrations

- Entity Framework Core 9.x com PostgreSQL (Npgsql).
- Novas entidades DEVEM ser adicionadas como `DbSet` no
  `MonexUpContext.cs` e ter migration correspondente.
- Migrations: `dotnet ef migrations add <Name> --project MonexUp.Infra
  --startup-project MonexUp.API`.

### VII. Registro de Dependências

- Todo novo Service, Repository e Factory DEVE ser registrado em
  `MonexUp.Application/Initializer.cs`.
- API: lifetime Scoped. BackgroundService: lifetime Transient com
  `DbContextFactory`.
- Frontend: todo novo Service DEVE ser registrado no
  `ServiceFactory.tsx`. Todo novo Provider DEVE ser adicionado ao
  `ContextBuilder` em `App.tsx`.

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Backend | .NET 8.0, ASP.NET Core Web API |
| ORM | Entity Framework Core 9.x (Npgsql) |
| Banco de Dados | PostgreSQL |
| Frontend | React 18 + TypeScript (CRA) |
| UI Framework | Bootstrap 5 + Material-UI 6 |
| i18n | i18next (pt, en, es, fr) |
| Mobile | Capacitor 7 (Android) |
| Autenticação | NAuth (JWT, pacote NuGet + nauth-react) |
| Pagamentos | ProxyPay (proxypay-react) |
| Produtos | Lofn (API externa + lofn-react) |
| Templates/CMS | Dedalo (API externa) |
| Utilitários | zTools (email, S3, slugs — pacote NuGet) |
| Versionamento | GitVersion (ContinuousDelivery) |

## Convenções de Desenvolvimento

### Backend (.NET)

| Artefato | Convenção | Exemplo |
|----------|-----------|---------|
| Model | `{Entity}Model` | `NetworkModel` |
| Factory | `{Entity}DomainFactory` | `NetworkDomainFactory` |
| Service | `{Entity}Service` | `NetworkService` |
| Repository | `{Entity}Repository` | `NetworkRepository` |
| Interface | `I{Entity}` | `INetworkService` |
| DTO | `{Entity}Info` | `NetworkInfo` |
| Search Param | `{Entity}SearchParam` | `InvoiceSearchParam` |
| Paged Result | `{Entity}ListPagedResult` | `OrderListPagedResult` |
| Enum | `{Entity}Enum` | `InvoiceStatusEnum` |

### Frontend (React/TypeScript)

| Artefato | Caminho | Exemplo |
|----------|---------|---------|
| DTO Domain | `src/DTO/Domain/{Entity}Info.tsx` | `WithdrawalInfo.tsx` |
| Service Interface | `src/Services/Interfaces/I{Entity}Service.tsx` | `IWithdrawalService.tsx` |
| Service Impl | `src/Services/Impl/{Entity}Service.tsx` | `WithdrawalService.tsx` |
| Business Interface | `src/Business/Interfaces/I{Entity}Business.tsx` | `IWithdrawalBusiness.tsx` |
| Business Impl | `src/Business/Impl/{Entity}Business.tsx` | `WithdrawalBusiness.tsx` |
| Business Factory | `src/Business/Factory/{Entity}Factory.tsx` | `WithdrawalFactory.tsx` |
| Context | `src/Contexts/{Entity}/{Entity}Context.tsx` | `WithdrawalContext.tsx` |
| Provider | `src/Contexts/{Entity}/{Entity}Provider.tsx` | `WithdrawalProvider.tsx` |
| Page | `src/Pages/{PageName}/index.tsx` | `WithdrawalSearchPage/index.tsx` |

## Governance

- Esta constitution é o documento principal de governança do projeto
  MonexUp. Todas as specs, planos e tasks DEVEM estar em conformidade.
- Alterações nesta constitution DEVEM ser documentadas com justificativa,
  incremento de versão semântico e propagação para templates dependentes.
- Todo PR/review DEVE verificar conformidade com os princípios aqui
  definidos.
- Complexidade adicional DEVE ser justificada explicitamente (ver
  Complexity Tracking no plan-template).
- Docker NÃO está acessível no ambiente CLI — fornecer SQL/comandos
  para execução manual quando necessário.
- Consultar `CLAUDE.md` na raiz do repositório para orientações de
  desenvolvimento em tempo de execução.

**Version**: 1.0.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02

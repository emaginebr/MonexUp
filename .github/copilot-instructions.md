# MonexUp — Copilot Instructions

MonexUp is a multi-level marketing (MMN) platform: donation/subscription management, PIX payments via **ProxyPay** (not Stripe, despite older docs), and multi-level commission tracking. Monorepo: **.NET 8.0** backend + **React 18/TypeScript** frontend, with **NAuth** and **zTools** as git submodules.

## Build, test, run

```bash
# Backend
dotnet restore MonexUp.sln
dotnet build MonexUp.sln
dotnet run --project MonexUp.API/MonexUp.API.csproj
dotnet run --project MonexUp.BackgroundService/MonexUp.BackgroundService.csproj

# Unit tests (MonexUp.UnitTests) — filter to a single class/method with --filter
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~OrderServiceTests"
dotnet test MonexUp.UnitTests/MonexUp.UnitTests.csproj --filter "FullyQualifiedName~OrderServiceTests.SomeSpecificTest"

# API integration tests (MonexUp.ApiTests) — xUnit + Flurl.Http + FluentAssertions against a running API
dotnet test MonexUp.ApiTests/MonexUp.ApiTests.csproj

# EF Core migrations (MonexUp DB)
dotnet ef migrations add <Name> --project MonexUp.Infra --startup-project MonexUp.API
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API

# NAuth submodule migrations need connection string via env var
ConnectionStrings__NAuthContext="Host=localhost;Port=5432;Database=nauth_db;Username=monexup_user;Password=<password>" \
  dotnet ef database update --project submodules/NAuth/NAuth.Infra --startup-project submodules/NAuth/NAuth.API

# Frontend
cd monexup-app
npm install
npm start                 # dev server on :3000
npm run build              # production build
npm test -- --testPathPattern=<File>   # run a single Jest test file
```

Note: `dotnet` CLI commands may be blocked in some sandboxed shells ("Permission denied") — if so, state that and rely on code review/tests the user can run.

## Architecture

DDD layered architecture with Factory/Repository pattern:

```
MonexUp.API                  → ASP.NET Core Web API (controllers, NAuth middleware)
  └─ MonexUp.Application      → DI/IoC wiring (Initializer.cs), ConfigurationParam
       ├─ MonexUp.Domain       → business logic: Services, Entities, Factory (domain factories), Core
       │    └─ MonexUp.DTO     → DTOs, enums (referenced by Domain and API)
       └─ MonexUp.Infra        → EF Core DbContext + repositories (namespace is `DB.Infra`, NOT `MonexUp.Infra`)
            └─ MonexUp.Infra.Interfaces → infra-facing interfaces (repositories, app services)

MonexUp.BackgroundService     → hosted service for scheduled jobs (NCrontab)
MonexUp.UnitTests             → xUnit + Moq + EF Core InMemory, mirrors Domain/Infra structure (Services/, Factories/, Repository/, Utils/)
MonexUp.ApiTests              → xUnit + Flurl.Http + FluentAssertions, hits a running API end-to-end (Controllers/, Fixtures/, Helpers/)

monexup-app/                  → React 18 + TypeScript (CRA), see structure below

submodules/NAuth               → authentication service (do not modify — see below)
submodules/zTools               → utility microservice: email, AI (ChatGPT/DALL-E), S3-compatible upload (do not modify)
```

**Factory pattern:** every domain entity has an `I<Entity>DomainFactory` interface (`MonexUp.Domain/Factory/`, e.g. `OrderDomainFactory`, `NetworkDomainFactory`). Models are created/updated by passing a factory into model methods rather than models calling repositories directly.

**DI registration:** all repositories, services, and factories are registered in `MonexUp.Application/Initializer.cs::Configure()`. `MonexUp.API` uses scoped lifetimes (`AddDbContext`); `MonexUp.BackgroundService` uses transient lifetimes with `AddDbContextFactory` — keep this scoped/transient distinction in mind when adding new registrations.

**Auth:** custom "NAuth" scheme wired in `Initializer.cs`, JWT-based, configured via `NAuthSetting` in appsettings.

**Configuration:** all secrets/config come through `IConfiguration` from `appsettings.{Environment}.json` (`Development` locally, `Docker` in containers) — never use `Environment.GetEnvironmentVariable()` directly in application code. In Docker, `docker-compose.yml` supplies env vars using `__` as the section separator, which ASP.NET Core maps into the configuration hierarchy.

**Database:** PostgreSQL via EF Core 9.x/Npgsql, lazy-loading proxies enabled. Context: `MonexUp.Infra/Context/MonexUpContext.cs` (namespace `DB.Infra.Context`). Key entities: Users, Networks, UserNetworks (junction), Orders, OrderItems, Invoices, InvoiceFees, Withdrawals, UserProfiles.

### Lofn integration (products/e-commerce)

Product CRUD lives entirely in the separate **Lofn** project — do not add product CRUD here. MonexUp only owns the cross-link data:
- Backend reads for checkout go through `LofnProductRepository` (HTTP shim used by `OrderService`/`ProxyPayService` before issuing a PIX invoice).
- Backend writes are limited to `LofnStoreClient` (`POST {Lofn:ApiURL}/Store/insert`, lazy store provisioning) — no product writes.
- MonexUp-owned tables: `monexup_networks.lofn_store_id` (1:1, lazy on first product create) and `monexup_product_links` (idempotent on `(LofnProductId, NetworkId, UserId)`).
- MonexUp-owned endpoints: `POST /ProductLink` (201 first call / 200 on retry, idempotent on `lofnProductId`), `GET /ProductLink/by-network/{id}`, `GET /ProductLink/by-user/{id}`, `DELETE /ProductLink/by-network/{id}`.
- All requests to Lofn include header `X-Tenant-Id: monexup`. Frontend uses `lofn-react`'s `<ProductList />`/`<ProductForm />` at `/admin/products`, then calls `productLinkContext.upsert(...)`. Retry queue key: `localStorage['mnx.productLink.pending']`.
- Details: `docs/LOFN_INTEGRATION.md`.

### Dedalo integration (templates/CMS)

Templates/CMS are owned by the separate **Dedalo** project — do not add template/CMS code here. Frontend `packages/template` calls Dedalo's REST API directly (`REACT_APP_DEDALO_API_URL`, header `X-Tenant-Id: monexup`). Details: `docs/DEDALO_INTEGRATION.md`.

### Frontend structure (`monexup-app/src/`)

- `Business/` domain logic, `Contexts/` React contexts, `Services/` API clients, `DTO/` TypeScript types, `Infra/` HTTP infra, `Pages/`, `Components/`.
- Auth via `nauth-react`; payments via `proxypay-react` (PIX QR code flow).
- i18n via `i18next`, translations in `public/locales/{pt,en,es,fr}/translation.json`.
- UI: Bootstrap 5 + Material-UI 6 + FontAwesome. Mobile builds via Capacitor 7 (Android).
- Env vars follow CRA convention: must be prefixed `REACT_APP_` (e.g. `REACT_APP_PROXYPAY_API_URL`, `REACT_APP_LOFN_API_URL`, `REACT_APP_DEDALO_API_URL`).

## Conventions

- **No empty catch blocks.** `catch { }` / `catch (Exception) { }` with no side effect is forbidden in any layer. If best-effort, catch the specific exception type and log via `ILogger` (e.g. `_logger.LogWarning(ex, "context...")`); otherwise let it bubble up.
- **API response DTOs use Portuguese field names**, e.g. `sucesso` (bool success flag) and `mensagemErro` (error message) via `[JsonPropertyName(...)]` — see `MonexUp.DTO/Billing/BillingApiResult.cs`, `MonexUp.DTO/ProductLink/ProductLinkApiResult.cs`. Follow this naming for new API result DTOs. Domain code/comments frequently mix Portuguese and English.
- **Submodules (`submodules/NAuth`, `submodules/zTools`) are read-only** from this repo — never edit their code. If a submodule needs a change, tell the user to make it upstream; here you may only bump the submodule pointer (`git submodule update`).
- **Commit prefixes drive semantic versioning** (GitVersion, ContinuousDelivery mode): `major:`/`breaking:` → major, `feat:`/`feature:` → minor, `fix:`/`patch:` → patch. `version-tag.yml` tags `v{version}` on push to `main`; `create-release.yml` creates GitHub Releases for major/minor bumps only.
- **Docker is not accessible from this CLI environment** — don't run `docker`/`docker-compose`/`docker exec`. For SQL/DB operations needing a live container, hand the exact commands to the user to run manually.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MonexUp is a multi-network marketing (MMN) platform with donation/subscription management, payment processing (Stripe), and multi-level commission tracking. The codebase is a monorepo with a .NET 8.0 backend and a React 18 TypeScript frontend.

## Build & Run Commands

### Backend (.NET 8.0)

```bash
# Restore and build entire solution
dotnet restore MonexUp.sln
dotnet build MonexUp.sln

# Build specific project
dotnet build MonexUp.API/MonexUp.API.csproj
dotnet build MonexUp.BackgroundService/MonexUp.BackgroundService.csproj

# Run API (development)
dotnet run --project MonexUp.API/MonexUp.API.csproj

# Run background service
dotnet run --project MonexUp.BackgroundService/MonexUp.BackgroundService.csproj

# Publish for production
dotnet publish MonexUp.API/MonexUp.API.csproj -c Release
```

### Frontend (React / CRA)

```bash
cd monexup-app
npm install
npm start          # Dev server on port 443
npm run build      # Production build
npm test           # Jest tests
```

### Docker

```bash
# API
docker build -f MonexUp.API/Dockerfile -t monexup-api .

# Frontend
docker build -f monexup-app/Dockerfile -t monexup-app ./monexup-app
```

## Architecture

**Pattern:** Domain-Driven Design (DDD) with layered architecture and Factory/Repository patterns.

```
MonexUp.API                    → ASP.NET Core Web API (controllers, auth middleware)
  └─ MonexUp.Application       → DI/IoC setup (Initializer.cs), ConfigurationParam
       ├─ MonexUp.Domain        → Business logic: services, models, factories, interfaces
       │    ├─ Core.Domain      → Shared utilities (slugs, crypto, validators), repository interfaces
       │    └─ MonexUp.DTO      → Data transfer objects, enums
       └─ DB.Infra              → EF Core DbContext (MonexUpContext), repository implementations

MonexUp.BackgroundService      → Hosted service for scheduled tasks (NCrontab)

monexup-app/                   → React 18 + TypeScript frontend (CRA)
```

### Key architectural decisions

- **Factory pattern for models:** Each entity has a domain factory interface (e.g., `IProductDomainFactory`) used to create/update models. Models receive factories in their methods rather than using repositories directly.
- **DI registration in `MonexUp.Application/Initializer.cs`:** All repositories, services, and factories are registered here via `Configure()`. API uses scoped lifetime; BackgroundService uses transient with `DbContextFactory`.
- **NAuth for authentication:** Custom auth scheme ("NAuth") registered in `Initializer.cs`. JWT-based with `NAuthSetting` in appsettings.json.
- **Configuration via appsettings:** All secrets come from `appsettings.{Environment}.json` (Development for local, Docker for containers). No `Environment.GetEnvironmentVariable()` in the code — everything goes through `IConfiguration`. In Docker, `docker-compose.yml` passes env vars (with `__` separator) that ASP.NET Core maps into the configuration hierarchy.
- **EF Core with PostgreSQL:** Lazy loading enabled via proxies. Connection string via `ConnectionStrings:MonexUpContext` in appsettings.

### Database (PostgreSQL)

Entity Framework Core 9.x with Npgsql. Context: `DB.Infra/Context/MonexUpContext.cs`.

Key entities: Users, Networks, UserNetworks (junction), Products, Orders, OrderItems, Invoices, InvoiceFees, Withdrawals, Templates/TemplatePages/TemplateParts/TemplateVars, UserProfiles.

### Frontend structure

- **Auth:** `nauth-react` package
- **Payment:** `@stripe/react-stripe-js` with embedded checkout
- **i18n:** `i18next` with languages: pt, en, es, fr (files in `public/locales/{lang}/translation.json`)
- **UI:** Bootstrap 5 + Material-UI 6 + FontAwesome
- **Mobile:** Capacitor 7 for Android builds
- **Env vars:** React CRA convention — prefix with `REACT_APP_` (e.g., `REACT_APP_STRIPE_PUBLISHABLE_KEY`)

## Environment Variables

All secrets are in `.env` at the repo root (gitignored). Key variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — PostgreSQL connection
- `STRIPE_SECRET_KEY` — Stripe API (backend)
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` — Stripe public key (frontend, in `monexup-app/.env`)
- `MAILERSEND_API_TOKEN`, `MAILERSEND_SENDER` — Email service
- `DO_SPACES_ACCESS_KEY`, `DO_SPACES_SECRET_KEY`, `DO_SPACES_BUCKET`, `DO_SPACES_ENDPOINT` — DigitalOcean Spaces (S3-compatible storage)
- `SSL_CERT_PASSWORD` — SSL certificate for Kestrel (production only)

Copy `.env.example` to `.env` and fill in values.

## Versioning & CI/CD

- **GitVersion** (ContinuousDelivery mode) with `GitVersion.yml` config
- Commit message prefixes control version bumps: `major:` / `breaking:`, `feat:` / `feature:`, `fix:` / `patch:`
- **version-tag.yml** — Auto-creates `v{version}` tags on push to main
- **create-release.yml** — Creates GitHub releases on major/minor version changes (skips patch-only)

## EF Core Migrations

```bash
# MonexUp — list / add / apply
dotnet ef migrations list --project MonexUp.Infra --startup-project MonexUp.API
dotnet ef migrations add <Name> --project MonexUp.Infra --startup-project MonexUp.API
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API

# NAuth (submodule) — needs connection string via env var
ConnectionStrings__NAuthContext="Host=localhost;Port=5432;Database=nauth_db;Username=monexup_user;Password=<password>" \
  dotnet ef database update --project submodules/NAuth/NAuth.Infra --startup-project submodules/NAuth/NAuth.API
```

## Submodules

- **Do NOT modify submodule code.** The submodules (`submodules/NAuth`, `submodules/zTools`) are managed in their own repositories. If a change is needed in a submodule, inform the user so they can make the change in the original repository. Here you may only update the submodule pointer (i.e., `git submodule update` or advance to a newer commit).

## Tool Limitations

- **Docker is NOT accessible** from this CLI environment. Do not attempt to run `docker`, `docker-compose`, or `docker exec` commands. For database operations that require SQL execution, provide the SQL/commands for the user to run manually.

## Language

The codebase mixes Portuguese and English. Domain code, comments, and documentation are frequently in Portuguese. The API response DTOs use Portuguese field names (e.g., `sucesso`, `mensagemErro`).

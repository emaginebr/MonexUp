# Implementation Plan: Substituir Stripe pelo ProxyPay

**Branch**: `001-replace-stripe-proxypay` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-replace-stripe-proxypay/spec.md`

## Summary

Substituir toda a integração de pagamentos Stripe por ProxyPay (que usa AbacatePay como provedor). Nesta fase, apenas pagamento via PIX será implementado. O Stripe será completamente removido (código, pacotes, campos do banco). Opções de cartão e assinatura serão desabilitadas no frontend até implementação futura. O backend chamará a API REST do ProxyPay para gerar QR Codes PIX e consultar status. O frontend usará o pacote `proxypay-react` com o componente `PixPayment`.

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend), TypeScript / React 18 (frontend)
**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core 9.x, proxypay-react (frontend)
**Storage**: PostgreSQL via EF Core (Npgsql)
**Testing**: Manual testing (no automated test framework configured)
**Target Platform**: Web (Linux server for API, browser for frontend, Android via Capacitor)
**Project Type**: Web application (monorepo: .NET API + React SPA)
**Performance Goals**: Pagamento PIX concluído em < 2 minutos end-to-end
**Constraints**: ProxyPay backend deve estar acessível via HTTP; CPF obrigatório para PIX
**Scale/Scope**: Plataforma MMN com múltiplas redes e representantes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | ✅ PASS | Novo ProxyPayService segue padrão: Interface em Domain, implementação como AppService em Infra. Registrado no Initializer.cs |
| II. Frontend em Camadas (React) | ✅ PASS | Modificações seguem padrão Service → Business → Context → Pages. ProxyPayProvider adicionado ao ContextBuilder |
| III. Delegação a Projetos Externos | ✅ PASS | ProxyPay é projeto externo — MonexUp chama sua API REST. Nenhum código de pagamento implementado diretamente |
| IV. Configuração e Secrets | ✅ PASS | ProxyPay config via appsettings.json (backend) e REACT_APP_ vars (frontend) |
| V. Internacionalização | ✅ PASS | Novas strings (CPF label, mensagens de sucesso/erro PIX) usarão chaves i18next |
| VI. Banco de Dados e Migrations | ✅ PASS | Migration para remover colunas Stripe. Sem novas entidades |
| VII. Registro de Dependências | ✅ PASS | IProxyPayService registrado no Initializer.cs. ProxyPayProvider no App.tsx |

**Gate Result**: ALL PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-replace-stripe-proxypay/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Data model changes
├── quickstart.md        # Setup and validation guide
├── contracts/
│   └── api-endpoints.md # API contract changes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Backend (.NET)
MonexUp.Domain/
├── Services/
│   ├── Interfaces/
│   │   ├── IProxyPayService.cs          # NEW — replaces IStripeService
│   │   └── IStripeService.cs            # REMOVED
│   ├── ProxyPayService.cs              # NEW — HTTP client to ProxyPay API
│   ├── StripeService.cs                # REMOVED
│   ├── SubscriptionService.cs          # MODIFIED — uses IProxyPayService
│   └── InvoiceService.cs              # MODIFIED — sync via ProxyPay
├── Entities/
│   ├── InvoiceModel.cs                # MODIFIED — remove StripeId property
│   ├── OrderModel.cs                  # MODIFIED — remove StripeId property
│   ├── ProductModel.cs               # MODIFIED — remove StripeProductId, StripePriceId
│   └── Interfaces/
│       ├── IInvoiceModel.cs           # MODIFIED — remove StripeId
│       ├── IOrderModel.cs            # MODIFIED — remove StripeId
│       └── IProductModel.cs          # MODIFIED — remove Stripe fields

MonexUp.DTO/
├── Payment/
│   ├── PixPaymentRequest.cs           # NEW — documentId (CPF)
│   └── PixPaymentResult.cs           # NEW — order + QR code data

MonexUp.Infra/
├── Context/
│   ├── MonexUpContext.cs              # MODIFIED — remove Stripe column configs
│   ├── Invoice.cs                     # MODIFIED — remove stripe_id mapping
│   └── Order.cs                      # MODIFIED — remove stripe_id mapping
├── Migrations/
│   └── RemoveStripeFields.cs          # NEW — drop Stripe columns

MonexUp.Infra.Interfaces/
├── AppServices/
│   └── IProxyPayAppService.cs         # NEW — HTTP client interface

MonexUp.Application/
├── Initializer.cs                     # MODIFIED — replace Stripe → ProxyPay DI

MonexUp.API/
├── Controllers/
│   └── OrderController.cs            # MODIFIED — new PIX endpoints, remove Stripe
├── appsettings.json                   # MODIFIED — add ProxyPay, remove Stripe

MonexUp.Domain/
├── MonexUp.Domain.csproj              # MODIFIED — remove Stripe.net NuGet

# Frontend (React)
monexup-app/
├── src/
│   ├── Pages/
│   │   ├── ProductPage/
│   │   │   ├── SubscriptionForm.tsx   # REMOVED — Stripe Embedded Checkout
│   │   │   ├── PixPaymentForm.tsx     # NEW — CPF input + PixPayment component
│   │   │   └── index.tsx              # MODIFIED — use PixPaymentForm
│   │   └── CheckoutSuccessPage/
│   │       └── index.tsx              # NEW — payment confirmation page
│   ├── Contexts/
│   │   └── Order/
│   │       └── OrderProvider.tsx      # MODIFIED — remove clientSecret, add PIX methods
│   ├── Business/
│   │   └── Impl/
│   │       └── OrderBusiness.tsx      # MODIFIED — PIX methods
│   ├── Services/
│   │   └── Impl/
│   │       └── OrderService.tsx       # MODIFIED — PIX endpoints
│   ├── DTO/
│   │   └── Services/
│   │       └── SubscriptionResult.tsx # MODIFIED — replace clientSecret with QR data
│   └── App.tsx                        # MODIFIED — add ProxyPayProvider, add success route
├── package.json                       # MODIFIED — remove @stripe, add proxypay-react
└── .env                               # MODIFIED — add ProxyPay vars, remove Stripe
```

**Structure Decision**: Web application with existing monorepo structure (backend .NET + frontend React). No new projects or layers created — modifications within existing architecture.

## Complexity Tracking

> No constitution violations. No additional complexity justification needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

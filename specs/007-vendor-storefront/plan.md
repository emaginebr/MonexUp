# Implementation Plan: Vendor Storefront (Página Pública de Produtos)

**Branch**: `007-vendor-storefront` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-vendor-storefront/spec.md`

## Summary

Nova página pública por vendedor em rede — rota `/{networkSlug}/store/{vendorSlug}` — exibindo lista paginada de produtos ativos (origem Lofn) com cards em "modo vitrine" (sem navegação para detalhe). Botão por card: **Comprar** (Físico/InfoProduto) ou **Doar** (Doação). Clique no botão exige login simples (nome, e-mail, CPF) quando anônimo, então abre modal PIX do pacote `proxypay-react` que faz polling nativo do status no ProxyPay. Liquidação dispara redirecionamento para `CheckoutSuccessPage`. Backend MonexUp reaproveita `OrderController.createPixPayment/{productSlug}` (já existente). NÃO altera `SellerPage` nem `ProductPage` existentes — apenas cria nova rota/página, novo componente de card, novo formulário de login simples e novo container de modal PIX. Webhook ProxyPay → MonexUp atualiza invoice server-side independente do front.

## Technical Context

**Language/Version**: .NET 8.0 (backend), TypeScript 4.x + React 18 (frontend CRA)
**Primary Dependencies**: ASP.NET Core Web API, EF Core 9 (Npgsql), `proxypay-react`, `nauth-react`, `lofn-react`, i18next, Bootstrap 5, react-router-dom
**Storage**: PostgreSQL (MonexUp) — sem novas tabelas; produtos vêm da Lofn via HTTP
**Testing**: xUnit (`MonexUp.Tests`, `MonexUp.ApiTests`), Jest (frontend CRA)
**Target Platform**: Web (browser desktop/mobile); Android via Capacitor 7 (herdado)
**Project Type**: Web — frontend (`monexup-app`) + backend (`MonexUp.API`) já existentes
**Performance Goals**: Página completa < 3 s em 4G (SC-001); QR Code < 2 s pós-checkout (SC-002); 200 visitantes simultâneos/vendedor (SC-006)
**Constraints**: Não modificar `SellerPage` (FR-016); ProxyPay polling nativo via `proxypay-react`; idempotência server-side de invoice (FR-015)
**Scale/Scope**: 1 nova rota, 1 nova página React, 3–5 novos componentes (StorefrontCard, SimpleLoginForm, PixModalContainer, DonationAmountForm, EmptyState), 0 novas tabelas, 0 novos endpoints (reusa `Order/createPixPayment`, `Product/search` via Lofn), 0 novas migrations

## Constitution Check

Avaliação contra `.specify/memory/constitution.md` v1.0.0.

| Princípio | Status | Notas |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) — backend | ✅ PASS | Sem novo backend code (reusa `OrderController.createPixPayment`, `LofnProductRepository`). Se webhook ProxyPay já existir, sem nova camada. |
| II. Frontend em Camadas (React) | ✅ PASS | Nova página em `Pages/StorefrontPage/`; reusa `ProductContext`, `OrderContext`, `UserContext`, `AuthContext`. Nenhum novo Service/Business/Context (todos já existem para Product/Order/User). |
| III. Delegação a Projetos Externos | ✅ PASS | Produtos via Lofn (HTTP). Pagamento via ProxyPay (`proxypay-react` `<PixPayment>`). Login/cadastro via NAuth/`UserContext` existente. |
| IV. Configuração e Secrets | ✅ PASS | Reusa `REACT_APP_LOFN_API_URL`, `REACT_APP_PROXYPAY_*`, `REACT_APP_TENANT_ID` já configurados. Nada novo. |
| V. Internacionalização | ✅ PASS | Todas as strings novas via `useTranslation()`; chaves adicionadas em `public/locales/{pt,en,es,fr}/translation.json`. |
| VI. Banco de Dados e Migrations | ✅ PASS | Zero novas entidades, zero migrations. |
| VII. Registro de Dependências | ✅ PASS | Sem novos Services/Providers — Provider chain do `App.tsx` permanece. Nova `<Route>` adicionada em `App.tsx`. |

**Resultado inicial**: PASS — sem violations, sem Complexity Tracking.

**Re-check pós-Phase 1**: ver final do documento.

## Project Structure

### Documentation (this feature)

```text
specs/007-vendor-storefront/
├── plan.md              # This file
├── spec.md              # Spec (com Clarifications)
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — entidades & estados
├── quickstart.md        # Phase 1 — como rodar/testar a feature
├── contracts/
│   └── frontend-routes.md  # Rota React e contrato de URL/params
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
monexup-app/
└── src/
    ├── Pages/
    │   └── StorefrontPage/           # NEW
    │       ├── index.tsx             # rota /{networkSlug}/store/{vendorSlug}
    │       ├── StorefrontCard.tsx    # card vitrine (img + botão Comprar/Doar)
    │       ├── SimpleLoginForm.tsx   # nome + e-mail + CPF (modal de login leve)
    │       ├── DonationAmountForm.tsx# valor livre para doação aberta
    │       ├── PixModalContainer.tsx # wrapper que aciona <PixPayment> proxypay-react
    │       └── EmptyState.tsx        # estado vazio "sem produtos"
    ├── App.tsx                       # MODIFY — adicionar <Route path="store/:sellerSlug" />
    │                                 # dentro de :networkSlug
    └── (i18n)
        └── public/locales/{pt,en,es,fr}/translation.json   # MODIFY — chaves novas

MonexUp.API/                          # SEM MUDANÇAS — `Order/createPixPayment` já existe
MonexUp.Domain/                       # SEM MUDANÇAS
MonexUp.Infra/                        # SEM MUDANÇAS
MonexUp.Tests/                        # SEM MUDANÇAS (cobertura backend já cobre Order)
MonexUp.ApiTests/                     # opcional: smoke test do fluxo se ainda não houver
```

**Structure Decision**: web (frontend + backend). Backend permanece intacto — toda a entrega é frontend, reaproveitando endpoint `POST /Order/createPixPayment/{productSlug}?networkSlug=&sellerSlug=` e `POST /Product/search` (Lofn via `ProductContext.search`). Nova página isolada em `monexup-app/src/Pages/StorefrontPage/` para não colidir com `SellerPage` (FR-016).

## Phase 0: Outline & Research

### Decisões / Pesquisa (consolidada em `research.md`)

1. **Reusar endpoint `Order/createPixPayment` existente** — confirmado em `monexup-app/src/Services/Impl/OrderService.tsx:13-25` e `MonexUp.API/Controllers/OrderController.cs`. Aceita `productSlug` na rota e `networkSlug`/`sellerSlug` em query. Retorna `PixPaymentResult` com `qrCode` e `proxyPayInvoiceId`. Atribuição de comissão já tratada server-side (FR-013).
2. **`<PixPayment>` do `proxypay-react`** — componente já portado em `c:\repos\ProxyPay\proxypay-react\src\components\PixPayment.tsx` faz polling de `checkQRCodeStatus(invoiceId)` em `pollInterval` (default 10000 ms). Aceita `onSuccess`, `onError`, `onStatusChange`, `children` (trigger). FR-010a satisfeito.
3. **Filtragem de produtos por vendedor+rede** — `ProductContext.search({ userSlug, networkSlug, onlyActive: true, pageNum })` já usado em `SellerPage` (`monexup-app/src/Pages/SellerPage/index.tsx:34-49`). Mesma assinatura reutilizada na nova página.
4. **Rota** — Padrão `react-router` v6 já define `:networkSlug` como segmento base (`App.tsx:264`). Inserir nova rota `<Route path="store/:sellerSlug" element={<StorefrontPage />} />` dentro do bloco `<Route path=":networkSlug" element={<LayoutNetwork />}>`. Não colide com `:productSlug` porque "store" é literal antes do `:sellerSlug`.
5. **Login simples (nome+e-mail+CPF) sem senha** — Estratégia: criar usuário leve via `userContext.insert` (já registra usuário). Senha gerada server-side ou opcional. Decisão: usar o fluxo de cadastro mínimo existente (`UserContext.insert`) e disparar `authContext.loadUserSession()` após sucesso. Se NAuth exigir senha, gerar token temporário no momento (verificar em research). **Possível NEEDS CLARIFICATION** — endereçada na research.
6. **CPF — validação** — Reusar utilitário já presente (`zTools`/frontend). Localizar em `monexup-app/src/...` durante implementação.
7. **Redirect pós-pagamento** — `navigate('/checkout/success')` (já usado em `PixPaymentForm.tsx:46`). FR-011 satisfeito.
8. **Idempotência** — Garantida no backend MonexUp pelo `createPixPayment` atual (chave: productId+sellerId+networkId+userId+open invoice). Verificar via teste manual no quickstart.
9. **Edge case rede inativa** — `NetworkContext.getBySlug` já retorna 404 quando inativa. Página exibe `Error404Page` / estado vazio (decisão: estado vazio com mensagem amigável vs redirect → manter na própria rota com EmptyState e título "Loja indisponível").
10. **Webhook ProxyPay** — Backend MonexUp já recebe webhook e atualiza `Invoice.Status`. Sem trabalho adicional.

**Output**: research.md (a ser criada).

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

Sem novas entidades persistidas. Documenta apenas DTOs de leitura/fluxo (já existentes):

- **ProductInfo** (Lofn) — `productId`, `slug`, `name`, `description`, `price`, `imageUrl`, `status`, `productType` (1=Physical, 2=InfoProduct, 3=Donation), `donationMode`, `minimumDonationAmount`.
- **ProductListPagedResult** — `products`, `pageNum`, `pageSize`, `totalPages`, `totalCount`.
- **PixPaymentResult** (MonexUp) — `sucesso`, `mensagem`, `qrCode` (objeto com `brCode`, `brCodeBase64`, `invoiceId`, `expiredAt`), `orderId`.
- **UserInfo** (subset criado por SimpleLoginForm) — `name`, `email`, `documentId` (CPF).
- **State machine do modal PIX** — `closed → loading → qrcode → (paid|error|expired)`; controlado pelo próprio `<PixPayment>`.

### Contracts (`contracts/`)

#### `contracts/frontend-routes.md`

Rota React adicionada:

| Rota | Componente | Layout | Acesso |
|------|-----------|--------|--------|
| `/:networkSlug/store/:sellerSlug` | `StorefrontPage` | `LayoutNetwork` | Anônimo (lista) / Autenticado (pagamento) |

Reusa endpoints existentes (não há novos):

| HTTP | Endpoint | Uso |
|------|----------|-----|
| `POST` | `{Lofn:ApiURL}/Product/search` | Buscar produtos por `userSlug`+`networkSlug`+`onlyActive` (chamado por `ProductContext.search`) |
| `POST` | `{API}/Order/createPixPayment/{productSlug}?networkSlug=&sellerSlug=` | Criar invoice + QR Code (chamado por `OrderContext.createPixPayment`) |
| `GET` | `{ProxyPay}/.../qrcode/{invoiceId}` | Polling de status (interno do `proxypay-react`) |

### Quickstart (`quickstart.md`)

1. Conferir `.env` do `monexup-app/` — `REACT_APP_LOFN_API_URL`, `REACT_APP_PROXYPAY_*` preenchidos.
2. `dotnet run --project MonexUp.API/MonexUp.API.csproj` (terminal 1).
3. `cd monexup-app && npm start` (terminal 2).
4. Cadastrar vendedor em rede `network-demo` com 3 produtos ativos (1 Físico, 1 Info, 1 Doação) via admin Lofn (`/admin/products`).
5. Abrir janela anônima em `http://localhost:3000/network-demo/store/{vendorSlug}`.
6. Validar: 3 cards visíveis, botão correto por tipo, sem necessidade de login.
7. Clicar **Comprar** em produto Físico → SimpleLoginForm aparece → preencher nome+e-mail+CPF → confirmar → modal PIX abre com QR.
8. Simular liquidação no ProxyPay sandbox → modal vai a "pago" → redireciona para `/checkout/success`.
9. Repetir para Doação com valor livre (validar mínimo).
10. Cobrir edge cases: vendedor inexistente, rede inativa, expiração do QR, duplo-clique no botão (idempotência).

### Agent context update

Executar:

```powershell
.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

Acrescenta às orientações Claude/`CLAUDE.md` (entre marcadores):
- Nova página `Pages/StorefrontPage/` é vitrine pública do vendedor em rede; **não substitui** `SellerPage`.
- Rota: `/:networkSlug/store/:sellerSlug`.
- Reusa `ProductContext.search`, `OrderContext.createPixPayment`, `proxypay-react.PixPayment`.
- Não criar endpoints novos no backend para esta feature.

## Re-evaluation Constitution Check (pós-Phase 1)

| Princípio | Status | Notas |
|-----------|--------|-------|
| I. DDD backend | ✅ PASS | Sem mudanças no backend. |
| II. Frontend em Camadas | ✅ PASS | Página nova reusa contexts existentes (`Product`, `Order`, `User`, `Auth`); nenhum novo Service/Business é criado, satisfazendo Convenções de Desenvolvimento sem dispersar lógica. |
| III. Delegação | ✅ PASS | Lofn, ProxyPay, NAuth todos via pacotes oficiais. |
| IV. Config/Secrets | ✅ PASS | Nenhuma variável nova. |
| V. i18n | ✅ PASS | Strings via `t()`; chaves adicionadas em 4 idiomas. |
| VI. DB/Migrations | ✅ PASS | Zero. |
| VII. Registro DI/Providers | ✅ PASS | Sem novos providers. |

**Conclusão**: passa em todos os gates. Nenhum item para `Complexity Tracking`.

## Complexity Tracking

*Vazio — sem violations.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Próximo passo

`/speckit.tasks` para gerar `tasks.md` decomposto por User Story (P1 listagem, P1 compra PIX, P2 doação) seguindo o template tasks.

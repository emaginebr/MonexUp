# Implementation Plan: Store Product Admin

**Branch**: `006-store-product-admin` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-store-product-admin/spec.md`

## Summary

Área administrativa frontend-only para o gestor de Network gerenciar produtos da Store no Lofn. Telas: busca de produtos, cadastro (modos Simples/Avançado), categorias por Store (hierarquia 2 níveis), e tela de filtros globais (admin-only). Reuso pesado de `lofn-react` (`ProductList`, `ProductForm`, `CategoryForm`, `CategoryList`, `CategoryTree`, `ProductTypeForm`, `ProductTypeList`). Status de produto vem de `ProductStatusEnum` do Lofn (Active/Inactive/Expired). Network ativa via dropdown no header com persistência em `localStorage`. Backend MonexUp **não** muda — gestor já tem `lofnStoreId` na Network e bearer token NAuth para autenticar no Lofn.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), .NET 8.0 (backend — sem mudanças nesta feature)
**Primary Dependencies**: React 18, `lofn-react` (componentes prontos), `nauth-react`, `i18next`, Bootstrap 5 + MUI 6, `axios`
**Storage**: N/A no MonexUp (toda persistência fica no Lofn). MonexUp já guarda apenas `monexup_networks.lofn_store_id` (já existente).
**Testing**: Jest + React Testing Library (frontend); xUnit (backend, sem alterações)
**Target Platform**: SPA web (Chrome/Edge/Firefox/Safari), Capacitor 7 Android (futuro, sem mudança nesta feature)
**Project Type**: Web (frontend SPA) — backend `.NET 8.0` API existente apenas serve sessão NAuth e expõe `Network.lofnStoreId`
**Performance Goals**: SC-002 (≤ 2s CRUD), SC-005 (paginar 500 produtos em ≤ 1s próxima página)
**Constraints**: Frontend-only entrega; nenhuma rota nova no backend MonexUp; toda chamada CRUD vai direto para Lofn API com header `X-Tenant-Id: monexup` + bearer
**Scale/Scope**: Stores ~ centenas; produtos por Store ≤ 500 (target); dropdown Network suporta usuário em até ~10 redes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Aderência | Notas |
|-----------|-----------|-------|
| I. Arquitetura DDD em camadas | ✅ N/A | Sem código backend novo |
| II. Frontend em camadas (Service→Business→Context→Page) | ✅ Pass | Páginas novas usam Context existentes (`NetworkContext`, `ProductLinkContext`) e wrappers; nova `ActiveNetworkContext` segue padrão |
| III. Delegação a projetos externos | ✅ Pass | Toda lógica de produto/categoria/filtro fica no Lofn; MonexUp só compõe UI |
| IV. Configuração e Secrets | ✅ Pass | `REACT_APP_LOFN_API_URL` já configurado |
| V. i18n (pt/en/es/fr) | ⚠ Action required | Adicionar chaves novas em todos os 4 locales |
| VI. Banco e Migrations | ✅ N/A | Sem mudança de schema |
| VII. Registro de DI | ⚠ Action required | Novo provider (`ActiveNetworkProvider`) deve ser registrado no `ContextBuilder` |

**Veredito**: PASS. Itens marcados ⚠ são tarefas de implementação, não desvios.

## Project Structure

### Documentation (this feature)

```text
specs/006-store-product-admin/
├── plan.md              # This file
├── spec.md              # Feature spec (already exists)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (Lofn DTOs frontend-side)
├── quickstart.md        # Phase 1 output (manual smoke test)
├── contracts/           # Phase 1 output (Lofn endpoint contracts consumed)
│   └── lofn-endpoints-used.md
├── checklists/
│   └── requirements.md  # Already exists
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (frontend changes)

```text
monexup-app/src/
├── Components/
│   └── Admin/
│       ├── NetworkSwitcher/index.tsx                # NEW — dropdown header
│       └── ProductModeToggle/index.tsx              # NEW — Simple/Advanced toggle
├── Contexts/
│   └── ActiveNetwork/
│       ├── ActiveNetworkContext.tsx                 # NEW — networkId ativo + setter
│       └── ActiveNetworkProvider.tsx                # NEW — persistência localStorage
├── Hooks/
│   ├── useActiveNetwork.ts                         # NEW
│   └── useStoreScope.ts                             # NEW — resolve storeId, valida ownership
├── Pages/
│   └── Admin/
│       ├── ProductManagePage/index.tsx              # MODIFY — adicionar busca + modo Simples/Avançado
│       ├── ProductSearchPage/index.tsx              # NEW — tela de busca (US2)
│       ├── ProductFormPage/index.tsx                # NEW — tela de cadastro com toggle
│       ├── CategoryManagePage/index.tsx             # NEW — CRUD categorias 2 níveis
│       └── FilterManagePage/index.tsx               # NEW — admin-only (gate por isAdmin)
├── DTO/
│   ├── Domain/Admin/
│   │   ├── ProductSimpleForm.tsx                    # NEW — shape do form Simple
│   │   └── ProductAdvancedForm.tsx                  # NEW — shape do form Advanced
│   └── Enum/
│       └── ProductFormModeEnum.tsx                  # NEW — Simple|Advanced
├── App.tsx                                          # MODIFY — adicionar ActiveNetworkProvider no ContextBuilder + rotas novas
└── public/locales/{pt,en,es,fr}/translation.json    # MODIFY — chaves i18n novas
```

**Structure Decision**: Frontend-only feature. Compõe componentes do `lofn-react` dentro das páginas Admin, adicionando o gating de Network ativa, o toggle Simple/Advanced e a categoria padrão invisível. Sem backend MonexUp alterado (validado em Phase 0).

## Phase 0: Research artifacts

Ver [research.md](./research.md). Tópicos cobertos:

- Endpoints Lofn consumidos (Product, Category, ProductType=Filter, Image)
- Suporte nativo a `ParentCategoryId` (confirma 2 níveis sem mudança no Lofn)
- `ProductStatusEnum` (Active/Inactive/Expired) já exposto
- Categoria padrão lazy: estratégia de provisionamento sob demanda
- Componentes `lofn-react` reutilizáveis e gaps
- Estratégia de admin-only para filtros (claim `isAdmin` no JWT)
- Persistência de Network ativa no `localStorage`

Saída: zero `NEEDS CLARIFICATION` restantes.

## Phase 1: Design artifacts

- [data-model.md](./data-model.md) — entidades frontend (TypeScript types) e mapping para Lofn DTOs
- [contracts/lofn-endpoints-used.md](./contracts/lofn-endpoints-used.md) — superfície Lofn consumida
- [quickstart.md](./quickstart.md) — passo a passo manual (login → cadastrar produto Simple → editar Advanced → criar categoria → admin cria filtro)

Após Phase 1, agent context atualizado via `update-agent-context.ps1`.

## Complexity Tracking

Sem violations. Tabela vazia.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_ | _(none)_ | _(none)_ |

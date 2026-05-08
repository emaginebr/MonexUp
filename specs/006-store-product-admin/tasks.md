---
description: "Task list for Store Product Admin feature"
---

# Tasks: Store Product Admin

**Input**: Design documents from `/specs/006-store-product-admin/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/lofn-endpoints-used.md, quickstart.md

**Tests**: Spec não solicita testes automatizados — tarefas focam em entrega + smoke manual via `quickstart.md`. Adicionar testes Jest opcionalmente em Phase Polish.

**Organization**: Tarefas organizadas por User Story (US1..US5). MVP = Phase 1+2+3 (US1).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: paralelizável (arquivos distintos, sem dependência incompleta)
- **[Story]**: presente apenas em fases de US (US1..US5)
- Caminhos absolutos sob `monexup-app/src/...`

## Path Conventions

- Frontend-only: `monexup-app/src/`
- Locales: `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

---

## Phase 1: Setup (Project initialization)

- [x] T001 Verify `lofn-react` package version installed in `monexup-app/package.json` (consult `c:/repos/Lofn/lofn-react/package.json` for current version); upgrade with `npm install lofn-react@latest --legacy-peer-deps` if outdated
- [x] T002 Confirm `REACT_APP_LOFN_API_URL` populated in `monexup-app/.env` and `.env.production`; add to `.env.example` if missing
- [x] T003 [P] Create folder skeleton: `monexup-app/src/Pages/Admin/{ProductSearchPage,ProductFormPage,CategoryManagePage,FilterManagePage}/`, `monexup-app/src/Components/Admin/{NetworkSwitcher,ProductModeToggle}/`, `monexup-app/src/Contexts/ActiveNetwork/`, `monexup-app/src/Hooks/`, `monexup-app/src/DTO/Domain/Admin/`

---

## Phase 2: Foundational (blocking prerequisites)

**Goal**: criar contexto de Network ativa, hooks de scope/admin, i18n keys e rotas Admin antes de qualquer página de US.

- [x] T010 Create `monexup-app/src/DTO/Enum/ProductFormModeEnum.tsx` with enum `Simple` / `Advanced`
- [x] T011 [P] Create `monexup-app/src/DTO/Domain/Admin/ProductSimpleForm.tsx` and `ProductAdvancedForm.tsx` per `data-model.md` E2/E3
- [x] T012 [P] Create `monexup-app/src/DTO/Domain/Admin/CategoryNode.tsx` per `data-model.md` E4
- [x] T013 Create `monexup-app/src/Contexts/ActiveNetwork/ActiveNetworkContext.tsx` exporting `ActiveNetworkState` shape (per `data-model.md` E5)
- [x] T014 Create `monexup-app/src/Contexts/ActiveNetwork/ActiveNetworkProvider.tsx` reading `localStorage.mnx.activeNetworkId`, falling back to first Network from `NetworkContext.userNetworks`, exposing `setActiveNetwork(networkId)` that persists to localStorage and triggers re-render
- [x] T015 [P] Create `monexup-app/src/Hooks/useActiveNetwork.ts` returning `useContext(ActiveNetworkContext)`
- [x] T016 [P] Create `monexup-app/src/Hooks/useStoreScope.ts` returning `{storeId, storeSlug, isReady, needsProvisioning}` derived from `useActiveNetwork().activeNetwork.lofnStoreId`
- [x] T017 [P] Create `monexup-app/src/Hooks/useIsAdmin.ts` returning `authContext.sessionInfo?.isAdmin === true`
- [x] T018 [P] Create `monexup-app/src/Components/Admin/RequireAdmin/index.tsx` HOC redirecting to `/` via `<Navigate>` when `!useIsAdmin()`
- [x] T019 Register `<ActiveNetworkProvider>` in `monexup-app/src/App.tsx` `ContextBuilder` array between `NetworkProvider` and `ProductProvider`
- [x] T020 Add admin routes in `monexup-app/src/App.tsx` (under existing admin guard): `/admin/products` (existing), `/admin/products/new`, `/admin/products/:productId/edit`, `/admin/categories`, `/admin/filters` (wrapped in `<RequireAdmin>`)
- [x] T021 [P] Add i18n keys namespace `admin_product.*` to `monexup-app/public/locales/pt/translation.json` (title, mode toggle, simple/advanced labels, advanced-data warning, delete confirmations, empty states, error toasts, network switcher)
- [x] T022 [P] Mirror keys from T021 in `monexup-app/public/locales/en/translation.json`
- [x] T023 [P] Mirror keys from T021 in `monexup-app/public/locales/es/translation.json`
- [x] T024 [P] Mirror keys from T021 in `monexup-app/public/locales/fr/translation.json`
- [x] T025 Create `monexup-app/src/Components/Admin/NetworkSwitcher/index.tsx`: dropdown that lists `availableNetworks` from `useActiveNetwork()`, hidden when length < 2, calls `setActiveNetwork(id)` on change

**Checkpoint**: Phase 2 completo → Network switcher renderiza, hooks funcionam, rotas registradas, i18n pronta. US podem começar.

---

## Phase 3: User Story 1 — Manager edits products via Simple mode (Priority: P1) 🎯 MVP

**Story Goal**: Gestor cadastra/edita produto rapidamente via modo Simples (nome + preço + 1 foto), com categoria padrão `_default` criada lazy e invisível.

**Independent Test**: Login → `/admin/products/new` → modo Simples → preenche e salva → produto aparece na lista da Store. Categoria `_default` criada no Lofn (verificar via API direto), nunca exposta na UI.

- [x] T030 [US1] Implement `monexup-app/src/Components/Admin/ProductModeToggle/index.tsx` — toggle button-group Simple/Advanced controlado por prop `mode` + `onModeChange`
- [x] T031 [US1] Implement helper `monexup-app/src/Hooks/useDefaultCategory.ts` — searches Lofn categories of current Store for `name === "_default"`; if absent, creates via `POST {Lofn}/Category/{storeSlug}/insert` with `{name:"_default", parentCategoryId:null}` and returns `categoryId`. Memoize per storeId in module-scope cache to avoid duplicate creation
- [x] T032 [US1] Create simple form sub-component `monexup-app/src/Pages/Admin/ProductFormPage/SimpleForm.tsx` — fields: `name`, `description?`, `price`, single image uploader (uses `<ProductImageManager />` with `maxImages=1` from lofn-react), `status` toggle Active/Inactive
- [x] T033 [US1] Implement `monexup-app/src/Pages/Admin/ProductFormPage/index.tsx` orchestrator: reads `:productId` from route, fetches product if editing, renders `<ProductModeToggle>` + `<SimpleForm>` (or `<AdvancedForm>` placeholder until US3), handles submit → calls `useDefaultCategory()` to obtain default `categoryId`, builds `ProductInsertInfo`/`UpdateInfo`, calls Lofn endpoint via `lofn-react` service hooks, shows toast (sonner/MessageToast)
- [x] T034 [US1] Wire `ProductFormPage` to existing `ProductLinkContext.upsert(productId, networkId, userId)` after successful create — preserves existing MonexUp link mechanism
- [x] T035 [US1] Update `monexup-app/src/Pages/Admin/ProductManagePage/index.tsx` "Novo produto" button to navigate to `/admin/products/new` instead of inline state
- [x] T036 [US1] Implement gating in `ProductFormPage`: if `useStoreScope().needsProvisioning === true`, render CTA "Provisione sua loja primeiro" linking to existing provisioning flow; if `!isReady`, render spinner
- [x] T037 [US1] Implement gating: page redirects to `/` when active Network's user role is not `NetworkManager` (consult `networkContext.currentRole`)

**Checkpoint US1**: Gestor consegue criar e editar produtos em modo Simples ponta a ponta. MVP shippable.

---

## Phase 4: User Story 2 — Manager searches and removes products (Priority: P1)

**Story Goal**: Lista paginada/buscável dos produtos da Store + delete com confirmação.

**Independent Test**: `/admin/products` → digitar termo → lista filtra → excluir item → some.

- [ ] T040 [US2] Create `monexup-app/src/Pages/Admin/ProductSearchPage/index.tsx` using `<ProductList storeId={...} />` from `lofn-react`, passing query/page state; add search input (debounced 300ms) + status filter dropdown (Active/Inactive/Expired/All)
- [ ] T041 [US2] Implement pagination state in `ProductSearchPage`: pageNum/pageSize=25, page navigation buttons, preserves search/filter on page change
- [ ] T042 [US2] Implement delete action: row button → `<Modal>` confirmation (use existing `react-modal` skill component) → on confirm call Lofn `DELETE /Product/{storeSlug}/delete/{productId}` (verify exact path in `c:/repos/Lofn/Lofn/Lofn.API/Controllers/ProductController.cs`) → refetch list → toast
- [ ] T043 [US2] Add empty state: when query returns 0 items, show "Nenhum produto encontrado" + CTA "Cadastrar primeiro produto" linking to `/admin/products/new`
- [ ] T044 [US2] Replace existing inline list rendering in `ProductManagePage` with redirect/link to `/admin/products` (now `ProductSearchPage`); keep ProductManagePage as router shell or deprecate
- [ ] T045 [US2] Filter `_default` category from any category labels rendered in product rows (don't show as badge)

**Checkpoint US2**: CRUD básico (sem advanced/categories/filters próprios) completo.

---

## Phase 5: User Story 4 — Manager creates Store-scoped categories (Priority: P2)

> Implementada antes de US3 porque US3 depende de categorias existirem para serem selecionadas.

**Story Goal**: CRUD de categorias com hierarquia 2 níveis, isoladas por Store, ocultando `_default`.

**Independent Test**: `/admin/categories` → criar pai + sub → aparecem no dropdown do ProductForm Avançado; outro gestor de outra Store não vê estas.

- [ ] T050 [US4] Create `monexup-app/src/Pages/Admin/CategoryManagePage/index.tsx` using `<CategoryTree />` from `lofn-react` for visualization; passes `storeSlug` from `useStoreScope()`
- [ ] T051 [US4] Wrap `<CategoryTree>` filter pre-display: hide nodes where `name === "_default"` (apply via `transform` prop or by post-processing the data feed)
- [ ] T052 [US4] Implement "Nova categoria" button → modal with `<CategoryForm storeSlug parentOptions />` from `lofn-react`; restrict `parentCategoryId` options to nodes where `parentCategoryId === null` (only level 1 can be parent)
- [ ] T053 [US4] On `<CategoryForm>` save attempt, validate frontend: if `parentCategoryId` references a node that itself has `parentCategoryId !== null`, block save with error toast "Profundidade máxima 2 níveis"
- [ ] T054 [US4] Implement edit category: row → opens `<CategoryForm>` pre-filled; same depth validation applies
- [ ] T055 [US4] Implement delete category: row → confirmation modal showing `{ subcategoriesCount, productsAffectedCount }` (fetch counts beforehand); options: cascade delete (sends recursive delete) or cancel
- [ ] T056 [US4] Update `ProductFormPage` (advanced placeholder from T033) to fetch Store categories and expose them; placeholder still inert in this phase

**Checkpoint US4**: Gestor mantém categorias próprias; `_default` permanece invisível; isolamento por Store validado.

---

## Phase 6: User Story 3 — Manager uses Advanced mode (Priority: P2)

**Story Goal**: Modo Avançado com múltiplas fotos, categoria escolhida, valores de filtros globais, descrição rica; salvar Avançado em modo Simples preserva campos avançados.

**Independent Test**: Cadastra produto Avançado com 3 fotos + categoria + 1 filtro → vitrine mostra com facetas. Reabrir em Simples mostra aviso, salvar não destrói dados avançados.

- [ ] T060 [US3] Create `monexup-app/src/Pages/Admin/ProductFormPage/AdvancedForm.tsx` wrapping `<ProductForm storeSlug product />` from `lofn-react`; passes `categories` (from US4 fetch) and `productTypes` (from Lofn `GET /ProductType/list`) as available options
- [ ] T061 [US3] Wire `<ProductForm>` to use `<ProductImageManager>` with `maxImages` unrestricted (or sane upper bound, e.g. 10), preserving image order
- [ ] T062 [US3] Implement filter selection UI: dropdown of `ProductType[]` (read-only — no create/edit buttons here per FR-030); for each selected ProductType, multi-select of its `FilterValue[]`
- [ ] T063 [US3] In `ProductFormPage` orchestrator (T033), branch on `mode`: render `SimpleForm` or `AdvancedForm`; on toggle change preserve form values where compatible
- [ ] T064 [US3] Implement preservation logic (FR-037): when `mode === Simple` AND product has `images.length > 1` OR `categoryId !== _defaultId` OR `productTypes.length > 0`, before save GET current product from Lofn, merge Simple fields (`name/description/price/status/images[0]`) over fetched object, send full `ProductUpdateInfo` so non-Simple fields stay intact
- [ ] T065 [US3] Implement advanced-data warning (FR-018): when opening existing product whose data exceeds Simple capacity AND user toggles to Simple, show alert banner "Este produto tem dados avançados não editáveis aqui — abra em Avançado para vê-los"
- [ ] T066 [US3] Default `mode = Advanced` when editing product that already has multi-photo OR non-default categoryId OR productTypes; default `mode = Simple` for new products
- [ ] T067 [US3] Surface product `status` Active/Inactive toggle in `AdvancedForm`; expose `Expired` as read-only badge (FR-039/FR-040)

**Checkpoint US3**: Modo Avançado funcional ponta a ponta; co-existência Simple/Advanced segura.

---

## Phase 7: User Story 5 — Admin manages global filters (Priority: P3)

**Story Goal**: Tela admin-only para CRUD de `ProductType` (filtros) e seus valores.

**Independent Test**: Login admin → `/admin/filters` → criar filtro com 3 valores; gestor não-admin não vê controles.

- [ ] T070 [US5] Create `monexup-app/src/Pages/Admin/FilterManagePage/index.tsx` using `<ProductTypeList />` from `lofn-react`; route already wrapped in `<RequireAdmin>` (T020)
- [ ] T071 [US5] Add "Novo filtro" button → modal with `<ProductTypeForm />` from `lofn-react` calling Lofn `POST /ProductType/insert`
- [ ] T072 [US5] Implement edit filter: row → modal with `<ProductTypeForm>` pre-filled; submit calls `POST /ProductType/update`
- [ ] T073 [US5] Implement delete filter: row → confirmation showing `productsAffectedCount` (from Lofn, if exposed; else generic warning) → `DELETE /ProductType/delete/{id}`
- [ ] T074 [US5] Embed `<ProductTypeFilterEditor />` from `lofn-react` per filter row to manage values (`POST /ProductType/{id}/filter/insert`, `POST /ProductType/filter/update`, `DELETE /ProductType/filter/delete/{filterId}`)
- [ ] T075 [US5] Add menu link to `/admin/filters` in `monexup-app/src/Components/AdminSidebar.tsx`, conditionally rendered when `useIsAdmin() === true`

**Checkpoint US5**: Filtros globais administráveis; gestor consome (US3) sem ver controles.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T080 Add loading skeletons to `ProductSearchPage`, `CategoryManagePage`, `FilterManagePage` while initial fetch pending
- [ ] T081 [P] Add error boundary `monexup-app/src/Components/Admin/AdminErrorBoundary/index.tsx` wrapping all `/admin/*` routes; logs to console + toast on uncaught render error
- [ ] T082 [P] Add Lofn-down handling: when fetch throws/timeout, render banner "Lofn indisponível, tente novamente" with retry button; never leave spinner infinito (SC-007)
- [ ] T083 [P] Run accessibility audit on new pages (axe DevTools); fix labels, ARIA roles, keyboard navigation issues
- [ ] T084 [P] Add menu links in `monexup-app/src/Components/AdminSidebar.tsx`: Produtos (`/admin/products`), Categorias (`/admin/categories`), Filtros (`/admin/filters` only if admin)
- [ ] T085 [P] Update `monexup-app/src/Components/Menu.tsx` mobile menu mirror of T084
- [ ] T086 Verify all toasts use existing `MessageToast`/sonner pattern; replace any `alert()` accidentally introduced
- [ ] T087 Run smoke tests from `quickstart.md` (1–6) end-to-end against staging Lofn; document any regressions
- [ ] T088 [P] Add Jest test `monexup-app/src/Hooks/__tests__/useDefaultCategory.test.ts` covering: cache hit, cache miss → create, second call within session uses cache
- [ ] T089 [P] Add Jest test `monexup-app/src/Contexts/ActiveNetwork/__tests__/ActiveNetworkProvider.test.tsx` covering: initial fallback to first Network, localStorage persistence, swap triggers state change
- [ ] T090 Update `docs/LOFN_INTEGRATION.md` with the admin pages/routes added by this feature

**Checkpoint Polish**: Smoke tests passam; SC-001..SC-007 verificáveis; UX consistente.

---

## Dependencies

```text
Phase 1 (Setup)               → Phase 2 (Foundational)
Phase 2 (Foundational)        → Phase 3 (US1)
Phase 3 (US1) ─┐
Phase 4 (US2) ─┼── independentes entre si após Phase 2
Phase 5 (US4) ─┘
Phase 5 (US4)                 → Phase 6 (US3)        [US3 precisa de categorias]
Phase 6 (US3)                 → Phase 7 (US5)        [US5 não bloqueia US3, mas dropdown de filtros em US3 fica vazio até US5 popular]
                Polish (Phase 8) depende de US1..US5
```

MVP shippable após Phase 3 (US1). US2 segue logo depois (CRUD básico). US4+US3 entregam valor avançado. US5 fecha admin de filtros.

---

## Parallel Execution Examples

**Phase 2 paralelo:**

```text
T011 [P] DTOs Admin
T012 [P] CategoryNode
T015 [P] useActiveNetwork
T016 [P] useStoreScope
T017 [P] useIsAdmin
T018 [P] RequireAdmin
T021..T024 [P] i18n locales (4 arquivos)
```

**Phase 8 paralelo:**

```text
T081, T082, T083, T084, T085, T088, T089 — todos arquivos distintos
```

**Sequencial obrigatório:** T013 → T014 → T019 (Provider precisa do Context); T040 → T041 → T042 (mesma página); T060 → T063 (Advanced precisa antes do orchestrator branch).

---

## Implementation Strategy

1. **Sprint 1 — MVP (Phase 1+2+3)**: Setup + Foundational + US1. Gestor consegue criar produto Simple. Ship.
2. **Sprint 2 — CRUD completo (Phase 4)**: US2 — busca + delete.
3. **Sprint 3 — Categorias + Avançado (Phase 5+6)**: US4 antes (categorias existem), depois US3 consome.
4. **Sprint 4 — Admin filtros (Phase 7)**: US5.
5. **Sprint 5 — Polish (Phase 8)**: a11y, error boundary, smoke, docs.

---

## Format Validation

Todas as tarefas seguem o padrão `- [ ] TXXX [P?] [USx?] descrição com caminho`. ✓

| Tipo de fase | Total |
|--------------|-------|
| Setup (Phase 1) | 3 (T001–T003) |
| Foundational (Phase 2) | 16 (T010–T025) |
| US1 (Phase 3) | 8 (T030–T037) |
| US2 (Phase 4) | 6 (T040–T045) |
| US4 (Phase 5) | 7 (T050–T056) |
| US3 (Phase 6) | 8 (T060–T067) |
| US5 (Phase 7) | 6 (T070–T075) |
| Polish (Phase 8) | 11 (T080–T090) |
| **Total** | **65 tasks** |

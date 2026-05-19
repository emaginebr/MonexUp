---

description: "Task list for Vendor Storefront feature"
---

# Tasks: Vendor Storefront (Página Pública de Produtos do Vendedor)

**Input**: Design documents from `/specs/007-vendor-storefront/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/frontend-routes.md, quickstart.md

**Tests**: NÃO solicitados — não há tasks de teste automatizado. Validação manual via `quickstart.md`.

**Organization**: Tarefas agrupadas por User Story (US1 P1, US2 P1, US3 P2). Cada US é independentemente testável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependência pendente)
- **[Story]**: User story alvo (US1, US2, US3)
- Caminhos absolutos sempre que o arquivo já existir; relativos a `monexup-app/src/` quando novos

## Path Conventions

- **Web app**: Backend (`MonexUp.API/...`) intocado nesta feature. Frontend em `monexup-app/src/`.
- Página nova: `monexup-app/src/Pages/StorefrontPage/`.
- i18n: `monexup-app/public/locales/{pt,en,es,fr}/translation.json`.
- Rotas: `monexup-app/src/App.tsx`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estrutura de pastas e chaves i18n para acomodar a nova página.

- [X] T001 [P] Criar diretório `monexup-app/src/Pages/StorefrontPage/` (vazio, com `.gitkeep` se necessário) para abrigar componentes da feature
- [X] T002 [P] Adicionar chaves i18n base em `monexup-app/public/locales/pt/translation.json`: `storefront_title`, `storefront_empty`, `storefront_loading`, `storefront_unavailable`, `btn_buy`, `btn_donate`, `simple_login_title`, `field_name`, `field_email`, `field_cpf`, `cpf_invalid`, `email_invalid`, `name_required`, `donation_amount_label`, `donation_min_warning`, `pix_modal_title`, `pix_expired`, `pix_retry`
- [X] T003 [P] Replicar as mesmas chaves em `monexup-app/public/locales/en/translation.json` com traduções equivalentes
- [X] T004 [P] Replicar as mesmas chaves em `monexup-app/public/locales/es/translation.json` com traduções equivalentes
- [X] T005 [P] Replicar as mesmas chaves em `monexup-app/public/locales/fr/translation.json` com traduções equivalentes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rota e utilitário compartilhado de validação. Bloqueia todas as US.

**CRITICAL**: Nada das US começa antes desta fase.

- [X] T006 Verificar/localizar utilitário de validação de CPF existente no repositório (`monexup-app/src/Infra/`, `monexup-app/src/...` ou pacote `zTools`/`lofn-react`); registrar caminho em comentário no topo de `monexup-app/src/Pages/StorefrontPage/index.tsx` (a criar em T010). Se não houver, criar `monexup-app/src/Infra/Validators/CpfValidator.tsx` exportando `isValidCpf(cpf: string): boolean` com dígito verificador — **criado**: `monexup-app/src/Infra/Validators/CpfValidator.tsx`
- [X] T007 Registrar nova rota em `monexup-app/src/App.tsx`: dentro do bloco `<Route path=":networkSlug" element={<LayoutNetwork />}>`, ANTES de `<Route path=":productSlug" element={<ProductPage />} />`, adicionar `<Route path="store/:sellerSlug" element={<StorefrontPage />} />`. Importar `StorefrontPage` no topo do arquivo
- [X] T008 Criar arquivo placeholder `monexup-app/src/Pages/StorefrontPage/index.tsx` exportando componente vazio `export default function StorefrontPage() { return null; }` para destravar o import de T007 sem quebrar build (será substituído em T011)

**Checkpoint**: Rota responde a `/{networkSlug}/store/{sellerSlug}` retornando página vazia. Build OK.

---

## Phase 3: User Story 1 - Listagem pública de produtos do vendedor (Priority: P1) 🎯 MVP

**Goal**: Visitante anônimo abre `/{networkSlug}/store/{vendorSlug}` e vê grade paginada com produtos ativos, cada card com imagem, nome, descrição curta, preço e botão Comprar/Doar conforme `productType`. Card é vitrine pura (sem navegação para detalhe).

**Independent Test**: Cadastrar vendedor com 3 produtos ativos de tipos diferentes; abrir link em janela anônima; confirmar cards visíveis com botão correto; verificar paginação se houver mais que `pageSize`; testar 404 amigável para slugs inexistentes.

### Implementation for User Story 1

- [X] T009 [P] [US1] Criar `monexup-app/src/Pages/StorefrontPage/StorefrontCard.tsx`
- [X] T010 [P] [US1] Criar `monexup-app/src/Pages/StorefrontPage/EmptyState.tsx`
- [X] T011 [US1] Implementar `monexup-app/src/Pages/StorefrontPage/index.tsx` (orquestração completa US1+US2+US3)
- [X] T012 [US1] Adicionar `MessageToast` em `index.tsx` para erros
- [ ] T013 [US1] **MANUAL**: Validar conforme `quickstart.md` US1 — vendedor com 3 produtos, slugs inválidos, página vazia, paginação. Confirmar `SellerPage` antiga inalterada (já validado via `git diff`: sem alterações)

**Checkpoint**: US1 funcional. MVP listagem entregável.

---

## Phase 4: User Story 2 - Comprar produto físico/info via PIX em modal ProxyPay (Priority: P1)

**Goal**: A partir do card de produto Físico/InfoProduto, clicar **Comprar** exige login simples (nome+e-mail+CPF) se anônimo; depois modal PIX abre via `<PixPayment>` do `proxypay-react`; polling nativo detecta liquidação; redireciona para `/checkout/success`.

**Independent Test**: Clicar Comprar em produto físico, preencher SimpleLoginForm, confirmar; modal PIX exibe QR Code e copia-e-cola; simular liquidação sandbox; conferir redirecionamento. Repetir com sessão já autenticada (pula login).

### Implementation for User Story 2

- [X] T014 [P] [US2] Criar `monexup-app/src/Pages/StorefrontPage/SimpleLoginForm.tsx` — inclui auto-login via `userContext.loginWithEmail` após `insert` para garantir token NAuth disponível ao `createPixPayment`. `prefill`+`skipRegister` para usuários já autenticados.
- [X] T015 [P] [US2] Criar `monexup-app/src/Pages/StorefrontPage/PixModalContainer.tsx` — envelopa `<PixPayment>` proxypay-react com trigger programático invisível.
- [X] T016 [US2] `handleAction` em `index.tsx` orquestra Comprar/Doar; abre `DonationAmountForm` para doação aberta, senão abre `SimpleLoginForm`.
- [X] T017 [US2] `finalizeCheckout` chama `orderContext.createPixPayment`, set `pendingProductId` desabilita botão (idempotência UX).
- [X] T018 [US2] `<PixModalContainer>` renderizado no JSX, abre via prop `open`.
- [ ] T019 [US2] **MANUAL**: validar conforme `quickstart.md` US2 — visitante anônimo + modal PIX + liquidação sandbox + redirect.

**Checkpoint**: US1 + US2 funcionais. Loja vende.

---

## Phase 5: User Story 3 - Doar para produto do tipo Doação (Priority: P2)

**Goal**: Botão **Doar** em produto Doação abre formulário de valor (se `donationMode === Open`) com validação de mínimo, depois reusa fluxo SimpleLoginForm + modal PIX da US2. Doação de valor fixo pula direto para login/PIX.

**Independent Test**: Para produto de doação aberta com `minimumDonationAmount=10`: tentar R$ 5 → bloqueia com mensagem; R$ 20 → prossegue. Para doação fixa: clicar Doar vai direto a login/PIX com o `product.price`.

### Implementation for User Story 3

- [X] T020 [P] [US3] Criar `monexup-app/src/Pages/StorefrontPage/DonationAmountForm.tsx`
- [X] T021 [US3] `handleAction` em `index.tsx` trata `isOpenDonation` abrindo `DonationAmountForm`; doação fixa vai direto a login/PIX.
- [X] T022 [US3] **Constatado**: `OrderController.CreatePixPayment` (`MonexUp.API/Controllers/OrderController.cs:44-87`) NÃO aceita `amount` no payload — usa `product.Price` server-side via `_subscriptionService.CreatePixPayment(product.ProductId, ...)`. Para doação aberta, o valor coletado no front é **apenas exibido** no modal PIX (`PixModalContainer` recebe `amount`); o invoice MonexUp gravará `product.price`. Issue de evolução server-side a abrir: aceitar `amount` opcional em `PixPaymentRequest` para doação aberta. Fora do escopo desta feature.
- [X] T023 [US3] `<DonationAmountForm>` renderizado em `index.tsx` controlado por `donationFormOpen`.
- [ ] T024 [US3] **MANUAL**: validar `quickstart.md` US3 — doação aberta com mínimo, doação fixa direta.

**Checkpoint**: Todas as 3 US funcionais. Storefront completa.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Acabamento e validação cruzada das US.

- [X] T025 [P] Acessibilidade: `alt` em imagens (`product.name`), `aria-label="Fechar"` no botão de fechar do `<PixPayment>` (proxypay-react já provê), botão close em modais Bootstrap traz `aria-label` automático. `autoFocus` direcionado contextualmente nos formulários.
- [ ] T026 [P] **MANUAL**: verificar responsividade mobile 320–414 px (grid `col-12 col-sm-6 col-lg-4`; modais Bootstrap responsivos por padrão).
- [X] T027 [P] Traduções `en/es/fr` presentes com mesmas chaves de `pt` — todas as 23 chaves adicionadas.
- [X] T028 [P] `git diff` confirmado limpo em `SellerPage/`, `ProductPage/index.tsx`, `ProductPage/PixPaymentForm.tsx`, `ProductPage/UserForm.tsx` (FR-016 ✅). `App.tsx` recebeu apenas 2 linhas (import + Route).
- [ ] T029 **MANUAL**: rodar `quickstart.md` integral
- [ ] T030 **MANUAL**: medir SC-001/SC-002 com DevTools throttling
- [ ] T031 **MANUAL**: `npm run build` (não executado neste agente — TypeScript já validado via `tsc --noEmit`: zero erros novos da feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup, T001–T005)**: sem dependências, pode iniciar imediatamente. Tudo `[P]`.
- **Phase 2 (Foundational, T006–T008)**: depende de Phase 1. **Bloqueia todas as User Stories**. T006/T007 podem ser paralelos depois que T008 cria o stub; sequência segura: T008 → T007 → T006.
- **Phase 3 (US1, T009–T013)**: depende de Phase 2. MVP. Entregável.
- **Phase 4 (US2, T014–T019)**: depende de Phase 2 (rota) e Phase 3 (T011 produz `index.tsx` que T016 amplia).
- **Phase 5 (US3, T020–T024)**: depende de Phase 4 (reusa `SimpleLoginForm` e `PixModalContainer`).
- **Phase 6 (Polish, T025–T031)**: depende de US encerradas que se deseja polir.

### User Story Dependencies

- **US1 (P1)**: independente após Phase 2. Entrega vitrine pública.
- **US2 (P1)**: precisa de US1 (compartilha `index.tsx`) → desenvolvimento sequencial. Em equipe, pode partir após T011 estar mergeado.
- **US3 (P2)**: precisa de US2 (reusa SimpleLoginForm/PixModalContainer) — sequencial.

### Within Each User Story

- Componentes novos sem dependência (US1: T009, T010 — paralelos; US2: T014, T015 — paralelos; US3: T020 — único `[P]`).
- Composição em `index.tsx` é sequencial dentro de cada US.
- Validação manual encerra cada Phase.

### Parallel Opportunities

- **Phase 1**: T001–T005 todos `[P]` (diretório + 4 arquivos de tradução distintos).
- **US1**: T009 + T010 em paralelo. T011 depois.
- **US2**: T014 + T015 em paralelo. T016–T019 sequenciais em `index.tsx`.
- **Polish**: T025–T028 todos `[P]` (arquivos/conferências distintas).

---

## Parallel Example: User Story 1

```bash
# Após Phase 2 completa, iniciar US1 disparando componentes em paralelo:
Task: "Criar StorefrontCard.tsx em monexup-app/src/Pages/StorefrontPage/"
Task: "Criar EmptyState.tsx em monexup-app/src/Pages/StorefrontPage/"
# Depois (sequencial):
Task: "Implementar index.tsx orquestrando os componentes"
```

## Parallel Example: User Story 2

```bash
Task: "Criar SimpleLoginForm.tsx em monexup-app/src/Pages/StorefrontPage/"
Task: "Criar PixModalContainer.tsx em monexup-app/src/Pages/StorefrontPage/"
# Depois (sequencial):
Task: "Integrar handlers em index.tsx (handleBuyOrDonate + createPix)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1)
2. **STOP e VALIDATE**: storefront pública responde, lista produtos, sem fluxo de pagamento ainda
3. Deploy/demo MVP — entrega valor de visibilidade do catálogo

### Incremental Delivery

1. MVP US1 → demo
2. + US2 (compra PIX) → demo
3. + US3 (doação) → demo
4. Polish + medições SC → release

### Parallel Team Strategy

- Dev A: T009 (StorefrontCard) + T011 (index.tsx orquestração) sequenciais.
- Dev B: T014 (SimpleLoginForm) + T020 (DonationAmountForm) em paralelo (arquivos distintos), aguarda Dev A para integração.
- Dev C: Traduções T003/T004/T005 + Polish T025–T028.

---

## Notes

- `[P]` = arquivos distintos, sem dependência incompleta.
- Backend MonexUp **NÃO é tocado** nesta feature (endpoints reusados). Se T022 detectar que `Order/createPixPayment` não aceita `amount` para doação aberta, criar issue/PR separado para evolução server-side — não entra no escopo deste tasks.
- `SellerPage`/`ProductPage`/`PixPaymentForm`/`UserForm` antigos NÃO podem ser alterados (FR-016). T028 valida via `git diff`.
- Cada commit deve corresponder a uma task ou grupo lógico de tasks `[P]`.
- Validação manual ao fim de cada Phase encerra o checkpoint antes de avançar.
- `<PixPayment>` do `proxypay-react` já controla seu modal via `createPortal`; T015 apenas o envolve para receber `customer/items` corretos e o trigger programático.

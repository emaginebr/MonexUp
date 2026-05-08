# Quickstart — Store Product Admin

**Feature**: 006-store-product-admin
**Audience**: Engenheiros validando entrega; QA manual.
**Pré-requisitos**:
- Backend MonexUp rodando (não há mudanças nesta feature)
- Backend Lofn rodando e acessível em `REACT_APP_LOFN_API_URL`
- NAuth rodando e usuário gestor com `lofnStoreId` provisionado em ao menos 1 Network
- Para validação de filtros: usuário com claim `isAdmin: true`
- Frontend: `npm install --legacy-peer-deps && npm run dev`

---

## Smoke test 1 — Modo Simples ponta a ponta (US1)

1. Login como **gestor** (não-admin) de Network com Store provisionada
2. Navegar para `/admin/products`
3. Verificar que `<NetworkSwitcher>` aparece no header se gestor tem ≥2 Networks; senão fica oculto
4. Clicar em **"Novo produto"**
5. Verificar que o toggle **Simples / Avançado** está visível e default **Simples**
6. Preencher: `Nome`, `Preço`, `Foto` (upload 1 imagem)
7. Clicar **Salvar**
   - **Esperado**: toast "Produto criado e vinculado"; produto aparece na lista; categoria padrão `_default` foi criada no Lofn (verificar via API direto ou logs do Lofn — não deve aparecer em nenhum dropdown da UI)
8. Editar o produto recém-criado em modo Simples; alterar preço; salvar
   - **Esperado**: toast sucesso; preço atualizado na lista

**Critério SC-001**: tempo total ≤ 90 segundos.

---

## Smoke test 2 — Busca + delete (US2)

1. Logado como gestor com produtos cadastrados
2. Em `/admin/products`, digitar parte do nome no campo de busca
   - **Esperado**: lista filtra
3. Clicar em **excluir** numa linha → confirmar no modal
   - **Esperado**: produto some da lista; chamada `DELETE` ao Lofn confirmada
4. Navegar entre páginas (se >25 produtos)
   - **Esperado**: paginação preserva filtro; próxima página em ≤ 1s (SC-005)

---

## Smoke test 3 — Modo Avançado com categoria + filtro (US3)

1. Pré: criar 1 categoria via tela de categorias (smoke test 4)
2. Pré: admin criar 1 filtro "Cor" com valores "Vermelho", "Azul" (smoke test 5)
3. `/admin/products` → Novo produto
4. Toggle → **Avançado**
5. Preencher: nome, preço, descrição rica, **3 fotos** (drag/drop ou upload), **categoria** (selecionar a criada), **filtro Cor = Vermelho**
6. Salvar
   - **Esperado**: produto aparece com badge de categoria + filtros; chamada Lofn com `categoryId` e `productTypes` corretos
7. Reabrir produto em modo **Simples**
   - **Esperado**: aviso "este produto tem dados avançados não editáveis em Simples"
8. Salvar pelo Simples (alterar nome)
   - **Esperado**: nome atualiza; categoria, filtros, fotos extras preservados (FR-037)

---

## Smoke test 4 — Categorias por Store (US4)

1. Logado como gestor; navegar para `/admin/categories`
2. Criar **categoria pai** "Camisetas"
3. Criar **subcategoria** "Manga curta" com pai = "Camisetas"
4. Tentar criar subcategoria de "Manga curta"
   - **Esperado**: UI bloqueia (profundidade > 2)
5. Verificar que `_default` **NÃO** aparece na listagem
6. Logar como **outro gestor** (Network/Store diferente)
   - **Esperado**: vê suas próprias categorias, nenhuma da Store anterior
7. Excluir "Camisetas" (que tem 1 subcategoria + N produtos)
   - **Esperado**: modal "1 subcategoria + N produtos serão afetados — cascade ou cancelar?"

---

## Smoke test 5 — Filtros globais admin-only (US5)

1. Login como **admin** (`isAdmin: true`)
2. Navegar para `/admin/filters`
   - **Esperado**: tela acessível (não admin recebe redirect para `/`)
3. Criar filtro "Cor" → adicionar valores "Vermelho", "Azul", "Verde"
4. Editar filtro: renomear valor "Verde" → "Verde-claro"
5. Logout; login como **gestor não-admin**
6. Navegar diretamente em `/admin/filters` no browser
   - **Esperado**: redirect imediato para `/` (HOC `<RequireAdmin>`)
7. Em `/admin/products` → Avançado → dropdown de filtros
   - **Esperado**: gestor vê "Cor" como opção e pode selecionar valores; **NÃO** vê botão de criar/editar/excluir filtro

---

## Smoke test 6 — Network switcher (multi-Network)

1. Login como gestor de **2 Networks** (A e B), ambas com Stores provisionadas
2. `/admin/products` → header mostra `<NetworkSwitcher>` com Network A pré-selecionada
3. Cadastrar produto X em Network A
4. Trocar dropdown para Network B
   - **Esperado**: lista de produtos limpa e recarrega com produtos da Store de B; produto X **NÃO** aparece
5. Recarregar a página (F5)
   - **Esperado**: Network B ainda ativa (persistido em `localStorage.mnx.activeNetworkId`)

---

## Verificação SC (Success Criteria)

| SC | Como verificar |
|----|----------------|
| SC-001 | Cronometrar smoke test 1 |
| SC-002 | DevTools Network tab — request CRUD ≤ 2s p95 |
| SC-003 | Smoke test 4 passo 6 + smoke test 6 (zero vazamento entre Stores) |
| SC-004 | Smoke test 1 — UI nunca mostra a palavra "categoria" no modo Simples |
| SC-005 | Smoke test 2 — paginação ≤ 1s próxima página |
| SC-006 | Coletar toasts de erro vs sucesso ao longo dos smokes; razão erro/total ≤ 2% |
| SC-007 | Stop Lofn container; recarregar `/admin/products` — UI mostra mensagem acionável (não spinner infinito) |

---

## Rollback rápido

Feature é frontend-only sem migração de DB. Rollback = reverter commits no `monexup-app/` e re-deployar. Sem efeitos colaterais no Lofn (dados criados durante teste permanecem no Lofn — limpar manualmente se necessário).

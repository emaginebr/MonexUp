# Phase 0 — Research: Store Product Admin

**Feature**: 006-store-product-admin
**Date**: 2026-05-06

## R1. Endpoints Lofn consumidos

**Decision**: Reusar endpoints REST do Lofn já existentes; nada de GraphQL nesta entrega.

**Rationale**: REST já cobre 100% do CRUD necessário. GraphQL existe no Lofn mas adicionaria peso sem ganho.

**Endpoints (verificados em `c:/repos/Lofn/Lofn/Lofn.API/Controllers/`):**

| Operação | Verbo + Path | Auth |
|----------|--------------|------|
| Criar produto | `POST /Product/{storeSlug}/insert` | Bearer + `X-Tenant-Id` |
| Atualizar produto | `POST /Product/{storeSlug}/update` | Bearer + `X-Tenant-Id` |
| Buscar produtos | `POST /Product/search` | Bearer (filtra por storeId no body) |
| Atualizar preço | `POST /Product/{productId}/price` | Bearer |
| Listar/categorias da Store | `GET /Category/list?storeSlug=...` (a confirmar shape) | Bearer |
| Criar categoria | `POST /Category/{storeSlug}/insert` | Bearer |
| Atualizar categoria | `POST /Category/{storeSlug}/update` | Bearer |
| Excluir categoria | `DELETE /Category/{storeSlug}/delete/{categoryId}` | Bearer |
| Listar filtros (ProductType) | `GET /ProductType/list` | Bearer |
| Detalhe filtro | `GET /ProductType/{productTypeId}` | Bearer |
| Criar filtro | `POST /ProductType/insert` | Bearer + isAdmin |
| Atualizar filtro | `POST /ProductType/update` | Bearer + isAdmin |
| Excluir filtro | `DELETE /ProductType/delete/{productTypeId}` | Bearer + isAdmin |
| Add valor de filtro | `POST /ProductType/{productTypeId}/filter/insert` | Bearer + isAdmin |
| Update valor de filtro | `POST /ProductType/filter/update` | Bearer + isAdmin |
| Delete valor de filtro | `DELETE /ProductType/filter/delete/{filterId}` | Bearer + isAdmin |
| Upload imagem | `POST /Image/upload` (assumido) | Bearer |

**Alternatives considered**: GraphQL — descartado por overhead.

---

## R2. Hierarquia de categorias (2 níveis)

**Decision**: Usar campo nativo `ParentCategoryId` (`Lofn.DTO.Category.CategoryInfo`).

**Rationale**: Lofn já expõe `ParentCategoryId` em `CategoryInfo`, `CategoryInsertInfo`, `CategoryUpdateInfo`. Suporta hierarquia ilimitada no backend, mas frontend MonexUp restringe a 2 níveis (validação no `CategoryForm` admin do MonexUp).

**Validação aplicada no front**:
- Categoria pai: `ParentCategoryId = null`
- Subcategoria: `ParentCategoryId` ≠ null E categoria referenciada também tem `ParentCategoryId = null`
- Não permite cadastrar subcategoria de subcategoria

**Alternatives considered**: Limitação no Lofn — rejeitado, fora de escopo (NON-NEGOTIABLE).

---

## R3. Status de produto

**Decision**: Mapear direto `Lofn.DTO.Product.ProductStatusEnum`:
- `Active = 1` → exibido como "Ativo" / toggle ON
- `Inactive = 2` → exibido como "Inativo" / toggle OFF
- `Expired = 3` → badge "Expirado" (somente leitura, gerado pelo Lofn)

**Rationale**: Já existe no Lofn. Sem necessidade de mapping custom.

**UI**: toggle binário Active↔Inactive na linha da lista e no form. Quando `Expired`, toggle desabilitado e badge visível.

---

## R4. Categoria padrão lazy (modo Simples)

**Decision**: Criar categoria padrão "_default" sob demanda na primeira vez que o gestor salvar produto em modo Simples sem categoria selecionada.

**Algoritmo (frontend)**:

1. Antes de submeter `POST /Product/{storeSlug}/insert` em modo Simples:
   - Busca lista de categorias da Store
   - Procura por nome `_default` (prefixo underscore para sinalizar oculta)
   - Se não existe → `POST /Category/{storeSlug}/insert` com `{ name: "_default", parentCategoryId: null }`
   - Usa o `categoryId` retornado no produto
2. Listagem de categorias visíveis ao gestor filtra `name === "_default"` no frontend (oculta).
3. Categoria padrão NUNCA é exibida em selects/dropdowns.

**Rationale**: Lofn não exige categoria (`CategoryId` é nullable em `ProductInsertInfo`), mas adotamos categoria padrão por **defesa** caso requisito mude e pra atender FR-012.

**Alternatives considered**:
- Enviar `categoryId = null`: arriscado se Lofn evoluir
- Categoria global compartilhada por todas as Stores: violaria FR-020 (sem categorias globais)

---

## R5. Componentes lofn-react reutilizáveis

**Decision**: Compor páginas a partir de:

| Componente lofn-react | Uso na feature |
|-----------------------|----------------|
| `<ProductList storeId={...} />` | US2 — busca de produtos |
| `<ProductForm storeSlug={...} product={...} />` | US1, US3 — cadastro Simples/Avançado |
| `<ProductImageManager />` | Modo Avançado — múltiplas fotos |
| `<CategoryForm storeSlug />` | US4 — criar/editar categoria |
| `<CategoryList storeSlug />` | US4 — listar (filtra `_default`) |
| `<CategoryTree storeSlug />` | US4 — visualização hierárquica 2 níveis |
| `<ProductTypeForm />` | US5 — admin cria/edita filtro |
| `<ProductTypeList />` | US5 — admin lista filtros |
| `<ProductTypeFilterEditor />` | US5 — admin edita valores de filtro |

**Gaps identificados** (componentes que MonexUp envolve/customiza):
- Toggle Simple/Advanced no `ProductForm` — wrapper MonexUp esconde campos quando Simple
- Filtro `_default` no `CategoryList` — wrapper MonexUp aplica filter
- Gating admin nas telas de filtro — wrapper MonexUp checa `authContext.isAdmin`

---

## R6. Admin gating (filtros)

**Decision**: Usar claim `isAdmin` do JWT NAuth (já presente em `authContext.sessionInfo.isAdmin`).

**Verificado**:
- `c:/repos/NAuth/NAuth/NAuth/ACL/UserClient.cs:50` — claim `isAdmin` mapeado para `UserSessionInfo.IsAdmin`
- `monexup-app/src/Contexts/Auth/AuthProvider.tsx:25` — `isAdmin` exposto no `AuthSession` frontend
- `monexup-app/src/Contexts/User/UserProvider.tsx:51` — `role: isAdmin ? Administrator : User`

**Gating**:
- Rota `/admin/filters` envolvida em `<RequireAdmin>` HOC: redireciona para `/` se `!isAdmin`
- Botões de criar/editar/deletar filtros em outras telas só renderizam quando `isAdmin === true`

**Alternatives considered**: Gating apenas backend → insuficiente (UI exibiria botões inúteis).

---

## R7. Network ativa (multi-Network gestor)

**Decision**: Novo `ActiveNetworkContext` com persistência em `localStorage` chave `mnx.activeNetworkId`.

**Algoritmo**:
1. Ao logar, lista Networks do usuário via `NetworkContext.listByUser()`
2. Lê `localStorage.mnx.activeNetworkId`:
   - Se válido (usuário pertence à Network) → seta como ativa
   - Senão → primeira Network da lista
3. Header da área `/admin/*` exibe `<NetworkSwitcher>` (dropdown) — `onChange` atualiza `localStorage` e dispara `window.location.reload()` ou re-fetch de listas
4. `useStoreScope()` hook lê `activeNetwork.lofnStoreId` — única fonte de verdade pra `storeId`/`storeSlug`

**Rationale**: localStorage simples, sem precisar de URL routing por Network (mantém URLs limpas). Reload garante zero contaminação entre contextos.

**Alternatives considered**:
- URL `/admin/{networkSlug}/products` (Opção C da clarificação) — rejeitada pelo usuário
- Modal obrigatório (Opção B) — rejeitada (gestor com 1 Network teria fricção)

---

## R8. Backend MonexUp — sem mudanças necessárias

**Decision**: Zero rotas novas. Toda comunicação CRUD vai do frontend direto pro Lofn.

**Verificado**:
- Network já tem `lofnStoreId` (`monexup_networks.lofn_store_id`) — provisionamento existe via `LofnStoreProvisioningService`
- Frontend já tem `httpClientLofn` configurado em `ServiceFactory.tsx:43` apontando pra `REACT_APP_LOFN_API_URL`
- Token NAuth do gestor é válido contra Lofn (mesmo `JwtSecret` compartilhado)

**Caso edge**: se Network ainda não tem `lofnStoreId` provisionado, a tela exibe CTA pra disparar provisionamento (endpoint MonexUp já existe). Sem código novo no backend.

---

## R9. Performance e paginação

**Decision**: Paginação client-side em cima de `POST /Product/search` com pageSize=25, pageNum incremental. Cache simples por chave `{storeId, query, pageNum}` em memória do componente (TanStack Query opcional, mas evitado para não inflar bundle).

**Rationale**: SC-005 exige próximas páginas em ≤1s — Lofn com 500 produtos por Store responde rápido. Cache na sessão evita re-fetch ao voltar de cadastro.

---

## R10. Internacionalização

**Decision**: Adicionar chaves novas em todos os 4 locales (`pt`, `en`, `es`, `fr`). Namespace `admin_product`.

Exemplos:
```json
{
  "admin_product.title": "Produtos da loja",
  "admin_product.mode.simple": "Simples",
  "admin_product.mode.advanced": "Avançado",
  "admin_product.warning_advanced_data": "Este produto tem dados avançados não editáveis em modo Simples",
  ...
}
```

Lista completa será extraída na fase de implementação.

---

## NEEDS CLARIFICATION restantes

Nenhum. Todas as ambiguidades resolvidas no `/speckit.clarify` ou nesta fase de pesquisa.

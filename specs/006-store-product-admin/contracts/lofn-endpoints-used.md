# Contract: Lofn Endpoints Consumed by Store Product Admin

**Source of truth**: `c:/repos/Lofn/Lofn` — read-only reference. **Do NOT modify Lofn code.**

Common headers em **toda** request:
- `Authorization: Bearer <NAuth-JWT>`
- `X-Tenant-Id: monexup`
- `Content-Type: application/json` (POST/PUT)

Base URL: `process.env.REACT_APP_LOFN_API_URL`

---

## 1. `POST {Lofn}/Product/{storeSlug}/insert`

**Auth**: Bearer (gestor da Store)

**Body** (`ProductInsertInfo`):
```json
{
  "name": "string",
  "description": "string",
  "categoryId": 123,           // null permitido; em Simples → id da _default
  "price": 99.90,
  "status": 1,                 // ProductStatusEnum.Active
  "images": [
    { "url": "https://.../img.jpg", "order": 1 }
  ],
  "productTypes": []           // ids de filtros aplicáveis (vazio em Simples)
}
```

**Response 200** (`ProductInfo`):
```json
{ "productId": 456, "slug": "name-slug", "status": 1, ... }
```

**Caller MonexUp**: `<ProductForm />` em modo Simple ou Advanced.

---

## 2. `POST {Lofn}/Product/{storeSlug}/update`

**Auth**: Bearer

**Body** (`ProductUpdateInfo`): mesmo shape do insert + `productId`. Em modo Simples MonexUp envia apenas `name/description/price/status/images[0]` e omite `categoryId`/`productTypes`/imagens não-1 — backend Lofn deve preservar campos não enviados (verify: se Lofn faz overwrite total, frontend deve fazer GET-then-merge antes do save).

**Response 200**: `ProductInfo` atualizado.

---

## 3. `POST {Lofn}/Product/search`

**Auth**: Bearer

**Body** (`ProductSearchParam`):
```json
{
  "storeId": 12,
  "query": "termo opcional",
  "pageNum": 1,
  "pageSize": 25,
  "status": null               // ou 1/2/3 quando filtro de status ativo
}
```

**Response 200** (`ProductListPagedResult`):
```json
{
  "items": [ ProductInfo ],
  "pageNum": 1,
  "pageCount": 4,
  "totalCount": 87
}
```

**Caller MonexUp**: `<ProductSearchPage />`.

---

## 4. `DELETE {Lofn}/Product/{storeSlug}/delete/{productId}` *(a confirmar nome exato no Lofn)*

**Auth**: Bearer

**Response 200/204**: vazio.

**Caller MonexUp**: ação delete na lista (US2).

> **TODO em implementação**: confirmar verbo/path exato em `ProductController` antes de wirar.

---

## 5. `GET {Lofn}/Category/list?storeSlug={slug}` *(a confirmar)*

**Auth**: Bearer

**Response 200**: `CategoryInfo[]` (flat, com `parentCategoryId`).

**Caller MonexUp**: `<CategoryManagePage />` + `<ProductForm />` (dropdown categoria).

> **TODO**: verificar se Lofn retorna lista flat completa ou já hierárquica em `CategoryTreeNodeInfo`. Frontend prefere flat (constrói árvore localmente).

---

## 6. `POST {Lofn}/Category/{storeSlug}/insert`

**Body** (`CategoryInsertInfo`):
```json
{
  "name": "string",
  "parentCategoryId": null     // ou id da pai para subcategoria
}
```

**Caller MonexUp**: `<CategoryForm />` + categoria padrão lazy.

---

## 7. `POST {Lofn}/Category/{storeSlug}/update`

**Body** (`CategoryUpdateInfo`): inclui `categoryId` + campos.

---

## 8. `DELETE {Lofn}/Category/{storeSlug}/delete/{categoryId}`

**Response**: 200/204.

**Pre-checks no front**:
- Se categoria tem filhos → modal "categoria pai com N filhos: cascade ou cancel"
- Se categoria tem produtos vinculados → modal "M produtos afetados, confirmar?"

---

## 9. `GET {Lofn}/ProductType/list`

**Auth**: Bearer

**Response 200**: `ProductTypeInfo[]` (filtros globais).

**Caller MonexUp**: `<FilterManagePage />` (admin-only) + `<ProductForm />` Avançado (dropdown).

---

## 10. `POST {Lofn}/ProductType/insert` (admin-only)

**Body**: `ProductTypeInsertInfo`.

**Caller MonexUp**: `<FilterManagePage />` (admin).

---

## 11. `POST {Lofn}/ProductType/update`, `DELETE /ProductType/delete/{id}` (admin-only)

Mesmo padrão.

---

## 12. `POST {Lofn}/ProductType/{productTypeId}/filter/insert` (admin-only)

Adiciona valor ao filtro.

**Body**: `FilterValueInsertInfo` (nome do valor).

---

## 13. `POST {Lofn}/Image/upload` *(endpoint a confirmar)*

**Auth**: Bearer

**Body**: `multipart/form-data` com arquivo.

**Response 200**: `{ url: "https://..." }`

**Caller MonexUp**: ambos modos (1 imagem em Simple, N em Advanced via `<ProductImageManager />`).

> **TODO**: verificar se Lofn ou zTools faz upload. Se for zTools → vai pelo backend MonexUp existente, NÃO pelo Lofn.

---

## Out of scope desta feature

- GraphQL queries do Lofn — não consumidas
- Endpoints de categoria global (`CategoryGlobalController`) — explicitamente ignorados (FR-020)
- Endpoints de Store CRUD (`StoreController`) — Store já provisionada antes desta feature
- Endpoints de carrinho (`ShopCartController`) — irrelevantes para admin

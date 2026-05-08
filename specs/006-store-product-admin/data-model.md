# Phase 1 — Data Model: Store Product Admin

**Feature**: 006-store-product-admin
**Date**: 2026-05-06
**Scope**: Apenas tipos TypeScript no frontend MonexUp. Persistência: 100% no Lofn. Backend MonexUp inalterado.

## Overview

Reutiliza tipos existentes do pacote `lofn-react` (re-exportados de `Lofn.DTO`). MonexUp adiciona apenas:
- Tipos para o form com toggle Simple/Advanced
- Estado de Network ativa (contexto)
- Hooks de scope/admin

---

## E1. ProductFormMode (enum)

```ts
// monexup-app/src/DTO/Enum/ProductFormModeEnum.tsx
export enum ProductFormModeEnum {
  Simple = "simple",
  Advanced = "advanced",
}
```

---

## E2. ProductSimpleForm

```ts
// monexup-app/src/DTO/Domain/Admin/ProductSimpleForm.tsx
export interface ProductSimpleForm {
  productId?: number;        // undefined = create
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;         // exatamente 1 imagem
  status: ProductStatusEnum; // default Active
}
```

**Validation**:
- `name` obrigatório, 3–120 chars
- `price` ≥ 0
- `imageUrl` obrigatório no create; opcional no update

**Mapping para Lofn `ProductInsertInfo`**:
- `categoryId` ← id da categoria padrão `_default` (lazy)
- `productTypes` (filtros) ← `[]` (vazio)
- `images` ← `[{url: imageUrl, order: 1}]`

---

## E3. ProductAdvancedForm

```ts
// monexup-app/src/DTO/Domain/Admin/ProductAdvancedForm.tsx
export interface ProductAdvancedForm {
  productId?: number;
  name: string;
  description?: string;
  richDescription?: string;
  price: number;
  status: ProductStatusEnum;
  categoryId: number | null;       // pai OU subcategoria; null permitido
  images: ProductImageEntry[];     // ordem definível
  filterValues: ProductFilterValueRef[];
}

export interface ProductImageEntry {
  url: string;
  order: number;
}

export interface ProductFilterValueRef {
  productTypeId: number;
  filterValueId: number;
}
```

**Validation**:
- `name` 3–120 chars
- `price` ≥ 0
- `images.length` ≥ 1
- `categoryId` opcional; se preenchido, deve pertencer à própria Store (validação client + server)

**Mapping para Lofn `ProductInsertInfo` / `ProductUpdateInfo`**: 1:1.

---

## E4. CategoryHierarchyView

Visualização derivada da lista flat do Lofn:

```ts
export interface CategoryNode {
  categoryId: number;
  name: string;
  parentCategoryId: number | null;
  isHidden: boolean;            // true se name === "_default"
  children: CategoryNode[];     // só preenchido para nodes pai
}
```

**Build rule**:
1. Buscar `Category[]` do Lofn (REST)
2. Filtrar `name !== "_default"` para listagem visível
3. Agrupar:
   - Pais: `parentCategoryId === null`
   - Filhos: encaixar em `children` do pai correspondente
4. Profundidade > 2 → erro (não suportado pela UI MonexUp)

---

## E5. ActiveNetworkState

```ts
// monexup-app/src/Contexts/ActiveNetwork/ActiveNetworkContext.tsx
export interface ActiveNetworkState {
  activeNetwork: UserNetworkInfo | null;
  availableNetworks: UserNetworkInfo[];
  setActiveNetwork: (networkId: number) => void;
  isProvisioned: boolean;       // activeNetwork.lofnStoreId != null
}
```

**Persistence**:
- Chave: `mnx.activeNetworkId`
- Valor: `string` (networkId numérico serializado)
- Lido em `ActiveNetworkProvider` ao montar; gravado no `setActiveNetwork`

---

## E6. AdminGate (HOC + hook)

```ts
// monexup-app/src/Hooks/useIsAdmin.ts
export function useIsAdmin(): boolean {
  const auth = useContext(AuthContext);
  return auth?.sessionInfo?.isAdmin === true;
}

// monexup-app/src/Components/Admin/RequireAdmin.tsx
export function RequireAdmin({ children }: PropsWithChildren) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

---

## E7. StoreScope (hook)

```ts
// monexup-app/src/Hooks/useStoreScope.ts
export interface StoreScope {
  storeId: number | null;
  storeSlug: string | null;
  isReady: boolean;             // true quando lofnStoreId resolvido
  needsProvisioning: boolean;   // true quando Network não tem lofnStoreId
}

export function useStoreScope(): StoreScope { ... }
```

**Source**: `useActiveNetwork().activeNetwork.lofnStoreId`. Quando `null`, retorna `needsProvisioning: true` para a página exibir CTA.

---

## State transitions

### Produto

```text
(novo) ── Criar (Simples ou Avançado) ──▶ Active
   Active ──── Toggle ────▶ Inactive
   Inactive ── Toggle ────▶ Active
   *        ── Lofn marca ▶ Expired (read-only)
   *        ── Excluir ───▶ (removido)
```

### Categoria

```text
(criar pai)        ──▶ Pai
(criar com parent) ──▶ Subcategoria
Pai      ── editar nome    ──▶ Pai (preserva filhos)
Pai      ── excluir        ──▶ avisa N filhos + M produtos → cascade ou bloqueio
Subcat   ── editar parent  ──▶ pode mover para outro Pai (não para subcat)
Subcat   ── excluir        ──▶ avisa M produtos
```

### Network ativa

```text
(login) ── lê localStorage ──▶ activeNetwork ou primeira disponível
(swap)  ── dropdown change ──▶ grava localStorage + reload listas
```

---

## Relationships diagram

```text
Network (MonexUp) ── 1:1 ──▶ Store (Lofn) [via lofn_store_id]
Store ── 1:N ──▶ Product
Store ── 1:N ──▶ Category
Category (pai) ── 1:N ──▶ Category (subcategoria)
Product ── 0..1 ──▶ Category
Product ── 0..N ──▶ FilterValue
ProductType (Filter) ── 1:N ──▶ FilterValue [global, admin-only]
```

---

## Out of scope (data model)

- Persistência local de produtos (cache offline) — não nesta entrega
- Variantes de produto (SKUs) — pode ser modelado via `ProductFilterValueRef` no Avançado
- Bulk actions (excluir múltiplos) — futuro

# Contracts — Vendor Storefront

## Rota Frontend (nova)

```text
GET (SPA) /:networkSlug/store/:sellerSlug   → <StorefrontPage />
```

- **Layout**: `LayoutNetwork` (mesma chrome de outras rotas sob `:networkSlug`).
- **Acesso**: público / anônimo permitido para visualização. Login simples obrigatório no clique de Comprar/Doar.
- **Inserção em `App.tsx`**: dentro do bloco `<Route path=":networkSlug" element={<LayoutNetwork />}>`, **antes** de `<Route path=":productSlug" element={<ProductPage />} />` para evitar shadowing.

```tsx
<Route path=":networkSlug" element={<LayoutNetwork />}>
  <Route index element={<NetworkPage />} />
  <Route path="account">…</Route>
  <Route path="store/:sellerSlug" element={<StorefrontPage />} />   {/* NOVO */}
  <Route path=":productSlug" element={<ProductPage />} />
  <Route path="@">…</Route>
</Route>
```

## Endpoints HTTP (reusados, sem alteração de contrato)

### 1. Listagem de produtos (Lofn)

```http
POST {Lofn:ApiURL}/Product/search
X-Tenant-Id: monexup
Content-Type: application/json

{
  "userSlug": "{vendorSlug}",
  "networkSlug": "{networkSlug}",
  "keyword": "",
  "onlyActive": true,
  "pageNum": 1
}
```

Resposta: `ProductListPagedResult` com `products: ProductInfo[]`, `pageNum`, `totalPages`.

Chamado via `ProductContext.search(param)` — sem mudanças no client.

### 2. Criar PIX (MonexUp)

```http
POST {API}/Order/createPixPayment/{productSlug}?networkSlug={networkSlug}&sellerSlug={sellerSlug}
Authorization: Bearer {nauth-token}
Content-Type: application/json

{ "documentId": "12345678909" }
```

Resposta: `PixPaymentResult` (ver `data-model.md`). Chamado via `OrderContext.createPixPayment`.

### 3. Polling do status PIX (ProxyPay, interno ao `<PixPayment>`)

```http
GET {ProxyPay:BaseURL}/qrcode/{invoiceId}
X-Tenant-Id: {ProxyPay:TenantId}
Authorization: …
```

Resposta: `QRCodeStatusResponse` com `paid: boolean`, `statusText`. Gerenciado pelo hook `useProxyPay` do pacote.

### 4. Webhook ProxyPay → MonexUp (existente, sem mudanças)

Backend MonexUp já consome webhook do ProxyPay para atualizar `Invoice.Status` server-side. Independente do frontend.

## Contratos de Componente (frontend, novos)

### `<StorefrontPage />`

- **Path params**: `networkSlug`, `sellerSlug`
- **Estados internos**: `loadingProducts`, `pendingAction` (productId em ação), `loginOpen`, `pixOpen`, `selectedProduct`, `donationAmount`
- **Side effects (`useEffect` inicial)**:
  1. `networkContext.getBySlug(networkSlug)` — se erro → estado `unavailable`
  2. `networkContext.getSellerBySlug(networkSlug, sellerSlug)` — se erro → estado `unavailable`
  3. `templateContext.getNetworkPage(networkSlug, 'store')` (opcional, se houver template) — pular se não exigido
  4. `searchProducts(1)` via `ProductContext.search`

### `<StorefrontCard product, onAction />`

- **Props**: `product: ProductInfo`, `onAction(product: ProductInfo): void`
- **Render**: imagem (`loading="lazy"`), nome, descrição curta, preço, botão único.
- **Label do botão**: `productType === 3 ? t('btn_donate') : t('btn_buy')`.

### `<SimpleLoginForm onSuccess, onCancel />`

- **Campos**: nome, e-mail, CPF.
- **Validação**: nome obrigatório, e-mail regex, CPF dígito verificador (11 dígitos).
- **Submit**: `userContext.insert({...})` → se sucesso, `authContext.loadUserSession()` → `onSuccess`.

### `<DonationAmountForm product, onConfirm />`

- Renderizado apenas se `product.donationMode === 'Open'`.
- Valida `amount >= product.minimumDonationAmount`.

### `<PixModalContainer trigger, customer, items, onPaid />`

- Wrapper sobre `<PixPayment>` do `proxypay-react`:
  - `customer` = `{ name, documentId, email, cellphone: '' }`
  - `items` = `[{ id: productId, description: product.name, quantity: 1, unitPrice: product.price, discount: 0 }]`
  - `onSuccess` → `navigate('/checkout/success')`
  - `onError` → toast erro
  - `pollInterval` = 5000

## Anti-contrato (NÃO fazer)

- **NÃO** criar endpoint `/Storefront/*` no backend. Reusar `Order/createPixPayment`.
- **NÃO** modificar `SellerPage`, `ProductPage`, `PixPaymentForm`, `UserForm` existentes (FR-016).
- **NÃO** criar Service/Business/Provider novos no frontend para Storefront — reusar `Product`, `Order`, `User`, `Auth`.
- **NÃO** adicionar coluna/migration em PostgreSQL.
- **NÃO** consultar status do PIX via backend MonexUp no modal — usar polling nativo `proxypay-react` (FR-010a).

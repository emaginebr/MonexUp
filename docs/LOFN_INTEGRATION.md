# Integração MonexUp com Lofn API

> Documenta os gaps, convenções de mapeamento e alterações necessárias no projeto Lofn para suportar o sistema de produtos do MonexUp.

**Created:** 2026-03-31
**Last Updated:** 2026-03-31

---

## Contexto

O MonexUp migrou seu sistema de produtos para o projeto Lofn (plataforma de e-commerce separada). O backend do MonexUp agora usa `LofnProductRepository` que chama a API Lofn via HTTP em vez de acessar a tabela `products` diretamente. O frontend chama a API Lofn diretamente para leitura de produtos.

---

## Configuração

### Backend (appsettings)

```json
{
  "Lofn": {
    "ApiURL": "http://localhost:5003"
  }
}
```

Em Docker, passar via variável de ambiente:
```
Lofn__ApiURL=http://lofn-api:80
```

### Frontend (variável de ambiente)

```
REACT_APP_LOFN_API_URL=http://localhost:5003
```

### Header de Tenant

Todas as requisições incluem automaticamente:

```
X-Tenant-Id: monexup
```

O Lofn precisa ter o tenant `monexup` configurado em `appsettings.json`.

---

## Mapeamento de Conceitos

| MonexUp (antigo)      | Lofn (novo)           |
|-----------------------|------------------------|
| Network               | Store                  |
| Product.NetworkId     | Product.StoreId        |
| Product.Image         | ProductImage (tabela separada) |
| ProductStatusEnum     | ProductStatusEnum (mesmo: Active=1, Inactive=2, Expired=3) |

### Convenção Network → Store

Cada Network do MonexUp corresponde a uma Store no Lofn. A convenção é:

- `store.slug` = `network.slug` (mesmo valor)
- `store.ownerId` = ID do administrador da network

---

## Gaps e Alterações Necessárias no Lofn

### 1. Campos Stripe na API (CRÍTICO)

**Status:** Não exposto na API

O Lofn tem `StripeProductId` e `StripePriceId` no domain model (`ProductModel.cs`), mas **não os expõe nos DTOs da API** (`ProductInfo`, `ProductUpdateInfo`).

O MonexUp precisa desses campos para a integração com Stripe (pagamentos e assinaturas).

**Alterações necessárias no Lofn:**

1. Adicionar ao `ProductInfo` (response):
   ```csharp
   [JsonPropertyName("stripeProductId")]
   public string StripeProductId { get; set; }
   
   [JsonPropertyName("stripePriceId")]
   public string StripePriceId { get; set; }
   ```

2. Adicionar ao `ProductUpdateInfo` (request):
   ```csharp
   [JsonPropertyName("stripeProductId")]
   public string StripeProductId { get; set; }
   
   [JsonPropertyName("stripePriceId")]
   public string StripePriceId { get; set; }
   ```

3. Adicionar campos ao GraphQL type `ProductTypeExtension`:
   ```csharp
   descriptor.Field("stripeProductId").Type<StringType>();
   descriptor.Field("stripePriceId").Type<StringType>();
   ```

4. Criar endpoints de busca por Stripe ID:
   - `GET /product/byStripeProductId/{stripeProductId}` 
   - `GET /product/byStripePriceId/{stripePriceId}`

### 2. Criação Automática de Store para Networks

**Status:** Não implementado

Quando o MonexUp cria uma nova Network, precisa automaticamente criar uma Store correspondente no Lofn:

```
POST /store/insert
Authorization: Bearer <token>
X-Tenant-Id: monexup

{
  "name": "<network name>"
}
```

**Opções de implementação:**
- **Opção A:** O MonexUp backend chama a API do Lofn ao criar uma network
- **Opção B:** Webhook/evento de criação de network que o Lofn escuta

### 3. Busca por NetworkSlug/UserSlug

**Status:** Parcialmente suportado

O MonexUp frontend envia `networkSlug` e `userSlug` na busca de produtos. O Lofn aceita esses campos no `ProductSearchParam`, mas a implementação no backend do Lofn precisa resolver:

- `networkSlug` → buscar Store por slug → filtrar por storeId
- `userSlug` → buscar usuário por slug → filtrar por userId

### 4. Upload de Imagens de Produto

**Status:** Suportado

O Lofn já tem `POST /image/upload/{productId}` para upload de imagens de produto. O MonexUp removeu seu endpoint `uploadImageProduct` e deve usar o Lofn para isso.

---

## Arquitetura Backend (MonexUp)

### LofnProductRepository

O `LofnProductRepository` implementa `IProductRepository<IProductModel, IProductDomainFactory>` e substitui o antigo `ProductRepository` que usava EF Core.

**Localização:** `MonexUp.Infra/Repository/LofnProductRepository.cs`

**Como funciona:**
- Usa `IHttpClientFactory` para criar instâncias HttpClient
- Chama GraphQL público do Lofn para leituras (GetById, GetBySlug, ListByNetwork)
- Chama REST `POST /product/search` para buscas paginadas
- Chama REST para Insert/Update

**O que NÃO mudou:**
- `IProductModel`, `IProductService`, `IProductDomainFactory` (interfaces)
- `ProductModel`, `ProductDomainFactory`, `ProductService` (implementações)
- `OrderService`, `StripeService`, `SubscriptionService`, `InvoiceService` (dependências)

---

## Arquitetura Frontend (MonexUp)

### Mudanças

- **Removido:** `ProductEditPage`, `ProductSearchPage` (admin CRUD agora no Lofn)
- **Removido:** rotas admin de produtos no `App.tsx`
- **Removido:** métodos de escrita no ProductProvider (insert, update)
- **Reescrito:** `ProductService` para chamar Lofn API (GraphQL + REST)
- **Mantido:** `ProductPage`, `NetworkPage`, `SellerPage` (páginas públicas)
- **Mantido:** WebParts `Product01Part`, `ProductListPart`

### ProductService → Lofn API

| Método frontend     | Endpoint Lofn                          |
|---------------------|----------------------------------------|
| `search(param)`     | `POST /product/search`                 |
| `getBySlug(slug)`   | `POST /graphql` (query GetProducts)    |

---

## Endpoints Lofn Utilizados pelo MonexUp

### Backend (via LofnProductRepository)

| Método | Endpoint                              | Uso                              |
|--------|----------------------------------------|----------------------------------|
| POST   | `/graphql`                             | Buscar produto por ID, slug      |
| POST   | `/product/search`                      | Busca paginada de produtos       |
| POST   | `/product/{storeSlug}/insert`          | Criar produto                    |
| POST   | `/product/{storeSlug}/update`          | Atualizar produto                |

### Frontend (direto)

| Método | Endpoint                              | Uso                              |
|--------|----------------------------------------|----------------------------------|
| POST   | `/graphql`                             | Buscar produto por slug          |
| POST   | `/product/search`                      | Busca paginada (páginas públicas)|

---

## Migração de Dados

Para migrar produtos existentes do MonexUp para o Lofn:

1. Para cada Network no MonexUp, criar uma Store no Lofn com `slug = network.slug`
2. Para cada produto, inserir via API do Lofn preservando `name`, `description`, `price`, `frequency`, `limit`, `status`
3. Mapear campos Stripe (`StripeProductId`, `StripePriceId`) - requer gap #1 resolvido
4. Migrar imagens de produto para o Lofn via `POST /image/upload/{productId}`

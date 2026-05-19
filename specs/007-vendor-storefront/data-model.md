# Phase 1 — Data Model: Vendor Storefront

**Note**: Sem novas entidades persistidas em MonexUp. Toda a feature reaproveita DTOs e estados existentes. Este documento enumera as estruturas de dados envolvidas no fluxo.

## Entidades de Domínio (leitura)

### Network (MonexUp)

| Campo | Tipo | Origem | Observação |
|-------|------|--------|------------|
| `networkId` | `long` | DB | PK |
| `slug` | `string` | DB | Resolvido pela URL |
| `name` | `string` | DB | |
| `lofnStoreId` | `long?` | DB | Vínculo lazy com Lofn Store |
| `active` | `bool` | DB | Inativa → storefront indisponível |

### User (Vendedor) (MonexUp / NAuth)

| Campo | Tipo | Origem | Observação |
|-------|------|--------|------------|
| `userId` | `long` | DB | PK |
| `slug` | `string` | DB | Resolvido pela URL (`sellerSlug`) |
| `name` | `string` | DB | |
| `email` | `string` | DB | Único |
| `documentId` | `string` (CPF) | DB | 11 dígitos |

### Product (Lofn — `ProductInfo`)

| Campo | Tipo | Observação |
|-------|------|------------|
| `productId` | `long` | PK Lofn |
| `slug` | `string` | Usado em `Order/createPixPayment/{productSlug}` |
| `name` | `string` | Exibido no card |
| `description` | `string` | Descrição curta no card |
| `price` | `double` | R$; usado no botão e modal |
| `imageUrl` | `string` | Imagem principal |
| `images` | `ProductImageInfo[]` | Não usados — apenas a `imageUrl` é exibida |
| `status` | `ProductStatusEnum` | Filtro `onlyActive` na busca |
| `productType` | `ProductTypeEnum` | `1=Physical`, `2=InfoProduct`, `3=Donation` → determina rótulo do botão |
| `donationMode` | `DonationModeEnum?` | Se `Open`, exigir valor do usuário |
| `minimumDonationAmount` | `double?` | Validação mínima quando `donationMode = Open` |

## DTOs de Fluxo (em memória)

### `SimpleLoginPayload` (frontend-only, novo)

```ts
interface SimpleLoginPayload {
  name: string;
  email: string;
  documentId: string;  // CPF, 11 dígitos sem máscara
}
```

Regras:
- `name` não vazio
- `email` formato válido (regex padrão)
- `documentId` 11 dígitos + dígito verificador válido

### `PixPaymentResult` (existente, `MonexUp.DTO`)

```ts
interface PixPaymentResult {
  sucesso: boolean;
  mensagem?: string;
  mensagemErro?: string;
  orderId?: number;
  qrCode?: {
    invoiceId: string;
    brCode: string;
    brCodeBase64: string;
    expiredAt: string;
  };
}
```

### `DonationCheckoutPayload` (frontend-only, novo)

```ts
interface DonationCheckoutPayload {
  productSlug: string;
  amount: number;     // ≥ minimumDonationAmount quando aplicável
}
```

(Backend hoje aceita apenas `documentId`; se necessário enviar `amount` ao backend, adicionar parâmetro ao `createPixPayment` ou usar endpoint análogo de doação. Confirmar em implementação — se já existir suporte, simplesmente passar; senão, restringir doação a valor fixo do produto e abrir ticket para evoluir o endpoint.)

## State Machine do Fluxo de Pagamento (frontend)

```text
[idle]
   │ click Comprar/Doar
   ▼
[checkAuth]
   ├── já logado ───────────► [checkout]
   └── anônimo ──► [simpleLogin] ──► (success) ──► [checkout]
                                    └── (fail) ──► volta a [idle] + toast erro

[checkout]
   │ POST /Order/createPixPayment
   ├── success ──► [pixModalOpen]
   └── fail   ──► [idle] + toast erro

[pixModalOpen]   (controlado por <PixPayment>)
   ├── onSuccess (paid) ──► navigate('/checkout/success')
   ├── onError ──► [error] no modal (botão "tentar novamente")
   └── expired ──► [error] + opção de regenerar
```

## State Machine — Card Visual (frontend)

```text
[loading]  → skeleton card
[loaded]   → imagem + título + preço + botão (label = Comprar|Doar)
[empty]    → estado vazio na grade
[unavailable]  → exibido se vendedor/rede inválidos (mensagem amigável, sem card)
```

## Persistência

Nenhuma nova persistência. `Order`/`Invoice` criados via fluxo existente; webhook ProxyPay atualiza status no MonexUp (já implementado).

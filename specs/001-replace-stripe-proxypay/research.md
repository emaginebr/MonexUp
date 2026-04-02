# Research: Substituir Stripe pelo ProxyPay

**Date**: 2026-04-02
**Feature**: 001-replace-stripe-proxypay

## R1: Integração Backend MonexUp ↔ ProxyPay

**Decision**: O MonexUp backend chamará a API REST do ProxyPay (que é um projeto .NET separado) para criar QR Codes PIX e consultar status. Não haverá dependência direta do AbacatePay — o ProxyPay é o intermediário.

**Rationale**: O ProxyPay já abstrai o provedor de pagamento (AbacatePay). O MonexUp deve tratar o ProxyPay como um serviço externo via HTTP, assim como faz com Lofn e Dedalo. Isso mantém o acoplamento mínimo e segue o princípio III da constitution (delegação a projetos externos).

**Alternatives considered**:
- Chamar AbacatePay diretamente do MonexUp: rejeitado — viola o princípio de delegação e duplica lógica que já existe no ProxyPay.
- Usar o ProxyPay como pacote NuGet: rejeitado — ProxyPay é uma API independente, não uma biblioteca.

## R2: Integração Frontend MonexUp ↔ proxypay-react

**Decision**: O frontend usará o pacote npm `proxypay-react` que fornece componentes prontos: `ProxyPayProvider`, `PixPayment`. O `ProxyPayProvider` será adicionado ao `ContextBuilder` no `App.tsx`. O componente `PixPayment` substituirá o `SubscriptionForm` (Stripe Embedded Checkout) na página de produto.

**Rationale**: O pacote `proxypay-react` já implementa o modal PIX com QR Code, polling automático, timer de expiração e callbacks de sucesso/erro. Reutilizar esses componentes evita reimplementar lógica de polling e UI.

**Alternatives considered**:
- Implementar componente PIX customizado chamando a API diretamente: rejeitado — duplicaria o que já existe no pacote.
- Usar apenas o hook `useProxyPay` sem componentes: rejeitado — o componente `PixPayment` já encapsula toda a UX necessária.

## R3: Fluxo de Pagamento PIX (end-to-end)

**Decision**: O fluxo será:
1. Comprador clica em comprar → frontend solicita CPF
2. Frontend chama backend `POST /Order/createPixPayment/{productSlug}` com CPF
3. Backend cria/reutiliza Order (status Incoming), cria Invoice (status Pending)
4. Backend chama ProxyPay API `POST /payment/qrcode` com dados do cliente e itens
5. Backend retorna QRCodeResponse (brCode, brCodeBase64, invoiceId, expiredAt)
6. Frontend renderiza `PixPayment` com QR Code e polling
7. Polling detecta pagamento → frontend redireciona para `/checkout/success`
8. Backend marca Invoice como Paid e calcula comissões

**Rationale**: Este fluxo separa responsabilidades: backend gerencia Orders/Invoices/Comissões, ProxyPay gerencia pagamento PIX, frontend gerencia UX.

## R4: Sincronização de Invoices Pendentes

**Decision**: O botão "Sincronizar" chamará o backend, que iterará sobre invoices pendentes e consultará o status de cada uma no ProxyPay via `GET /payment/qrcode/status/{invoiceId}`. Se paga, atualiza a invoice e calcula comissões.

**Rationale**: Substitui a sincronização em lote do Stripe (que buscava todas as invoices) por consultas individuais ao ProxyPay. Como nesta fase só há PIX, o volume de consultas é gerenciável.

**Alternatives considered**:
- Buscar todas as invoices do ProxyPay em lote: ProxyPay não possui endpoint de listagem geral — apenas consulta por ID.

## R5: Remoção do Stripe

**Decision**: Remoção completa em 3 frentes:
1. **Backend**: Remover StripeService, IStripeService, pacote NuGet Stripe.net, referências em Initializer.cs, configuração STRIPE_SECRET_KEY
2. **Frontend**: Remover SubscriptionForm.tsx, pacotes @stripe/react-stripe-js e @stripe/stripe-js, variável REACT_APP_STRIPE_PUBLISHABLE_KEY
3. **Banco**: Migration para remover colunas stripe_id (Invoice, Order), stripe_product_id e stripe_price_id (Product)

**Rationale**: A spec determina remoção completa. Manter código morto viola o princípio de simplicidade.

## R6: Campos de Referência no Banco

**Decision**: Remover todos os campos Stripe sem substituição. O ProxyPay retorna `invoiceId` que pode ser armazenado temporariamente em memória durante o fluxo de pagamento, mas não precisa ser persistido no banco do MonexUp — o ProxyPay já persiste seus próprios dados.

**Rationale**: A spec determina remoção sem campo de referência externa. O ProxyPay é o sistema de registro para dados de pagamento. Se necessário no futuro, um campo genérico pode ser adicionado.

## R7: Coleta de CPF no Frontend

**Decision**: Adicionar campo de CPF no formulário de pagamento PIX (antes de gerar o QR Code). O CPF será enviado ao backend junto com a requisição de pagamento. O backend repassará ao ProxyPay como `documentId` do customer.

**Rationale**: O ProxyPay/AbacatePay exige CPF para gerar QR Code PIX. Como o cadastro básico (NAuth) não coleta CPF, a solução menos invasiva é pedir no momento do pagamento.

## R8: Configuração do ProxyPay

**Decision**: Adicionar em `appsettings.json`:
```json
"ProxyPay": {
  "ApiUrl": "https://...",
  "ClientId": "...",
  "TenantId": "monexup"
}
```
E no frontend (`monexup-app/.env`):
```
REACT_APP_PROXYPAY_API_URL=https://...
REACT_APP_PROXYPAY_CLIENT_ID=...
REACT_APP_PROXYPAY_TENANT_ID=monexup
```

**Rationale**: Segue o princípio IV da constitution (configuração via IConfiguration/env vars com prefixo REACT_APP_).

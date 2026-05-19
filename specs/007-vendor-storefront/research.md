# Phase 0 — Research: Vendor Storefront

## R1. Reusar `Order/createPixPayment` em vez de criar endpoint novo

- **Decision**: Reusar `POST /Order/createPixPayment/{productSlug}?networkSlug=&sellerSlug=` (frontend: `OrderService.createPixPayment` em `monexup-app/src/Services/Impl/OrderService.tsx:13-25`).
- **Rationale**: Endpoint já cria invoice MonexUp + gera QR ProxyPay + atribui comissão multi-nível pelo `sellerSlug`/`networkSlug` (FR-013). Cobertura por testes existentes. Idempotência server-side já garantida (FR-015).
- **Alternatives**: criar endpoint dedicado `/Storefront/checkout` — rejeitado: duplica lógica e não acrescenta valor; viola Princípio III (delegação) ao expandir superfície sem ganho.

## R2. Modal PIX — usar `<PixPayment>` do `proxypay-react`

- **Decision**: Usar componente `<PixPayment>` (`c:\repos\ProxyPay\proxypay-react\src\components\PixPayment.tsx`) que (a) renderiza modal via `createPortal`, (b) faz polling automático em `pollInterval` via `useProxyPay().checkQRCodeStatus(invoiceId)`, (c) emite `onSuccess(status)` quando `status.paid === true`.
- **Rationale**: Satisfaz FR-009 (padrão visual do pacote), FR-010a (polling nativo direto no ProxyPay, sem consultar MonexUp). Já existe em `PixPaymentForm.tsx:39-61` como referência funcional.
- **Alternatives**: implementar modal próprio com polling MonexUp — rejeitado: duplicaria o trabalho do pacote oficial e adiciona latência (front→back→ProxyPay).

## R3. Filtro de produtos por vendedor+rede

- **Decision**: `ProductContext.search({ networkSlug, userSlug: sellerSlug, onlyActive: true, pageNum })` — exatamente o padrão usado por `SellerPage` (`monexup-app/src/Pages/SellerPage/index.tsx:34-49`).
- **Rationale**: `Lofn.API.ProductController.Search` aceita `userSlug`/`networkSlug` e resolve internamente para `userId` (`ProductController.cs:69-75`). Filtra por status ativo via `onlyActive`. Sem novo serviço/repositório.
- **Alternatives**: nova rota Lofn dedicada — rejeitado: viola Princípio III; Lofn não deve receber lógica MonexUp-específica.

## R4. Definição da rota

- **Decision**: Adicionar `<Route path="store/:sellerSlug" element={<StorefrontPage />} />` dentro do bloco `:networkSlug` (`App.tsx:264-283`), antes de `<Route path=":productSlug" />` para evitar colisão de matching.
- **Rationale**: "store" é literal e ocorre antes do `:sellerSlug` dinâmico — não conflita com `:productSlug` nem com `@/:sellerSlug` (que já existe). Mantém `LayoutNetwork`.
- **Alternatives**:
  - `/:networkSlug/@/:sellerSlug/store` — rejeitado: confunde com `SellerPage` existente que já usa `@/:sellerSlug`.
  - rota top-level `/store/:network/:vendor` — rejeitado: clarificação Q2 definiu padrão sob `:networkSlug`.

## R5. Login simples (nome + e-mail + CPF) sem senha

- **Decision**: Criar usuário com `userContext.insert({ name, email, documentId: cpf })` gerando senha aleatória interna; logo após `insert` chamar `authContext.loadUserSession()` ou efetuar auto-login com a senha gerada (mesma estratégia já adotada em `RequestAccessPage`/`SellerAddPage` quando aplicável — confirmar no momento da implementação). Se NAuth exigir senha definida pelo usuário, fluxo deve incluir geração + envio por e-mail (link de definir senha) e prosseguir mesmo assim com o pagamento (o invoice é criado vinculado ao userId recém-criado).
- **Rationale**: Spec FR-005a/FR-005b exige apenas nome+e-mail+CPF; não exige senha do usuário. Reaproveita NAuth sem alterar contrato.
- **Open point**: confirmar comportamento de `userContext.insert` quanto a senha — se exigir, gerar internamente. Se já permitir nulo, ainda melhor.
- **Alternatives**:
  - Pedir senha no formulário — rejeitado pela clarificação Q1 (login *simples*).
  - Checkout anônimo sem criar usuário — rejeitado por Q1 (login obrigatório).

## R6. Validação de CPF

- **Decision**: Reusar utilitário de validação CPF já presente no frontend MonexUp (provável local: `monexup-app/src/Infra/...` ou `packages/`). Se inexistente, importar de `zTools`/lofn-react. Implementação: dígito verificador + máscara.
- **Rationale**: FR-005b exige validação local antes de chamar API; falha rápida = melhor UX.
- **Alternatives**: deixar backend validar — rejeitado: UX pior (round-trip).

## R7. Redirect pós-pagamento

- **Decision**: `navigate('/checkout/success')` no callback `onSuccess` do `<PixPayment>` (mesmo padrão de `PixPaymentForm.tsx:46`).
- **Rationale**: Q4 clarificou — usar `CheckoutSuccessPage` existente.
- **Alternatives**: confirmação inline → rejeitada por Q4.

## R8. Idempotência

- **Decision**: Confiar na implementação server-side existente do `createPixPayment`. No frontend, desabilitar o botão durante request pendente para mitigar duplo-clique (UX). Edge case: usuário fecha modal antes do retorno do servidor → ainda OK porque o backend criou o invoice; webhook ProxyPay liquida.
- **Rationale**: FR-015 + SC-004 (zero duplicatas em 5 min).
- **Alternatives**: gerar `idempotencyKey` no front — rejeitado: spec do backend não suporta hoje.

## R9. Rede inativa / vendedor fora da rede

- **Decision**: Antes de listar produtos, chamar `networkContext.getBySlug(networkSlug)` e `networkContext.getSellerBySlug(networkSlug, sellerSlug)`. Se falhar, exibir `EmptyState` com mensagem amigável ("Loja indisponível" / "Vendedor não encontrado") em vez de redirecionar para `Error404Page` — mantém URL navegável e SEO-friendly.
- **Rationale**: FR-002a + edge case "rede inativa".
- **Alternatives**: redirect para `/` — rejeitado: perde contexto da rede e a URL deixa de ser compartilhável.

## R10. Polling do ProxyPay vs status do backend

- **Decision**: Polling no ProxyPay diretamente via `<PixPayment>` (FR-010a). Backend MonexUp recebe webhook ProxyPay assincronamente — não consultado pelo modal.
- **Rationale**: Q3 clarificou. Reduz latência e elimina dependência server-side para refresh UI.
- **Risk**: Webhook ProxyPay atrasar e usuário ver "pago" no modal antes do invoice MonexUp consolidar. Mitigação: `CheckoutSuccessPage` reconsulta o invoice via `OrderContext.getById` no carregamento.

## R11. i18n — chaves novas

- **Decision**: Adicionar chaves em `public/locales/{pt,en,es,fr}/translation.json`. Lista mínima:
  - `storefront_title`, `storefront_empty`, `storefront_loading`, `storefront_unavailable`
  - `btn_buy`, `btn_donate`
  - `simple_login_title`, `field_name`, `field_email`, `field_cpf`
  - `cpf_invalid`, `email_invalid`, `name_required`
  - `donation_amount_label`, `donation_min_warning`
  - `pix_modal_title`, `pix_expired`, `pix_retry`
- **Rationale**: Princípio V (i18n obrigatório, 4 idiomas).

## R12. Performance — paginação + lazy de imagens

- **Decision**: Paginação server-side já existe (`ProductSearchParam.pageNum`). Imagens com `loading="lazy"` nativo HTML; placeholder enquanto carrega. Tamanho de página default 12 (3×4 grid em desktop).
- **Rationale**: SC-001 (3 s em 4G) e SC-006 (200 visitantes simultâneos).
- **Alternatives**: virtual scroll — não necessário no horizonte de produtos esperado (dezenas, não milhares).

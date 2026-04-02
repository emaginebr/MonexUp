# Feature Specification: Substituir Stripe pelo ProxyPay

**Feature Branch**: `001-replace-stripe-proxypay`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: "Substitua o stripe pelo proxypay"

## Clarifications

### Session 2026-04-02

- Q: Remover Stripe completamente ou manter para cartão/assinatura? → A: Remover Stripe mas desabilitar botões de cartão/assinatura no frontend (sem erro, sem opção visível). Sistema fica apenas com PIX.
- Q: Como tratar campos de banco `StripeId`, `StripeProductId`, `StripePriceId`? → A: Remover todos os campos relacionados ao Stripe (sem campo de referência externa).
- Q: Para onde direcionar o comprador após pagamento PIX confirmado? → A: Redirecionar para uma página de confirmação dedicada (ex: `/checkout/success`).
- Q: Manter ou remover botão de sincronização de invoices? → A: Manter o botão mas adaptá-lo para consultar status das invoices pendentes diretamente no ProxyPay.
- Q: Como obter CPF do comprador para gerar QR Code PIX? → A: Solicitar CPF no momento do pagamento (campo adicional antes de gerar o QR Code PIX).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pagamento único via PIX (Priority: P1)

Um comprador acessa a página de um produto em uma rede, escolhe comprar e realiza o pagamento via PIX. O sistema solicita o CPF, gera um QR Code PIX, o comprador escaneia e paga. O sistema detecta automaticamente o pagamento, confirma o pedido e redireciona para uma página de confirmação.

**Why this priority**: PIX é o método de pagamento mais utilizado no Brasil e oferece confirmação instantânea, representando o fluxo de maior valor para a plataforma.

**Independent Test**: Pode ser testado acessando qualquer página de produto, clicando em comprar, informando o CPF e completando o pagamento PIX. O pedido e a invoice devem ser criados e marcados como pagos, e o comprador deve ser redirecionado para a página de confirmação.

**Acceptance Scenarios**:

1. **Given** um comprador autenticado na página de um produto, **When** ele clica em comprar, **Then** o sistema solicita o CPF do comprador antes de prosseguir.
2. **Given** o comprador informou o CPF, **When** o sistema processa a solicitação, **Then** exibe um modal com QR Code PIX, o código BR para copiar/colar e um timer de expiração.
3. **Given** o QR Code PIX exibido ao comprador, **When** o comprador realiza o pagamento via app bancário, **Then** o sistema detecta o pagamento via polling, fecha o modal e redireciona para a página de confirmação (`/checkout/success`).
4. **Given** o QR Code PIX exibido ao comprador, **When** o timer expira sem pagamento, **Then** o sistema exibe mensagem de expiração e permite gerar novo QR Code.

---

### User Story 2 - Comprador não autenticado (Priority: P2)

Um visitante não autenticado acessa a página de produto e deseja comprar. Ele preenche um formulário de cadastro rápido antes de prosseguir para o pagamento PIX.

**Why this priority**: Permite que novos usuários comprem sem ter conta prévia, essencial para conversão.

**Independent Test**: Pode ser testado acessando uma página de produto sem estar logado, preenchendo o formulário de cadastro, informando o CPF e completando o pagamento PIX.

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado na página de produto, **When** ele clica em comprar, **Then** o sistema exibe formulário de cadastro rápido (nome, email, senha).
2. **Given** o visitante preencheu o cadastro, **When** ele submete o formulário, **Then** a conta é criada, ele é autenticado e direcionado ao fluxo de pagamento PIX (solicitação de CPF).

---

### User Story 3 - Sincronização de status de invoices (Priority: P3)

O administrador ou representante pode consultar o status atualizado das invoices pendentes diretamente no processador de pagamentos, garantindo que o sistema reflita o estado real dos pagamentos.

**Why this priority**: Garante que invoices com status desatualizado possam ser corrigidas manualmente, complementando o fluxo automático de polling durante o pagamento.

**Independent Test**: Pode ser testado acessando a lista de invoices, clicando em sincronizar e verificando que invoices pendentes tiveram seus status atualizados conforme o processador.

**Acceptance Scenarios**:

1. **Given** o administrador na página de lista de invoices com invoices pendentes, **When** ele clica em "Sincronizar", **Then** o sistema consulta o status de cada invoice pendente no ProxyPay e atualiza o status local.
2. **Given** uma invoice pendente cujo pagamento PIX já foi realizado, **When** a sincronização é executada, **Then** a invoice é marcada como paga e as comissões são calculadas.

---

### Escopo Diferido (fora desta implementação)

As seguintes funcionalidades serão implementadas em fases futuras:

- **Pagamento via cartão de crédito**: botões/opções de cartão serão desabilitados no frontend (sem erro, sem opção visível ao usuário).
- **Assinatura recorrente**: funcionalidade de billing/subscription será implementada quando cartão for habilitado.
- **Webhooks do processador**: será implementado junto com cartão e assinaturas. Nesta fase, o status é atualizado via polling (durante pagamento) e sincronização manual.

---

### Edge Cases

- O que acontece quando o comprador fecha o navegador durante o processo de pagamento PIX? O QR Code expira naturalmente e nenhuma cobrança é feita. O pedido permanece com status "Incoming".
- O que acontece quando o comprador tenta comprar o mesmo produto duas vezes? O sistema reutiliza o pedido existente com status "Incoming" se houver.
- O que acontece quando o processador de pagamentos está fora do ar? O sistema exibe mensagem de erro amigável ao comprador.
- O que acontece com dados de pagamentos existentes feitos via Stripe? Os registros existentes permanecem no banco, mas os campos `StripeId`, `StripeProductId` e `StripePriceId` são removidos via migration. Dados históricos de referência ao Stripe são perdidos.
- O que acontece quando o CPF informado é inválido? O sistema exibe mensagem de erro e solicita correção antes de gerar o QR Code.
- O que acontece quando o comprador não tem CPF? O pagamento PIX não pode ser processado sem CPF (requisito do processador).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE suportar pagamento via PIX com geração de QR Code e detecção automática de pagamento via polling.
- **FR-002**: O sistema DEVE solicitar o CPF do comprador antes de gerar o QR Code PIX.
- **FR-003**: O sistema DEVE redirecionar o comprador para uma página de confirmação (`/checkout/success`) após pagamento PIX confirmado.
- **FR-004**: O sistema DEVE criar clientes no processador de pagamentos de forma transparente (upsert por email e CPF).
- **FR-005**: O sistema DEVE calcular comissões (plataforma, rede e representante) ao confirmar pagamento, mantendo a lógica existente.
- **FR-006**: O sistema DEVE remover toda dependência do Stripe (backend e frontend): pacotes NuGet, pacotes npm, código-fonte, configurações.
- **FR-007**: O sistema DEVE remover os campos `StripeId` de Invoice e Order, e `StripeProductId`/`StripePriceId` de Product do banco de dados via migration.
- **FR-008**: O sistema DEVE desabilitar opções de pagamento por cartão e assinatura no frontend (não visíveis ao usuário) até implementação futura.
- **FR-009**: O sistema DEVE permitir sincronização manual de invoices pendentes consultando o status no ProxyPay.
- **FR-010**: O sistema DEVE exibir timer de expiração no QR Code PIX e permitir gerar novo QR Code quando expirado.

### Key Entities

- **Invoice**: Registro de cobrança com status (Pendente, Pago, Cancelado, Expirado), valor, data de vencimento, data de pagamento. Relacionada a um pedido. Campo `StripeId` removido.
- **Order**: Pedido de compra com status (Incoming, Active, Suspended, Finished, Expired). Contém itens e está vinculado a uma rede. Campo `StripeId` removido.
- **InvoiceFee**: Taxa de comissão associada a uma invoice (plataforma, rede ou representante). Calculada automaticamente no pagamento.
- **Product**: Produto com nome, preço, descrição, slug e frequência. Campos `StripeProductId` e `StripePriceId` removidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Compradores podem completar um pagamento via PIX em menos de 2 minutos (do clique em comprar até confirmação).
- **SC-002**: O sistema não possui nenhuma referência ao Stripe em código-fonte, pacotes ou dependências após a migração.
- **SC-003**: As comissões (plataforma, rede, representante) são calculadas corretamente em pagamentos processados pelo ProxyPay.
- **SC-004**: Invoices pendentes podem ter seu status atualizado via botão de sincronização.
- **SC-005**: Opções de cartão e assinatura não são visíveis ao usuário no frontend.

## Assumptions

- O processador ProxyPay (que utiliza AbacatePay como provedor) está operacional e com credenciais disponíveis para o ambiente de desenvolvimento.
- O pacote npm `proxypay-react` está disponível e compatível com React 18.
- O backend do ProxyPay está implantado e acessível via HTTP para receber chamadas do MonexUp.
- O fluxo de pagamento para compradores não autenticados (formulário de cadastro rápido) permanece inalterado, apenas o componente de pagamento muda.
- A lógica de cálculo de comissões (InvoiceService.CalculateFee) não é alterada — apenas a origem do evento de pagamento muda.
- Os métodos de pagamento boleto, débito, cartão de crédito e assinatura serão implementados em fases futuras via ProxyPay.
- A remoção dos campos `StripeId`/`StripeProductId`/`StripePriceId` é irreversível — dados históricos de referência ao Stripe serão perdidos.
- CPF é obrigatório para pagamentos PIX (requisito do processador AbacatePay).

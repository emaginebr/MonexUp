# Feature Specification: Página Pública de Produtos do Vendedor (Storefront)

**Feature Branch**: `007-vendor-storefront`
**Created**: 2026-05-15
**Status**: Draft
**Input**: User description: "Preciso que crie uma página com os dados com a lista de produtos: essa tela não é administrativa, é para o usuário do site; cada vendedor deve ter um link próprio para essa página; já existe uma tela para isso, mas não mexa nela, crie uma nova; deve listar todos os produtos, exibindo a imagem com a opção de comprar ou doar (de acordo com o tipo); deve direcionar para a página de pagamento e efetuar o pagamento; no caso de pagamento com QR Code, deve abrir um modal usando o padrão do proxy-pay; use ProxyPay para o pagamento."

## Clarifications

### Session 2026-05-15

- Q: Login obrigatório para Comprar/Doar? → A: Sim, login simples (nome, e-mail, CPF) antes de iniciar pagamento; navegação na storefront permanece anônima.
- Q: Escopo da URL — sem rede vs com rede? → A: URL sempre exige `networkSlug`; rota única `/{networkSlug}/store/{vendorSlug}`. Não haverá `/store/{vendor}` sem rede.
- Q: Como detectar liquidação PIX no modal? → A: Polling direto no ProxyPay pelo próprio `proxypay-react` (comportamento nativo do componente); backend MonexUp atualiza invoice via webhook ProxyPay de forma independente.
- Q: UX após estado "pago"? → A: Redirecionar automaticamente para a tela existente `CheckoutSuccessPage`.
- Q: Card leva à página de detalhe do produto? → A: Não. Card é só vitrine; toda interação acontece via botão Comprar/Doar — não há navegação para `ProductPage` a partir do card.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante acessa storefront público de um vendedor (Priority: P1)

Um visitante (anônimo ou logado) acessa um link único e compartilhável de um vendedor em uma rede específica (`/{networkSlug}/store/{vendorSlug}`) e vê uma página catálogo com todos os produtos ativos daquele vendedor naquela rede. Cada card de produto exibe imagem, nome, descrição curta, preço e um botão de ação cuja semântica depende do tipo do produto (Comprar para físicos/info, Doar para doações).

**Why this priority**: É o núcleo da funcionalidade. Sem listagem pública acessível por link próprio do vendedor não há canal de venda/doação. Primeira fatia entregável de valor.

**Independent Test**: Criar um vendedor com produtos de tipos diferentes, abrir o link público em janela anônima e confirmar que: (a) a página carrega sem login, (b) todos os produtos ativos aparecem com imagem e preço, (c) o rótulo do botão muda conforme o tipo, (d) produtos inativos não aparecem.

**Acceptance Scenarios**:

1. **Given** um vendedor existe e possui 3 produtos ativos (1 físico, 1 info, 1 doação), **When** um visitante anônimo acessa o link público do vendedor, **Then** a página exibe os 3 produtos com imagem, nome, preço e o botão correto por tipo.
2. **Given** um vendedor existe mas não possui produtos ativos, **When** o visitante acessa o link público, **Then** a página exibe um estado vazio claro (ex.: "Este vendedor ainda não publicou produtos").
3. **Given** o `vendorSlug` da URL não existe, **When** o visitante acessa o link, **Then** a página retorna um estado 404 amigável.
4. **Given** uma listagem grande (acima do tamanho de página), **When** o visitante avança a paginação, **Then** mais produtos são carregados sem recarregar a página.

---

### User Story 2 - Comprar produto físico/info via PIX em modal ProxyPay (Priority: P1)

A partir do card de um produto do tipo Físico ou InfoProduto, o visitante clica em **Comprar**, é levado ao fluxo de checkout (coleta dos dados mínimos necessários ao pagamento) e, ao confirmar, um **modal** abre exibindo o QR Code PIX gerado via ProxyPay. O modal segue o padrão visual do pacote `proxypay-react`. Após confirmação de pagamento (ou expiração), o usuário recebe feedback adequado.

**Why this priority**: Conversão de visita em receita. Sem fluxo de pagamento completo, a página é só vitrine.

**Independent Test**: Em ambiente com ProxyPay sandbox, clicar em **Comprar** em um produto físico, preencher os dados, confirmar; o modal PIX deve abrir mostrando QR Code e código copia-e-cola; simular liquidação no sandbox deve mudar o estado do modal para "pago" e a tela final indicar sucesso.

**Acceptance Scenarios**:

1. **Given** um produto do tipo Físico ou InfoProduto e um visitante anônimo na storefront, **When** ele clica em **Comprar**, **Then** o sistema exibe formulário de login simples (nome, e-mail, CPF) antes de prosseguir.
2. **Given** os dados de login válidos preenchidos, **When** o visitante confirma, **Then** o modal PIX abre exibindo QR Code, valor correto e código copia-e-cola.
3. **Given** o modal PIX aberto, **When** o pagamento é confirmado pelo provedor, **Then** o modal atualiza para o estado "pago" e o usuário é redirecionado automaticamente para `CheckoutSuccessPage`.
4. **Given** o modal PIX aberto, **When** o QR Code expira sem pagamento, **Then** o modal apresenta opção de gerar novo código ou cancelar.
5. **Given** falha de comunicação com ProxyPay durante a geração, **When** o usuário tenta gerar o QR, **Then** uma mensagem de erro clara é exibida com opção de tentar novamente.

---

### User Story 3 - Doar para produto do tipo Doação (Priority: P2)

A partir do card de um produto do tipo Doação, o botão exibe **Doar**. Ao clicar, o visitante é levado ao fluxo de pagamento. Se o produto permite valor livre (modo doação aberto), o visitante informa o valor (respeitando o mínimo configurado); caso contrário usa o preço definido. O restante do fluxo é idêntico ao de compra (modal PIX ProxyPay).

**Why this priority**: Doações são uma porção menor mas distinta do catálogo. Reaproveita o fluxo de pagamento da US2; pode ser entregue logo depois.

**Independent Test**: Para um produto de doação com `minimumDonationAmount` definido, clicar em **Doar**, tentar valor abaixo do mínimo (deve bloquear), tentar valor válido (deve seguir para o modal PIX), confirmar pagamento sandbox e validar sucesso.

**Acceptance Scenarios**:

1. **Given** um produto de doação com valor mínimo R$ 10, **When** o visitante informa R$ 5, **Then** o sistema impede e exibe a regra do mínimo.
2. **Given** um visitante anônimo informa um valor válido e confirma, **When** ele prossegue, **Then** o sistema exige login simples (nome, e-mail, CPF) antes de abrir o modal PIX.
3. **Given** um produto de doação e visitante já autenticado, **When** o valor é confirmado, **Then** o modal PIX abre com o valor informado.
4. **Given** um produto de doação com valor fixo, **When** o visitante clica em **Doar**, **Then** não é solicitado valor adicional e o fluxo segue direto à etapa de login (se aplicável) e modal PIX com o valor do produto.

---

### Edge Cases

- Vendedor existe mas a rede (network) está inativa: storefront deve respeitar o status da rede (não exibir).
- Produto removido entre listagem e clique em comprar: ao iniciar checkout o sistema deve revalidar e informar indisponibilidade.
- Visitante sem JavaScript / com bloqueador de scripts: exibir mensagem de requisitos mínimos.
- URL sempre traz a rede (`/{network}/store/{vendor}`): vendedor em múltiplas redes terá um storefront distinto por rede; tentativa de acessar sem `networkSlug` resulta em 404/redirecionamento.
- Produtos com múltiplas imagens: o card usa apenas a imagem principal; demais imagens não são acessíveis pela storefront.
- Pagamento concluído após o usuário fechar o modal: o sistema ainda deve registrar a venda/doação (idempotência server-side).
- Mesmo produto adicionado mais de uma vez rapidamente (duplo clique): impedir duplicação de invoice.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor uma nova rota pública (não administrativa) `/{networkSlug}/store/{vendorSlug}` para cada par (rede, vendedor), sem alterar a tela de vendedor já existente (`SellerPage`).
- **FR-002**: A rota MUST exigir `networkSlug` na URL; não há rota sem rede. A combinação (rede, vendedor) determina os produtos exibidos e a atribuição de comissão.
- **FR-002a**: Se o vendedor não pertence à rede informada na URL, o sistema MUST retornar 404 amigável.
- **FR-003**: O sistema MUST listar todos os produtos ativos do vendedor com imagem principal, nome, descrição curta e preço.
- **FR-003a**: O card MUST ser exclusivamente vitrine: não navega para `ProductPage` nem abre detalhe; a única ação interativa do card é o botão Comprar/Doar.
- **FR-004**: O sistema MUST exibir, em cada card, um botão de ação cujo rótulo depende do tipo do produto: **Comprar** para Físico (1) e InfoProduto (2); **Doar** para Doação (3).
- **FR-005**: A listagem (navegação na storefront) MUST ser acessível por visitante anônimo, sem login.
- **FR-005a**: Ao clicar em **Comprar** ou **Doar**, o sistema MUST exigir um login simples coletando **nome**, **e-mail** e **CPF** antes de iniciar o fluxo de pagamento, caso o visitante ainda não esteja autenticado.
- **FR-005b**: O CPF MUST ser validado (formato e dígito verificador) antes de prosseguir; e-mail MUST ser único por usuário conforme regra existente de cadastro.
- **FR-006**: O sistema MUST paginar a listagem quando o número de produtos ultrapassar o tamanho da página, com navegação clara.
- **FR-007**: Ao clicar em **Comprar** ou **Doar**, o sistema MUST conduzir o visitante ao fluxo de pagamento (coleta dos dados mínimos exigidos pelo provedor e pelo modelo do pedido).
- **FR-008**: Para produto de Doação com modo de valor livre, o sistema MUST permitir o visitante informar o valor, validando o mínimo configurado (`minimumDonationAmount`).
- **FR-009**: O pagamento por PIX/QR Code MUST ser apresentado em um **modal** seguindo o padrão visual do pacote `proxypay-react`, exibindo QR Code, código copia-e-cola e valor.
- **FR-010**: O sistema MUST integrar com ProxyPay para gerar a cobrança e tratar liquidação no backend via webhook ProxyPay (atualização do invoice MonexUp).
- **FR-010a**: O modal PIX no frontend MUST detectar a liquidação consultando o ProxyPay diretamente, usando o mecanismo nativo de polling do componente `proxypay-react` (não consulta o MonexUp para esse fim).
- **FR-011**: O sistema MUST refletir no modal os estados do pagamento (pendente, pago, expirado, falhou) e, ao atingir estado "pago", MUST redirecionar automaticamente o usuário para a tela existente `CheckoutSuccessPage` exibindo confirmação do pedido/doação.
- **FR-012**: O sistema MUST consumir os produtos da API externa Lofn (já integrada via `LofnProductRepository` e `ProductController/search`), filtrando por `userSlug` (e `networkSlug` quando aplicável) e por status ativo.
- **FR-013**: O sistema MUST preservar a atribuição correta do vendedor para fins de comissão multi-nível ao criar a ordem/invoice.
- **FR-014**: Em caso de erro ao listar produtos, gerar QR Code ou processar pagamento, o sistema MUST exibir mensagem clara em PT-BR e oferecer opção de nova tentativa quando aplicável.
- **FR-015**: O sistema MUST garantir idempotência ao criar a ordem/invoice para evitar duplicação por re-cliques ou retorno tardio do provedor.
- **FR-016**: A nova página MUST coexistir com a tela existente sem reaproveitar seus componentes de forma que afete o comportamento atual da `SellerPage`.

### Key Entities *(include if feature involves data)*

- **Vendedor (Seller / User)**: Usuário com perfil de vendedor, identificado por slug único; possui produtos no Lofn vinculados pelo `ProductLink` em MonexUp.
- **Rede (Network)**: Contexto multi-nível opcional; quando presente na URL determina a árvore de comissão. Vincula-se ao Lofn por `lofn_store_id` (lazy).
- **Produto (Product)**: Vindo da Lofn. Atributos chave: `productId`, `name`, `slug`, `description`, `price`, `imageUrl`, `status`, `productType` (Physical/InfoProduct/Donation), `donationMode`, `minimumDonationAmount`.
- **Pedido/Invoice (Order/Invoice)**: Criado no MonexUp ao iniciar pagamento; gera cobrança PIX no ProxyPay e referencia produto, vendedor e (opcional) rede.
- **Cobrança PIX (ProxyPay Invoice)**: Recurso externo do ProxyPay com QR Code, código copia-e-cola, valor e status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% dos visitantes carregam a storefront completa (imagens e botões prontos) em menos de 3 segundos em conexão 4G padrão.
- **SC-002**: Pelo menos 90% das tentativas de pagamento PIX exibem o QR Code em menos de 2 segundos após a confirmação do checkout.
- **SC-003**: Taxa de conclusão de compra/doação iniciada (visitante que clica em Comprar/Doar e chega ao estado "pago") fica acima de 60% no primeiro mês após o lançamento.
- **SC-004**: Zero invoices duplicadas por sessão de pagamento dentro de janela de 5 minutos (idempotência efetiva).
- **SC-005**: 100% das vendas/doações realizadas via storefront ficam corretamente atribuídas ao vendedor da URL (atribuição de comissão verificável em auditoria).
- **SC-006**: Página suporta pelo menos 200 visitantes simultâneos por vendedor sem degradação perceptível.
- **SC-007**: Em testes com usuários, pelo menos 90% conseguem identificar o botão correto (Comprar vs Doar) e concluir o fluxo na primeira tentativa.

## Assumptions

- A API Lofn (`Lofn:ApiURL`, header `X-Tenant-Id: monexup`) já expõe `POST /Product/search` com filtros `userSlug` e `networkSlug` suficientes para alimentar a storefront — confirmado em `ProductController.cs`.
- O slug do vendedor já é único globalmente no MonexUp e é resolvível via API existente (`userContext.getBySlug`).
- O fluxo de pagamento PIX existente (componentes em `Pages/ProductPage/PixPaymentForm.tsx` e contexto ProxyPay) pode ser reaproveitado como base, sem mexer na `SellerPage`/`ProductPage` antigas — uma nova página/rota será criada.
- A tela existente que NÃO deve ser modificada é `monexup-app/src/Pages/SellerPage/index.tsx` (storefront via templates Dedalo).
- ProxyPay já está configurado em `monexup-app/.env` (`REACT_APP_PROXYPAY_API_URL`, `REACT_APP_PROXYPAY_CLIENT_ID`, `REACT_APP_PROXYPAY_TENANT_ID`).
- O pacote `proxypay-react` (em `c:\repos\ProxyPay\proxypay-react`) fornece `PixPayment`/`InvoicePayment`/`BillingPayment` reutilizáveis dentro de um modal Bootstrap/Material-UI.
- A "página de pagamento" mencionada pelo usuário pode ser materializada como checkout inline + modal PIX no mesmo fluxo, considerada equivalente — não é exigida uma rota intermediária dedicada.
- Idioma padrão pt-BR; demais idiomas (en, es, fr) acompanham via `i18next` conforme convenção do projeto.
- Comissão multi-nível segue o mecanismo já existente no backend MonexUp; nenhuma regra nova é introduzida.
- A criação de ordem/invoice continua sendo responsabilidade do MonexUp; a Lofn é consultada apenas para metadados de produto (sem CRUD de produto a partir deste fluxo).

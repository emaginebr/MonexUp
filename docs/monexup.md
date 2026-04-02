# Projeto MonexUp
---
## Sistema de Vendas usando Marketing de Redes e Marketing Multi Nível

1. Página de Produto / Doação
	- O representante (seller) possui um link personalizado com slug: `/@/{sellerSlug}/{productSlug}` ou `/{networkSlug}/@/{sellerSlug}/{productSlug}`;
	- A página de produto é renderizada via template do Dedalo, exibindo informações do produto (nome, descrição, preço, imagens) vindas da API do Lofn;
	- Usuários autenticados visualizam o formulário de pagamento Stripe (Embedded Checkout via `@stripe/react-stripe-js`);
	- Usuários não autenticados visualizam um formulário de cadastro rápido (nome, email, senha) antes do pagamento;
	- O pagamento cria um pedido (Order) com status "Incoming" e gera uma sessão de checkout no Stripe;
	- Produtos suportam frequência: pagamento único (0), mensal (30) ou anual (365);
	- Após o checkout, o sistema processa a invoice via callback do Stripe;

2. Página da Rede (Storefront)
	- Cada rede possui uma página pública acessível via `/{networkSlug}`;
	- A página é renderizada via templates do Dedalo (CMS externo), com partes configuráveis:
		* Hero (banner com texto/imagem) — Hero01Part, Hero02Part;
		* Planos em colunas (3 ou 4 colunas) — Plan3ColsPart, Plan4ColsPart;
		* Lista de produtos com paginação — ProductListPart;
		* Equipe — Team3ColsPart;
	- Administradores da rede podem editar o template em modo de edição;
	- Produtos são carregados da API do Lofn;

3. Página do Representante (Seller)
	- Cada representante possui uma página pública: `/@/{sellerSlug}` ou `/{networkSlug}/@/{sellerSlug}`;
	- Exibe perfil do representante (imagem, bio) e seus produtos;
	- Também renderizada via templates do Dedalo;

4. Cadastro de Usuário
	- O cadastro é feito via pacote nauth-react (NAuth);
	- Campos do cadastro básico (doador):
		* Nome completo (obrigatório);
		* Email (obrigatório);
		* Senha (obrigatório);
	- Não é possível criar mais de um cadastro por email;
	- Após o cadastro, o usuário é redirecionado para a tela de login;

5. Cadastro de Representante (Seller)
	- Cadastro via página `/new-seller` ou `/{networkSlug}/new-seller`;
	- Campos do formulário:
		* Nome completo (obrigatório);
		* Email (obrigatório);
		* Telefone (obrigatório);
		* CPF (obrigatório);
		* Data de Nascimento (obrigatório);
		* Endereço completo: CEP, rua, complemento, bairro, cidade, estado (obrigatório);
		* Chave PIX para saques (obrigatório);
		* Senha e confirmação (obrigatório, para novos cadastros);
	- Após o cadastro, o representante entra com status "Aguardando Aprovação" (WaitForApproval);
	- O representante precisa ser aprovado por um Administrador da Rede para ter acesso;

6. Solicitação de Acesso à Rede
	- Via página `/{networkSlug}/request-access`;
	- Usuário autenticado pode solicitar acesso a uma rede;
	- A página exibe mensagens conforme o status:
		* Active: "Você está aprovado" com botão para acessar o dashboard;
		* WaitForApproval: "Solicitação enviada, aguardando aprovação";
		* Inactive: "Acesso negado";
		* Blocked: "Acesso bloqueado";

7. Administração
	- Todos os usuários autenticados podem editar seus dados via nauth-react (UserEditForm);
	- Usuários não podem ser excluídos, apenas ter situação alterada;
	- Usuários podem fazer parte de uma ou mais redes. Há um seletor de rede no menu;

  7.1. Papel Doador (User, Role=1)
	- Acesso ao dashboard com visão limitada (sem saldo);
	- Pode visualizar pedidos e invoices relacionados a si;

  7.2. Papel Representante (Seller, Role=2)
	- Links:
		- O representante possui links personalizados para doação e indicação (visíveis no sistema);
	- Dashboard:
		- Visualiza saldo total (R$) e saldo disponível para saque (R$);
		- Botão "Sacar" existe porém está desabilitado (funcionalidade de saque não implementada);
		- Extrato de transações (statements) com paginação;
		- Estatísticas resumidas (CountPart);
	- Lista de Pedidos (Orders):
		- Visualiza pedidos onde é o vendedor;
		- Colunas: produto(s), valor total, comprador, vendedor, última alteração, status, ações;
		- Paginação;
	- Lista de Invoices:
		- Visualiza invoices onde é o vendedor;
		- Botão de sincronização com Stripe;
		- Colunas: produto(s), valor, comprador, vendedor, vencimento, pagamento, status;
		- Paginação;
	- Lista de Usuários (Teams):
		- Visualiza usuários que indicou;
		- Colunas: nome, perfil, role, comissão, status, ações;
		- Ações disponíveis variam por status do usuário;

  7.3. Papel Administrador da Rede (NetworkManager, Role=3)
	- Todos os recursos do Representante, mais:
	- Preferências da Rede (`/admin/network`):
		- Upload/alteração de imagem da rede;
		- Edição: nome, slug, email, valor mínimo de saque (R$), período de saque (dias), comissão (%);
	- Estrutura de Equipe — Perfis (`/admin/team-structure`):
		- Lista de perfis/níveis com: nome, nível, comissão (%), quantidade de membros;
		- Cadastro de perfil: nome, comissão (%), nível hierárquico;
		- Exclusão de perfil (apenas se nenhum usuário vinculado);
	- Gestão de Equipe (`/admin/teams`):
		- Lista todos os usuários da rede (não apenas os indicados);
		- Ações: Aprovar, Reprovar, Promover, Rebaixar, Ativar, Desativar, Bloquear;
	- Dashboard:
		- Visualiza saldo da rede (R$);
		- Extrato da rede com histórico de transações;

  7.4. Papel Administrador Master (Administrator, Role=4)
	- Acesso a todas as redes via seletor no menu;
	- Todos os recursos do Administrador da Rede em qualquer rede;
	- Pode criar novas redes via wizard de 4 etapas (`/network`):
		1. Login ou cadastro de usuário;
		2. Dados da rede (nome, email, comissão);
		3. Pagamento (placeholder — atualmente pula para etapa 4);
		4. Confirmação de sucesso;

8. Sistema de Comissões
	- Implementado no backend (InvoiceService);
	- Cálculo automático ao criar/pagar invoice:
		* Taxa da plataforma: 2% em redes do plano Free;
		* Comissão da rede: porcentagem configurável;
		* Comissão do representante: porcentagem baseada no perfil/nível;
	- Cada taxa é registrada como InvoiceFee no banco de dados;
	- Saldos calculados: total (getBalance) e disponível para saque (getAvailableBalance);

9. Integração com ProxyPay
	- Backend (ProxyPayService):
		- Geração de QR Code PIX via API do ProxyPay;
		- Consulta de status de pagamento PIX;
		- Sincronização de invoices pendentes com ProxyPay;
		- CPF obrigatório para gerar QR Code PIX;
	- Frontend:
		- Componente PixPayment do pacote `proxypay-react`;
		- Formulário de CPF antes do pagamento;
		- Polling automático para detecção de pagamento;
		- Redirecionamento para página de confirmação após pagamento;
	- Métodos de pagamento atualmente suportados: PIX;
	- Métodos futuros (não implementados): cartão de crédito, assinatura recorrente;

10. Integrações Externas
	- **NAuth**: Autenticação JWT, cadastro de usuários, recuperação de senha (pacote NuGet + nauth-react);
	- **zTools**: Upload de imagens para S3 (DigitalOcean Spaces), envio de email (MailerSend) — cliente de email existe mas não é utilizado ativamente;
	- **Lofn**: Gerenciamento de produtos via API externa (LofnProductRepository no backend, lofn-react no frontend);
	- **Dedalo**: Templates de páginas via API externa (frontend consome diretamente);
	- **ProxyPay**: Processamento de pagamentos PIX via API externa (proxypay-react no frontend, ver item 9);

11. Funcionalidades NÃO Implementadas / Pendentes
	- ❌ Saque (Withdrawal): entidade existe no banco mas sem service/controller — botão no frontend está desabilitado;
	- ❌ Background Service: infraestrutura existe mas toda lógica está comentada/desabilitada;
	- ❌ Upload de documentos do usuário: entidade UserDocument existe mas sem service/endpoint;
	- ❌ Envio de emails transacionais: MailClient registrado mas não utilizado nos fluxos (confirmação de cadastro, confirmação de pagamento, aprovação de representante);
	- ❌ Etapa de pagamento na criação de rede (step 3 do wizard pula direto para confirmação);
	- ❌ Busca/filtro na lista de redes e na lista de usuários (campo de busca existe mas não é funcional);
	- ❌ Botão de convite de representante (existe mas está desabilitado);
	- ⚠️ OriginalController (`/api/original`): código legado de outro projeto (GoblinWars), não utilizado;

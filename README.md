# MonexUp  
Sistema de Vendas com Doações via Marketing de Rede e Marketing Multinível

---

## 📌 Visão Geral

O **MonexUp** é uma plataforma de doações com estrutura de marketing multinível (MLM), permitindo que representantes compartilhem links personalizados, recebam comissões por indicações e acompanhem toda a atividade de sua rede. Administradores têm controle total sobre usuários, planos, redes e comissões.

---

## 🚀 Funcionalidades Principais

### 1. Tela de Doação
- Link único para cada representante.
- Planos de doação predefinidos ou personalizados.
- Planos ocultos acessíveis apenas por link direto.
- Formas de pagamento: **Cartão de Crédito** (padrão), **Boleto**, **PIX**.
- Cadastro obrigatório com:
  - Nome completo, e-mail, CPF (obrigatórios)
  - Telefone (opcional)
- Validação por e-mail (não impede doação).
- Verificação automática de pagamentos pendentes via agendamentos.

---

### 2. Cadastro de Representante
- Compartilha estrutura de cadastro com doador.
- Representantes podem doar e indicar novos usuários.
- Dados exigidos:
  - Informações pessoais
  - Dados bancários
  - Upload de documentos
- Afiliação via link de outro representante.
- Estados possíveis: `Aguardando aprovação`, `Ativo`, `Bloqueado`.

---

## 👥 Perfis e Acessos

### 3.1 Doador
- Visualização do extrato de doações.
- Botão "Pagar" para pagamentos pendentes.
- Pode pertencer a várias redes (escolha via menu).

### 3.2 Representante
- Visualização de extratos de comissão por rede.
- Links personalizados para doação e indicação.
- Solicitação de saque com validação de dados bancários.
- Acesso à lista de indicados e controle de status.

### 3.3 Administrador de Rede
- Cadastro e configuração da rede:
  - Nome, e-mail, templates de e-mail
  - Valores mínimos e periodicidade para saque
- Gerenciamento de níveis:
  - Definição de porcentagem por nível (por usuário ou padrão)
- Gerenciamento de planos:
  - Nome, valor, frequência (única, limitada, recorrente), visibilidade
- Lista e gestão de usuários da rede:
  - Alterar status, permissões, nível, e rede
- Visualização do extrato da rede por representante

### 3.4 Administrador Master
- Gerencia todas as redes do sistema
- Cadastra novas redes (exclusivo deste perfil)
- Acessa todos os recursos dos administradores de rede
- Seleciona a rede ativa via menu superior

---

## 🛠️ Tecnologias Utilizadas
- **Backend:** .NET Core
- **Frontend:** React + React Bootstrap
- **Banco de Dados:** PostgreSQL
- **Integrações:** Gateways de pagamento (Cartão, Boleto, PIX)
- **Tarefas Agendadas:** Verificação automática de pagamentos

---

## 📦 Instalação
(Em breve: instruções de instalação, configuração e execução)

---

## 📄 Licença
Este projeto está sob a licença [MIT](LICENSE).

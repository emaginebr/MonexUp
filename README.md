# MonexUp - Plataforma de Marketing Multinível

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

**MonexUp** é uma plataforma de marketing multinível (MMN) com gerenciamento de doações/assinaturas, processamento de pagamentos via Stripe e rastreamento de comissões multi-nível. Construída com **ASP.NET Core 8.0** no backend e **React 18 + TypeScript** no frontend, seguindo o padrão **Domain-Driven Design (DDD)** com arquitetura em camadas.

O projeto é um monorepo que inclui dois submodules: **NAuth** (serviço de autenticação) e **zTools** (microserviço utilitário para emails, IA e upload de arquivos).

---

## 🚀 Features

- 🔐 **Autenticação JWT** - Autenticação segura via NAuth com esquema customizado
- 💳 **Pagamentos Stripe** - Processamento de pagamentos com checkout embarcado
- 🌐 **Multi-idioma** - Suporte a Português, Inglês, Espanhol e Francês (i18next)
- 📱 **Mobile-ready** - Build Android via Capacitor 7
- 🏗️ **Templates dinâmicos** - Sistema de templates customizáveis para redes
- 📊 **Gestão de redes** - Gerenciamento de redes, produtos, pedidos e faturas
- 💰 **Comissões multi-nível** - Rastreamento e cálculo de comissões em cascata
- 📧 **Envio de emails** - Integração com MailerSend via zTools
- 🤖 **Integração com IA** - ChatGPT e DALL-E via zTools
- ☁️ **Upload de arquivos** - Armazenamento S3-compatible (DigitalOcean Spaces)
- ⏰ **Tarefas agendadas** - Background service com NCrontab

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **ASP.NET Core 8.0** - Web API com controllers REST
- **Entity Framework Core 9.x** - ORM com PostgreSQL (Npgsql)
- **NAuth** - Autenticação JWT customizada
- **Stripe.NET** - Processamento de pagamentos
- **Swashbuckle** - Documentação Swagger/OpenAPI

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript 5.3** - Tipagem estática
- **Bootstrap 5 + Material-UI 6** - Framework CSS e componentes
- **React Router 6** - Roteamento SPA
- **i18next** - Internacionalização (pt, en, es, fr)
- **Axios** - Cliente HTTP
- **Stripe.js** - Checkout embarcado
- **Capacitor 7** - Build mobile (Android)
- **Quill** - Editor de texto rich

### Banco de Dados
- **PostgreSQL 16** - Banco de dados relacional

### DevOps
- **Docker + Docker Compose** - Containerização
- **GitHub Actions** - CI/CD (versionamento e releases automáticas)
- **GitVersion** - Versionamento semântico automático
- **Nginx** - Servidor web do frontend (produção)

---

## 📁 Estrutura do Projeto

```
MonexUp/
├── MonexUp.API/                 # ASP.NET Core Web API (controllers, auth)
├── MonexUp.Application/         # DI/IoC setup, configurações
├── MonexUp.Domain/              # Lógica de negócio: serviços, modelos, factories
│   └── Core/                    # Utilitários compartilhados, interfaces de repositório
├── MonexUp.DTO/                 # Data Transfer Objects, enums
├── MonexUp.Infra/               # EF Core DbContext, repositórios
├── MonexUp.Infra.Interfaces/    # Interfaces de infraestrutura
├── MonexUp.BackgroundService/   # Serviço de tarefas agendadas (NCrontab)
├── monexup-app/                 # React 18 + TypeScript (CRA)
│   ├── src/
│   │   ├── Business/            # Lógica de negócio frontend
│   │   ├── Components/          # Componentes reutilizáveis
│   │   ├── Contexts/            # React Contexts
│   │   ├── DTO/                 # Tipos TypeScript
│   │   ├── Infra/               # Infraestrutura (HTTP, etc.)
│   │   ├── Pages/               # Páginas da aplicação
│   │   └── Services/            # Serviços de comunicação com API
│   └── public/locales/          # Arquivos de tradução (pt, en, es, fr)
├── submodules/
│   ├── NAuth/                   # Serviço de autenticação (submodule)
│   └── zTools/                  # Microserviço utilitário (submodule)
├── docker/                      # Scripts de inicialização do Docker
├── .github/workflows/           # GitHub Actions (version-tag, create-release)
├── docker-compose.yml           # Orquestração de todos os serviços
├── MonexUp.sln                  # Solution .NET
└── GitVersion.yml               # Configuração de versionamento semântico
```

---

## 🐳 Docker Setup

### Quick Start com Docker Compose

Esta é a forma mais rápida de subir todo o ambiente (banco de dados, APIs e frontend).

#### 1. Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- [Git](https://git-scm.com/) (com suporte a submodules)

#### 2. Clonar o repositório com submodules

```bash
git clone --recurse-submodules https://github.com/emaginebr/MonexUp.git
cd MonexUp
```

Se já clonou sem submodules:

```bash
git submodule update --init --recursive
```

#### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis obrigatórias:

```bash
# --- PostgreSQL ---
POSTGRES_PASSWORD=sua_senha_segura_aqui

# --- NAuth ---
NAUTH_JWT_SECRET=seu_jwt_secret_aqui

# --- Stripe ---
STRIPE_SECRET_KEY=sk_test_...

# --- Frontend ---
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> Consulte o arquivo `.env.example` para a lista completa de variáveis.

#### 4. Build e start dos serviços

```bash
docker-compose up -d --build
```

Este comando irá criar e iniciar os seguintes containers:

| Container | Descrição | Porta |
|-----------|-----------|-------|
| `monexup-postgres` | PostgreSQL 16 (bancos `monexup_db` e `nauth_db`) | 5432 |
| `nauth-api` | API de autenticação | 5004 |
| `ztools-api` | Microserviço utilitário (email, IA, upload) | 5001 |
| `monexup-api` | API principal MonexUp | 5000 |
| `monexup-bg` | Background service (tarefas agendadas) | — |
| `monexup-app` | Frontend React (Nginx) | 3000 |

#### 5. Verificar o deploy

```bash
# Ver status dos containers
docker-compose ps

# Acompanhar logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f monexup-api
```

### Acessando a Aplicação

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API Principal** | http://localhost:5000 |
| **NAuth API** | http://localhost:5004 |
| **zTools API** | http://localhost:5001 |

### Comandos Docker Compose

| Ação | Comando |
|------|---------|
| Iniciar serviços | `docker-compose up -d` |
| Iniciar com rebuild | `docker-compose up -d --build` |
| Parar serviços | `docker-compose stop` |
| Ver status | `docker-compose ps` |
| Ver logs | `docker-compose logs -f` |
| Remover containers | `docker-compose down` |
| Remover containers e volumes (⚠️) | `docker-compose down -v` |

---

## 🔧 Setup Manual (Sem Docker)

### Pré-requisitos

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) e npm
- [PostgreSQL 16](https://www.postgresql.org/download/)

### 1. Configurar o banco de dados

Crie dois bancos PostgreSQL: `monexup_db` e `nauth_db`.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Backend - Restaurar dependências e aplicar migrations

```bash
# Restaurar e compilar
dotnet restore MonexUp.sln
dotnet build MonexUp.sln

# Aplicar migrations MonexUp
dotnet ef database update --project MonexUp.Infra --startup-project MonexUp.API

# Aplicar migrations NAuth
ConnectionStrings__NAuthContext="Host=localhost;Port=5432;Database=nauth_db;Username=monexup_user;Password=SUA_SENHA" \
  dotnet ef database update --project submodules/NAuth/NAuth.Infra --startup-project submodules/NAuth/NAuth.API
```

### 4. Backend - Executar a API

```bash
dotnet run --project MonexUp.API/MonexUp.API.csproj
```

### 5. Frontend - Instalar dependências e executar

```bash
cd monexup-app
npm install
npm start
```

---

## ⚙️ Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | ✅ |
| `POSTGRES_DB` | Nome do banco (padrão: `monexup_db`) | — |
| `POSTGRES_USER` | Usuário do banco (padrão: `monexup_user`) | — |
| `NAUTH_JWT_SECRET` | Secret para tokens JWT | ✅ |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (backend) | ✅ |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (frontend) | ✅ |
| `MAILERSEND_API_TOKEN` | Token API MailerSend | — |
| `MAILERSEND_SENDER` | Email remetente MailerSend | — |
| `S3_ACCESS_KEY` | Access key DigitalOcean Spaces | — |
| `S3_SECRET_KEY` | Secret key DigitalOcean Spaces | — |
| `S3_ENDPOINT` | Endpoint do S3 | — |
| `CHATGPT_APIKEY` | API key OpenAI (usado por zTools) | — |

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` com credenciais reais. Apenas o `.env.example` deve estar no controle de versão.

---

## 🧪 Testes

### Frontend

```bash
cd monexup-app
npm test
```

---

## 🔄 CI/CD

### GitHub Actions

O projeto utiliza dois workflows automatizados:

**Version and Tag** (`version-tag.yml`)
- **Trigger:** Push na branch `main`
- Calcula a versão semântica via GitVersion
- Cria e pusha tags `v{version}` automaticamente

**Create Release** (`create-release.yml`)
- **Trigger:** Após o workflow "Version and Tag" completar
- Cria GitHub Releases para mudanças de major/minor
- Pula releases para mudanças patch-only

### Versionamento Semântico

O versionamento é controlado por prefixos nos commits:

| Prefixo | Tipo de Bump | Exemplo |
|---------|:------------:|---------|
| `major:` ou `breaking:` | Major | `major: nova arquitetura de pagamentos` |
| `feat:` ou `feature:` | Minor | `feat: adicionado suporte a PIX` |
| `fix:` ou `patch:` | Patch | `fix: correção no cálculo de comissões` |

---

## 📁 Ecossistema

| Projeto | Tipo | Descrição |
|---------|------|-----------|
| **[MonexUp](https://github.com/emaginebr/MonexUp)** | Monorepo | Aplicação principal (API + Frontend) |
| **[NAuth](https://github.com/emaginebr/NAuth)** | Submodule | Serviço de autenticação JWT |
| **[zTools](https://github.com/emaginebr/zTools)** | Submodule | Microserviço utilitário (email, IA, S3) |

### Grafo de Dependências

```
monexup-app (React) ──→ monexup-api ──→ PostgreSQL
                              │
                              ├──→ nauth-api ──→ PostgreSQL (nauth_db)
                              │         │
                              │         └──→ ztools-api
                              │
                              └──→ ztools-api (email, IA, upload)
```

---

## 💾 Backup e Restore

### Backup do PostgreSQL

```bash
docker exec monexup-postgres pg_dumpall -U monexup_user > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
cat backup.sql | docker exec -i monexup-postgres psql -U monexup_user -d monexup_db
```

---

## 🔍 Troubleshooting

### Container do PostgreSQL não inicia

**Verificar:**
```bash
docker-compose logs postgres
```

**Causas comuns:**
- `POSTGRES_PASSWORD` não definida no `.env`
- Porta 5432 já em uso por outra instância do PostgreSQL

**Solução:**
- Preencha a variável `POSTGRES_PASSWORD` no `.env`
- Pare outros serviços PostgreSQL: `sudo systemctl stop postgresql`

### API não conecta ao banco

**Verificar:**
```bash
docker-compose logs monexup-api
```

**Causas comuns:**
- Container do PostgreSQL ainda não está healthy
- Connection string incorreta

**Solução:**
- Aguarde o healthcheck do PostgreSQL completar
- Verifique se o `POSTGRES_PASSWORD` no `.env` está correto

### Frontend não conecta à API

**Causas comuns:**
- `REACT_APP_API_URL` incorreto
- API ainda não iniciou

**Solução:**
- Verifique se `REACT_APP_API_URL=http://localhost:5000` no `.env`
- Rebuild o frontend: `docker-compose up -d --build monexup-app`

---

## 🚀 Deploy

### Desenvolvimento (Docker)

```bash
docker-compose up -d --build
```

### Produção

```bash
# Backend
dotnet publish MonexUp.API/MonexUp.API.csproj -c Release

# Frontend
cd monexup-app && npm run build
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir um Pull Request.

### Setup de Desenvolvimento

1. Fork o repositório
2. Clone com submodules: `git clone --recurse-submodules <seu-fork>`
3. Crie uma branch de feature (`git checkout -b feature/MinhaFeature`)
4. Faça suas alterações
5. Commit suas mudanças (`git commit -m 'feat: minha nova feature'`)
6. Push para a branch (`git push origin feature/MinhaFeature`)
7. Abra um Pull Request

### Padrões de Código

- **Backend:** DDD com Factory/Repository pattern
- **Frontend:** Componentes funcionais React com TypeScript
- **Commits:** Prefixos semânticos (`feat:`, `fix:`, `major:`)

---

## 👨‍💻 Autor

Desenvolvido por **[Rodrigo Landim Carneiro](https://github.com/emaginebr)**

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet)
- [React](https://react.dev)
- [Stripe](https://stripe.com)
- [PostgreSQL](https://www.postgresql.org)
- [Bootstrap](https://getbootstrap.com)
- [Material-UI](https://mui.com)

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/emaginebr/MonexUp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/emaginebr/MonexUp/discussions)

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

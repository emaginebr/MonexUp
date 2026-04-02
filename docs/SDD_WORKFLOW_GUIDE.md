# Guia de Workflow SDD (Specification-Driven Development) — MonexUp

Este documento explica como utilizar o workflow SDD com os comandos `/speckit.*` no projeto MonexUp. Cada etapa é descrita com exemplos contextualizados para este projeto.

---

## Visão Geral do Fluxo

```
Constitution → Specify → Plan → Tasks → Implement → Analyze
     ↓            ↓         ↓        ↓         ↓          ↓
 Princípios   Intenção   Plano   Tarefas   Código    Validação
 do projeto   funcional  técnico  atômicas  gerado    de qualidade
```

Cada etapa alimenta a próxima. A `constitution` é criada **uma vez** e reutilizada em todas as features. As demais etapas são criadas **por feature**.

---

## 1. `/speckit.constitution` — Princípios Inegociáveis

**O que é:** Define as regras fundamentais do projeto que nunca mudam entre features. É o "contrato base" que todas as specs, planos e tasks devem respeitar.

**Quando criar:** Uma única vez, no início da adoção do SDD. Atualize apenas quando houver mudança estrutural no projeto.

**O que preencher para o MonexUp:**

### Stack Tecnológico
```
Backend:
- .NET 8.0, ASP.NET Core Web API
- Entity Framework Core 9.x com PostgreSQL (Npgsql)

Frontend:
- React 18 + TypeScript (CRA)
- Bootstrap 5 + Material-UI 6
- i18next (pt, en, es, fr)

Integrações externas:
- NAuth (autenticação JWT possui um pacote nuget NAuth, dentro dele o ACL e DTOs)
    - use a skill nauth-guide
    - Se preciso consulte o diretório c:/repos/NAuth/NAuth para o backend e c:/repos/NAuth/nauth-react para o frontend
- zTools (email, upload S3, slugs via pacote NuGet)
    - use a skill ztools-guide
    - Se preciso consulte o diretório c:/repos/zTools
- ProxyPay (pagamentos, use o pacote npm proxypay-react)
    - Se preciso consulte o diretório c:/repos/ProxyPay/ProxyPay para o backend e c:/repos/ProxyPay/proxypay-react para o frontend
- Lofn (produtos — API externa, use o pacote npm lofn-react)
    - Se preciso consulte o diretório c:/repos/Lofn/Lofn para o backend e c:/repos/Lofn/lofn-react para o frontend
- Dedalo (templates/CMS — API externa)
    - Se preciso consulte o diretório c:/repos/Dedalo/Dedalo para o backend e c:/repos/Dedalo/dedalo-app
    - Será necessário fazer implementações no Dedalo, NÃO implemente nesse projeto
```

### Convenções de Código
```
Backend:
- Seguir a skill dotnet-architecture

Frontend:
- Seguir as skills react-architecture, react-alert e react-modal
- Para decisões de layout, siga a skill frontend-design
```

### Regras Inegociáveis
```
- Use o projeto NAuth para cuidar de tudo referente a autenticação e criação de usuários
- Produtos: gerenciados pelo Lofn — não criar CRUD de produto neste backend
- Templates: gerenciados pelo Dedalo — não criar CMS neste backend
- Secrets: sempre via appsettings.{Environment}.json ou .env, nunca Environment.GetEnvironmentVariable()
- Docker: NÃO acessível no ambiente CLI — fornecer SQL/comandos para execução manual
```

### Exemplo de comando
```
/speckit.constitution
```
O agente vai te perguntar sobre os princípios. Forneça as informações acima adaptadas conforme necessário.

---

## 2. `/speckit.specify` — Especificação Funcional

**O que é:** Transforma a sua intenção (o que você quer construir) em uma especificação estruturada. Foco no **comportamento**, não na implementação.

**Quando criar:** No início de cada feature nova.

**Como descrever a intenção — exemplos MonexUp:**

### Exemplo 1: Sistema de Withdrawal (Saques)
```
Quero criar um sistema de saque para os usuários das redes.
O usuário pode solicitar saque do saldo disponível (comissões acumuladas).
O administrador da rede aprova ou rejeita o saque.
Após aprovação, o pagamento é processado via Stripe Connect.
O usuário recebe notificação por email do status.
Regras: valor mínimo de saque definido por rede, prazo de carência após último pagamento.
```

### Exemplo 2: Dashboard de Comissões
```
Quero um dashboard para o usuário visualizar suas comissões.
Deve mostrar: total acumulado, total disponível para saque, histórico mensal.
Gráfico de evolução das comissões nos últimos 12 meses.
Filtro por rede (o usuário pode participar de várias redes).
Acessível apenas para usuários autenticados.
```

### Dicas para escrever boas especificações
```
✅ Descreva O QUE o sistema deve fazer (comportamento)
✅ Liste os atores envolvidos (usuário, admin, sistema)
✅ Defina regras de negócio claras
✅ Mencione integrações necessárias (Stripe, email, etc.)

❌ NÃO descreva COMO implementar (controllers, services, etc.)
❌ NÃO mencione tecnologias específicas
❌ NÃO defina estrutura de banco de dados
```

### Comando
```
/speckit.specify
```
Forneça a descrição em linguagem natural. O agente vai estruturar em uma spec formal.

---

## 3. `/speckit.plan` — Plano Técnico

**O que é:** Traduz a especificação funcional em decisões técnicas e arquiteturais. Aqui sim entra tecnologia, APIs, e estrutura de dados.

**Quando criar:** Após a spec ser aprovada.

**O que o plano deve conter (contextualizado para MonexUp):**

### Decisões Arquiteturais esperadas
```
- Quais camadas serão afetadas (Domain, DTO, Infra, Infra.Interfaces, API, Application)
- Novos Models, Factories, Services, Repositories necessários
- Mudanças no MonexUpContext.cs (novos DbSets, configurações)
- Migrations necessárias
- Novos Controllers e endpoints
- Novos DTOs e Enums
```

### Frontend
```
- Novos Services e Interfaces
- Novos Business + Factory
- Novos Context + Provider
- Registro no ServiceFactory.tsx
- Novas Pages e rotas no App.tsx
- Componentes compartilhados necessários
- Chaves de tradução (i18next) nos 4 idiomas
```

### Integrações
```
- Stripe: novos métodos no StripeService?
- Email: novos templates via zTools?
- Lofn/Dedalo: novas chamadas necessárias?
```

### Definição de API
```
- Endpoints REST (verbo, rota, request/response DTOs)
- Autenticação necessária ([Authorize])?
- Roles permitidas?
```

### Comando
```
/speckit.plan
```
O agente lê a spec gerada e produz o plano técnico.

---

## 4. `/speckit.tasks` — Decomposição em Tarefas

**O que é:** Quebra o plano em tarefas atômicas, ordenadas por dependência, com checkpoints de validação.

**Quando criar:** Após o plano ser aprovado.

**Estrutura típica de tarefas para uma feature MonexUp:**

```
Ordem típica de tarefas:

1. Criar Enums no MonexUp.DTO (ex: WithdrawalStatusEnum)
2. Criar DTOs (ex: WithdrawalInfo, WithdrawalSearchParam)
3. Criar Model no MonexUp.Domain/Entities (ex: WithdrawalModel)
4. Criar Interface do Model (ex: IWithdrawalModel)
5. Criar Factory Interface e Implementação (ex: IWithdrawalDomainFactory)
6. Criar Interface do Repository (ex: IWithdrawalRepository em Infra.Interfaces)
7. Criar Implementação do Repository (ex: WithdrawalRepository em Infra)
8. Adicionar DbSet no MonexUpContext.cs
9. Criar Migration EF Core
10. Criar Interface do Service (ex: IWithdrawalService)
11. Criar Implementação do Service (ex: WithdrawalService)
12. Registrar tudo no Initializer.cs (Application)
13. Criar Controller (ex: WithdrawalController)
── CHECKPOINT: Backend compilando e endpoints respondendo ──
14. Criar DTOs frontend (DTO/Domain/WithdrawalInfo.tsx)
15. Criar Service Interface + Implementação frontend
16. Registrar no ServiceFactory.tsx
17. Criar Business Interface + Implementação + Factory
18. Criar Context + Provider
19. Registrar Provider no App.tsx
20. Criar Pages (lista, detalhe, formulário)
21. Adicionar rotas no App.tsx
22. Adicionar chaves i18next nos 4 idiomas
── CHECKPOINT: Feature funcional end-to-end ──
23. Testes (se aplicável)
24. Revisão e ajustes finais
```

### Comando
```
/speckit.tasks
```
O agente lê o plano e gera as tarefas ordenadas com dependências.

---

## 5. `/speckit.implement` — Execução

**O que é:** O agente executa as tarefas uma a uma, gerando o código real.

**Quando usar:** Após as tarefas serem aprovadas.

**O que esperar:**
- O agente segue a ordem de tarefas definida
- Cada tarefa é implementada seguindo os padrões da constitution
- O código segue as convenções de nomenclatura do MonexUp
- Registros de DI são adicionados no Initializer.cs
- Novas entidades são adicionadas ao MonexUpContext.cs

### Comando
```
/speckit.implement
```

### Dicas durante a implementação
- Acompanhe o progresso e valide nos checkpoints
- Se algo parecer errado, pause e corrija antes de prosseguir
- O agente pode pedir esclarecimentos — responda com contexto

---

## 6. `/speckit.analyze` — Quality Gate

**O que é:** Verifica consistência entre constitution, spec, plano e tasks. Identifica contradições, lacunas ou desvios.

**Quando usar:** Após a geração de tasks (antes de implementar) OU após a implementação (como revisão).

**O que é verificado:**
- A spec respeita os princípios da constitution?
- O plano cobre todos os requisitos da spec?
- As tasks cobrem todo o plano?
- Há dependências circulares nas tasks?
- As convenções de código estão sendo seguidas?
- As integrações externas (Lofn, Dedalo) não estão sendo violadas?

### Comando
```
/speckit.analyze
```

---

## Fluxo Completo — Exemplo Prático

Vamos supor que você quer adicionar um **sistema de notificações in-app**:

```bash
# 1. Constitution (apenas na primeira vez)
/speckit.constitution
# → Define os princípios do MonexUp (stack, padrões, regras)

# 2. Especificar a feature
/speckit.specify
# → "Quero um sistema de notificações in-app para os usuários.
#    O sistema deve notificar sobre: novos pedidos, mudanças de status
#    de invoice, aprovação/rejeição em redes. As notificações devem
#    ter status lida/não-lida. O usuário pode marcar todas como lidas.
#    Deve haver um ícone com contador no menu superior."

# 3. Gerar o plano técnico
/speckit.plan
# → Revise as decisões arquiteturais, endpoints, DTOs

# 4. Gerar as tarefas
/speckit.tasks
# → Revise a ordem e dependências

# 5. Validar consistência (opcional mas recomendado)
/speckit.analyze
# → Verifique se não há lacunas ou contradições

# 6. Implementar
/speckit.implement
# → Acompanhe a execução tarefa por tarefa
```

---

## Arquivos Gerados pelo SDD

O workflow SDD armazena os artefatos na pasta `.specify/`:

```
.specify/
├── constitution.md      ← Princípios do projeto (passo 1)
├── features/
│   └── {feature-name}/
│       ├── spec.md      ← Especificação funcional (passo 2)
│       ├── plan.md      ← Plano técnico (passo 3)
│       └── tasks.md     ← Tarefas decompostas (passo 4)
```

---

## Dicas Gerais

1. **Comece pela constitution** — ela só precisa ser feita uma vez e é a base de tudo
2. **Seja detalhista na spec** — quanto mais contexto de negócio, melhor o plano
3. **Revise cada etapa antes de avançar** — o SDD é iterativo, não linear cego
4. **Use `/speckit.analyze` como checkpoint** — especialmente antes de implementar
5. **Uma feature por vez** — não tente especificar múltiplas features simultaneamente
6. **Mantenha a constitution atualizada** — se o projeto mudar (nova integração, novo padrão), atualize

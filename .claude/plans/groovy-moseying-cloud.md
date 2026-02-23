# Reorganização do Projeto .NET — Alinhamento com dotnet-arch-entity

## Contexto

O projeto MonexUp usa uma arquitetura DDD com Factory/Repository, mas a organização dos diretórios e projetos diverge do padrão definido na skill `dotnet-arch-entity`. O objetivo é **reorganizar a estrutura de pastas e projetos** para alinhar com a skill, **sem reescrever** AutoMapper, Domain Models imutáveis, ou lógica de negócios existente.

## Mapeamento: Estrutura Atual → Estrutura Alvo

### Estrutura Alvo (skill dotnet-arch-entity)
```
MonexUp.DTO/                          → DTOs (sem mudança, já está correto)
MonexUp.Domain/
  ├─ Entities/Interfaces/             → Interfaces dos domain models (I{Entity}Model.cs)
  ├─ Entities/                        → Implementações dos domain models ({Entity}Model.cs)
  ├─ Services/Interfaces/             → Interfaces dos serviços (I{Entity}Service.cs)
  └─ Services/                        → Implementações dos serviços ({Entity}Service.cs)
MonexUp.Infra.Interfaces/
  └─ Repository/                      → Interfaces dos repositórios (I{Entity}Repository.cs)
MonexUp.Infra/
  ├─ Context/                         → EF entities + DbContext (sem mudança)
  └─ Repository/                      → Implementações dos repositórios (sem mudança)
MonexUp.Application/                  → DI registration (sem mudança)
MonexUp.API/
  └─ Controllers/                     → Controllers (sem mudança)
```

### O que muda

| De (Atual) | Para (Alvo) | Ação |
|---|---|---|
| `Core.Domain/Repository/I*Repository.cs` | `MonexUp.Infra.Interfaces/Repository/` | Mover 12 interfaces de repositório |
| `MonexUp.Domain/Interfaces/Models/` | `MonexUp.Domain/Entities/Interfaces/` | Renomear diretório |
| `MonexUp.Domain/Impl/Models/` | `MonexUp.Domain/Entities/` | Renomear diretório |
| `MonexUp.Domain/Interfaces/Factory/` | `MonexUp.Domain/Entities/Interfaces/` | Mover factories para junto dos models |
| `MonexUp.Domain/Impl/Factory/` | `MonexUp.Domain/Entities/` | Mover factories para junto dos models |
| `MonexUp.Domain/Interfaces/Services/` | `MonexUp.Domain/Services/Interfaces/` | Renomear diretório |
| `MonexUp.Domain/Impl/Services/` | `MonexUp.Domain/Services/` | Renomear diretório |
| `MonexUp.Domain/Interfaces/Core/` | `MonexUp.Domain/Core/Interfaces/` | Renomear diretório |
| `MonexUp.Domain/Impl/Core/` | `MonexUp.Domain/Core/` | Renomear diretório |
| `DB.Infra/` | `MonexUp.Infra/` | Renomear projeto |
| `Core.Domain/` | Manter (utilitários) | Apenas remover pasta Repository/ |

### O que NÃO muda
- **DTOs** — `MonexUp.DTO/` já está correto
- **Lógica de negócios** — Nenhum código é reescrito
- **Mapeamento manual** — DbToModel/ModelToDb continuam como estão
- **Factory pattern** — Mantido, apenas move de diretório
- **Controllers** — Já estão em `Controllers/`
- **Namespaces** — Serão atualizados para refletir os novos caminhos

---

## Plano de Execução

### Fase 1: Criar projeto `MonexUp.Infra.Interfaces`

1. Criar `MonexUp.Infra.Interfaces/MonexUp.Infra.Interfaces.csproj` (net8.0)
2. Adicionar à solução `MonexUp.sln` via `dotnet sln add`
3. Criar pasta `MonexUp.Infra.Interfaces/Repository/`
4. Mover as 12 interfaces de repositório de `Core.Domain/Repository/` → `MonexUp.Infra.Interfaces/Repository/`
   - `IInvoiceRepository.cs`
   - `IInvoiceFeeRepository.cs`
   - `INetworkRepository.cs`
   - `IOrderRepository.cs`
   - `IOrderItemRepository.cs`
   - `IProductRepository.cs`
   - `ITemplateRepository.cs`
   - `ITemplatePageRepository.cs`
   - `ITemplatePartRepository.cs`
   - `ITemplateVarRepository.cs`
   - `IUserNetworkRepository.cs`
   - `IUserProfileRepository.cs`
5. Atualizar namespace de `Core.Domain.Repository` → `MonexUp.Infra.Interfaces.Repository`
6. Adicionar referência `MonexUp.Infra.Interfaces` ao:
   - `MonexUp.Domain.csproj` (consome as interfaces nos Models)
   - `DB.Infra.csproj` → que será renomeado na Fase 3 (implementa as interfaces)
   - `MonexUp.Application.csproj` (registra DI)
7. Remover `using Core.Domain.Repository` e substituir por `using MonexUp.Infra.Interfaces.Repository` em todos os arquivos afetados
8. Deletar `Core.Domain/Repository/` (pasta vazia)

**Arquivos afetados pelo using:**
- `MonexUp.Domain/Impl/Models/*.cs` (12 arquivos — importam interfaces de repositório)
- `MonexUp.Domain/Impl/Factory/*.cs` (12 arquivos — importam interfaces de repositório)
- `DB.Infra/Repository/*.cs` (12 arquivos — implementam as interfaces)

**Build check:** Compilar e verificar 0 erros.

### Fase 2: Reorganizar `MonexUp.Domain/`

Estrutura atual:
```
MonexUp.Domain/
  ├─ Interfaces/Models/       → I{Entity}Model.cs (13 arquivos)
  ├─ Interfaces/Factory/      → I{Entity}DomainFactory.cs (12 arquivos)
  ├─ Interfaces/Services/     → I{Entity}Service.cs (11 arquivos)
  ├─ Interfaces/Core/         → ILogCore.cs
  ├─ Impl/Models/             → {Entity}Model.cs (12 arquivos)
  ├─ Impl/Factory/            → {Entity}DomainFactory.cs (12 arquivos)
  ├─ Impl/Services/           → {Entity}Service.cs (11 arquivos)
  ├─ Impl/Core/               → LogCore.cs, Utils.cs, etc.
  └─ LanguageUtils.cs
```

Estrutura alvo:
```
MonexUp.Domain/
  ├─ Entities/Interfaces/     → I{Entity}Model.cs + I{Entity}DomainFactory.cs
  ├─ Entities/                → {Entity}Model.cs + {Entity}DomainFactory.cs
  ├─ Services/Interfaces/     → I{Entity}Service.cs
  ├─ Services/                → {Entity}Service.cs
  ├─ Core/Interfaces/         → ILogCore.cs
  ├─ Core/                    → LogCore.cs, Utils.cs, etc.
  └─ LanguageUtils.cs
```

Passos:
1. Criar diretórios: `Entities/`, `Entities/Interfaces/`, `Services/`, `Services/Interfaces/`, `Core/`, `Core/Interfaces/`
2. Mover arquivos (git mv para preservar histórico):
   - `Interfaces/Models/*.cs` → `Entities/Interfaces/`
   - `Interfaces/Factory/*.cs` → `Entities/Interfaces/`
   - `Impl/Models/*.cs` → `Entities/`
   - `Impl/Factory/*.cs` → `Entities/`
   - `Interfaces/Services/*.cs` → `Services/Interfaces/`
   - `Impl/Services/*.cs` → `Services/`
   - `Interfaces/Core/*.cs` → `Core/Interfaces/`
   - `Impl/Core/*.cs` → `Core/`
3. Atualizar namespaces em TODOS os arquivos movidos:
   - `MonexUp.Domain.Interfaces.Models` → `MonexUp.Domain.Entities.Interfaces`
   - `MonexUp.Domain.Interfaces.Factory` → `MonexUp.Domain.Entities.Interfaces`
   - `MonexUp.Domain.Impl.Models` → `MonexUp.Domain.Entities`
   - `MonexUp.Domain.Impl.Factory` → `MonexUp.Domain.Entities`
   - `MonexUp.Domain.Interfaces.Services` → `MonexUp.Domain.Services.Interfaces`
   - `MonexUp.Domain.Impl.Services` → `MonexUp.Domain.Services`
   - `MonexUp.Domain.Interfaces.Core` → `MonexUp.Domain.Core.Interfaces`
   - `MonexUp.Domain.Impl.Core` → `MonexUp.Domain.Core`
4. Atualizar `using` statements em TODOS os consumidores (Controllers, Initializer, etc.)
5. Remover diretórios vazios `Interfaces/` e `Impl/`

**Arquivos que importam esses namespaces (precisam de atualização de usings):**
- `MonexUp.API/Controllers/*.cs` (7 controllers)
- `MonexUp.Application/Initializer.cs`
- `DB.Infra/Repository/*.cs` (12 repositórios)
- Todos os arquivos dentro do próprio `MonexUp.Domain/`
- `MonexUp.BackgroundService/ScheduleTask.cs`

**Build check:** Compilar e verificar 0 erros.

### Fase 3: Renomear `DB.Infra` → `MonexUp.Infra`

1. Renomear diretório: `DB.Infra/` → `MonexUp.Infra/`
2. Renomear arquivo: `DB.Infra.csproj` → `MonexUp.Infra.csproj`
3. Atualizar `MonexUp.sln` (remover `DB.Infra`, adicionar `MonexUp.Infra`)
4. Atualizar referências de projeto em:
   - `MonexUp.Application.csproj`
   - `MonexUp.API.csproj` (se referencia DB.Infra)
   - `MonexUp.BackgroundService.csproj`
5. Atualizar namespace `DB.Infra` → `MonexUp.Infra` em TODOS os arquivos do projeto:
   - `DB.Infra.Context` → `MonexUp.Infra.Context`
   - `DB.Infra.Repository` → `MonexUp.Infra.Repository`
   - `DB.Infra` (UnitOfWork, TransactionDisposable) → `MonexUp.Infra`
6. Atualizar `using DB.Infra.*` → `using MonexUp.Infra.*` em todos os consumidores:
   - `MonexUp.Application/Initializer.cs`
   - `MonexUp.API/Controllers/*.cs`
   - `MonexUp.API/Startup.cs`
   - `MonexUp.Domain/` (se importa DB.Infra)
   - `MonexUp.BackgroundService/`

**Build check:** Compilar e verificar 0 erros.

### Fase 4: Verificação Final e Cleanup

1. Verificar que `Core.Domain/Repository/` está vazio e remover a pasta
2. Verificar que `MonexUp.Domain/Interfaces/` e `MonexUp.Domain/Impl/` estão vazios e remover
3. `dotnet build MonexUp.sln` — deve compilar com 0 erros
4. Verificar que `MonexUp.BackgroundService` também compila

---

## Arquivos Críticos

| Arquivo | Motivo |
|---|---|
| `MonexUp.sln` | Adicionar Infra.Interfaces, renomear DB.Infra → MonexUp.Infra |
| `MonexUp.Application/Initializer.cs` | Atualizar todos os usings (repository, factory, service, context) |
| `MonexUp.Domain/**/*.cs` | ~70 arquivos movidos + namespaces atualizados |
| `MonexUp.Infra/**/*.cs` | ~25 arquivos com namespace renomeado |
| `MonexUp.API/Controllers/*.cs` | Atualizar usings |
| `Core.Domain/Repository/` | 12 interfaces movidas para Infra.Interfaces |

## Verificação

1. `dotnet build MonexUp.sln` — 0 erros em todos os projetos
2. Verificar que a estrutura de diretórios corresponde ao padrão da skill
3. Verificar que nenhuma lógica de negócios foi alterada (apenas namespaces e caminhos)

# Feature Specification: Store Product Admin

**Feature Branch**: `006-store-product-admin`
**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "Crie a parte administrativa para gerenciar produtos da Store via API externa Lofn — duas telas (busca + cadastro), CRUD completo, modos Simples/Avançado, categorias próprias por Store e filtros globais admin-only baseados em storeId vinculado à Network."

## Clarifications

### Session 2026-05-06

- Q: Escopo de filtros no Lofn (Store-scoped vs global)? → A: Filtros são globais no Lofn e no MonexUp; apenas admin pode alterar (gestor de Store apenas seleciona)
- Q: Estrutura de categorias por Store (flat / 2 níveis / árvore)? → A: Hierarquia de 2 níveis (categoria → subcategoria)
- Q: Gestor com múltiplas Networks — como escolher contexto ativo? → A: Dropdown de Network ativa no header do admin, persistido em localStorage
- Q: Salvar produto Avançado em modo Simples — comportamento? → A: Preserva campos avançados intactos; modo Simples atualiza apenas nome/descrição/preço/foto-principal
- Q: Lifecycle/status de produto visível ao gestor? → A: Usar `ProductStatusEnum` do Lofn (Active=1, Inactive=2, Expired=3); UI mostra controle Ativo/Inativo (Expired é read-only, vindo do Lofn)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manager edits products via Simple mode (Priority: P1)

Como gestor de uma rede (Network) MonexUp que possui uma Store provisionada no Lofn, quero cadastrar e atualizar produtos rapidamente preenchendo apenas nome, descrição, preço e uma única foto, sem ter que escolher categoria ou filtros, para colocar produtos no ar em poucos cliques.

**Why this priority**: É o caminho mais curto para o gestor ter produtos publicados. Atende 90% dos casos quando a rede vende poucos itens simples (assinatura, e-book, mentoria). Sem isso, gestores leigos abandonam o cadastro.

**Independent Test**: Login como gestor da rede → acessa Admin > Produtos > Novo → modo Simples → preenche nome/preço/foto → Salvar → produto aparece na busca da Store.

**Acceptance Scenarios**:

1. **Given** gestor logado com Store provisionada, **When** abre cadastro novo em modo Simples e salva nome+preço+1 foto, **Then** produto é criado no Lofn vinculado ao `storeId` da rede e categoria padrão invisível é atribuída automaticamente
2. **Given** produto existente da própria Store, **When** gestor edita preço/foto em modo Simples, **Then** alteração é persistida e refletida na listagem
3. **Given** gestor sem Store provisionada, **When** tenta acessar a tela de produtos, **Then** sistema bloqueia/orienta a provisionar Store primeiro
4. **Given** usuário não-gestor (membro/visitante), **When** tenta acessar `/admin/products`, **Then** sistema nega acesso

---

### User Story 2 - Manager searches and removes products (Priority: P1)

Como gestor, quero ver lista paginada/buscável dos produtos da minha Store e poder excluir os que saíram de linha, para manter o catálogo enxuto.

**Why this priority**: Sem a tela de busca + delete, gestor não consegue gerenciar inventário. CRUD incompleto.

**Independent Test**: Acessa Admin > Produtos → vê lista da Store → busca por nome → exclui um item → some da lista.

**Acceptance Scenarios**:

1. **Given** Store com N produtos, **When** gestor abre tela de busca, **Then** vê apenas produtos da própria Store (nunca de outras Stores)
2. **Given** caixa de busca, **When** digita parte do nome, **Then** lista filtra em tempo real ou ao confirmar
3. **Given** linha de produto, **When** clica em excluir e confirma, **Then** produto é removido no Lofn e some da listagem
4. **Given** lista paginada, **When** navega entre páginas, **Then** paginação preserva filtro de busca

---

### User Story 3 - Manager uses Advanced mode with categories and filters (Priority: P2)

Como gestor de Store com catálogo mais elaborado, quero alternar para modo Avançado e cadastrar produto com várias fotos, categoria própria da Store, filtros (cor/tamanho/etc.) e descrição rica, para diferenciar produtos em catálogo grande.

**Why this priority**: Necessário para Stores que vendem produtos físicos com variantes ou e-commerce mais sofisticado. Não bloqueia MVP, mas obrigatório antes de onboard de Stores complexas.

**Independent Test**: Cadastra produto Avançado com 3 fotos + categoria + 2 filtros → aparece na vitrine com facetas funcionais.

**Acceptance Scenarios**:

1. **Given** modo Avançado, **When** gestor adiciona múltiplas fotos, **Then** todas ficam vinculadas ao produto na ordem definida
2. **Given** modo Avançado, **When** gestor escolhe categoria do dropdown, **Then** lista mostra apenas categorias da própria Store (nenhuma global Lofn)
3. **Given** filtros configurados na Store, **When** gestor associa valores ao produto, **Then** valores ficam disponíveis para faceta do consumidor
4. **Given** produto cadastrado em modo Avançado, **When** abre em modo Simples, **Then** sistema avisa que existem dados não editáveis em Simples e oferece continuar em Avançado

---

### User Story 4 - Manager creates Store-scoped categories (Priority: P2)

Como gestor, quero criar/editar/excluir categorias **da minha Store** numa tela dedicada, para organizar meus produtos sem usar as categorias globais do Lofn.

**Why this priority**: Pré-requisito para US3 (modo Avançado). Sem categorias próprias, modo Avançado fica capenga.

**Independent Test**: Acessa Admin > Categorias → cria 3 categorias → aparecem no dropdown ao cadastrar produto Avançado.

**Acceptance Scenarios**:

1. **Given** gestor logado, **When** cria categoria com nome único, **Then** categoria fica vinculada apenas ao `storeId` (não vaza pra outras Stores)
2. **Given** categoria com produtos vinculados, **When** tenta excluir, **Then** sistema avisa quantidade de produtos afetados e exige confirmação
3. **Given** lista de categorias, **When** consulta, **Then** vê apenas as próprias e a categoria padrão invisível **não** aparece na listagem visível ao gestor
4. **Given** outro gestor de outra Store, **When** consulta categorias, **Then** vê apenas as suas (isolamento por Store)

---

### User Story 5 - Admin manages global filters; manager only consumes (Priority: P3)

Filtros (ex.: "Cor", "Tamanho") são **globais** no MonexUp/Lofn e mantidos exclusivamente por **administradores do sistema** (não pelo gestor da Store). Gestor da Store apenas **seleciona** valores de filtros existentes ao cadastrar produto em modo Avançado.

**Why this priority**: Sem CRUD próprio do gestor, escopo desta US fica menor. Tela de admin de filtros é separada e fora do fluxo do gestor.

**Independent Test**: Admin cria filtro "Cor" com 3 valores em tela admin → gestor de Store entra em modo Avançado de produto → filtro "Cor" aparece como opção e gestor seleciona valores.

**Acceptance Scenarios**:

1. **Given** usuário admin logado, **When** cria/edita/exclui filtro global com seus valores, **Then** filtro fica disponível para todas as Stores
2. **Given** gestor de Store (não-admin), **When** acessa qualquer tela de produto/categoria, **Then** **NÃO** vê opção de criar/editar/excluir filtros (somente seleção)
3. **Given** modo Avançado de produto, **When** gestor seleciona valores de filtros globais, **Then** valores ficam associados ao produto da sua Store
4. **Given** admin tenta excluir filtro com produtos usando, **When** confirma, **Then** sistema avisa impacto e exige confirmação

---

### Edge Cases

- Gestor pertence a duas Networks distintas → dropdown no header do admin escolhe Network ativa; escolha persiste em `localStorage`
- Network sem `lofnStoreId` provisionado ainda → telas devem oferecer caminho de provisionamento (chamar endpoint que já existe ou avisar)
- Lofn fora do ar → mensagem clara "produtos indisponíveis temporariamente", sem dados em cache obsoletos
- Upload de foto excede tamanho permitido → erro claro com tamanho máximo
- Produto referencia categoria que foi excluída → sistema mantém produto consistente (categoria default ou erro tratado)
- Modo Simples reabre produto cadastrado em Avançado → exibe aviso, preserva campos avançados intocados ao salvar (apenas nome/descrição/preço/foto-1 atualizados)
- Múltiplas requisições simultâneas de delete → idempotência (segunda chamada não falha)
- Token expirado durante edição → preserva form e re-autentica

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e contexto**

- **FR-001**: Sistema MUST restringir acesso às telas administrativas a usuários com papel de gestor (NetworkManager) da Network correspondente
- **FR-002**: Sistema MUST resolver `storeId` a partir do `lofnStoreId` da Network ativa do usuário antes de qualquer operação
- **FR-003**: Sistema MUST bloquear visualização/edição de produtos, categorias ou filtros pertencentes a Stores que não sejam a do usuário
- **FR-004**: Sistema MUST oferecer fluxo de provisionamento (ou link para ele) quando a Network não tiver Store no Lofn
- **FR-035**: Quando o usuário gestor pertence a duas ou mais Networks, sistema MUST exibir dropdown de **Network ativa no header da área admin**, persistindo a escolha em `localStorage` entre sessões; toda operação subsequente usa o `storeId` da Network selecionada
- **FR-036**: Troca de Network ativa via dropdown MUST recarregar/limpar listas (produtos, categorias) para evitar mistura de contextos

**CRUD de Produto**

- **FR-005**: Usuários gestores MUST conseguir listar produtos da própria Store com paginação e busca por nome
- **FR-006**: Usuários gestores MUST conseguir criar novo produto via tela de cadastro
- **FR-007**: Usuários gestores MUST conseguir editar produto existente da própria Store
- **FR-008**: Usuários gestores MUST conseguir excluir produto da própria Store, com confirmação prévia
- **FR-009**: Sistema MUST exibir feedback claro de sucesso/erro em cada operação CRUD
- **FR-039**: Sistema MUST usar `ProductStatusEnum` do Lofn (`Active=1`, `Inactive=2`, `Expired=3`); UI MUST permitir alternar Active↔Inactive
- **FR-040**: Status `Expired` MUST ser exibido como somente-leitura (controlado pelo Lofn); UI sinaliza visualmente e bloqueia transição manual desse estado
- **FR-041**: Produto recém-criado em modo Simples ou Avançado MUST default para `Active` salvo escolha contrária do gestor
- **FR-042**: Lista de produtos MUST exibir o status atual e permitir filtro por status

**Modo Simples vs Avançado**

- **FR-010**: Tela de cadastro MUST oferecer toggle visível entre modo Simples e Avançado
- **FR-011**: Modo Simples MUST aceitar somente: nome, descrição (opcional), preço, e exatamente uma foto
- **FR-012**: Modo Simples MUST atribuir automaticamente uma categoria padrão (invisível ao gestor) ao produto, caso o Lofn exija categoria
- **FR-013**: Modo Simples MUST ocultar/desabilitar seleção de filtros e categorias
- **FR-014**: Modo Avançado MUST permitir múltiplas fotos com ordem definível
- **FR-015**: Modo Avançado MUST permitir seleção de uma categoria criada pelo gestor (Store-scoped)
- **FR-016**: Modo Avançado MUST permitir associar valores de filtros configurados pelo gestor (Store-scoped)
- **FR-017**: Modo Avançado MUST suportar todos os campos ricos que o Lofn aceita para produto (descrição rica, atributos avançados)
- **FR-018**: Quando produto criado em modo Avançado é reaberto em modo Simples, sistema MUST avisar que existem dados ocultos não editáveis nesse modo
- **FR-037**: Salvar em modo Simples produto que tem dados avançados (múltiplas fotos, categoria não-padrão, valores de filtro) MUST preservar esses campos intocados — modo Simples atualiza apenas: nome, descrição, preço, foto principal
- **FR-038**: Foto principal em modo Simples corresponde à primeira foto da ordem definida no modo Avançado; substituir foto em modo Simples substitui apenas a posição 1, mantendo demais

**Categorias por Store**

- **FR-019**: Usuários gestores MUST conseguir criar/editar/excluir categorias vinculadas exclusivamente à própria Store
- **FR-020**: Sistema MUST NOT exibir categorias globais do Lofn nem categorias de outras Stores nas telas de produto/categorias do gestor
- **FR-021**: Sistema MUST ocultar a categoria padrão (criada para suportar modo Simples) da listagem visível ao gestor
- **FR-022**: Exclusão de categoria com produtos vinculados MUST exigir confirmação informando o impacto
- **FR-031**: Categorias MUST suportar hierarquia de **2 níveis** (categoria pai → subcategoria); subcategorias MUST referenciar exatamente uma categoria pai
- **FR-032**: Subcategoria NÃO pode ter outra subcategoria filha (profundidade máxima = 2)
- **FR-033**: Exclusão de categoria pai com subcategorias MUST avisar e permitir cascata (excluir tudo) ou bloqueio (exigir mover/excluir filhas antes)
- **FR-034**: Cadastro de produto em modo Avançado MUST permitir selecionar categoria pai OU subcategoria; produto vinculado a subcategoria pertence implicitamente à pai

**Filtros (globais, admin-only)**

- **FR-023**: Apenas usuários com papel **administrador do sistema** MUST conseguir criar/editar/excluir filtros e seus valores; filtros são globais (compartilhados por todas as Stores)
- **FR-024**: Sistema MUST permitir definir múltiplos valores por filtro (ex.: "Cor" → "Vermelho", "Azul")
- **FR-025**: Filtros globais MUST estar disponíveis para **seleção** no cadastro de produto em modo Avançado por qualquer gestor de Store
- **FR-030**: Gestor de Store (não-admin) MUST NOT ver controles de criação/edição/exclusão de filtros em nenhuma tela do app

**Integração com Lofn**

- **FR-026**: Sistema MUST consumir API Lofn para todas as operações de produto, categoria e filtro (não duplicar dados localmente além do necessário)
- **FR-027**: Sistema MUST tratar falhas de comunicação com Lofn exibindo mensagens claras e não corrompendo o estado da UI
- **FR-028**: Tokens/credenciais do gestor MUST ser propagados ao Lofn de forma a comprovar a posse da Store
- **FR-029**: Caso o Lofn evolua e exponha mecanismo de filtro escopado por Store nativamente, sistema deve adotá-lo sem refatoração de UX

### Key Entities

- **Store**: Entidade do Lofn que representa a loja do gestor. Identificada por `lofnStoreId` armazenado em `monexup_networks.lofn_store_id`. Toda operação parte daqui.
- **Product**: Item à venda dentro da Store. Atributos visíveis ao gestor: nome, descrição, preço, imagens, categoria (avançado), valores de filtro (avançado), status (`Active`/`Inactive`/`Expired` — vindo de `ProductStatusEnum` do Lofn). Persistido no Lofn.
- **Category (Store-scoped)**: Agrupador organizacional próprio da Store. Suporta hierarquia de **2 níveis** (categoria pai com subcategorias filhas opcionais). Não confundir com categoria global do Lofn (intencionalmente ignorada).
- **Default Category (invisível)**: Categoria criada automaticamente por Store para suportar produtos em modo Simples sem expor o conceito ao gestor.
- **Filter**: Tipo de característica (Cor, Tamanho, etc.) **global**, mantido por admin do sistema. Persistido no Lofn (`ProductType`).
- **FilterValue**: Cada valor possível de um filtro global (ex.: "Vermelho" dentro de "Cor"). Mantido por admin.
- **Network → Store link**: Relação 1:1 já existente; o `lofnStoreId` na Network é a chave de escopo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Gestor consegue cadastrar primeiro produto pelo modo Simples em até **90 segundos** desde o login
- **SC-002**: 95% das operações CRUD de produto (excluindo upload de imagem) retornam à UI em até **2 segundos** sob carga normal
- **SC-003**: Zero vazamentos entre Stores: em testes automatizados de regressão, gestor de Store A não acessa nenhum recurso (produto/categoria/filtro) de Store B
- **SC-004**: Modo Simples funciona ponta a ponta sem qualquer menção visível de "categoria" ao usuário, mesmo quando Lofn exige categoria internamente
- **SC-005**: Tela de busca de produtos lista até **500 itens** com paginação responsiva (próxima página em ≤ 1 segundo)
- **SC-006**: Taxa de erro percebida pelo usuário em operações de CRUD ≤ **2%** (medida por toasts/alerts de erro vs sucesso)
- **SC-007**: 100% das operações que falham por indisponibilidade do Lofn produzem mensagem acionável para o gestor (não tela em branco / spinner infinito)

## Assumptions

- A Network já está provisionada e tem (ou pode obter via fluxo existente) `lofnStoreId` antes de o gestor entrar nas telas de produto
- O backend MonexUp **não** precisará de novas rotas para esta feature: gestor autentica no MonexUp, frontend obtém `storeId` da Network, e chama o Lofn diretamente com header `X-Tenant-Id: monexup` + bearer token (mesmo padrão já usado por `/admin/products` no roadmap atual)
- O Lofn aceita escopo por `storeSlug`/`storeId` em produtos e categorias, conforme inspeção dos endpoints `/Product/{storeSlug}/insert`, `/Category/{storeSlug}/insert` e similares
- Filtros são globais no Lofn (`ProductTypeController` sem escopo de Store) e mantidos por admin do sistema; gestor de Store apenas seleciona valores
- Upload de imagens reutilizará o endpoint do Lofn (provavelmente `/Image/...`) sem que o MonexUp precise armazenar arquivos
- Categoria padrão invisível: assumimos que o Lofn aceita criar categoria comum para a Store; o frontend cria-a sob demanda (lazy) na primeira vez que o gestor salva produto em modo Simples
- Internacionalização e responsividade seguem o padrão já estabelecido pelo restante do admin (i18next + Bootstrap 5/MUI)
- Apenas frontend será implementado nesta entrega, salvo dependência externa identificada acima sobre Lofn

## Dependencies

- API externa **Lofn** disponível (`REACT_APP_LOFN_API_URL` configurada e acessível)
- Network do gestor já vinculada a `lofnStoreId` (provisionamento existente)
- Pacote `lofn-react` (componentes `<ProductList />`, `<ProductForm />`, etc.) e contexto `productLinkContext` já presentes no projeto
- Sessão NAuth ativa do gestor com claim `role=NetworkManager` para a Network alvo

# Feature Specification: Testes Unitarios e Testes de API Externa

**Feature Branch**: `003-unit-api-tests`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Crie testes unitarios para o maximo de cobertura possivel e testes de API externa (testa a API em uma url externa informada usando xUnit e Flurl.Http). Crie projetos separados para os testes unitarios e os testes de API"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Executar Testes Unitarios da Camada de Dominio (Priority: P1)

Como desenvolvedor, quero executar testes unitarios que validem a logica de negocio dos servicos de dominio (InvoiceService, OrderService, ProductService, NetworkService, ProfileService), suas fabricas e entidades, garantindo que o comportamento esperado esteja correto sem depender de infraestrutura externa.

**Why this priority**: A camada de dominio contem toda a logica de negocio critica (calculo de taxas, gestao de redes, criacao de pedidos). Testar essa camada garante a integridade das regras de negocio e permite refatoracoes seguras.

**Independent Test**: Pode ser totalmente testado executando `dotnet test` no projeto de testes unitarios. Cada servico pode ser testado isoladamente com mocks dos repositorios e dependencias externas.

**Acceptance Scenarios**:

1. **Given** o projeto de testes unitarios configurado, **When** executo `dotnet test`, **Then** todos os testes dos servicos de dominio passam com sucesso.
2. **Given** um servico com dependencias de repositorio, **When** o teste e executado, **Then** as dependencias sao substituidas por mocks e o teste valida apenas a logica de negocio.
3. **Given** um cenario de calculo de taxas no InvoiceService, **When** o teste e executado com dados conhecidos, **Then** o resultado do calculo corresponde ao valor esperado.
4. **Given** um cenario de erro (dados invalidos), **When** o teste e executado, **Then** o servico lanca a excecao ou retorna o erro esperado.

---

### User Story 2 - Executar Testes Unitarios das Fabricas de Dominio (Priority: P1)

Como desenvolvedor, quero testar que as fabricas de dominio (InvoiceDomainFactory, OrderDomainFactory, NetworkDomainFactory, etc.) criam entidades corretamente com os valores esperados.

**Why this priority**: As fabricas sao o ponto de criacao de todas as entidades. Se uma fabrica produzir objetos incorretos, toda a cadeia de negocio e comprometida.

**Independent Test**: Pode ser testado executando os testes de fabricas isoladamente. Cada fabrica e testada sem dependencias externas.

**Acceptance Scenarios**:

1. **Given** dados validos de entrada, **When** a fabrica cria uma entidade, **Then** todos os campos da entidade correspondem aos valores fornecidos.
2. **Given** dados parciais ou opcionais, **When** a fabrica cria uma entidade, **Then** os valores padrao sao aplicados corretamente.

---

### User Story 3 - Executar Testes de API Externa (Priority: P2)

Como desenvolvedor, quero executar testes que validem os endpoints da API MonexUp em execucao numa URL externa configuravel, verificando que as respostas estao corretas em termos de status HTTP, estrutura do corpo e comportamento esperado.

**Why this priority**: Testes de API externa validam o sistema integrado em ambiente real, complementando os testes unitarios. Sao essenciais para validar deploys e garantir que a API funciona corretamente de ponta a ponta.

**Independent Test**: Pode ser testado executando `dotnet test` no projeto de testes de API, desde que a URL da API externa esteja acessivel e configurada.

**Acceptance Scenarios**:

1. **Given** uma URL de API configurada e acessivel, **When** executo os testes de API, **Then** cada endpoint retorna o status HTTP esperado.
2. **Given** um endpoint que requer autenticacao, **When** o teste e executado sem token, **Then** a resposta e 401 Unauthorized.
3. **Given** um endpoint que requer autenticacao, **When** o teste e executado com token valido, **Then** a resposta contem os dados esperados na estrutura correta.
4. **Given** um endpoint de busca com parametros, **When** o teste envia parametros validos, **Then** a resposta contem resultados no formato paginado esperado.

---

### User Story 4 - Executar Testes Unitarios dos Utilitarios (Priority: P2)

Como desenvolvedor, quero testar as classes utilitarias do Core.Domain (validacao de documentos, validacao de e-mail, geracao de slugs, criptografia) para garantir que funcionam corretamente com diversos inputs.

**Why this priority**: Utilitarios sao usados transversalmente em todo o sistema. Falhas neles causam erros em cascata dificeis de diagnosticar.

**Independent Test**: Pode ser testado executando os testes de utilitarios isoladamente. Nao requer dependencias externas.

**Acceptance Scenarios**:

1. **Given** um CPF ou CNPJ valido, **When** o validador e executado, **Then** retorna verdadeiro.
2. **Given** um CPF ou CNPJ invalido, **When** o validador e executado, **Then** retorna falso.
3. **Given** um texto de entrada, **When** o gerador de slug e executado, **Then** retorna um slug formatado corretamente (lowercase, sem caracteres especiais, hifens como separadores).
4. **Given** um e-mail valido/invalido, **When** o validador e executado, **Then** retorna o resultado correto.

---

### Edge Cases

- O que acontece quando um servico recebe um ID inexistente do repositorio (retorno nulo)?
- Como o sistema se comporta quando o calculo de taxas resulta em valores com muitas casas decimais?
- O que acontece quando a URL da API externa esta inacessivel durante os testes de API?
- Como os testes de API lidam com timeout de conexao?
- O que acontece quando um endpoint retorna dados vazios (lista vazia, objeto nulo)?
- Como os testes unitarios lidam com cenarios de concorrencia no UnitOfWork?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE ter um projeto de testes unitarios separado que testa a camada de dominio (servicos, fabricas, entidades e utilitarios) sem dependencias de infraestrutura.
- **FR-002**: O sistema DEVE ter um projeto de testes de API externa separado que testa os endpoints da API em uma URL configuravel.
- **FR-003**: Os testes unitarios DEVEM utilizar mocks (Moq) para substituir repositorios, clientes externos e servicos de infraestrutura.
- **FR-004**: Os testes de API externa DEVEM permitir a configuracao da URL base da API atraves de variaveis de ambiente ou arquivo de configuracao.
- **FR-005**: Os testes unitarios DEVEM cobrir os cenarios de sucesso e de erro de cada servico de dominio (InvoiceService, OrderService, ProductService, NetworkService, ProfileService).
- **FR-006**: Os testes unitarios DEVEM cobrir todas as fabricas de dominio (Invoice, InvoiceFee, Order, OrderItem, Product, Network, UserNetwork, UserProfile).
- **FR-007**: Os testes de API externa DEVEM testar os principais endpoints de cada controlador (Order, Invoice, Network, Profile, Image), incluindo operacoes de leitura (GET) e escrita (POST/PUT).
- **FR-008**: Os testes de API externa DEVEM validar status HTTP, estrutura da resposta e comportamento de autenticacao.
- **FR-012**: Os testes de API externa DEVEM utilizar uma fixture compartilhada (xUnit IAsyncLifetime/ClassFixture) que autentica uma vez no NAuth e reutiliza o token JWT em todos os testes da sessao.
- **FR-013**: Os testes de API externa DEVEM utilizar FluentAssertions para validacao de resultados.
- **FR-009**: Os testes unitarios DEVEM cobrir as classes utilitarias do Core.Domain (validacao de documentos, e-mail, geracao de slugs).
- **FR-010**: Ambos os projetos de testes DEVEM ser integraveis ao pipeline de CI/CD existente.
- **FR-011**: Os testes de API externa DEVEM ser executaveis de forma independente, sem necessidade de executar os testes unitarios.

### Key Entities

- **Projeto de Testes Unitarios**: Projeto isolado contendo testes para servicos, fabricas, entidades e utilitarios da camada de dominio. Organizado por camada (Services, Factories, Utilities).
- **Projeto de Testes de API**: Projeto isolado contendo testes de integracao que comunicam com a API via HTTP. Organizado por controlador (Order, Invoice, Network, Profile, Image).
- **Configuracao de API**: Mecanismo de configuracao que permite definir a URL base da API e credenciais de autenticacao para os testes de API externa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os servicos de dominio (5 servicos) possuem testes que cobrem cenarios de sucesso e erro.
- **SC-002**: Todas as fabricas de dominio (8 fabricas) possuem testes que validam a criacao correta de entidades.
- **SC-003**: Os testes de API externa cobrem pelo menos os endpoints principais de cada controlador (minimo 1 teste por endpoint documentado).
- **SC-004**: Todos os testes unitarios executam em menos de 30 segundos no total.
- **SC-005**: Os testes de API externa validam corretamente respostas de sucesso (2xx) e de erro (4xx).
- **SC-006**: Os utilitarios de dominio (validacao de documentos, e-mail, slugs) possuem testes com dados validos e invalidos.
- **SC-007**: Ambos os projetos de testes podem ser executados independentemente via linha de comando.

## Clarifications

### Session 2026-04-02

- Q: Como deve ser obtido o token JWT para os testes de API externa? → A: Fixture compartilhada que faz login uma vez no NAuth e reutiliza o token em todos os testes da sessao.
- Q: Os testes de API devem incluir operacoes de escrita (POST/PUT) ou apenas leitura (GET)? → A: Leitura e escrita (GET + POST/PUT) - testa fluxo completo, pode criar dados no ambiente de teste.
- Q: Qual biblioteca de mocking usar nos testes unitarios? → A: Moq - biblioteca mais popular, sintaxe baseada em lambdas.

## Assumptions

- O framework de testes utilizado e xUnit, que e o padrao para projetos .NET.
- Os testes de API externa utilizam Flurl.Http como cliente HTTP, conforme solicitado pelo utilizador.
- Os mocks nos testes unitarios serao criados utilizando Moq.
- A API externa para os testes de API ja esta em execucao e acessivel na URL configurada antes da execucao dos testes.
- Os testes de API externa podem criar/modificar dados no ambiente de teste (o ambiente permite operacoes de escrita).
- A autenticacao da API utiliza o esquema NAuth (JWT). Os testes de API usam uma fixture compartilhada que faz login uma vez e reutiliza o token em toda a sessao.
- Os submodules (NAuth, zTools) nao sao testados neste escopo — apenas as interfaces consumidas pelo MonexUp.
- O projeto LofnProductRepository (que faz chamadas HTTP ao Lofn) sera testado nos testes unitarios com mock da resposta HTTP.

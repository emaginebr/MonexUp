# Design — Campo de API Key do AbacatePay em `/admin/network`

**Data:** 2026-06-27
**Status:** Aprovado (design) — pronto para plano de implementação

## Problema

O checkout PIX falha com `AbacatePay error (401): Invalid or inactive API key`. A
chave AbacatePay é configurada **por loja** no ProxyPay (coluna
`proxypay_stores.abacatepay_api_key`), via o endpoint write-only
`PUT /Store/{storeId}/abacatepay-apikey`. Hoje não há nenhuma forma de o gestor
da rede definir essa chave pela interface do MonexUp.

## Objetivo

Adicionar à página `/admin/network` (`NetworkEditPage`) um campo onde o gestor
informa/atualiza a API Key do AbacatePay da sua loja ProxyPay. O valor é
**write-only**: nunca é lido nem reexibido — a UI apenas indica se já existe uma
chave configurada.

## Decisões fechadas

| Decisão | Escolha |
|---|---|
| Caminho da chamada | Frontend chama a **API do ProxyPay diretamente** — sem endpoint relay no backend MonexUp |
| Indicador de estado | Mostra badge "Configurada / Não configurada" via GraphQL `myStore { hasAbacatePayApiKey }` |
| Persistência no MonexUp | Nenhuma — o segredo vive só no ProxyPay |
| Confirmação ao salvar | Salva direto (sem modal), apenas toast de feedback |
| Coluna no ProxyPay | Assume-se já criada (`ALTER TABLE` rodado antes — ver Dependências) |

## Contexto técnico verificado

- **Autenticação cruzada:** o token NAuth da sessão do MonexUp autentica no
  ProxyPay (mesmo NAuth, `X-Tenant-Id: monexup`). Confirmado empiricamente nesta
  investigação (`POST /Store` e `myStore` responderam com o token do gestor).
- **Endpoint ProxyPay (read-only para nós):**
  `PUT {REACT_APP_PROXYPAY_API_URL}/Store/{storeId}/abacatepay-apikey`
  - Headers: `Authorization: Bearer <token>`, `X-Tenant-Id: monexup`
  - Body: `{ "apiKey": "<chave>" }`
  - Respostas: `204` ok · `401` sem auth · `403` não é dono da loja · `400` validação
- **Indicador GraphQL:** `POST {REACT_APP_PROXYPAY_API_URL}/graphql`
  com `{ myStore { storeId hasAbacatePayApiKey } }` → `hasAbacatePayApiKey: Boolean!`
- **Env vars já existentes:** `REACT_APP_PROXYPAY_API_URL`,
  `REACT_APP_PROXYPAY_TENANT_ID` (default `monexup`).
- **`NetworkInfo` (frontend) já expõe `proxypayStoreId`** — usado como `{storeId}`.

## Arquitetura

A chamada não passa pelo backend MonexUp, então **não** se usa o `HttpClient`
padrão (cuja `baseURL` aponta para o backend MonexUp). Cria-se uma camada
dedicada que fala com a base do ProxyPay, seguindo o padrão de camadas existente
(Service → Business → Factory → Provider/Page).

```
NetworkEditPage  (UI: seção AbacatePay)
      │
      ▼
ProxyPayStoreBusiness  (resolve token da sessão via AuthFactory, envelopa BusinessResult)
      │
      ▼
ProxyPayStoreService   (cliente HTTP próprio → base REACT_APP_PROXYPAY_API_URL)
      │
      ▼
ProxyPay API           (PUT /Store/{id}/abacatepay-apikey  +  POST /graphql)
```

### Componentes novos

1. **`monexup-app/src/Services/Interfaces/IProxyPayStoreService.tsx`**
   - `setAbacatePayApiKey(storeId: number, apiKey: string, token: string): Promise<ApiResponse<void>>`
   - `getHasAbacatePayApiKey(token: string): Promise<boolean>`

2. **`monexup-app/src/Services/Impl/ProxyPayStoreService.tsx`**
   - Cliente HTTP próprio (axios/fetch) com base `REACT_APP_PROXYPAY_API_URL` e
     header fixo `X-Tenant-Id` (`REACT_APP_PROXYPAY_TENANT_ID || 'monexup'`).
   - `setAbacatePayApiKey`: `PUT /Store/{storeId}/abacatepay-apikey`, bearer,
     body `{ apiKey }`. Sucesso = HTTP 204.
   - `getHasAbacatePayApiKey`: `POST /graphql` com a query `myStore`; retorna o
     booleano; em qualquer falha retorna `false` (degrada sem quebrar a página).

3. **`monexup-app/src/Business/Interfaces/IProxyPayStoreBusiness.tsx`** +
   **`monexup-app/src/Business/Impl/ProxyPayStoreBusiness.tsx`** +
   **`monexup-app/src/Business/Factory/ProxyPayStoreFactory.tsx`**
   - Pega `session.token` via `AuthFactory.AuthBusiness.getSession()` (padrão de
     `OrderBusiness`). Sem sessão → `{ sucesso: false }`.
   - Registra o service no `ServiceFactory` (padrão existente).

4. **UI — nova seção em `NetworkEditPage/index.tsx`**
   - Card no mesmo padrão visual (`auth-card`, `SectionHeader`, `FormField`).
   - Renderiza somente quando `network?.proxypayStoreId` existe. Caso contrário,
     hint orientando a provisionar a loja primeiro.
   - **Badge** "Configurada / Não configurada": consulta `getHasAbacatePayApiKey`
     no mount da seção.
   - **Input** `type="password"` (`autoComplete="off"`) para a nova chave +
     botão "Salvar chave". Ao salvar, chama
     `setAbacatePayApiKey(network.proxypayStoreId, apiKey, token)`.
   - Após 204: limpa o input, re-consulta o indicador, mostra
     `MessageToast` de sucesso. O valor digitado nunca é re-renderizado depois
     de salvo.
   - Estado próprio da seção (apiKey local, loading, hasKey) — não toca
     `networkContext.network`.

### i18n

Novas chaves nos quatro locales (`pt`, `en`, `es`, `fr`):
`network_edit_abacatepay_section_title`, `..._subtitle`, `..._field_label`,
`..._field_placeholder`, `..._save_button`, `..._configured`, `..._not_configured`,
`..._no_store_hint`, `..._save_success`, `..._save_error`.

## Tratamento de erro

| Situação | UI |
|---|---|
| 204 | toast sucesso, limpa input, atualiza badge |
| 401 / 403 | toast "sem permissão para alterar a chave desta loja" |
| 400 | toast com a mensagem do corpo da resposta |
| Erro de rede / GraphQL indisponível | toast genérico; badge cai para "Não configurada" sem quebrar |
| `apiKey` vazia (após trim) | validação client-side bloqueia o submit |

## Fora de escopo (YAGNI)

- Nenhuma mudança no backend MonexUp (sem endpoint, sem DTO, sem persistência).
- Sem leitura/decriptação do valor da chave.
- Sem modal de confirmação.
- Sem gestão de webhook secret do AbacatePay (só a API key).

## Dependências externas (ação do usuário)

1. **ProxyPay — coluna no DB.** A coluna `proxypay_stores.abacatepay_api_key`
   precisa existir no banco do tenant `monexup`, senão tanto o `PUT` quanto o
   indicador `hasAbacatePayApiKey` quebram com `42703`:
   ```sql
   ALTER TABLE proxypay_stores ADD COLUMN IF NOT EXISTS abacatepay_api_key VARCHAR(500);
   ```
2. **ProxyPay deployado** deve ser o tree `backend` (que contém o endpoint e o
   campo GraphQL), acessível em `REACT_APP_PROXYPAY_API_URL`.

> Nota: o repositório do ProxyPay (`C:\repos\ProxyPay`) é referência somente
> leitura. Qualquer alteração lá é solicitada ao usuário.

## Critérios de sucesso

- Gestor com loja provisionada vê a seção AbacatePay em `/admin/network`.
- Badge reflete corretamente se há chave (`hasAbacatePayApiKey`).
- Salvar uma chave válida retorna 204, limpa o campo e atualiza o badge para
  "Configurada".
- Após configurar uma chave válida, o checkout PIX deixa de retornar
  `Invalid or inactive API key`.
- O valor da chave nunca aparece na UI depois de salvo.

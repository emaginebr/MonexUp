# AbacatePay API Key em /admin/network — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o gestor da rede informe/atualize a API Key do AbacatePay da sua loja ProxyPay pela página `/admin/network`, chamando a API do ProxyPay diretamente do frontend (write-only, com indicador de estado).

**Architecture:** Nova camada Service→Business→Factory no frontend MonexUp que fala direto com a API do ProxyPay (base `REACT_APP_PROXYPAY_API_URL`), reusando a infra `HttpClient` (instância própria com `X-Tenant-Id`). A UI ganha uma seção em `NetworkEditPage` com badge indicador (GraphQL `hasAbacatePayApiKey`) e input de chave (`PUT /Store/{storeId}/abacatepay-apikey`). Nenhuma mudança no backend MonexUp.

**Tech Stack:** React 18 + TypeScript, Vite, axios (via `HttpClient`), i18next, vitest, lucide-react, Tailwind.

---

## Referência — contratos externos (ProxyPay, read-only)

- **Setar chave:** `PUT {PROXYPAY}/Store/{storeId}/abacatepay-apikey`
  - Headers: `Authorization: Bearer <token>`, `X-Tenant-Id: monexup`, `Content-Type: application/json`
  - Body: `{ "apiKey": "<chave>" }`
  - Respostas: `204` ok · `401` sem auth · `403` não-dono · `400` validação (corpo = string)
- **Indicador:** `POST {PROXYPAY}/graphql`
  - Body: `{ "query": "{ myStore { storeId hasAbacatePayApiKey } }" }`
  - Resposta: `{ "data": { "myStore": [ { "storeId": 1, "hasAbacatePayApiKey": true } ] } }`
  - (`myStore` é array; pegar o primeiro elemento.)

> O token NAuth da sessão do MonexUp autentica no ProxyPay (mesmo NAuth, tenant `monexup`) — confirmado empiricamente.

---

## Task 1: Camada HTTP do ProxyPay no ServiceFactory

**Files:**
- Modify: `monexup-app/src/Services/ServiceFactory.tsx`

- [ ] **Step 1: Adicionar instância HttpClient para o ProxyPay**

Em `monexup-app/src/Services/ServiceFactory.tsx`, logo após o bloco `httpClientLofn` (linha ~47), adicionar:

```typescript
// Initialize ProxyPay direct client (frontend talks straight to ProxyPay API)
const PROXYPAY_TENANT_HEADERS = {
  'X-Tenant-Id':
    process.env.REACT_APP_PROXYPAY_TENANT_ID ||
    process.env.REACT_APP_TENANT_ID ||
    'monexup',
};
const httpClientProxyPay: IHttpClient = HttpClient();
httpClientProxyPay.init(
  process.env.REACT_APP_PROXYPAY_API_URL || '',
  PROXYPAY_TENANT_HEADERS
);
```

- [ ] **Step 2: Registrar o ProxyPayStoreService no factory**

Ainda em `ServiceFactory.tsx`, adicionar o import no topo (junto aos outros service imports):

```typescript
import IProxyPayStoreService from './Interfaces/IProxyPayStoreService';
import ProxyPayStoreService from './Impl/ProxyPayStoreService';
```

Depois do bloco `billingServiceImpl` (linha ~62), adicionar:

```typescript
const proxyPayStoreServiceImpl: IProxyPayStoreService = ProxyPayStoreService;
proxyPayStoreServiceImpl.init(httpClientProxyPay);
```

E no objeto `const ServiceFactory = {` adicionar a entrada (após `BillingService: billingServiceImpl,`):

```typescript
  ProxyPayStoreService: proxyPayStoreServiceImpl,
```

> Nota: este step só compila depois da Task 2 (que cria os arquivos importados). Não rode build ainda — feito na Task 2.

- [ ] **Step 3: Commit**

```bash
git add monexup-app/src/Services/ServiceFactory.tsx
git commit -m "feat(frontend): registra HttpClient direto do ProxyPay no ServiceFactory"
```

---

## Task 2: ProxyPayStoreService (camada de serviço)

**Files:**
- Create: `monexup-app/src/Services/Interfaces/IProxyPayStoreService.tsx`
- Create: `monexup-app/src/Services/Impl/ProxyPayStoreService.tsx`
- Test: `monexup-app/src/Services/Impl/ProxyPayStoreService.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

Criar `monexup-app/src/Services/Impl/ProxyPayStoreService.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProxyPayStoreService from './ProxyPayStoreService';
import IHttpClient from '../../Infra/Interface/IHttpClient';

function makeHttpClientMock(): IHttpClient {
  return {
    init: vi.fn(),
    setLogoff: vi.fn(),
    doPost: vi.fn(),
    doPostAuth: vi.fn(),
    doGet: vi.fn(),
    doGetAuth: vi.fn(),
    doDeleteAuth: vi.fn(),
    doPutAuth: vi.fn(),
    doPostFormData: vi.fn(),
    doPostFormDataAuth: vi.fn(),
  } as unknown as IHttpClient;
}

describe('ProxyPayStoreService', () => {
  let http: IHttpClient;

  beforeEach(() => {
    http = makeHttpClientMock();
    ProxyPayStoreService.init(http);
  });

  it('setAbacatePayApiKey chama PUT /Store/{id}/abacatepay-apikey com body e token', async () => {
    (http.doPutAuth as any).mockResolvedValue({ success: true, httpStatus: '204', data: undefined });

    const ret = await ProxyPayStoreService.setAbacatePayApiKey(7, 'abc_live_1', 'tok');

    expect(http.doPutAuth).toHaveBeenCalledWith(
      '/Store/7/abacatepay-apikey',
      { apiKey: 'abc_live_1' },
      'tok'
    );
    expect(ret.success).toBe(true);
  });

  it('getHasAbacatePayApiKey retorna o booleano do primeiro myStore', async () => {
    (http.doPostAuth as any).mockResolvedValue({
      success: true,
      httpStatus: '200',
      data: { data: { myStore: [{ storeId: 1, hasAbacatePayApiKey: true }] } },
    });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey('tok');

    expect(http.doPostAuth).toHaveBeenCalledWith(
      '/graphql',
      { query: '{ myStore { storeId hasAbacatePayApiKey } }' },
      'tok'
    );
    expect(ret).toBe(true);
  });

  it('getHasAbacatePayApiKey retorna false quando a chamada falha', async () => {
    (http.doPostAuth as any).mockResolvedValue({ success: false, httpStatus: '500', messageError: 'x' });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey('tok');

    expect(ret).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `cd monexup-app && npx vitest run src/Services/Impl/ProxyPayStoreService.test.tsx`
Expected: FAIL — `Cannot find module './ProxyPayStoreService'`

- [ ] **Step 3: Criar a interface**

Criar `monexup-app/src/Services/Interfaces/IProxyPayStoreService.tsx`:

```typescript
import IHttpClient from '../../Infra/Interface/IHttpClient';
import ApiResponse from '../../DTO/Services/ApiResponse';

export default interface IProxyPayStoreService {
  init: (httpClient: IHttpClient) => void;
  /** PUT /Store/{storeId}/abacatepay-apikey — write-only. Sucesso = HTTP 204. */
  setAbacatePayApiKey: (
    storeId: number,
    apiKey: string,
    token: string
  ) => Promise<ApiResponse<void>>;
  /** GraphQL myStore { hasAbacatePayApiKey }. Retorna false em qualquer falha. */
  getHasAbacatePayApiKey: (token: string) => Promise<boolean>;
}
```

- [ ] **Step 4: Criar a implementação**

Criar `monexup-app/src/Services/Impl/ProxyPayStoreService.tsx`:

```typescript
import IHttpClient from '../../Infra/Interface/IHttpClient';
import ApiResponse from '../../DTO/Services/ApiResponse';
import IProxyPayStoreService from '../Interfaces/IProxyPayStoreService';

let _httpClient: IHttpClient;

interface MyStoreGraphQLResponse {
  data?: { myStore?: Array<{ storeId: number; hasAbacatePayApiKey: boolean }> };
}

const ProxyPayStoreService: IProxyPayStoreService = {
  init: function (httpClient: IHttpClient): void {
    _httpClient = httpClient;
  },

  setAbacatePayApiKey: async (storeId: number, apiKey: string, token: string) => {
    return await _httpClient.doPutAuth<void>(
      `/Store/${storeId}/abacatepay-apikey`,
      { apiKey },
      token
    );
  },

  getHasAbacatePayApiKey: async (token: string) => {
    const request = await _httpClient.doPostAuth<MyStoreGraphQLResponse>(
      '/graphql',
      { query: '{ myStore { storeId hasAbacatePayApiKey } }' },
      token
    );
    if (!request.success) {
      return false;
    }
    const store = request.data?.data?.myStore?.[0];
    return store?.hasAbacatePayApiKey === true;
  },
};

export default ProxyPayStoreService;
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `cd monexup-app && npx vitest run src/Services/Impl/ProxyPayStoreService.test.tsx`
Expected: PASS (3 testes)

- [ ] **Step 6: Confirmar que o ServiceFactory compila**

Run: `cd monexup-app && npx tsc --noEmit`
Expected: sem erros relacionados a `ProxyPayStoreService` / `IProxyPayStoreService`

- [ ] **Step 7: Commit**

```bash
git add monexup-app/src/Services/Interfaces/IProxyPayStoreService.tsx monexup-app/src/Services/Impl/ProxyPayStoreService.tsx monexup-app/src/Services/Impl/ProxyPayStoreService.test.tsx
git commit -m "feat(frontend): ProxyPayStoreService (set apikey + indicador hasAbacatePayApiKey)"
```

---

## Task 3: ProxyPayStoreBusiness + Factory

**Files:**
- Create: `monexup-app/src/Business/Interfaces/IProxyPayStoreBusiness.tsx`
- Create: `monexup-app/src/Business/Impl/ProxyPayStoreBusiness.tsx`
- Create: `monexup-app/src/Business/Factory/ProxyPayStoreFactory.tsx`
- Test: `monexup-app/src/Business/Impl/ProxyPayStoreBusiness.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

Criar `monexup-app/src/Business/Impl/ProxyPayStoreBusiness.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Factory/AuthFactory', () => ({
  default: { AuthBusiness: { getSession: vi.fn() } },
}));

import ProxyPayStoreBusiness from './ProxyPayStoreBusiness';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';
import AuthFactory from '../Factory/AuthFactory';

function makeServiceMock(): IProxyPayStoreService {
  return {
    init: vi.fn(),
    setAbacatePayApiKey: vi.fn(),
    getHasAbacatePayApiKey: vi.fn(),
  };
}

describe('ProxyPayStoreBusiness', () => {
  let svc: IProxyPayStoreService;

  beforeEach(() => {
    svc = makeServiceMock();
    ProxyPayStoreBusiness.init(svc);
    (AuthFactory.AuthBusiness.getSession as any).mockReturnValue({ token: 'tok' });
  });

  it('setAbacatePayApiKey sucesso quando service retorna 204', async () => {
    (svc.setAbacatePayApiKey as any).mockResolvedValue({ success: true, httpStatus: '204' });

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(svc.setAbacatePayApiKey).toHaveBeenCalledWith(5, 'key', 'tok');
    expect(ret.sucesso).toBe(true);
  });

  it('setAbacatePayApiKey repassa mensagem de erro do service', async () => {
    (svc.setAbacatePayApiKey as any).mockResolvedValue({ success: false, messageError: 'forbidden' });

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(ret.sucesso).toBe(false);
    expect(ret.mensagem).toBe('forbidden');
  });

  it('setAbacatePayApiKey falha sem sessão', async () => {
    (AuthFactory.AuthBusiness.getSession as any).mockReturnValue(null);

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(ret.sucesso).toBe(false);
  });

  it('getHasAbacatePayApiKey delega ao service com o token', async () => {
    (svc.getHasAbacatePayApiKey as any).mockResolvedValue(true);

    const ret = await ProxyPayStoreBusiness.getHasAbacatePayApiKey();

    expect(svc.getHasAbacatePayApiKey).toHaveBeenCalledWith('tok');
    expect(ret).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `cd monexup-app && npx vitest run src/Business/Impl/ProxyPayStoreBusiness.test.tsx`
Expected: FAIL — `Cannot find module './ProxyPayStoreBusiness'`

- [ ] **Step 3: Criar a interface**

Criar `monexup-app/src/Business/Interfaces/IProxyPayStoreBusiness.tsx`:

```typescript
import BusinessResult from '../../DTO/Business/BusinessResult';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';

export default interface IProxyPayStoreBusiness {
  init: (service: IProxyPayStoreService) => void;
  setAbacatePayApiKey: (storeId: number, apiKey: string) => Promise<BusinessResult<void>>;
  getHasAbacatePayApiKey: () => Promise<boolean>;
}
```

- [ ] **Step 4: Criar a implementação**

Criar `monexup-app/src/Business/Impl/ProxyPayStoreBusiness.tsx`:

```typescript
import BusinessResult from '../../DTO/Business/BusinessResult';
import AuthSession from '../../DTO/Domain/AuthSession';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';
import AuthFactory from '../Factory/AuthFactory';
import IProxyPayStoreBusiness from '../Interfaces/IProxyPayStoreBusiness';

let _service: IProxyPayStoreService;

const ProxyPayStoreBusiness: IProxyPayStoreBusiness = {
  init: function (service: IProxyPayStoreService): void {
    _service = service;
  },

  setAbacatePayApiKey: async (storeId: number, apiKey: string) => {
    let ret: BusinessResult<void>;
    const session: AuthSession = AuthFactory.AuthBusiness.getSession();
    if (!session) {
      return { ...ret, sucesso: false, mensagem: 'Not logged' };
    }
    const retServ = await _service.setAbacatePayApiKey(storeId, apiKey, session.token);
    if (retServ.success) {
      return { ...ret, sucesso: true };
    }
    return { ...ret, sucesso: false, mensagem: retServ.messageError };
  },

  getHasAbacatePayApiKey: async () => {
    const session: AuthSession = AuthFactory.AuthBusiness.getSession();
    if (!session) {
      return false;
    }
    return await _service.getHasAbacatePayApiKey(session.token);
  },
};

export default ProxyPayStoreBusiness;
```

- [ ] **Step 5: Criar o Factory**

Criar `monexup-app/src/Business/Factory/ProxyPayStoreFactory.tsx`:

```typescript
import ServiceFactory from '../../Services/ServiceFactory';
import ProxyPayStoreBusiness from '../Impl/ProxyPayStoreBusiness';
import IProxyPayStoreBusiness from '../Interfaces/IProxyPayStoreBusiness';

const proxyPayStoreService = ServiceFactory.ProxyPayStoreService;

const proxyPayStoreBusinessImpl: IProxyPayStoreBusiness = ProxyPayStoreBusiness;
proxyPayStoreBusinessImpl.init(proxyPayStoreService);

const ProxyPayStoreFactory = {
  ProxyPayStoreBusiness: proxyPayStoreBusinessImpl,
};

export default ProxyPayStoreFactory;
```

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `cd monexup-app && npx vitest run src/Business/Impl/ProxyPayStoreBusiness.test.tsx`
Expected: PASS (4 testes)

- [ ] **Step 7: Commit**

```bash
git add monexup-app/src/Business/Interfaces/IProxyPayStoreBusiness.tsx monexup-app/src/Business/Impl/ProxyPayStoreBusiness.tsx monexup-app/src/Business/Factory/ProxyPayStoreFactory.tsx monexup-app/src/Business/Impl/ProxyPayStoreBusiness.test.tsx
git commit -m "feat(frontend): ProxyPayStoreBusiness + Factory (resolve token da sessao)"
```

---

## Task 4: Chaves de i18n (pt, en, es, fr)

**Files:**
- Modify: `monexup-app/public/locales/pt/translation.json`
- Modify: `monexup-app/public/locales/en/translation.json`
- Modify: `monexup-app/public/locales/es/translation.json`
- Modify: `monexup-app/public/locales/fr/translation.json`

- [ ] **Step 1: Adicionar chaves em pt**

Em `monexup-app/public/locales/pt/translation.json`, adicionar (antes da última `}` do objeto raiz, lembrando a vírgula na entrada anterior):

```json
  "network_edit_abacatepay_section_title": "Pagamento (AbacatePay)",
  "network_edit_abacatepay_section_subtitle": "Configure a chave de API do AbacatePay usada para gerar cobranças PIX desta rede.",
  "network_edit_abacatepay_field_label": "API Key do AbacatePay",
  "network_edit_abacatepay_field_placeholder": "Cole a nova chave",
  "network_edit_abacatepay_save_button": "Salvar chave",
  "network_edit_abacatepay_configured": "Configurada",
  "network_edit_abacatepay_not_configured": "Não configurada",
  "network_edit_abacatepay_no_store_hint": "Provisione a loja de pagamento antes de configurar a chave.",
  "network_edit_abacatepay_save_success": "Chave do AbacatePay atualizada.",
  "network_edit_abacatepay_save_error": "Não foi possível atualizar a chave do AbacatePay.",
  "network_edit_abacatepay_empty_validation": "Informe a chave de API."
```

- [ ] **Step 2: Adicionar chaves em en**

Em `monexup-app/public/locales/en/translation.json`:

```json
  "network_edit_abacatepay_section_title": "Payment (AbacatePay)",
  "network_edit_abacatepay_section_subtitle": "Configure the AbacatePay API key used to generate PIX charges for this network.",
  "network_edit_abacatepay_field_label": "AbacatePay API Key",
  "network_edit_abacatepay_field_placeholder": "Paste the new key",
  "network_edit_abacatepay_save_button": "Save key",
  "network_edit_abacatepay_configured": "Configured",
  "network_edit_abacatepay_not_configured": "Not configured",
  "network_edit_abacatepay_no_store_hint": "Provision the payment store before configuring the key.",
  "network_edit_abacatepay_save_success": "AbacatePay key updated.",
  "network_edit_abacatepay_save_error": "Could not update the AbacatePay key.",
  "network_edit_abacatepay_empty_validation": "Enter the API key."
```

- [ ] **Step 3: Adicionar chaves em es**

Em `monexup-app/public/locales/es/translation.json`:

```json
  "network_edit_abacatepay_section_title": "Pago (AbacatePay)",
  "network_edit_abacatepay_section_subtitle": "Configura la clave de API de AbacatePay usada para generar cobros PIX de esta red.",
  "network_edit_abacatepay_field_label": "Clave de API de AbacatePay",
  "network_edit_abacatepay_field_placeholder": "Pega la nueva clave",
  "network_edit_abacatepay_save_button": "Guardar clave",
  "network_edit_abacatepay_configured": "Configurada",
  "network_edit_abacatepay_not_configured": "No configurada",
  "network_edit_abacatepay_no_store_hint": "Aprovisiona la tienda de pago antes de configurar la clave.",
  "network_edit_abacatepay_save_success": "Clave de AbacatePay actualizada.",
  "network_edit_abacatepay_save_error": "No se pudo actualizar la clave de AbacatePay.",
  "network_edit_abacatepay_empty_validation": "Ingresa la clave de API."
```

- [ ] **Step 4: Adicionar chaves em fr**

Em `monexup-app/public/locales/fr/translation.json`:

```json
  "network_edit_abacatepay_section_title": "Paiement (AbacatePay)",
  "network_edit_abacatepay_section_subtitle": "Configurez la clé d'API AbacatePay utilisée pour générer les paiements PIX de ce réseau.",
  "network_edit_abacatepay_field_label": "Clé d'API AbacatePay",
  "network_edit_abacatepay_field_placeholder": "Collez la nouvelle clé",
  "network_edit_abacatepay_save_button": "Enregistrer la clé",
  "network_edit_abacatepay_configured": "Configurée",
  "network_edit_abacatepay_not_configured": "Non configurée",
  "network_edit_abacatepay_no_store_hint": "Provisionnez la boutique de paiement avant de configurer la clé.",
  "network_edit_abacatepay_save_success": "Clé AbacatePay mise à jour.",
  "network_edit_abacatepay_save_error": "Impossible de mettre à jour la clé AbacatePay.",
  "network_edit_abacatepay_empty_validation": "Saisissez la clé d'API."
```

- [ ] **Step 5: Validar JSON dos quatro arquivos**

Run: `cd monexup-app && node -e "['pt','en','es','fr'].forEach(l=>JSON.parse(require('fs').readFileSync('public/locales/'+l+'/translation.json','utf8')))" && echo OK`
Expected: `OK` (nenhum erro de parse / vírgula)

- [ ] **Step 6: Commit**

```bash
git add monexup-app/public/locales/pt/translation.json monexup-app/public/locales/en/translation.json monexup-app/public/locales/es/translation.json monexup-app/public/locales/fr/translation.json
git commit -m "feat(frontend): i18n da secao AbacatePay em /admin/network"
```

---

## Task 5: Seção AbacatePay na NetworkEditPage

**Files:**
- Create: `monexup-app/src/Pages/NetworkEditPage/AbacatePayApiKeySection.tsx`
- Modify: `monexup-app/src/Pages/NetworkEditPage/index.tsx`

> Componente isolado: encapsula estado e chamadas próprios (não toca `networkContext.network`). Recebe `storeId`, `onSuccess`, `onError` por props. Reusa `FormField`/`SectionHeader` da pasta.

- [ ] **Step 1: Criar o componente da seção**

Criar `monexup-app/src/Pages/NetworkEditPage/AbacatePayApiKeySection.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, CheckCircle2, AlertCircle, Save } from "lucide-react";

import ProxyPayStoreFactory from "../../Business/Factory/ProxyPayStoreFactory";
import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

interface Props {
  storeId: number | null | undefined;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/**
 * Seção write-only para a API Key do AbacatePay da loja ProxyPay da rede.
 * - Indicador "Configurada / Não configurada" via GraphQL hasAbacatePayApiKey.
 * - Input nunca reexibe o valor; após salvar (204) limpa o campo e re-checa.
 * - Renderiza hint se a loja ainda não foi provisionada (sem storeId).
 */
export default function AbacatePayApiKeySection({ storeId, onSuccess, onError }: Props) {
  const { t } = useTranslation();

  const [apiKey, setApiKey] = useState<string>("");
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const hasStore = !!storeId && storeId > 0;

  const refreshIndicator = () => {
    if (!hasStore) return;
    ProxyPayStoreFactory.ProxyPayStoreBusiness.getHasAbacatePayApiKey()
      .then((value) => setHasKey(value))
      .catch(() => setHasKey(false));
  };

  useEffect(() => {
    refreshIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      onError(t("network_edit_abacatepay_empty_validation"));
      return;
    }
    setSaving(true);
    const ret = await ProxyPayStoreFactory.ProxyPayStoreBusiness.setAbacatePayApiKey(
      storeId as number,
      trimmed
    );
    setSaving(false);
    if (ret.sucesso) {
      setApiKey("");
      onSuccess(t("network_edit_abacatepay_save_success"));
      refreshIndicator();
    } else {
      onError(ret.mensagem || t("network_edit_abacatepay_save_error"));
    }
  };

  return (
    <section
      aria-labelledby="network-edit-abacatepay-title"
      className="auth-card relative p-6 sm:p-8 mt-6 animate-fade-up"
    >
      <SectionHeader
        id="network-edit-abacatepay-title"
        icon={KeyRound}
        title={t("network_edit_abacatepay_section_title")}
        subtitle={t("network_edit_abacatepay_section_subtitle")}
      />

      {!hasStore ? (
        <p className="text-sm text-graphite-500">
          {t("network_edit_abacatepay_no_store_hint")}
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            {hasKey ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_configured")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-graphite-500">
                <AlertCircle size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_not_configured")}
              </span>
            )}
          </div>

          <FormField
            id="network-edit-abacatepay-key"
            label={t("network_edit_abacatepay_field_label")}
            icon={KeyRound}
          >
            <input
              id="network-edit-abacatepay-key"
              type="password"
              autoComplete="off"
              placeholder={t("network_edit_abacatepay_field_placeholder")}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 font-mono text-sm"
            />
          </FormField>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cta-primary inline-flex h-12 items-center justify-center gap-2 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
          >
            {saving ? (
              t("loading")
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                {t("network_edit_abacatepay_save_button")}
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Montar a seção na NetworkEditPage**

Em `monexup-app/src/Pages/NetworkEditPage/index.tsx`, adicionar o import após a linha `import FormField from "./FormField";` (linha 25):

```tsx
import AbacatePayApiKeySection from "./AbacatePayApiKeySection";
```

Depois, logo após o fechamento da seção financeira `</section>` (a que termina na linha ~388, imediatamente antes do `</div>` que fecha o `max-w-container`), inserir:

```tsx
        {/* 3b. AbacatePay payment key ----------------------------------- */}
        <AbacatePayApiKeySection
          storeId={network?.proxypayStoreId}
          onSuccess={showSuccessMessage}
          onError={throwError}
        />
```

> `network?.proxypayStoreId` já existe no DTO `NetworkInfo` (frontend) e é populado pelo backend. `showSuccessMessage` e `throwError` já estão definidos no componente (linhas 58-67).

- [ ] **Step 3: Verificar tipos e build**

Run: `cd monexup-app && npx tsc --noEmit`
Expected: sem erros

Run: `cd monexup-app && npm run build`
Expected: build conclui sem erros

- [ ] **Step 4: Commit**

```bash
git add monexup-app/src/Pages/NetworkEditPage/AbacatePayApiKeySection.tsx monexup-app/src/Pages/NetworkEditPage/index.tsx
git commit -m "feat(frontend): secao AbacatePay API Key em /admin/network"
```

---

## Task 6: Verificação manual (end-to-end)

**Pré-requisitos (ação do usuário — fora do código):**
1. ProxyPay (tree `backend`) rodando e acessível em `REACT_APP_PROXYPAY_API_URL`.
2. Coluna criada no DB do ProxyPay (tenant monexup):
   ```sql
   ALTER TABLE proxypay_stores ADD COLUMN IF NOT EXISTS abacatepay_api_key VARCHAR(500);
   ```

- [ ] **Step 1: Subir o frontend**

Run: `cd monexup-app && npm start`
Abrir `/admin/network` logado como gestor de uma rede com loja ProxyPay provisionada (`proxypayStoreId` != null).

- [ ] **Step 2: Verificar indicador inicial**

Expected: a seção "Pagamento (AbacatePay)" aparece; badge mostra "Não configurada" (ou "Configurada" se já houver chave).

- [ ] **Step 3: Salvar uma chave**

Colar uma API key válida do AbacatePay → clicar "Salvar chave".
Expected: toast de sucesso; campo limpa; badge vira "Configurada".

- [ ] **Step 4: Confirmar que o valor não vaza**

Expected: o input volta vazio; recarregar a página mantém badge "Configurada" e input vazio (nunca reexibe o valor).

- [ ] **Step 5: Confirmar o efeito no checkout PIX**

Refazer um checkout PIX da rede.
Expected: não retorna mais `AbacatePay error (401): Invalid or inactive API key`.

- [ ] **Step 6: Verificar caso sem loja**

Logar como gestor de rede sem `proxypayStoreId`.
Expected: a seção mostra o hint "Provisione a loja de pagamento antes de configurar a chave." em vez do campo.

---

## Dependências e ordem

- Task 1 → Task 2 (ServiceFactory importa os arquivos da Task 2; build só fecha ao fim da Task 2).
- Task 2 → Task 3 (Business usa o Service).
- Task 3 + Task 4 → Task 5 (UI usa Factory e chaves i18n).
- Task 5 → Task 6 (verificação manual).

## Notas

- Nenhuma alteração no backend MonexUp nem no repositório ProxyPay (`C:\repos\ProxyPay` é read-only — mudanças lá são solicitadas ao usuário).
- O `HttpClient` é uma factory: cada `HttpClient()` cria uma instância axios isolada. A instância ProxyPay não interfere na do backend MonexUp.
- `doPutAuth`/`doPostAuth` já injetam `Authorization: Bearer` e `Content-Type: application/json`; o `X-Tenant-Id` vem dos default headers da instância (Task 1).

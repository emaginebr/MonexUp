---
name: react-arch
description: Create the complete frontend architecture for a new entity in the React application. Generates DTO types, Service (interface + implementation), Business (interface + implementation + factory), Context, Provider, and registers everything in ServiceFactory and App.tsx. Use this skill when the user asks to create a new entity, feature module, or domain area in the frontend.
---

This skill defines the standard approach for scaffolding a complete frontend entity architecture in the MonexUp project. It creates all necessary files following the established layered pattern.

## Prerequisites

Before creating the architecture, you MUST:

1. **Ask the user** for the entity name (e.g., "Withdrawal", "Template", "Notification")
2. **Ask the user** for the API controller path (e.g., "/Withdrawal", "/Template")
3. **Ask the user** for the entity fields/properties or check if the backend DTO already exists in `MonexUp.DTO/`
4. **Check if the entity already exists** — search `src/DTO/Domain/`, `src/Services/`, `src/Business/`, `src/Contexts/` before creating anything

## Creation Order

Always create files in this exact order:

1. **DTO Domain** → `src/DTO/Domain/{Entity}Info.tsx`
2. **DTO Service Result** → `src/DTO/Services/{Entity}Result.tsx` (and optional `{Entity}ListResult.tsx`)
3. **DTO Context Interface** → `src/DTO/Contexts/I{Entity}Provider.tsx`
4. **Service Interface** → `src/Services/Interfaces/I{Entity}Service.tsx`
5. **Service Implementation** → `src/Services/Impl/{Entity}Service.tsx`
6. **ServiceFactory registration** → `src/Services/ServiceFactory.tsx`
7. **Business Interface** → `src/Business/Interfaces/I{Entity}Business.tsx`
8. **Business Implementation** → `src/Business/Impl/{Entity}Business.tsx`
9. **Business Factory** → `src/Business/Factory/{Entity}Factory.tsx`
10. **Context** → `src/Contexts/{Entity}/{Entity}Context.tsx`
11. **Provider** → `src/Contexts/{Entity}/{Entity}Provider.tsx`
12. **App.tsx registration** → `src/App.tsx`

## Rules

1. **Never use `any` type** — all types must be explicitly defined.
2. **Never use `alert()` or `window.confirm()`** — use `MessageToast` (see `react-alert` skill).
3. **Never create custom hooks** — components use `useContext()` directly.
4. **Never use `useCallback`** — the project does not use it in providers.
5. **Always use the singleton-object pattern** for services and business (not classes).
6. **Always use module-level variables** (`let _httpClient`, `let _service`) for dependency injection via `init()`.
7. **Always check `result.sucesso`** before updating state — API responses use Portuguese keys.
8. **Always use `AuthFactory.AuthBusiness.getSession()`** to get auth tokens in business methods.
9. **Always extend `StatusRequest`** for service result types.
10. **Always return `ProviderResult`** from provider async methods.

## Existing Types to Reuse (DO NOT recreate)

These types already exist and should be imported:

- `src/DTO/Services/StatusRequest.tsx` → `{ sucesso: boolean; mensagem: string; erros: any }`
- `src/DTO/Services/ApiResponse.tsx` → `ApiResponse<T>` (generic HTTP response wrapper)
- `src/DTO/Business/BusinessResult.tsx` → `BusinessResult<T>` extends StatusRequest with `dataResult: T`
- `src/DTO/Contexts/ProviderResult.tsx` → `{ sucesso: boolean; mensagemErro: string; mensagemSucesso: string }`
- `src/Infra/Interface/IHttpClient.tsx` → `IHttpClient` (HTTP client interface)
- `src/DTO/Domain/AuthSession.tsx` → `AuthSession` (auth session type)

## Step 1: Create DTO Domain

**File**: `src/DTO/Domain/{Entity}Info.tsx`

```tsx
export default interface {Entity}Info {
    {entity}Id: number;
    name: string;
    // ... entity-specific fields
    // Use appropriate types: number, string, boolean, Date
    // Reference enums from src/DTO/Enum/ if needed
}
```

**Conventions:**
- Entity ID uses camelCase: `{entity}Id` (e.g., `withdrawalId`)
- Export as `default interface`
- File extension is `.tsx`

## Step 2: Create DTO Service Result

**File**: `src/DTO/Services/{Entity}Result.tsx`

```tsx
import {Entity}Info from "../Domain/{Entity}Info";
import StatusRequest from "./StatusRequest";

export default interface {Entity}Result extends StatusRequest {
    {entity}?: {Entity}Info;
}
```

**If a list result is needed**, create `src/DTO/Services/{Entity}ListResult.tsx`:

```tsx
import {Entity}Info from "../Domain/{Entity}Info";
import StatusRequest from "./StatusRequest";

export default interface {Entity}ListResult extends StatusRequest {
    {entities}?: {Entity}Info[];
}
```

## Step 3: Create DTO Context Interface

**File**: `src/DTO/Contexts/I{Entity}Provider.tsx`

```tsx
import {Entity}Info from "../Domain/{Entity}Info";
import ProviderResult from "./ProviderResult";

interface I{Entity}Provider {
    loading: boolean;
    loadingList: boolean;
    loadingUpdate: boolean;

    {entity}: {Entity}Info;
    {entities}: {Entity}Info[];

    set{Entity}: ({entity}: {Entity}Info) => void;

    insert: ({entity}: {Entity}Info) => Promise<ProviderResult>;
    update: ({entity}: {Entity}Info) => Promise<ProviderResult>;
    getById: ({entity}Id: number) => Promise<ProviderResult>;
    list: () => Promise<ProviderResult>;
}

export default I{Entity}Provider;
```

**Conventions:**
- Include granular loading states: `loading`, `loadingList`, `loadingUpdate`
- All async methods return `Promise<ProviderResult>`
- Include a setter for the single entity: `set{Entity}`

## Step 4: Create Service Interface

**File**: `src/Services/Interfaces/I{Entity}Service.tsx`

```tsx
import {Entity}Info from "../../DTO/Domain/{Entity}Info";
import {Entity}Result from "../../DTO/Services/{Entity}Result";
import {Entity}ListResult from "../../DTO/Services/{Entity}ListResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface I{Entity}Service {
    init: (httpClient: IHttpClient) => void;
    insert: ({entity}: {Entity}Info, token: string) => Promise<{Entity}Result>;
    update: ({entity}: {Entity}Info, token: string) => Promise<{Entity}Result>;
    getById: ({entity}Id: number, token: string) => Promise<{Entity}Result>;
    list: (token: string) => Promise<{Entity}ListResult>;
}
```

**Conventions:**
- Always include `init(httpClient: IHttpClient)` method
- Auth-required methods receive `token: string` as last parameter
- Public (no-auth) methods omit the token parameter

## Step 5: Create Service Implementation

**File**: `src/Services/Impl/{Entity}Service.tsx`

```tsx
import {Entity}Info from "../../DTO/Domain/{Entity}Info";
import {Entity}Result from "../../DTO/Services/{Entity}Result";
import {Entity}ListResult from "../../DTO/Services/{Entity}ListResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import I{Entity}Service from "../Interfaces/I{Entity}Service";

let _httpClient: IHttpClient;

const {Entity}Service: I{Entity}Service = {
    init: function (httpClient: IHttpClient): void {
        _httpClient = httpClient;
    },
    insert: async ({entity}: {Entity}Info, token: string) => {
        let ret: {Entity}Result;
        let request = await _httpClient.doPostAuth<{Entity}Result>("/{Entity}/insert", {entity}, token);
        if (request.success) {
            return request.data;
        } else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    update: async ({entity}: {Entity}Info, token: string) => {
        let ret: {Entity}Result;
        let request = await _httpClient.doPostAuth<{Entity}Result>("/{Entity}/update", {entity}, token);
        if (request.success) {
            return request.data;
        } else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    getById: async ({entity}Id: number, token: string) => {
        let ret: {Entity}Result;
        let request = await _httpClient.doGetAuth<{Entity}Result>("/{Entity}/getById/" + {entity}Id, token);
        if (request.success) {
            return request.data;
        } else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    list: async (token: string) => {
        let ret: {Entity}ListResult;
        let request = await _httpClient.doGetAuth<{Entity}ListResult>("/{Entity}/list", token);
        if (request.success) {
            return request.data;
        } else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    }
};

export default {Entity}Service;
```

**Key patterns:**
- Module-level `let _httpClient: IHttpClient` for closure-based DI
- Singleton `const` object implementing the interface
- Error handling: check `request.success`, return `request.data` on success, build error result on failure
- Use `_httpClient.doPostAuth` for POST with auth, `_httpClient.doGetAuth` for GET with auth
- Use `_httpClient.doPost` / `_httpClient.doGet` for public endpoints (no token)
- API paths match the backend controller (e.g., `/{Entity}/insert`, `/{Entity}/getById/{id}`)

## Step 6: Register in ServiceFactory

**File**: `src/Services/ServiceFactory.tsx`

Add to the existing file:

```tsx
// Add imports
import I{Entity}Service from './Interfaces/I{Entity}Service';
import {Entity}Service from './Impl/{Entity}Service';

// Add initialization (after httpClientAuth.init)
const {entity}ServiceImpl: I{Entity}Service = {Entity}Service;
{entity}ServiceImpl.init(httpClientAuth);

// Add to ServiceFactory object
const ServiceFactory = {
    // ... existing services ...
    {Entity}Service: {entity}ServiceImpl,
};
```

## Step 7: Create Business Interface

**File**: `src/Business/Interfaces/I{Entity}Business.tsx`

```tsx
import BusinessResult from "../../DTO/Business/BusinessResult";
import {Entity}Info from "../../DTO/Domain/{Entity}Info";
import I{Entity}Service from "../../Services/Interfaces/I{Entity}Service";

export default interface I{Entity}Business {
    init: ({entity}Service: I{Entity}Service) => void;
    insert: ({entity}: {Entity}Info) => Promise<BusinessResult<{Entity}Info>>;
    update: ({entity}: {Entity}Info) => Promise<BusinessResult<{Entity}Info>>;
    getById: ({entity}Id: number) => Promise<BusinessResult<{Entity}Info>>;
    list: () => Promise<BusinessResult<{Entity}Info[]>>;
}
```

**Conventions:**
- `init()` receives the service interface
- Methods return `BusinessResult<T>` — no token parameter (handled internally)

## Step 8: Create Business Implementation

**File**: `src/Business/Impl/{Entity}Business.tsx`

```tsx
import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import {Entity}Info from "../../DTO/Domain/{Entity}Info";
import I{Entity}Service from "../../Services/Interfaces/I{Entity}Service";
import AuthFactory from "../Factory/AuthFactory";
import I{Entity}Business from "../Interfaces/I{Entity}Business";

let _{entity}Service: I{Entity}Service;

const {Entity}Business: I{Entity}Business = {
    init: function ({entity}Service: I{Entity}Service): void {
        _{entity}Service = {entity}Service;
    },
    insert: async ({entity}: {Entity}Info) => {
        try {
            let ret: BusinessResult<{Entity}Info>;
            let session: AuthSession = AuthFactory.AuthBusiness.getSession();
            if (!session) {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: "Not logged"
                };
            }
            let retServ = await _{entity}Service.insert({entity}, session.token);
            if (retServ.sucesso) {
                return {
                    ...ret,
                    dataResult: retServ.{entity},
                    sucesso: true
                };
            } else {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: retServ.mensagem
                };
            }
        } catch {
            throw new Error("Failed to insert {entity}");
        }
    },
    update: async ({entity}: {Entity}Info) => {
        try {
            let ret: BusinessResult<{Entity}Info>;
            let session: AuthSession = AuthFactory.AuthBusiness.getSession();
            if (!session) {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: "Not logged"
                };
            }
            let retServ = await _{entity}Service.update({entity}, session.token);
            if (retServ.sucesso) {
                return {
                    ...ret,
                    dataResult: retServ.{entity},
                    sucesso: true
                };
            } else {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: retServ.mensagem
                };
            }
        } catch {
            throw new Error("Failed to update {entity}");
        }
    },
    getById: async ({entity}Id: number) => {
        try {
            let ret: BusinessResult<{Entity}Info>;
            let session: AuthSession = AuthFactory.AuthBusiness.getSession();
            if (!session) {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: "Not logged"
                };
            }
            let retServ = await _{entity}Service.getById({entity}Id, session.token);
            if (retServ.sucesso) {
                return {
                    ...ret,
                    dataResult: retServ.{entity},
                    sucesso: true
                };
            } else {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: retServ.mensagem
                };
            }
        } catch {
            throw new Error("Failed to get {entity}");
        }
    },
    list: async () => {
        try {
            let ret: BusinessResult<{Entity}Info[]>;
            let session: AuthSession = AuthFactory.AuthBusiness.getSession();
            if (!session) {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: "Not logged"
                };
            }
            let retServ = await _{entity}Service.list(session.token);
            if (retServ.sucesso) {
                return {
                    ...ret,
                    dataResult: retServ.{entities},
                    sucesso: true
                };
            } else {
                return {
                    ...ret,
                    sucesso: false,
                    mensagem: retServ.mensagem
                };
            }
        } catch {
            throw new Error("Failed to list {entities}");
        }
    }
};

export default {Entity}Business;
```

**Key patterns:**
- Module-level `let _{entity}Service` for closure-based DI
- Gets auth token from `AuthFactory.AuthBusiness.getSession()`
- Always checks `if (!session)` before making service calls
- Maps service results to `BusinessResult<T>` with `dataResult`
- Result field names from service: `retServ.{entity}` (single) or `retServ.{entities}` (list)

## Step 9: Create Business Factory

**File**: `src/Business/Factory/{Entity}Factory.tsx`

```tsx
import ServiceFactory from '../../Services/ServiceFactory';
import {Entity}Business from '../Impl/{Entity}Business';
import I{Entity}Business from '../Interfaces/I{Entity}Business';

const {entity}Service = ServiceFactory.{Entity}Service;

const {entity}BusinessImpl: I{Entity}Business = {Entity}Business;
{entity}BusinessImpl.init({entity}Service);

const {Entity}Factory = {
    {Entity}Business: {entity}BusinessImpl
};

export default {Entity}Factory;
```

## Step 10: Create Context

**File**: `src/Contexts/{Entity}/{Entity}Context.tsx`

```tsx
import React from 'react';
import I{Entity}Provider from '../../DTO/Contexts/I{Entity}Provider';

const {Entity}Context = React.createContext<I{Entity}Provider>(null);

export default {Entity}Context;
```

## Step 11: Create Provider

**File**: `src/Contexts/{Entity}/{Entity}Provider.tsx`

```tsx
import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import I{Entity}Provider from "../../DTO/Contexts/I{Entity}Provider";
import {Entity}Info from "../../DTO/Domain/{Entity}Info";
import {Entity}Factory from "../../Business/Factory/{Entity}Factory";
import {Entity}Context from "./{Entity}Context";

export default function {Entity}Provider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);

    const [{entity}, _set{Entity}] = useState<{Entity}Info>(null);
    const [{entities}, set{Entities}] = useState<{Entity}Info[]>([]);

    const {entity}ProviderValue: I{Entity}Provider = {
        loading: loading,
        loadingList: loadingList,
        loadingUpdate: loadingUpdate,

        {entity}: {entity},
        {entities}: {entities},

        set{Entity}: ({entity}: {Entity}Info) => {
            _set{Entity}({entity});
        },

        insert: async ({entity}: {Entity}Info) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                let brt = await {Entity}Factory.{Entity}Business.insert({entity});
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    _set{Entity}(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "{entity}_added_successfully"
                    };
                } else {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            } catch (err) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        update: async ({entity}: {Entity}Info) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                let brt = await {Entity}Factory.{Entity}Business.update({entity});
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    _set{Entity}(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "{entity}_updated_successfully"
                    };
                } else {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            } catch (err) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        getById: async ({entity}Id: number) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            _set{Entity}(null);
            try {
                let brt = await {Entity}Factory.{Entity}Business.getById({entity}Id);
                if (brt.sucesso) {
                    setLoading(false);
                    _set{Entity}(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "{entity}_loaded_successfully"
                    };
                } else {
                    setLoading(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            } catch (err) {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        list: async () => {
            let ret: Promise<ProviderResult>;
            setLoadingList(true);
            try {
                let brt = await {Entity}Factory.{Entity}Business.list();
                if (brt.sucesso) {
                    setLoadingList(false);
                    set{Entities}(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "{entities}_loaded_successfully"
                    };
                } else {
                    setLoadingList(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            } catch (err) {
                setLoadingList(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        }
    };

    return (
        <{Entity}Context.Provider value={{entity}ProviderValue}>
            {props.children}
        </{Entity}Context.Provider>
    );
}
```

**Key patterns:**
- Functional component with `props: any`
- Multiple `useState` for loading states and entity data
- Creates provider value object implementing the interface
- Calls `{Entity}Factory.{Entity}Business` methods
- Sets loading state before and after async calls
- Maps business results to `ProviderResult` with `sucesso`, `mensagemErro`, `mensagemSucesso`
- Success messages are translation keys (e.g., `"{entity}_added_successfully"`)

## Step 12: Register Provider in App.tsx

**File**: `src/App.tsx`

Add import and include in the ContextBuilder array:

```tsx
// Add import
import {Entity}Provider from './Contexts/{Entity}/{Entity}Provider';

// Add to ContextBuilder array
const ContextContainer = ContextBuilder([
    AuthProvider, UserProvider, NetworkProvider, ProfileProvider, ProductProvider,
    OrderProvider, InvoiceProvider, ImageProvider, TemplateProvider,
    {Entity}Provider  // <-- Add here
]);
```

**Nesting rules:**
- `AuthProvider` must always be first (all contexts depend on auth via AuthFactory)
- Place new providers at the end of the array
- If the new provider depends on another context, place it after that provider

## Naming Convention Reference

| Item | Convention | Example |
|------|-----------|---------|
| Domain DTO | `src/DTO/Domain/{Entity}Info.tsx` | `WithdrawalInfo.tsx` |
| Service Result | `src/DTO/Services/{Entity}Result.tsx` | `WithdrawalResult.tsx` |
| List Result | `src/DTO/Services/{Entity}ListResult.tsx` | `WithdrawalListResult.tsx` |
| Context Interface | `src/DTO/Contexts/I{Entity}Provider.tsx` | `IWithdrawalProvider.tsx` |
| Service Interface | `src/Services/Interfaces/I{Entity}Service.tsx` | `IWithdrawalService.tsx` |
| Service Impl | `src/Services/Impl/{Entity}Service.tsx` | `WithdrawalService.tsx` |
| Business Interface | `src/Business/Interfaces/I{Entity}Business.tsx` | `IWithdrawalBusiness.tsx` |
| Business Impl | `src/Business/Impl/{Entity}Business.tsx` | `WithdrawalBusiness.tsx` |
| Business Factory | `src/Business/Factory/{Entity}Factory.tsx` | `WithdrawalFactory.tsx` |
| Context | `src/Contexts/{Entity}/{Entity}Context.tsx` | `WithdrawalContext.tsx` |
| Provider | `src/Contexts/{Entity}/{Entity}Provider.tsx` | `WithdrawalProvider.tsx` |
| Entity ID field | `{entity}Id` | `withdrawalId` |

## Verification Checklist

- [ ] Domain DTO at `src/DTO/Domain/{Entity}Info.tsx`
- [ ] Service result at `src/DTO/Services/{Entity}Result.tsx`
- [ ] Context interface at `src/DTO/Contexts/I{Entity}Provider.tsx`
- [ ] Service interface at `src/Services/Interfaces/I{Entity}Service.tsx`
- [ ] Service implementation at `src/Services/Impl/{Entity}Service.tsx`
- [ ] Service registered in `src/Services/ServiceFactory.tsx`
- [ ] Business interface at `src/Business/Interfaces/I{Entity}Business.tsx`
- [ ] Business implementation at `src/Business/Impl/{Entity}Business.tsx`
- [ ] Business factory at `src/Business/Factory/{Entity}Factory.tsx`
- [ ] Context at `src/Contexts/{Entity}/{Entity}Context.tsx`
- [ ] Provider at `src/Contexts/{Entity}/{Entity}Provider.tsx`
- [ ] Provider added to `ContextBuilder` in `src/App.tsx`
- [ ] All service results extend `StatusRequest`
- [ ] All provider methods return `ProviderResult`
- [ ] Business uses `AuthFactory.AuthBusiness.getSession()` for auth
- [ ] No `any` types, no `alert()`, no `window.confirm()`
- [ ] API paths match backend controller routes

## Common Gotchas

- **StatusRequest already exists**: Import from `src/DTO/Services/StatusRequest.tsx`, never recreate.
- **ProviderResult already exists**: Import from `src/DTO/Contexts/ProviderResult.tsx`, never recreate.
- **BusinessResult already exists**: Import from `src/DTO/Business/BusinessResult.tsx`, never recreate.
- **Entity ID naming**: Always use `{entity}Id` (camelCase), not `{entity}_id` or `id`.
- **Portuguese field names**: `sucesso` (not `success`), `mensagem` (not `message`), `mensagemErro`, `mensagemSucesso`.
- **Service result field names**: The service result wraps the entity with a field name matching the entity (e.g., `product` in `ProductResult`, `{entities}` in list results).
- **Spread operator pattern**: `let ret: Type; ... return { ...ret, sucesso: true }` — this is the project convention even though `ret` is uninitialized.
- **No useCallback**: The project does not use `useCallback` in providers. Methods are defined directly in the provider value object.

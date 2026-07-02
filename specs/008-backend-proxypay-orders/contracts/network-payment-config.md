# Contract: Network payment configuration endpoints (MonexUp API)

Moves the AbacatePay-key configuration off the browser→ProxyPay direct path (this branch's `ProxyPayStoreService`) onto MonexUp, which relays to ProxyPay server-side (FR-009, FR-010). NAuth bearer required; caller must manage the target network.

## PUT /Network/{networkId}/abacatepay-apikey  (new — proxy)

Sets (write-only) the AbacatePay API key on the network's ProxyPay store.

**Request**
```json
{ "apiKey": "string (required)" }
```

**Response 204** — key stored at the provider.
**Response 400** — `{ "sucesso": false, "mensagem": "..." }` (validation / no store provisioned).
**Response 403** — caller not the store owner.

**Backend**: resolve the network's `ProxyPayStoreId`; call new `IProxyPayClient.SetAbacatePayApiKeyAsync(storeId, apiKey, bearerToken)` → `PUT {ProxyPay}/Store/{storeId}/abacatepay-apikey`. Never echo the key back.

## GET /Network/{networkId}/abacatepay-apikey/status  (new — indicator)

Returns whether a key is configured (never the value).

**Response 200**
```json
{ "sucesso": true, "hasAbacatePayApiKey": true }
```

**Backend**: new `IProxyPayClient.GetHasAbacatePayApiKeyAsync(bearerToken)` → ProxyPay GraphQL `{ myStore { storeId hasAbacatePayApiKey } }`, returns the first store's flag; `false` on any failure.

## Notes
- Exact paths (`/Network/{id}/...` vs a dedicated controller) are a naming choice for `/speckit.tasks`; the contract is the capability + auth + write-only semantics.
- Frontend `ProxyPayStoreService.tsx` (this branch) repoints its two calls from `REACT_APP_PROXYPAY_API_URL` to the MonexUp API; the direct-ProxyPay `HttpClient` instance in `ServiceFactory` is retired.

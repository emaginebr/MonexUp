# Lofn Store Provisioning — Internal Contract

**Feature**: 004-lofn-products-migration
**Date**: 2026-05-04

This is **not** a public MonexUp API. It documents the back-channel call MonexUp makes to Lofn during lazy store provisioning.

---

## Trigger

Backend orchestrator: `LofnStoreProvisioningService.EnsureStoreAsync(int networkId)`.

Called from:

- The product-link endpoint (`POST /api/productLink`) **before** persisting the link, when the resolved Network has `LofnStoreId IS NULL`. This is the only legitimate write trigger (clarification Q3 — lazy on first product CREATE only).

## Outbound HTTP

```http
POST {Lofn:ApiURL}/api/Store/insert
X-Tenant-Id: monexup
Authorization: Bearer <NAuth token of the calling user>
Content-Type: application/json

{
  "name": "<network.Name>"
}
```

- `Lofn:ApiURL` comes from `IConfiguration` (`appsettings.{Environment}.json`). Constitution Principle IV — never read env vars directly in code.
- `X-Tenant-Id` is the same `monexup` value used by every other Lofn call in MonexUp (frontend `lofn-react`, frontend `dedalo`, etc.).
- `Authorization` carries the calling user's NAuth bearer; Lofn validates the token against the same `X-Tenant-Id` it expects.

## Expected response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 12345,
  "name": "MyNetwork",
  "status": 1,
  "createdAt": "2026-05-04T15:00:00Z"
}
```

Backend reads `id` and persists it as `Networks.LofnStoreId`.

## Idempotency / Concurrency

`EnsureStoreAsync` is wrapped in a serializable transaction on the `Networks` row:

```text
BEGIN SERIALIZABLE
  SELECT LofnStoreId FROM Networks WHERE Id = @networkId FOR UPDATE
  IF LofnStoreId IS NOT NULL → COMMIT, return LofnStoreId
  ELSE
    storeId = LofnStoreClient.InsertAsync(network.Name)
    UPDATE Networks SET LofnStoreId = @storeId WHERE Id = @networkId
COMMIT
```

The two-phase guard means a second concurrent CREATE waits on `FOR UPDATE`, then observes the now-populated `LofnStoreId`, short-circuits, and returns the same id (research R4).

## Failure modes

| Lofn response                  | MonexUp behavior                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------- |
| 5xx / network error            | `EnsureStoreAsync` throws; outer `POST /api/productLink` returns 503 with envelope `{ sucesso: false, mensagemErro: "Lofn indisponível, tente novamente." }`. Frontend retries per R6. |
| 4xx with body `{ message: "Tenant not found" }` | Configuration drift — alert + 500. Should not happen in production. |
| 200 but missing `id`           | Treat as 502 — protocol violation. Surface `mensagemErro: "Resposta inválida do Lofn"`. |

## Non-mutations

- This service NEVER calls `PUT /api/Store/update`, `DELETE /api/Store`, or `POST /api/Store/uploadLogo`. Logo, status, and updates are owned by the network owner via `lofn-react`'s `StoreForm` later (out of scope for this feature).
- This service NEVER deletes a Lofn store (clarification Q2 — controlled-orphan strategy).

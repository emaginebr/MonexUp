# Contract: Invite REST Endpoints

New endpoints on `NetworkController` (MonexUp API, base `/Network`). All use NAuth (`NAuth` scheme). Response DTOs follow the project convention with Portuguese status fields (`sucesso`, `mensagemErro`). All request/response bodies are JSON with camelCase property names.

Signing secret: `IConfiguration:Invite:Secret`. Token format: `base64url(payload).base64url(HMAC-SHA256(secret, payload))`, `payload = "{networkId}|{inviterUserId}|{targetUserId}|{hasAccount}"`.

---

## 1. Generate invite — `POST /Network/invite`

Authorization: caller MUST be NetworkManager/Administrator of `networkId`.

**Request** — `InviteRequestInfo`
```json
{ "networkId": 12, "email": "person@example.com" }
```

**Behavior**
1. Validate email format → 400 / `sucesso:false` if invalid.
2. Resolve account via NAuth `GetByEmailAsync` (try/catch → not found = no account).
3. If account exists:
   - If the user already has an `Active`/`WaitForApproval` membership in `networkId` → do not duplicate; return `alreadyMember` state.
   - Else create `WaitForApproval` membership for the invitee with `ReferrerId = caller.UserId`.
   - Build token with `targetUserId = inviteeUserId`, `hasAccount = 1`.
4. If no account: create nothing; build token with `targetUserId = 0`, `hasAccount = 0`.

**Response 200** — `InviteResultInfo`
```json
{
  "sucesso": true,
  "hasAccount": true,
  "alreadyMember": false,
  "token": "eyJ...aGVsbG8.QmFzZTY0U2ln",
  "networkSlug": "minha-rede",
  "mensagemErro": null
}
```
Frontend composes the URL:
- `hasAccount = false` → `{origin}/{networkSlug}/new-seller?invite={token}`
- `hasAccount = true`  → `{origin}/invite/accept?token={token}`

**Errors**: 401 (no session), 403 (not a manager of the network), 400 (invalid email).

---

## 2. Invite detail — `GET /Network/invite/detail?token={token}`

Authorization: any authenticated user (the invited account opening the accept page).

**Behavior**: verify token signature. Return network + inviter display info and the caller's relationship to the network.

**Response 200** — `InviteDetailInfo`
```json
{
  "sucesso": true,
  "networkId": 12,
  "networkName": "Minha Rede",
  "inviterName": "João Silva",
  "targetUserId": 87,
  "isForCurrentUser": true,
  "alreadyActiveMember": false,
  "mensagemErro": null
}
```
- `isForCurrentUser` = `session.UserId == targetUserId` (drives FR-015: if false, the UI tells them to sign in as the invited account).

**Errors**: 401, 400 (invalid/tampered token).

---

## 3. Accept invite — `POST /Network/invite/accept`

Authorization: authenticated; caller MUST equal `token.targetUserId`.

**Request** — `InviteActionInfo`
```json
{ "token": "eyJ...aGVsbG8.QmFzZTY0U2ln" }
```

**Behavior**: verify token + `session.UserId == targetUserId` (403 otherwise). Ensure a `WaitForApproval` membership exists for the invitee (idempotent; created at invite time). No status change — confirms intent; membership remains pending for manager approval.

**Response 200** — `{ "sucesso": true, "mensagemErro": null }`

**Errors**: 401, 403 (not the invited account), 400 (invalid token).

---

## 4. Decline invite — `POST /Network/invite/decline`

Authorization: authenticated; caller MUST equal `token.targetUserId`.

**Request** — `InviteActionInfo` (same shape as accept).

**Behavior**: verify token + ownership. Set the invitee's `WaitForApproval` membership in `networkId` to `Inactive`.

**Response 200** — `{ "sucesso": true, "mensagemErro": null }`

**Errors**: 401, 403, 400.

---

## 5. Join from invite (new account) — `POST /Network/invite/join`

Authorization: authenticated (the newly created account, just logged in).

**Request** — `InviteActionInfo`
```json
{ "token": "eyJ...aGVsbG8.QmFzZTY0U2ln" }
```

**Behavior**: verify token (`hasAccount = 0`). Enroll the caller (`session.UserId`) into `token.networkId` as `WaitForApproval` with `ReferrerId = token.inviterUserId` (idempotent — no duplicate if already active/pending). This is the tamper-proof referrer enrollment for the no-account path.

**Response 200** — `{ "sucesso": true, "mensagemErro": null }`

**Errors**: 401, 400 (invalid token), 409/`sucesso:false` if already an active member (surfaced, not fatal).

---

## DTO summary (MonexUp.DTO/Network)

| DTO | Fields |
|-----|--------|
| `InviteRequestInfo` | `networkId:long`, `email:string` |
| `InviteResultInfo` | `sucesso:bool`, `hasAccount:bool`, `alreadyMember:bool`, `token:string`, `networkSlug:string`, `mensagemErro:string?` |
| `InviteDetailInfo` | `sucesso:bool`, `networkId:long`, `networkName:string`, `inviterName:string`, `targetUserId:long`, `isForCurrentUser:bool`, `alreadyActiveMember:bool`, `mensagemErro:string?` |
| `InviteActionInfo` | `token:string` |

## Contract test intents (for /speckit.tasks)

- Generate invite for a **new email** → `hasAccount:false`, `targetUserId=0`, no membership row created, valid token.
- Generate invite for an **existing email** → `hasAccount:true`, `WaitForApproval` row created with `referrerId = caller`, valid token.
- Generate invite for **existing active member** → `alreadyMember:true`, no duplicate row.
- Generate invite by a **non-manager** → 403.
- Tampered token to any consuming endpoint → 400.
- Accept/decline by a **different account** than `targetUserId` → 403.
- Decline → membership becomes `Inactive`.
- Join (new account) → caller enrolled `WaitForApproval` with `referrerId = inviter`; second call idempotent (no duplicate).

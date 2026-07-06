---
description: "Task list for Referrer Invite Flow"
---

# Tasks: Referrer Invite Flow for Network Teams

**Input**: Design documents from `/specs/009-referrer-invite/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/invite-api.md

**Tests**: Unit tests are included for the token signer and the new `NetworkService` invite logic (per plan.md Testing). UI flows are verified via quickstart.md.

**Organization**: Grouped by user story. US1 (P1) is the MVP. No new DB table/migration — reuses `user_networks.referrer_id`.

## Path Conventions

Web monorepo: backend under `MonexUp.*` projects; frontend under `monexup-app/src`. Absolute repo root: `C:\repos\MonexUp`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuration required before any invite code runs

- [X] T001 Add `Invite:Secret` HMAC signing key to `MonexUp.API/appsettings.Development.json` (and `appsettings.Docker.json` + `.env.example` / docker-compose `Invite__Secret`) — read via `IConfiguration`, never `Environment.GetEnvironmentVariable()`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Signer, DTOs, service contract, and the frontend Invite module scaffolding shared by every user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend foundation

- [X] T002 [P] Create `IInviteTokenSigner` interface (`Sign(networkId, inviterUserId, targetUserId, hasAccount)` → token; `TryVerify(token, out payload)`) in `MonexUp.Domain/Services/Interfaces/IInviteTokenSigner.cs`
- [X] T003 [P] Implement `InviteTokenSigner` — payload `"{networkId}|{inviterUserId}|{targetUserId}|{hasAccount}"`, `HMACSHA256` with secret from `IConfiguration:Invite:Secret`, base64url `payload.signature`, verify with `CryptographicOperations.FixedTimeEquals` — in `MonexUp.Domain/Services/InviteTokenSigner.cs`
- [X] T004 Register `IInviteTokenSigner` → `InviteTokenSigner` (Scoped) in `MonexUp.Application/Initializer.cs`
- [X] T005 [P] Create DTOs `InviteRequestInfo`, `InviteResultInfo`, `InviteDetailInfo`, `InviteActionInfo` (Portuguese status fields `sucesso`/`mensagemErro`, camelCase `JsonPropertyName`) in `MonexUp.DTO/Network/`
- [X] T006 [P] Add invite method signatures (`InviteByEmail`, `JoinFromInvite`, `GetInviteDetail`, `AcceptInvite`, `DeclineInvite`) to `MonexUp.Domain/Services/Interfaces/INetworkService.cs`
- [X] T007 [P] Unit tests for `InviteTokenSigner` (sign→verify round-trip; tampered payload/signature rejected; wrong-secret rejected) in `MonexUp.UnitTests/Services/InviteTokenSignerTests.cs`

### Frontend foundation (Invite module — Service → Business → Provider)

- [X] T008 [P] Create invite DTO types (`InviteRequestInfo`, `InviteResultInfo`, `InviteDetailInfo`, `InviteActionInfo`) in `monexup-app/src/DTO/Domain/InviteInfo.tsx`
- [X] T009 [P] Create `IInviteService` + `InviteService` (POST `/Network/invite`, `/invite/join`, `/invite/accept`, `/invite/decline`; GET `/invite/detail`) in `monexup-app/src/Services/{Interfaces/IInviteService.tsx,Impl/InviteService.tsx}` using `httpClientAuth`
- [X] T010 [P] Create `IInviteBusiness` + `InviteBusiness` + `InviteFactory` (inject session token from `AuthFactory`; expose `invite/join/accept/decline/getDetail`; compose invite URL from `token` + `hasAccount` + `networkSlug`) in `monexup-app/src/Business/{Interfaces,Impl,Factory}/`
- [X] T011 [P] Create `InviteContext` + `InviteProvider` in `monexup-app/src/Contexts/Invite/`
- [X] T012 Register `InviteService` in `monexup-app/src/Services/ServiceFactory.tsx` and add `InviteProvider` to the `ContextBuilder` array in `monexup-app/src/App.tsx` (inside/earlier than `AuthProvider`/`NetworkProvider`)

**Checkpoint**: Signer, DTOs, service contract, and frontend module wired — user stories can begin

---

## Phase 3: User Story 1 - Invite a new person (no account) (Priority: P1) 🎯 MVP

**Goal**: Manager invites a no-account email → gets a copyable `/new-seller` link → invitee signs up → enrolled as `WaitForApproval` with referrer = inviter.

**Independent Test**: From `/admin/teams`, invite a no-account email, open the link in a clean session, complete sign-up, confirm the new user appears pending with referrer = the inviting manager (quickstart Path A).

### Backend

- [X] T013 [US1] Implement `NetworkService.InviteByEmail` — validate email format; authorize caller is NetworkManager/Administrator of the network (reuse `ValidateAccess` pattern); resolve account via NAuth `IUserClient.GetByEmailAsync` in try/catch (non-2xx/404 → no account, log via `ILogger`); **no-account branch**: create nothing, build token `hasAccount=0, targetUserId=0`; return `InviteResultInfo{ hasAccount:false, token, networkSlug }` — in `MonexUp.Domain/Services/NetworkService.cs`
- [X] T014 [US1] Implement `NetworkService.JoinFromInvite(joinerUserId, token)` — verify token via `IInviteTokenSigner`; enroll caller into `token.networkId` as `WaitForApproval` with `ReferrerId = token.inviterUserId` (reuse lowest-profile/Seller insert logic from `RequestAccess`); idempotent (skip if active/pending row exists) — in `MonexUp.Domain/Services/NetworkService.cs`
- [X] T015 [US1] Add `POST /Network/invite` endpoint (`[Authorize]`, body `InviteRequestInfo`, caller from `GetUserInSession`) in `MonexUp.API/Controllers/NetworkController.cs`
- [X] T016 [US1] Add `POST /Network/invite/join` endpoint (`[Authorize]`, body `InviteActionInfo`) in `MonexUp.API/Controllers/NetworkController.cs`
- [X] T017 [P] [US1] Unit tests: `InviteByEmail` no-account (no row, valid token, non-manager → forbidden) and `JoinFromInvite` (enrolls WaitForApproval + referrer; second call idempotent) in `MonexUp.UnitTests/Services/NetworkServiceTests.cs`

### Frontend

- [X] T018 [US1] Create `InviteModal` (email input + format validation; call `inviteContext.invite(networkId, email)`; render generated link with copy-to-clipboard mirroring `navigator.clipboard.writeText` + transient `copied` from `StorefrontPage/PixQrView.tsx`; success/error via `MessageToast`) in `monexup-app/src/Pages/Admin/InviteModal/index.tsx` (use `react-modal` skill)
- [X] T019 [US1] Enable and wire the "Convidar" button (remove `disabled`, add `onClick` to open `InviteModal`) in `monexup-app/src/Pages/UserSearchPage/index.tsx`
- [X] T020 [US1] Extend `SellerAddPage`: read `invite` token query param (+ `networkSlug`); after successful `userContext.insert`, call `authContext.loginWithEmail(email, password)` then `inviteContext.join(token)`; show success and redirect — in `monexup-app/src/Pages/SellerAddPage/index.tsx`
- [X] T021 [P] [US1] Add i18n keys (invite modal title/email/generate/copy/copied, new-account link hint, join success/errors) to `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

**Checkpoint**: US1 fully functional — MVP shippable (no-account invite + referrer attribution end-to-end)

---

## Phase 4: User Story 2 - Invite an existing account (accept / decline) (Priority: P2)

**Goal**: Inviting an existing-account email immediately creates a `WaitForApproval` membership (referrer = inviter) and yields an accept/decline link reachable only by the invited account; decline sets the row `Inactive`.

**Independent Test**: Invite an existing-account email; confirm pending row created at invite time; open link as the invited account and Accept (stays pending) / Decline (→ Inactive); a different account cannot act (quickstart Path B + guardrails).

### Backend

- [X] T022 [US2] Extend `NetworkService.InviteByEmail` **existing-account branch**: create `WaitForApproval` membership for the invitee with `ReferrerId = caller.UserId`, idempotent (if active/pending row exists → set `alreadyMember=true`, no duplicate); build token `hasAccount=1, targetUserId=inviteeUserId` in `MonexUp.Domain/Services/NetworkService.cs` (depends on T013)
- [X] T023 [US2] Implement `NetworkService.GetInviteDetail(callerUserId, token)` — verify token; return network name + inviter name, `isForCurrentUser = caller==targetUserId`, `alreadyActiveMember` in `MonexUp.Domain/Services/NetworkService.cs`
- [X] T024 [US2] Implement `NetworkService.AcceptInvite(callerUserId, token)` — verify token + `caller==targetUserId` (else forbidden); ensure `WaitForApproval` row exists (idempotent, no status change) in `MonexUp.Domain/Services/NetworkService.cs`
- [X] T025 [US2] Implement `NetworkService.DeclineInvite(callerUserId, token)` — verify token + `caller==targetUserId` (owner-based check, NOT manager); set the invitee's `WaitForApproval` row to `Inactive` in `MonexUp.Domain/Services/NetworkService.cs`
- [X] T026 [US2] Add `GET /Network/invite/detail`, `POST /Network/invite/accept`, `POST /Network/invite/decline` endpoints (`[Authorize]`) in `MonexUp.API/Controllers/NetworkController.cs`
- [X] T027 [P] [US2] Unit tests: existing-account invite creates row (referrer = caller) + duplicate skip (`alreadyMember`); `DeclineInvite` → `Inactive`; accept/decline by non-target user → forbidden; tampered token → rejected — in `MonexUp.UnitTests/Services/NetworkServiceTests.cs`

### Frontend

- [X] T028 [US2] Create `AcceptInvitePage` (login-gated; read `token`; call `inviteContext.getDetail`; show network + inviter; **Accept**/**Decline** buttons; render "already belongs" and "sign in as invited account" states from `isForCurrentUser`/`alreadyActiveMember`) in `monexup-app/src/Pages/AcceptInvitePage/index.tsx`
- [X] T029 [US2] Add `/invite/accept` route (login-gated, under an authenticated layout) in `monexup-app/src/App.tsx`
- [X] T030 [P] [US2] Add i18n keys (accept page title, invited-by, accept/decline buttons, decline confirmation, already-member, wrong-account) to `monexup-app/public/locales/{pt,en,es,fr}/translation.json`

**Checkpoint**: US1 + US2 both work independently

---

## Phase 5: User Story 3 - Referrer attribution recorded and correct (Priority: P3)

**Goal**: Guarantee referrer = inviter for invited joins and empty for self-service joins, preserved across status changes.

**Independent Test**: Inspect memberships after both invite paths (referrer = inviter) and after a normal self-service `request-access` (referrer empty); confirm referrer survives approve/promote/demote.

- [X] T031 [P] [US3] Unit tests: referrer equals inviter for both invite paths; self-service `RequestAccess` (no referrer) yields empty `ReferrerId` (regression); `ReferrerId` preserved after `ChangeStatus`/`Promote`/`Demote` — in `MonexUp.UnitTests/Services/NetworkServiceTests.cs`
- [X] T032 [US3] Verify `/admin/teams` team-list rows preserve/surface referrer data after approval and that self-service joins show no false attribution; adjust `UserSearchPage` only if a referrer indicator is displayed — in `monexup-app/src/Pages/UserSearchPage/index.tsx`

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T033 [P] Add self-invite guard (manager invites own email → "already belongs"/blocked) and confirm invalid/tampered-token error copy is user-friendly across endpoints (`NetworkService.cs` + i18n)
- [X] T034 [P] Document the invite flow + `Invite:Secret` config in `docs/` (analyst-owned) and note it in `.env.example`
- [ ] T035 Run `quickstart.md` end-to-end: Path A, Path B, guardrails (wrong account, already-member, tampered token), i18n switch (pt/en/es/fr), and self-service regression

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all stories
- **US1 (Phase 3)**: depends on Foundational; MVP
- **US2 (Phase 4)**: depends on Foundational; T022 depends on T013 (extends `InviteByEmail`)
- **US3 (Phase 5)**: depends on US1 (+ US2 for the existing-account assertion)
- **Polish (Phase 6)**: after desired stories complete

### Within stories

- Backend service methods (T013/T014, T022–T025) before their endpoints (T015/T016, T026)
- Frontend module (Phase 2) before UI pages (T018–T020, T028)
- Same-file tasks are sequential: T013 → T022 → T023 → T024 → T025 (all in `NetworkService.cs`); T015/T016 → T026 (all in `NetworkController.cs`); T018/T019/T020/T032 touch distinct frontend files

### Parallel Opportunities

- Foundational [P]: T002, T003, T005, T006, T007 (backend) and T008, T009, T010, T011 (frontend) can run together; T004/T012 after their deps
- US1 [P]: T017 (tests) and T021 (i18n) parallel to each other; T018 modal parallel with backend once module exists
- US2 [P]: T027 (tests) and T030 (i18n) parallel
- i18n tasks (T021, T030) are the four-language edits — independent files per language

---

## Parallel Example: Foundational

```bash
# Backend signer + DTOs + contract + signer tests together:
Task: "IInviteTokenSigner interface (T002)"
Task: "InviteTokenSigner impl (T003)"
Task: "Invite DTOs (T005)"
Task: "INetworkService signatures (T006)"
Task: "InviteTokenSigner unit tests (T007)"

# Frontend module in parallel:
Task: "Invite DTO types (T008)"
Task: "InviteService (T009)"
Task: "InviteBusiness + Factory (T010)"
Task: "InviteContext + Provider (T011)"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & VALIDATE** (quickstart Path A) → demo. Inviting a no-account email and enrolling with referrer is a complete, shippable slice.

### Incremental Delivery

1. Foundation ready → 2. US1 (MVP: no-account invite) → 3. US2 (existing-account accept/decline) → 4. US3 (attribution guarantees) → 5. Polish. Each story adds value without breaking the previous.

---

## Notes

- No DB migration — reuse `user_networks.referrer_id` (data-model.md).
- Referrer is always server-authoritative (from session/signed token), never client-supplied plaintext.
- Never write empty `catch` blocks — the NAuth `GetByEmailAsync` not-found path must catch the specific exception and log via `ILogger`.
- All new user-facing strings go through i18n (pt/en/es/fr).
- Commit after each task or logical group; validate stories at checkpoints.

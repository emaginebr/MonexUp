# Phase 0 Research: Referrer Invite Flow

All spec clarifications were resolved in `/speckit.clarify`. This document records the technical decisions from a codebase investigation (backend + NAuth reference) that unblock design.

## R1. Existing-account detection & getting the invitee's userId

- **Decision**: Detect account existence and resolve the invitee's `userId` **server-side** via NAuth `IUserClient.GetByEmailAsync(email)`, called from `NetworkService` (already injected there).
- **Rationale**: NAuth owns user identity (Constitution III). `IUserClient` is already used in `NetworkController`/`NetworkService`; `GetBySlugAsync` is an existing precedent for non-session lookups. Doing it server-side keeps the invitee's userId trustworthy (not client-supplied).
- **Caveat**: `GetByEmailAsync` calls `EnsureSuccessStatusCode()` and **throws** on 404. "No account" MUST be implemented as a `try/catch` treating a not-found/non-2xx as "no account" (catch the specific exception and log via `ILogger`, never an empty catch).
- **Alternatives considered**: Frontend `nauth.getUserByEmail` (the existing `UserProvider.getUserByEmail` is broken/stale) — rejected: would expose account-existence probing to the client and duplicate NAuth calls.

## R2. Enrolling an invited user (referrer attribution)

- **Decision**: The existing `NetworkService.RequestAccess(networkId, userId, referrerId)` already creates a `WaitForApproval` row and sets `ReferrerId`, but only for the **caller** (`userId = session.UserId`). Add new service methods that target a specific invitee/referrer:
  - `InviteByEmail(networkId, email, inviterUserId)` → resolves invitee via R1; if account exists, creates the `WaitForApproval` membership for the invitee with `ReferrerId = inviterUserId` (idempotent — skip if an active/pending row already exists); returns `hasAccount` + a signed token.
  - `JoinFromInvite(networkId, joinerUserId, inviterUserId)` → enrolls the caller (new account, after login) as `WaitForApproval` with `ReferrerId = inviterUserId` (idempotent). Reuses the `RequestAccess` insert logic (lowest profile, Seller role).
  - `DeclineInvite(networkId, invitedUserId)` → sets that user's `WaitForApproval` row to `Inactive`.
- **Rationale**: Reuses proven insert/profile-selection logic; keeps referrer server-authoritative. Matches spec FR-006/007/008/012.
- **Authorization**:
  - `InviteByEmail` — caller MUST be NetworkManager/Administrator of the network (mirror existing `ValidateAccess` used by `ChangeStatus`).
  - `DeclineInvite` / accept — caller MUST be the invited user themselves (`session.UserId == invitedUserId`), NOT a manager. Existing `ValidateAccess` authorizes managers/admins only, so decline needs a **new owner-based check** (FR-015).
- **Alternatives considered**: Extending `RequestAccess` to accept an arbitrary `userId` — rejected: it would let any caller enroll arbitrary users; safer to add explicit, separately-authorized methods.

## R3. Stateless signed invite link

- **Decision**: Encode the link as a signed token `base64url(payload) + "." + base64url(HMAC-SHA256(secret, payload))`, where `payload = "{networkId}|{inviterUserId}|{targetUserId}|{hasAccount}"`. Verify with `CryptographicOperations.FixedTimeEquals`. Introduce a small shared `IInviteTokenSigner` (Domain) — sign + verify — with the secret read from `IConfiguration` (`Invite:Secret`). No expiry field (spec: links do not expire).
- **Rationale**: MonexUp already uses exactly this HMAC-SHA256 + `FixedTimeEquals` pattern privately in `BillingService.ComputeHmac`. Lifting it into a reusable signer satisfies FR-004 (tamper-resistant, stateless) with zero new storage and no new dependency. `targetUserId` (invitee's id, or `0` for no-account) lets the accept/decline endpoints bind the action to the invited account (FR-015).
- **Rationale (no persistence)**: Spec chose stateless/reusable links; the existing-account `WaitForApproval` row itself is the durable state, and idempotent enrollment makes reuse safe.
- **Alternatives considered**: Persisted single-use/expiring invite table — explicitly deferred (spec Out of Scope). Plain unsigned query params — rejected: referrer/network could be tampered to farm attribution.

## R4. No-account path: session after signup

- **Decision**: `SellerAddPage` (`/new-seller`) will (a) read an `invite` token (query param) + `networkSlug`, (b) after a successful `userContext.insert`, perform `authContext.loginWithEmail(email, password)` (both already available on the page), then (c) call the invite `join` endpoint with the token as the now-authenticated new user.
- **Rationale**: NAuth `createUser` does NOT authenticate the new user (sets no token); an explicit login is required before any authenticated join call. Password is in-memory on the page at submit time, so an immediate login is feasible. Enrolling via the signed token keeps `referrer` tamper-proof.
- **Alternatives considered**: Server-side enrollment during signup (NAuth insert is external, MonexUp can't hook it) — rejected. Passing `referrerId` to the plain `RequestAccess` body — rejected: client-supplied referrer is not trustworthy; use the signed token instead.

## R5. Accept/decline for existing accounts

- **Decision**: New page `AcceptInvitePage` at a route requiring login. It reads the token, calls a `GET invite detail` endpoint (network name + inviter name + membership state) and offers **Accept** (confirm; membership stays `WaitForApproval` pending manager approval — effectively a no-op state change) and **Decline** (`DeclineInvite` → `Inactive`). Backend verifies `session.UserId == token.targetUserId` for both actions.
- **Rationale**: The pending row is pre-created at invite time (FR-007/012); accept only confirms intent, decline deactivates. Binding to `targetUserId` enforces FR-015. Already-active members get an "already belong" message (FR-009, edge case).
- **Alternatives considered**: Creating the row on accept instead of invite time — rejected: contradicts the clarified decision (create at invite time).

## R6. Frontend module wiring & copy-link UI

- **Decision**: Add an `Invite` module (`Services/Impl/InviteService.tsx` → `Business/Impl/InviteBusiness.tsx` + Factory → `Contexts/Invite/InviteProvider.tsx`), register the service in `ServiceFactory.tsx` (using `httpClientAuth` → MonexUp API) and the provider in the `ContextBuilder` array in `App.tsx` (inside/earlier than `AuthProvider`/`NetworkProvider` so it can consume them). The invite modal's copy-to-clipboard reuses the `navigator.clipboard.writeText` + transient `copied` idiom from `StorefrontPage/PixQrView.tsx`. Modal built with the `react-modal` skill; feedback via `MessageToast`.
- **Rationale**: Matches Constitution II/VII and existing module structure (Network module as reference). Only one clipboard precedent exists; mirror it.
- **Alternatives considered**: Building the invite call directly in `UserSearchPage` — rejected: violates the layered frontend convention.

## Resolved unknowns

All `NEEDS CLARIFICATION` from Technical Context are resolved: user lookup (R1), enrollment/authorization (R2/R5), link signing + secret (R3), post-signup session (R4), module wiring (R6). No open unknowns remain.

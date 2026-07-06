# Implementation Plan: Referrer Invite Flow for Network Teams

**Branch**: `009-referrer-invite` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-referrer-invite/spec.md`

## Summary

Enable a network manager to invite people into a network from `/admin/teams` and record the manager as the new member's **referrer** (`user_networks.referrer_id`). The manager enters an email; the system detects whether that email already has an account and returns a **stateless signed** invite link:

- **No account** → link to the seller sign-up page (`/new-seller`); after the invitee creates their account and logs in, they are enrolled into the network as `WaitForApproval` with `referrer = inviter`.
- **Existing account** → a `WaitForApproval` membership is created immediately (referrer = inviter) and the link points to an **accept/decline** page reachable only by the invited account; decline sets that membership to `Inactive`.

The invited membership still flows through the existing manager approval step (`WaitForApproval → Active`). Reuses the existing `RequestAccess`/`ChangeStatus` domain logic and the `referrer_id` column (already plumbed end-to-end, no migration). Invite delivery is a copyable link only (no email in v1).

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend); React 18 + TypeScript (CRA) frontend
**Primary Dependencies**: ASP.NET Core Web API, EF Core 9.x (Npgsql), NAuth (`IUserClient` / `nauth-react`), i18next; `System.Security.Cryptography` (HMAC-SHA256) for link signing
**Storage**: PostgreSQL — existing `monexup_user_networks` table; **no new table, no migration** (reuse `referrer_id` column)
**Testing**: xUnit (`MonexUp.UnitTests`) for the new service logic + token signer; manual/quickstart for the UI flows
**Target Platform**: Web (MonexUp API + monexup-app SPA)
**Project Type**: Web application (backend + frontend monorepo)
**Performance Goals**: Invite generation returns in well under 2s (single NAuth lookup + optional single insert); no batch/scale concerns
**Constraints**: Invite link MUST be stateless + signed (tamper-resistant), no expiry, reusable (per spec FR-004); signing secret via `IConfiguration`; only the invited account may accept/decline (FR-015)
**Scale/Scope**: Low volume (manual invites); 1 new backend endpoint group + 1 signer helper; 1 new frontend module (Service/Business/Provider), 1 invite modal, 1 accept/decline page, edits to `/new-seller`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arquitetura em Camadas (DDD) | PASS | New logic lives in `NetworkService` (Domain) + a new `IInviteTokenSigner` domain helper; controller in API; no repo access from models. |
| II. Frontend em Camadas (React) | PASS | New `Invite` module follows Service → Business (+Factory) → Provider → Pages. Modal uses `react-modal` skill; feedback uses `MessageToast`/`react-alert`. |
| III. Delegação a Projetos Externos (NON-NEGOTIABLE) | PASS | User existence check + account creation delegated to **NAuth** (`IUserClient.GetByEmailAsync`, `nauth.createUser`). No auth/user CRUD reimplemented here. Email delivery (zTools) explicitly out of scope for v1. |
| IV. Configuração e Secrets | PASS | HMAC signing secret read via `IConfiguration` (`Invite:Secret`); no `Environment.GetEnvironmentVariable()`. |
| V. Internacionalização | PASS | All new UI strings added to `pt/en/es/fr` translation.json; no hardcoded text. |
| VI. Banco de Dados e Migrations | PASS | No new entity/DbSet; reuses existing `UserNetwork.ReferrerId`. No migration required. |
| VII. Registro de Dependências | PASS | New signer + any factory registered in `Initializer.cs` (Scoped). Frontend service registered in `ServiceFactory.tsx`; provider added to `ContextBuilder` in `App.tsx`. |

**Result**: PASS — no violations, Complexity Tracking not required.

*Post-Phase-1 re-check*: PASS (design introduces no new projects, no new persistence, no external-domain encroachment).

## Project Structure

### Documentation (this feature)

```text
specs/009-referrer-invite/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── invite-api.md    # Phase 1 output — REST contract for invite endpoints
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
MonexUp.API/
└── Controllers/NetworkController.cs        # + invite / invite/accept / invite/decline / invite/join endpoints

MonexUp.Domain/
├── Services/NetworkService.cs              # + InviteByEmail / EnrollInvited / DeclineInvite logic
├── Services/Interfaces/INetworkService.cs  # + new signatures
└── Services/InviteTokenSigner.cs (+ Interfaces/IInviteTokenSigner.cs)  # HMAC-SHA256 sign/verify (new shared helper)

MonexUp.DTO/
└── Network/                                # + InviteRequestInfo, InviteResultInfo, InviteActionInfo, InviteDetailInfo

MonexUp.Application/
└── Initializer.cs                          # register IInviteTokenSigner

MonexUp.UnitTests/
└── Services/NetworkServiceTests.cs (+ InviteTokenSignerTests.cs)

monexup-app/src/
├── DTO/Domain/Invite*.tsx                  # invite request/result/detail types
├── Services/{Interfaces,Impl}/InviteService.tsx
├── Business/{Interfaces,Impl,Factory}/InviteBusiness.tsx
├── Contexts/Invite/{InviteContext,InviteProvider}.tsx
├── Services/ServiceFactory.tsx             # register InviteService
├── App.tsx                                 # add InviteProvider + accept-invite route
├── Pages/Admin/InviteModal/                # invite dialog (email → signed link + copy)
├── Pages/AcceptInvitePage/index.tsx        # accept/decline page (invited account only)
├── Pages/UserSearchPage/index.tsx          # wire the "Convidar" button
├── Pages/SellerAddPage/index.tsx           # read invite token; post-signup login + join
└── public/locales/{pt,en,es,fr}/translation.json  # new keys
```

**Structure Decision**: Existing MonexUp monorepo (backend layered DDD + `monexup-app` React SPA). The feature adds one backend endpoint group + one signer helper and one frontend `Invite` module, plus targeted edits to `UserSearchPage`, `SellerAddPage`, routing, and i18n. No structural change.

## Complexity Tracking

> No constitution violations — section intentionally empty.

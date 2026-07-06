# Feature Specification: Referrer Invite Flow for Network Teams

**Feature Branch**: `009-referrer-invite`
**Created**: 2026-07-03
**Status**: Draft
**Input**: User description: "Precisamos implemente o Referrer: campo referrer_id em user_networks; botão Convidar em /admin/teams; usuário coloca email e gera link de referrer para /new-seller; se convidado já tem conta, link para página de aceite; ao incluir convidado com conta cria UserNetwork com WaitForApproval; ao aceitar/criar conta o referrer_id fica vinculado a quem convidou; regras podem já existir no backend."

## Clarifications

### Session 2026-07-03

- Q: Invite delivery method → A: Display copyable link only in the dialog; no automatic email in v1.
- Q: For an existing-account invitee, when is the pending membership created → A: At invite time (immediately); appears in the team list before the invitee responds.
- Q: Invite link mechanism/security for v1 → A: Stateless signed (tamper-resistant) link encoding network + inviter; no persisted invite record, no expiry, reusable.
- Q: On decline (existing-account invitee), what happens to the pre-created pending membership → A: Set its status to Inactive (reuse existing status-change), keep history; no hard delete.
- Q: Who may accept/decline an existing-account invite → A: Only the invited account (owner of the invited email); a different logged-in account cannot confirm/decline and is prompted to sign in as the invited account.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invite a new person (no account yet) (Priority: P1)

A network manager opens the team page, clicks **Convidar**, types the invitee's email, and gets a shareable invite link. The link points the invitee to the seller sign-up page. When the invitee finishes creating their account through that link, they are automatically registered as a pending member of the manager's network, and the manager who invited them is recorded as their referrer.

**Why this priority**: This is the core growth loop — bringing brand-new people into a network with correct referrer attribution. It delivers standalone value even if the "existing account" path is not built yet.

**Independent Test**: From `/admin/teams`, invite an email that has no account, open the generated link in a clean session, complete sign-up, then confirm the new user appears in the team list as "waiting for approval" and their referrer is the inviting manager.

**Acceptance Scenarios**:

1. **Given** a network manager on `/admin/teams`, **When** they click "Convidar", enter an email with no existing account, and confirm, **Then** the system produces an invite link that targets the seller sign-up page and carries the inviter and network context.
2. **Given** an invitee opening a new-person invite link, **When** they complete account creation, **Then** a network membership is created for them with status "waiting for approval" and the referrer set to the inviting user.
3. **Given** a newly signed-up invitee, **When** the manager views the team list, **Then** the invitee is listed as a pending member awaiting approval.
4. **Given** the pending invitee, **When** the manager approves them (existing approval action), **Then** their membership becomes active while the referrer attribution is preserved.

---

### User Story 2 - Invite an existing account holder (accept / decline) (Priority: P2)

A network manager invites an email that already belongs to a registered user. At invite time the invitee is immediately recorded as a pending member of the network with the inviting manager as referrer (so they already show in the team list as "waiting for approval"). The generated link points to a dedicated page where the invitee can **accept** (confirm and keep the pending membership) or **decline** (which sets the pending membership to Inactive so they do not join). Only the invited account may respond.

**Why this priority**: Extends the invite loop to people already on the platform. Valuable, but the new-person path (P1) is the primary acquisition channel and can ship first.

**Independent Test**: Invite an email that already has an account, open the generated link while logged in as that account, choose "accept", and confirm a pending membership with correct referrer is created; repeat choosing "decline" and confirm no active/pending membership results.

**Acceptance Scenarios**:

1. **Given** a manager entering an email that already has an account, **When** they confirm the invite, **Then** the system produces an invite link that targets the accept/decline page (not the sign-up page) AND immediately creates a "waiting for approval" membership for that user with referrer = inviting user.
2. **Given** an invited existing user on the accept/decline page, **When** they choose "accept", **Then** their "waiting for approval" membership (referrer = inviting user) is confirmed and remains pending for manager approval.
3. **Given** an invited existing user on the accept/decline page, **When** they choose "decline", **Then** the pending membership created at invite time is set to Inactive so they are not a member of that network.
4. **Given** an existing user who is already an active member of the network, **When** they open the invite link, **Then** the page communicates they already belong to the network and no duplicate membership is created.
5. **Given** an existing-account invite link, **When** it is opened by someone signed in as a different account (or signed out), **Then** they cannot accept or decline and are prompted to sign in as the invited account.

---

### User Story 3 - Referrer attribution is recorded and correct (Priority: P3)

Whenever an invitee joins a network through an invite (either path), the referrer of their membership is the user who sent the invite. This attribution is stored on the membership record and is available for downstream use (team hierarchy, commissions).

**Why this priority**: The attribution itself is the underlying business reason for the feature, but it is only observable through the flows in US1/US2; it is called out separately to guarantee correctness is tested explicitly.

**Independent Test**: After completing either invite path, inspect the resulting membership and confirm the referrer equals the inviting user's identity.

**Acceptance Scenarios**:

1. **Given** any invite completed through US1 or US2, **When** the membership is created, **Then** its referrer field equals the inviting user.
2. **Given** a user who joins a network on their own without an invite, **When** their membership is created, **Then** the referrer field is empty (no false attribution).

---

### Edge Cases

- **Already a member (active)**: The invite link for someone who is already an active member must not create a duplicate or overwrite their existing membership; it should inform them they already belong.
- **Already pending**: If an invited person already has a "waiting for approval" membership in that network, re-inviting must not create a duplicate row and should surface a clear state.
- **Email vs. account mismatch at accept time**: An existing-account invite link is opened by someone logged in with a different account than the invited email — the other account cannot respond; the system requires signing in as the invited account (only the invited account may accept/decline).
- **Invite link reused / shared**: The same link opened by multiple people, or opened after the invitee already joined, must not create duplicate or conflicting memberships.
- **Self-invite**: A manager invites their own email — should be prevented or produce a clear "you already belong" outcome.
- **Invalid / malformed email** entered in the invite form is rejected before a link is generated.
- **Referrer no longer valid**: The inviting user later leaves the network — the stored referrer attribution on already-created memberships is retained.
- **Decline after a pending row already exists**: the pending row (created at invite time) is set to Inactive on decline; a later re-invite may reactivate it back to waiting-for-approval.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Convidar" action on the team page (`/admin/teams`) MUST be enabled for users authorized to manage the network (network manager / administrator) and MUST open an invite dialog.
- **FR-002**: The invite dialog MUST accept an email address and validate it is well-formed before allowing the invite to proceed.
- **FR-003**: The system MUST determine whether the entered email already corresponds to a registered account and choose the invite link destination accordingly: the sign-up page (`/new-seller`) for a new person, or an accept/decline page for an existing account.
- **FR-004**: The invite link MUST carry enough context to attribute the resulting membership to (a) the target network and (b) the inviting user as referrer. The link MUST be a stateless, signed (tamper-resistant) URL — no server-side invite record is stored, it does not expire, and it MAY be opened more than once. Tampering with the encoded network/inviter MUST invalidate the link.
- **FR-005**: After generating an invite, the system MUST display the invite link in the dialog with a copy affordance so the manager can copy and share it manually. The system does NOT send the invite by email in this version.
- **FR-006**: When an invitee without an account completes account creation through a new-person invite link, the system MUST create a network membership for them with status "waiting for approval" and set the referrer to the inviting user.
- **FR-007**: When a manager invites an email that already has an account, the system MUST create the invitee's network membership with status "waiting for approval" and referrer = inviting user at invite time (immediately), so the invitee appears as a pending member in the team list before responding. Accepting on the accept/decline page confirms the invitee's intent and keeps the membership pending for manager approval.
- **FR-008**: When an invited existing account declines on the accept/decline page, the system MUST set the pending membership created at invite time to Inactive status (reusing the existing status-change mechanism), preserving history rather than hard-deleting the record, so the invitee is not left as an active or pending member of the network.
- **FR-009**: The system MUST prevent duplicate memberships: an invite that resolves to a user who already has a membership (active or pending) in the target network MUST NOT create a second membership record, and MUST surface the existing state to the invitee.
- **FR-010**: The referrer recorded on a membership MUST be the inviting user for invited joins, and MUST remain empty for self-service joins that carry no referrer.
- **FR-011**: A membership created through an invite MUST still pass through the existing manager approval step (waiting-for-approval → active) before the member is active; acceptance by the invitee alone MUST NOT bypass manager approval.
- **FR-012**: For an invited existing account, the pending ("waiting for approval") membership MUST be created at invite time (not deferred to acceptance); the accept/decline page then either confirms (keep pending) or declines (set Inactive per FR-008). New-person invites (US1) still create the membership only after account creation, since no user exists to attach it to before then.
- **FR-013**: The accept/decline page MUST be reachable by an existing user and MUST clearly present the network they are being invited to and who invited them.
- **FR-014**: Referrer attribution MUST be preserved when a pending member is later approved, demoted, promoted, or has their status changed.
- **FR-015**: Only the invited account (the owner of the invited email) MAY accept or decline an existing-account invite. If the accept/decline link is opened while authenticated as a different account (or while signed out), the system MUST require signing in as the invited account and MUST NOT let any other account confirm or decline the pending membership.

### Key Entities *(include if feature involves data)*

- **Network Membership**: The association between a user and a network. Carries a status (active, waiting-for-approval, inactive, blocked), a role, a profile level, and a **referrer** reference to the user who brought this member in. The referrer is the central attribute exercised by this feature.
- **Invite**: The intent to bring a specific email into a specific network, initiated by an inviting user. Resolves to one of two link destinations depending on whether the email already has an account. Represented purely as a stateless signed link (network + inviter encoded); no stored invite record exists in v1.
- **User Account**: The platform identity created via sign-up. New-person invites result in account creation before membership.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A network manager can send an invite (enter email → obtain link) in under 30 seconds without leaving the team page.
- **SC-002**: 100% of memberships created through an invite link have a non-empty referrer equal to the inviting user.
- **SC-003**: 0% of invite completions produce duplicate memberships for a user already in the network.
- **SC-004**: A new-person invitee can go from opening the link to appearing as a pending member in the team list within a single uninterrupted sign-up session.
- **SC-005**: An invited existing user can accept or decline in one action from the invite link, with the outcome (pending membership or no membership) reflected immediately.
- **SC-006**: Self-service joins (no invite) continue to result in memberships with an empty referrer (no regression / no false attribution).

## Assumptions

- The existing `user_networks.referrer_id` field is reused to store the inviting user's identity; no new referrer storage is introduced. (Verified: the field exists end-to-end with no foreign-key constraint and holds a user identifier by convention.)
- The existing "request access" behavior that creates a waiting-for-approval membership and accepts an optional referrer is reused as the join mechanism; the feature primarily adds invite-link generation, referrer capture/forwarding on the frontend, and the accept/decline page.
- The existing manager approval flow (waiting-for-approval → active) on `/admin/teams` is reused unchanged; invitees are not auto-activated.
- The seller sign-up page (`/new-seller`) is the landing page for new-person invites and will be extended to capture and forward the referrer/network context, then trigger pending-membership creation after account creation.
- Invite links are stateless and signed (tamper-resistant), encoding the network and inviting-user context; no persisted invite record is created in v1, links do not expire, and they may be opened more than once.
- "Referrer" is a per-network, per-membership attribute (the same user can have different referrers across different networks).
- Manager/administrator authorization for inviting mirrors the existing authorization used for approving members on the team page.

## Out of Scope

- Multi-level / recursive referrer chains and commission calculation logic (only the direct referrer attribution on the membership is in scope).
- Bulk invites (CSV / multiple emails at once).
- Invite analytics dashboards.
- Automatic email delivery of invite links (v1 shows a copyable link only).
- Single-use, expiring, or revocable invite links / persisted invite records.
- Enforcing a database foreign-key constraint on `referrer_id`.

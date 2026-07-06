# Quickstart: Referrer Invite Flow

Manual verification of the two invite paths after implementation. Assumes API + `monexup-app` running, and a network where you are a NetworkManager.

## Prerequisites

- Backend config `Invite:Secret` set (any strong secret) in `appsettings.Development.json`.
- Logged in as a NetworkManager/Administrator of a test network.

## Path A — Invite a new person (no account)

1. Go to `/admin/teams`. Click **Convidar** (now enabled).
2. Enter an email with **no** MonexUp account. Confirm.
3. Modal shows a **new-account** invite link (`/{networkSlug}/new-seller?invite=...`) with a **Copy** button. Copy it.
4. Open the link in a clean/incognito session. Complete the seller sign-up form and submit.
5. Expected: after account creation you are logged in and enrolled; returning to `/admin/teams` as the manager shows the new user as **waiting for approval** with the manager as referrer.
6. Approve them (existing approve action) → status becomes **Active**, referrer preserved.

**Pass criteria**: pending member appears; `user_networks.referrer_id` = inviting manager's userId; approval works; referrer unchanged after approval.

## Path B — Invite an existing account (accept/decline)

1. `/admin/teams` → **Convidar** → enter an email that **already** has an account. Confirm.
2. Expected: modal shows an **accept/decline** invite link (`/invite/accept?token=...`); the invitee immediately appears in the team list as **waiting for approval** (referrer = manager).
3. Open the link **logged in as the invited account**. The page shows the network name + who invited you, with **Accept** / **Decline**.
4. **Accept** → membership stays pending; manager can then approve.
5. Re-run and **Decline** → membership becomes **Inactive**; the user is not a member.

**Pass criteria**: pending row created at invite time; accept keeps pending; decline sets Inactive; referrer = inviting manager.

### Path B guardrails

- Open the accept link while **logged in as a different account** → page refuses the action and prompts to sign in as the invited account (FR-015).
- Invite an email that is **already an active member** → modal reports "already belongs"; no duplicate row.
- Manually alter any character of the token → consuming endpoints return an invalid-link error.

## i18n check

- Switch language (pt/en/es/fr): invite modal, copy button, accept/decline page, and all messages are translated (no raw keys, no hardcoded text).

## Regression check

- A user who joins via the normal self-service `request-access` flow (no invite) still results in a membership with **empty** `referrer_id` (no false attribution).

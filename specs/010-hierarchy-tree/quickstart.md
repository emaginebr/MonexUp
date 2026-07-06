# Quickstart: Hierarchy Tree

Manual verification after implementation. Assumes API + `monexup-app` running, PostgreSQL + NAuth reachable, and a network with referrer relationships (feature 009 populates `ReferrerId`).

## Prerequisites

- Log in as a member of a test network that has both a referrer chain above them and referred members below (ideally ≥3 deep each way). Use invites (feature 009) to seed the tree if needed.

## Steps

1. Open the admin area and click **Hierarquia** in the sidebar (under "Minha Rede").
2. The page **Árvore Hierárquica** opens and renders a top-to-bottom flowchart:
   - Up to 3 referrer levels above, the current user highlighted in the center, up to 3 referred levels below.
   - Each node shows **Name, Profile, Role, Status**.
3. Confirm the current user is visually distinguished (center/highlight).
4. Expand a collapsed node that has many children → its children (within the depth bound) appear; collapse hides them again.

**Pass criteria**: correct depth (≤3 up, ≤3 down), current user centered, all four fields on every node, collapse/expand works.

## Edge checks

- **No referrer**: log in as a member who was not referred → no ancestors shown, current user at top, no error.
- **No referred**: member who invited no one → empty descendant area, no error.
- **Non-Active members**: a WaitForApproval / Inactive / Blocked descendant still appears, with its Status shown.
- **Active network switch**: switch the active network → the tree reflects the newly selected network's relationships.
- **Not a member**: hitting the hierarchy of a network you don't belong to returns no tree (no data leak).

## i18n check

- Switch language (pt/en/es/fr): menu label "Hierarquia" (and equivalents), page title, node field labels, and empty-state text are all translated (no raw keys, no hardcoded strings).

## Performance check

- For a fully populated 3-up/3-down tree, the page shows the hierarchy within a few seconds (SC-005).

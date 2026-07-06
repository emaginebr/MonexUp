# Feature Specification: Hierarchy Tree ("Árvore Hierárquica")

**Feature Branch**: `010-hierarchy-tree`
**Created**: 2026-07-06
**Status**: Draft
**Input**: User description: "Crie uma página chamada 'Árvore Hierárquica' (menu: 'Hierarquia'): fluxograma da árvore onde quem convidou o usuário logado está acima e os convidados por ele abaixo; 3 níveis acima e 3 abaixo; usar UserNetworks.ReferrerId; exibir Nome, Profile, Role e Status."

## Clarifications

### Session 2026-07-06

- Q: How to render wide descendant levels (a member who referred many people)? → A: Show all within the 3 levels, but nodes with many children render collapsed with an expand/collapse control (keeps it usable and fast on wide networks).
- Q: Which member statuses appear as nodes in the tree? → A: All statuses (Active, WaitForApproval, Inactive, Blocked); Status is a displayed field and visually differentiates nodes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View my referrer chain and referred members (Priority: P1)

A logged-in member of a network opens the **Hierarquia** page and sees a flowchart-style tree centered on themselves: the person who invited them (their referrer) and up to two more referrers above that (3 levels up), and the members they invited plus the members those people invited (3 levels down). Each node shows the person's Name, Profile, Role, and Status.

**Why this priority**: This is the entire feature — a single page that visualizes the referrer relationships for the current user in the current network. It delivers standalone value.

**Independent Test**: Log in as a member who has both a referrer chain and referred members in the active network, open the Hierarquia page, and confirm the tree renders the current user in the center, up to 3 ancestor levels above, up to 3 descendant levels below, each node labeled with Name/Profile/Role/Status.

**Acceptance Scenarios**:

1. **Given** a member with a referrer chain at least 3 deep and referred members at least 3 deep, **When** they open the Hierarquia page, **Then** the tree shows exactly 3 levels of ancestors above the current user and 3 levels of descendants below, with the current user highlighted in the center.
2. **Given** any node in the tree, **When** it is rendered, **Then** it displays the member's Name, Profile, Role, and Status.
3. **Given** a member whose referrer chain is shorter than 3 levels (e.g., they were not referred by anyone), **When** they open the page, **Then** the tree shows only the available ancestors (or none) without error, and the current user is still shown.
4. **Given** a member who has referred no one, **When** they open the page, **Then** the descendant area shows an empty/leaf state without error.
5. **Given** the navigation menu, **When** the user looks for the feature, **Then** it appears labeled **"Hierarquia"** and opens the Hierarquia page.

---

### Edge Cases

- **No referrer (root)**: The current user has an empty referrer — no ancestors are shown; the current user is the top of the visible tree.
- **No referred members (leaf)**: The current user invited no one — the descendant area is empty.
- **Wide descendant level**: A member referred many people — all direct referred members within the 3-level depth are available, but such a node renders collapsed by default with an expand/collapse control (horizontal scrolling/panning is also acceptable when expanded).
- **Referrer points to someone not in this network / missing**: A stored referrer id that does not resolve to a visible member in the active network is treated as the end of the chain (no ancestor shown beyond it) rather than an error.
- **Deeper than 3 levels**: Ancestors beyond level 3 and descendants beyond level 3 are not shown (the tree is bounded).
- **Cycle safety**: If referrer references ever form a loop, traversal stops at the depth limit and does not hang or duplicate infinitely.
- **Name unavailable**: If a member's display name cannot be resolved, the node still renders with the available identifying information and the other fields (Profile, Role, Status).
- **Status not Active**: Nodes are shown regardless of status (Active, WaitForApproval, Inactive, Blocked); Status is one of the displayed fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a page titled "Árvore Hierárquica", reachable from the navigation menu via the label **"Hierarquia"**.
- **FR-002**: The page MUST render a flowchart/tree visualization centered on the currently logged-in member for the active network.
- **FR-003**: Upward, the tree MUST show the current user's referrer and continue up the referrer chain for up to **3 levels** (grandparent-of-referrer at most).
- **FR-004**: Downward, the tree MUST show the members the current user referred and continue down for up to **3 levels** (members referred by members referred by the current user), branching where a member referred more than one person.
- **FR-004a**: A node with many children MUST render collapsed by default with an expand/collapse control, so that wide descendant levels stay usable and performant; expanding reveals that node's children (within the 3-level bound).
- **FR-006a**: The tree MUST include members of ALL statuses (Active, WaitForApproval, Inactive, Blocked) as nodes; Status is shown on each node and visually differentiates them (no status is filtered out of the tree).
- **FR-005**: Referrer relationships MUST be derived from the `UserNetworks.ReferrerId` field, scoped to the active network.
- **FR-006**: Each node MUST display the member's **Name**, **Profile**, **Role**, and **Status**.
- **FR-007**: The current user's node MUST be visually distinguished (highlighted/centered) from ancestors and descendants.
- **FR-008**: The page MUST handle empty branches gracefully — no referrer (no ancestors) and/or no referred members (no descendants) render without error.
- **FR-009**: Traversal MUST be bounded to at most 3 levels up and 3 levels down and MUST be safe against missing/looping referrer references (no infinite traversal, no duplicate infinite expansion).
- **FR-010**: The page MUST only expose the hierarchy for the logged-in user within a network they belong to (a member sees their own position; no arbitrary other-user hierarchy is exposed).
- **FR-011**: If the logged-in user belongs to more than one network, the hierarchy MUST be shown for the currently active/selected network (consistent with other admin pages).

### Key Entities *(include if feature involves data)*

- **Member (UserNetwork)**: A user's membership in a network. Carries the **Referrer** reference (`ReferrerId` → the user who invited them, per network), plus **Profile**, **Role**, and **Status**. The tree is built from these membership records within one network.
- **Tree Node**: A view concept representing one member positioned relative to the current user (ancestor level 1–3, self, or descendant level 1–3), showing Name, Profile, Role, Status.
- **User identity**: The display **Name** of each member, resolved from the platform's user identity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member can open the Hierarquia page and see their position in the referrer tree in a single view, with the current user clearly identifiable, on first load.
- **SC-002**: The tree never shows more than 3 ancestor levels or 3 descendant levels relative to the current user.
- **SC-003**: 100% of rendered nodes display all four fields (Name, Profile, Role, Status).
- **SC-004**: Members with no referrer and/or no referred members can open the page with no error and see a coherent (possibly single-node or partial) tree.
- **SC-005**: The page loads its hierarchy view within a typical page-load expectation (a few seconds) for a member with a fully populated 3-up/3-down tree.

## Assumptions

- The hierarchy is **per-network**: `ReferrerId` is a per-membership attribute, so the tree is built within the currently active/selected network (the same network context used by other admin pages).
- "3 levels up" means the referrer chain (each member has at most one referrer), and "3 levels down" means the branching set of members referred (directly and transitively) within 3 hops.
- Display **Name** is resolved from the existing user-identity source; Profile/Role/Status come from the membership record.
- The page is read-only (visualization only) — no editing of referrer relationships from this page.
- Access is limited to authenticated members viewing their own position; this is not an admin tool to browse arbitrary users' trees.
- The visualization is a top-to-bottom flowchart (ancestors above, current user in the middle, descendants below); horizontal scroll/pan is acceptable when a level is wide.
- A backend capability to return the bounded (3-up/3-down) hierarchy for the current user in a network may be added if the existing membership data cannot be assembled efficiently on the client.

## Out of Scope

- Editing, reassigning, or removing referrer relationships from this page.
- Browsing the hierarchy of an arbitrary other user (admin drill-down).
- Levels beyond 3 up / 3 down, or configurable depth.
- Commission calculations or any financial roll-up over the tree.
- Cross-network / global hierarchy spanning multiple networks at once.

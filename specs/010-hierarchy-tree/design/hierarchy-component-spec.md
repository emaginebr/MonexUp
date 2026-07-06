# Árvore Hierárquica — Component Spec

Scope: design/component contract only. **No `.tsx` here** — the frontend engineer
(`frontend-react-developer`) implements. Types, chip helpers, and page chrome should be
reused from the existing `UserSearchPage` / `UserSearchRow` where noted.

Route: `/admin/hierarchy` (or `/admin/tree`), rendered inside `LayoutAdmin` (no page
chrome from this component — the layout owns sidebar/header, like `UserSearchPage`).

---

## 0. Data model (design-facing shape)

The page needs a single member graph rooted at the logged-in user. Suggested DTO the
engineer maps the API onto (names are illustrative; align with backend `UserNetwork`):

```
HierarchyMember {
  userId: number
  name: string
  profile?: string            // "Gerente" | "Vendedor" | ...   (Profile field)
  role: UserRoleEnum          // User | Seller | NetworkManager | Administrator
  status: UserNetworkStatusEnum // Active | WaitForApproval | Inactive | Blocked
  slug?: string
}

HierarchyView {
  ancestors: HierarchyMember[] // ordered TOP → direct sponsor; length 0..3 (linear)
  current:   HierarchyMember
  descendants: HierarchyNode[] // current user's direct children (branching)
}

HierarchyNode {
  member: HierarchyMember
  childCount: number           // total direct children (for the "+N" badge)
  children?: HierarchyNode[]   // loaded subtree; may be undefined until expanded
  depth: number                // 1..3 relative to current (cap render at 3)
}
```

Depth caps: **≤3 ancestors** above, **≤3 descendant levels** below. Nodes below the cap
are not rendered (a deepest-level node with children shows the collapse control but its
children live beyond the visible tree — either lazy-load or omit per product decision).

---

## 1. Component tree

```
HierarchyPage                     (page container + chrome + state orchestration)
├─ PageHeaderBand                 (reuse UserSearchPage header markup; title + breadcrumb)
├─ HierarchyStage                 (auth-card body; owns overflow-x pan + centering)
│   ├─ AncestorChain              (linear vertical list, top → down)
│   │   ├─ TopOfTreeTag           (shown only when ancestors.length === 0 or at the top)
│   │   ├─ TreeNode (variant="ancestor")  × up to 3
│   │   └─ Connector (vertical, arrow)     between each
│   ├─ TreeNode (variant="current")        (the logged-in member, emphasized)
│   └─ DescendantTree             (branching org-chart)
│       └─ TreeBranch (recursive) → TreeNode (variant="descendant") + nested TreeBranch
├─ HierarchySkeleton              (loading)
├─ EmptyAncestors / EmptyDescendants (empty sub-states)
└─ MessageToast                   (reuse; errors)
```

---

## 2. Component specs

### 2.1 `HierarchyPage`
- **Responsibility:** fetch the `HierarchyView` for the current user + network, hold
  loading/error, own the expand/collapse open-set, render chrome + one of
  {loading, populated}. Empty sub-states render *inside* the populated layout.
- **Props:** none (reads `NetworkContext` + `AuthContext`/`UserContext` like the sibling
  admin pages).
- **Local state:**
  - `loading: boolean`, `error?: string`
  - `view?: HierarchyView`
  - `expanded: Set<number>` — userIds whose children are revealed.
- **Derived:** `isLoading`, `hasAncestors = view.ancestors.length > 0`,
  `hasDescendants = view.descendants.length > 0`.

### 2.2 `PageHeaderBand`
- Reuse the exact header markup from `UserSearchPage`/`ProductSearchPage` (2px orange
  accent, `display-headline`, breadcrumb `Dashboard › Hierarquia`).
- **Props:** `title: string`, `crumbs: {label, to?}[]`.
- Right cluster: empty, OR an optional `Convidar` button reusing UserSearchPage's
  `cta-primary` styling (only if invite belongs on this page).

### 2.3 `TreeNode`  (the core reusable unit)
Renders one member card. Variant drives emphasis only — same internal layout.

- **Props:**
  | prop | type | notes |
  |------|------|-------|
  | `member` | `HierarchyMember` | name/profile/role/status |
  | `variant` | `"ancestor" \| "current" \| "descendant"` | styling only |
  | `roleLabel` | `string` | pre-translated (`userSearchPage.roles.*`) |
  | `statusLabel` | `string` | pre-translated (`userSearchPage.status.*`) |
  | `statusClass` | `string` | from the shared `statusPillClasses(status)` helper |
  | `childCount?` | `number` | when > 0 renders the collapse control |
  | `expanded?` | `boolean` | controls chevron + aria on the control |
  | `onToggle?` | `(userId:number) => void` | expand/collapse callback |
  | `profileMissingLabel` | `string` | fallback when `profile` empty (reuse `profileMissing`) |
- **Behavior:** presentational. Emits `onToggle(member.userId)` from its collapse control.
- **Styling:** see tokens §3–§5 & §7. `current` → orange ring + glow + "Você" badge +
  `aria-current="true"`; `ancestor` → `bg-mnx-neutral-50` quiet fill.
- **Reuse:** `getInitials`, chip geometry, and `statusPillClasses` are lifted directly
  from `UserSearchRow.tsx` (do not re-derive). Role icon = lucide `ShieldCheck`.

### 2.4 `AncestorChain`
- **Props:** `ancestors: HierarchyMember[]` (top → sponsor), `labels`.
- Renders `TopOfTreeTag` when at the top, then each ancestor as `TreeNode
  variant="ancestor"` separated by vertical arrow connectors, flowing DOWN into the
  current node.
- **Empty:** if `ancestors.length === 0` → render `EmptyAncestors` in place of the chain.

### 2.5 `DescendantTree` + `TreeBranch` (recursive)
- **`DescendantTree` props:** `roots: HierarchyNode[]`, `expanded: Set<number>`,
  `onToggle`, `labels`, `maxDepth = 3`.
- **`TreeBranch` props:** `node: HierarchyNode`, `expanded`, `onToggle`, `labels`, `depth`.
- Uses the `ul/li` org-chart connector CSS (tokens §6). A branch renders its `TreeNode`;
  if `node.children` exist AND `expanded.has(userId)` AND `depth < maxDepth`, it renders a
  nested `<ul>` of child `TreeBranch`es.
- **Collapse default:** a node is collapsed unless its id is in `expanded`. Recommend
  auto-collapsing any node with `childCount > 3` on first render (seed `expanded` with
  small branches only). `TreeNode` shows `+{childCount}` when collapsed.
- **Empty:** if `roots.length === 0` → `EmptyDescendants` below the current node.

### 2.6 `HierarchySkeleton`
- Mirrors the tree shape: 2 ancestor skeleton cards + 1 current (with faint orange ring)
  + a row of 3 descendant skeleton cards. Uses `<Skeleton>` from
  `src/Components/ui/skeleton` (tokens §8). Container `aria-busy="true"`.

### 2.7 `EmptyAncestors` / `EmptyDescendants`
- Reuse UserSearchPage empty block: `mnx-stat-chip mnx-stat-chip--orange`, display-bold
  title, muted body.
  - Ancestors: title **"Você está no topo"** (`hierarchyPage.emptyAncestorsTitle`).
  - Descendants: title **"Nenhum convidado ainda"** (`hierarchyPage.emptyDescendantsTitle`)
    + optional `Convidar` cta.

---

## 3. Interaction — expand / collapse

- Clicking a node's collapse control calls `onToggle(userId)`, which toggles membership in
  `HierarchyPage.expanded`. `TreeBranch` re-renders; children mount/unmount.
- Chevron rotates via CSS on `aria-expanded`. Label swaps `Convidados +N` ⇄ `Recolher`.
- Lazy loading (optional): if `node.children` is `undefined` on expand, `onToggle` may
  trigger a fetch; show an inline skeleton row under the node while pending.
- Threshold constant `COLLAPSE_THRESHOLD = 3` decides default-collapsed nodes.

---

## 4. Accessibility (priority-ladder: Accessibility → Touch → …)

### Tree semantics (WAI-ARIA tree pattern) for the **descendants**
- `DescendantTree` root: `role="tree"`, `aria-label="Convidados de {currentName}"`.
- Each branch `<li>`: `role="treeitem"`, `aria-expanded={hasChildren ? expanded : undefined}`,
  `aria-level={depth}` (1-based), and `aria-label` summarizing name + role + status
  (+ "N convidados recolhidos" when collapsed).
- Nested child list: `role="group"`.
- The **ancestor chain** is contextual, not an interactive tree — expose it as
  `role="list"` / `role="group"` with `aria-label="Cadeia de patrocinadores"`; each
  ancestor `role="listitem"`. Do not make ancestors a second `tree`.
- Current node: `aria-current="true"`.

### Keyboard (tree)
Implement roving tabindex over treeitems (one `tabindex="0"` at a time, rest `-1`):
| Key | Action |
|-----|--------|
| `ArrowRight` | expand collapsed node; if already expanded, move to first child |
| `ArrowLeft` | collapse expanded node; if leaf/collapsed, move to parent |
| `ArrowDown` / `ArrowUp` | move focus to next/previous visible treeitem |
| `Home` / `End` | first / last visible treeitem |
| `Enter` / `Space` | toggle expand/collapse on the focused node |

The collapse control button itself is a real `<button>` with `aria-expanded` and an
`aria-label` including the count — usable independently of roving tabindex, so pointer
and screen-reader users get an explicit affordance.

### Contrast & targets
- All text/background pairs use existing tokens that already meet **≥4.5:1**
  (`graphite-900`/`graphite-700` on white; chip text `orange-700`/`emerald-700`/`rose-700`
  on 10% tints all pass). Verify the amber optional variant (`amber-700` on `amber/12`) if enabled.
- Interactive controls (collapse button) are `h-[26px]`; ensure the **hit area ≥44×44px**
  via padding/`::before` expansion or a larger tap wrapper on touch. Node cards that are
  clickable must also honor 44px.
- **Never color-only:** every status/role chip carries its text label.

### Focus & motion
- Visible focus ring on every focusable: `focus-visible:ring-3 focus-visible:ring-orange-500/35`
  (nodes use `focus-within:ring-orange-500/20`).
- Respect `prefers-reduced-motion` — expand/collapse must not animate height when reduced;
  chevron rotation and `animate-fade-up` already zero out via tokens.

---

## 5. Responsive

- **Desktop:** full vertical flow; descendants centered; `overflow-x-auto` pan when a level
  exceeds container width. Thin `mnx-neutral-300` scrollbar.
- **Tablet:** same; node width unchanged (236px), rely on horizontal pan.
- **Mobile (<640px):** node width `210px`; the whole `HierarchyStage` is horizontally
  scrollable; consider defaulting deeper descendant levels to collapsed to reduce width.
  Header title drops to `text-2xl`. Ancestor chain remains a simple vertical stack (already
  narrow).

---

## 6. i18n keys to add (namespace `hierarchyPage.*`)

Reuse `userSearchPage.roles.*` and `userSearchPage.status.*` for chip text. New keys:
```
hierarchyPage.title                    "Árvore Hierárquica"
hierarchyPage.breadcrumb               "Hierarquia"
hierarchyPage.you                      "Você"
hierarchyPage.topOfTree                "Topo da rede"
hierarchyPage.childrenLabel            "Convidados"
hierarchyPage.collapse                 "Recolher"
hierarchyPage.expandChildren           "Expandir {{count}} convidados"        // aria
hierarchyPage.collapsedSummary         "{{count}} convidados recolhidos"      // aria
hierarchyPage.emptyAncestorsTitle      "Você está no topo"
hierarchyPage.emptyAncestorsBody       "Ninguém convidou você para esta rede — você é o ponto de partida da sua árvore."
hierarchyPage.emptyDescendantsTitle    "Nenhum convidado ainda"
hierarchyPage.emptyDescendantsBody     "Convide vendedores para começar a construir sua rede."
hierarchyPage.loading                  "Carregando árvore hierárquica"        // aria-busy region
```
Add to all four locale files (`pt`, `en`, `es`, `fr`) per project i18n convention —
the frontend engineer owns translation via the `add-react-i18n` flow.

---

## 7. Reuse checklist (do not re-invent)

- [ ] Page header band + breadcrumb → copy from `UserSearchPage`.
- [ ] `getInitials`, chip geometry, `statusPillClasses` → lift from `UserSearchRow.tsx`.
- [ ] `<Skeleton>` → `src/Components/ui/skeleton`.
- [ ] `.auth-card`, `.display-headline`, `.mnx-stat-chip--orange`, `cta-primary`,
      `animate-fade-up`, `duration-fast` → existing `globals.css`.
- [ ] Colors bound to Tailwind tokens (`orange`, `graphite`, `mnx-neutral`, `emerald`,
      `rose`) — no raw hex; connectors → `mnx-neutral-300`.
- [ ] `MessageToast` for errors → reuse.

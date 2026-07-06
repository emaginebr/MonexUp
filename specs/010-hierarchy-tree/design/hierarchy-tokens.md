# Árvore Hierárquica — Design Tokens & Class Reference

Direction: **Editorial-Brutalist light admin surface** — identical vocabulary to
`UserSearchPage` / `ProductSearchPage`. Nothing new is invented here; every value
below already exists in `monexup-app/src/styles/tokens.css`,
`monexup-app/tailwind.config.js`, and `monexup-app/src/styles/globals.css`. This
page must reuse them verbatim.

> Source of truth for tokens: `src/styles/tokens.css` (primitives → semantic).
> Do **not** hardcode hex values in the React code — bind to the Tailwind classes
> listed below, which resolve to the CSS variables.

---

## 1. Palette (reuse only)

| Role | Token / Tailwind class | Hex |
|------|------------------------|-----|
| Brand accent | `orange-500` | `#E85A1A` |
| Accent hover | `orange-600` | `#C64A14` |
| Accent text-on-soft | `orange-700` | `#9E3A0F` |
| Accent soft bg | `orange-50` / `bg-orange-500/10` | `#FFF3EC` |
| Accent ring | `ring-orange-500/20` | — |
| Primary text | `text-graphite-900` | `#0A0A0D` |
| Secondary text | `text-graphite-500` | `#3F3F46` |
| Tertiary / muted | `text-graphite-400` | `#6B6B75` |
| Card bg | `bg-white` / `bg-mnx-neutral-0` | `#FFFFFF` |
| Page bg | `bg-mnx-neutral-50` | `#FAFAF9` |
| Sunken / quiet node bg | `bg-mnx-neutral-50` | `#FAFAF9` |
| Card border (subtle) | `border-mnx-neutral-200` | `#E7E7E4` |
| Field border | `border-neutral-300` | `#D4D4D1` |
| **Connector line** | `#D4D4D1` (`mnx-neutral-300`) — see §6 | `#D4D4D1` |

Page wrapper is `mnx-surface-light` (opts into the light token set), exactly like
`UserSearchPage`.

---

## 2. Page chrome (copy 1:1 from UserSearchPage / ProductSearchPage)

```html
<main class="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
  <div class="max-w-container mx-auto px-shell pt-6 pb-12">
    <!-- Header band -->
    <section class="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <span aria-hidden="true" class="inline-block w-[2px] h-5 rounded-full bg-orange-500"></span>
          <h1 class="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight">
            {t("hierarchyPage.title") /* "Árvore Hierárquica" */}
          </h1>
        </div>
        <nav aria-label="Breadcrumb" class="mt-2 ml-[14px] text-sm">
          <ol class="flex items-center gap-1 text-graphite-500">
            <li><a class="hover:text-orange-600 transition-colors duration-fast">Dashboard</a></li>
            <li aria-hidden="true" class="text-graphite-300"><ChevronRight size={14} /></li>
            <li aria-current="page" class="font-medium text-graphite-700 truncate max-w-[14rem]">Hierarquia</li>
          </ol>
        </nav>
      </div>
      <!-- right cluster: empty, or an optional "Convidar" cta-primary button reusing UserSearchPage's -->
    </section>

    <!-- Tree body -->
    <section class="auth-card relative p-4 sm:p-6 animate-fade-up" aria-label="Árvore hierárquica">
      ...
    </section>
  </div>
</main>
```

Utility classes used above are already defined:
- `.auth-card` — white, `border-mnx-neutral-200`, `rounded-2xl`, elevated shadow.
- `.display-headline` — Space Grotesk 700, `letter-spacing:-.04em`.
- `max-w-container` (1200px), `px-shell`, `animate-fade-up`, `duration-fast`.

---

## 3. Node card

Compact card, fixed width so the tree grid stays predictable.

| Property | Value |
|----------|-------|
| Width | `w-[236px]` (mobile `w-[210px]`) |
| Padding | `p-3` (12px) |
| Radius | `rounded-xl` (`--radius-xl` = 1rem) |
| Border | `border border-mnx-neutral-200` |
| Shadow | `shadow-md` |
| Hover | `hover:border-orange-200 hover:shadow-lg` |
| Focus-within | `focus-within:ring-3 focus-within:ring-orange-500/20` (mirrors FormField) |
| Transition | `transition-[box-shadow,border-color] duration-fast ease-out` |

Internal structure (top row + chip row), reusing UserSearchRow geometry:

```html
<article class="node w-[236px] rounded-xl border border-mnx-neutral-200 bg-white shadow-md p-3
                hover:border-orange-200 hover:shadow-lg transition-colors duration-fast">
  <div class="flex items-center gap-2.5 min-w-0">
    <!-- avatar / initials — same as UserSearchRow -->
    <span aria-hidden="true"
          class="inline-flex w-[34px] h-[34px] items-center justify-center rounded-full
                 bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20
                 text-[0.72rem] font-bold tabular-nums shrink-0">AB</span>
    <div class="min-w-0">
      <div class="text-sm font-semibold text-graphite-900 truncate">{name}</div>
      <div class="text-xs text-graphite-500 truncate">{profile || "—"}</div>  <!-- Profile field -->
    </div>
  </div>

  <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
    <!-- Role chip + Status chip (see §4) -->
  </div>
</article>
```

The four required fields map as:
- **Nome** → `.node__name` (semibold, `text-graphite-900`)
- **Profile** (Gerente / Vendedor) → secondary line under the name (`text-xs text-graphite-500`)
- **Role** (User / Seller / NetworkManager / Administrator) → **Role chip** (§4)
- **Status** (Ativo / Aguardando aprovação / Inativo / Bloqueado) → **Status chip** (§4)

### Avatar initials
Reuse `getInitials()` logic already in `UserSearchRow.tsx` (first + last initial, uppercase, `—` fallback).

---

## 4. Chips (reuse UserSearchRow chip styles)

Chip geometry is identical to UserSearchRow's mobile chips: `h-[24px] px-2 rounded-full ring-1 text-[11px] font-semibold`.

### Role chip (always orange — matches the "Role" chip in UserSearchRow)
```
inline-flex items-center gap-1 h-[24px] px-2 rounded-full
bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 text-[11px] font-semibold
```
Prefix icon: `<ShieldCheck size={11} aria-hidden="true" />` (lucide), same as UserSearchRow.
Text per role uses the existing `userSearchPage.roles.*` i18n keys:
`user` → Usuário, `seller` → Vendedor, `networkManager` → Gestor de rede, `administrator` → Administrador.

### Status chip — canonical mapping (verbatim from `UserSearchRow.statusPillClasses`)
Reuse the exact three-tint function so this page stays consistent with `/admin/teams`:

```ts
// UserNetworkStatusEnum → chip classes  (COPY from UserSearchRow.tsx)
Active   → "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"   // Ativo
Blocked  → "bg-rose-500/10    text-rose-700    ring-rose-500/20"      // Bloqueado
default  → "bg-graphite-100   text-graphite-700 ring-graphite-200"    // Inactive, WaitForApproval
```

Wrapper: `inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 {statusClass}`.
Status text uses the existing `userSearchPage.status.*` keys
(`active` → Ativo, `waitForApproval` → Aguardando aprovação, `inactive` → Inativo, `blocked` → Bloqueado).

### Optional status refinement (documented, off by default)
The mockup additionally shows two *optional* differentiators, only if the team wants
finer semantics than the canonical three-tint. Ship these ONLY with product sign-off —
otherwise use the canonical mapping above so the tree matches `/admin/teams` exactly:
- `Inactive` → rose (`bg-rose-500/10 text-rose-700 ring-rose-500/20`)
- `WaitForApproval` → amber (`bg-amber-500/12 text-amber-700 ring-amber-500/20`)

> Important: never rely on color alone. Each status chip always carries its text label,
> satisfying the "no info by color alone" rule (priority-ladder Accessibility).

---

## 5. Current-user emphasis

The center node is visually distinct from ancestors/descendants:

| Layer | Class |
|-------|-------|
| Orange ring (2px, not layout-shifting) | `ring-2 ring-orange-500 ring-offset-0` (or `shadow-[0_0_0_2px_var(--color-orange-500)]`) |
| Brand glow | `shadow-glow-md` (`--shadow-glow-orange-md`) |
| Subtle warm fill | `bg-gradient-to-b from-[#FFFBF8] to-white` |
| Filled avatar | `bg-orange-500 text-white` (instead of soft orange) |
| "Você" badge | pill top-left: `bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wide h-5 px-2 rounded-full`, positioned `-top-2.5 left-3` |

Set `aria-current="true"` on the current node article.

Ancestor nodes are quieter: add `bg-mnx-neutral-50` to distinguish "context" from the subject.

---

## 6. Connector styling

Pure-CSS org-chart connectors (no SVG needed). Line color = `#D4D4D1` (`mnx-neutral-300`),
weight `2px`.

- **Ancestor chain (linear, vertical):** a `2px × 22px` bar (`bg-mnx-neutral-300`) between
  each stacked node, ending in a small down-triangle before the current node.
  ```
  .link-v      { width:2px; height:22px; background:#D4D4D1; }
  .link-v--arrow::after { /* 5px transparent L/R border + 6px top border in #D4D4D1 */ }
  ```
- **Descendant tree (branching):** the classic `ul/li ::before/::after` elbow technique
  (see mockup CSS `.tree`). Parent → children vertical drop = `ul ul::before`; sibling
  elbows via `li::before`/`li::after`; `:first-child`/`:last-child`/`:only-child` rounding.
  All borders `2px solid #D4D4D1`, radius `6px` on the outer corners.
- **Top-of-tree tag:** `▲ Topo da rede` pill — `bg-mnx-neutral-100 text-graphite-500
  border border-dashed border-mnx-neutral-300 h-6 px-2.5 rounded-full text-[11px] font-semibold`.

Wrap the branching area in an overflow container for wide levels:
`overflow-x-auto` (horizontal pan) with a thin `mnx-neutral-300` scrollbar thumb.

---

## 7. Collapse / expand control

Rendered inside a node that has children (collapsed by default when childCount is large).

```html
<button
  class="collapse-ctl inline-flex items-center gap-1.5 h-[26px] pl-1.5 pr-2 mt-2.5
         rounded-full border border-mnx-neutral-200 bg-white text-graphite-700
         text-[11px] font-semibold
         hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700
         focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500/35
         transition-colors duration-fast"
  aria-expanded="false"
  aria-label={t("hierarchyPage.expandChildren", { count })}>
  <ChevronDown size={13} class="chev text-orange-600 transition-transform duration-fast" aria-hidden="true" />
  {t("hierarchyPage.childrenLabel") /* "Convidados" */}
  <span class="count inline-flex items-center justify-center min-w-[18px] h-4 px-1
               rounded-full bg-orange-500 text-white text-[10px] font-bold">+{count}</span>
</button>
```

- Chevron rotates 180° when `aria-expanded="true"` (`.chev` → `rotate-180`).
- When expanded, the label switches to `t("hierarchyPage.collapse")` ("Recolher") and the
  `+N` count badge is dropped.
- Default state: **collapsed** whenever `childCount > COLLAPSE_THRESHOLD` (recommend `3`).

---

## 8. States

| State | Pattern |
|-------|---------|
| **Loading** | `aria-busy="true"` container; node-shaped skeletons using `<Skeleton>` (`rgba(154,154,163,.18)`, `animate-pulse`, `rounded-md`). Skeleton the ancestor chain + current + one descendant row. |
| **Empty ancestors** | `mnx-stat-chip mnx-stat-chip--orange` + `display` bold title **"Você está no topo"** + body, exactly like `UserSearchPage` empty block. Current node still rendered below. |
| **Empty descendants** | Current node, a single `.link-v`, then `mnx-stat-chip--orange` + **"Nenhum convidado ainda"** + body + (optional) "Convidar" cta. |
| **Populated** | Ancestors (≤3) → current → descendants (≤3 levels), horizontal scroll when wide. |

Empty-state block classes (from UserSearchPage):
```
title:  mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight
body:   mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed
```

---

## 9. Motion & reduced-motion

- Card enter: `animate-fade-up` on the header + card sections (already token-backed).
- Chevron + hover: `transition-* duration-fast ease-out`.
- All durations collapse to `0ms` under `@media (prefers-reduced-motion: reduce)` because
  the app's tokens already zero out `--duration-*`. No JS motion needed for expand/collapse
  (height auto is fine; if animating, guard with `prefers-reduced-motion`).

---

## 10. Tailwind `theme.extend` — no additions required

Every class above resolves against the **existing** `tailwind.config.js`
(`orange`, `graphite`, `mnx-neutral`, `shadow-glow-md`, `duration-fast`,
`animate-fade-up`, `max-w-container`, `px-shell`, `rounded-xl/2xl`). `emerald-*`,
`rose-*`, `amber-*` are Tailwind built-ins. **Do not add new tokens** — this keeps
brand changes cascading from `tokens.css`.

The only project-level value that is a plain literal (not yet a named token) is the
**connector line color** `#D4D4D1`, which equals `mnx-neutral-300`. Bind connectors to
`mnx-neutral-300` rather than a raw hex.

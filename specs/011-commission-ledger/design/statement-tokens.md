# Extrato — Tokens & Class Reuse Map

Full-page commission statement (`/admin/statement`, "Extrato"). Every class below
already exists in the app. **No new Tailwind tokens, no new `tailwind.config.js`
entries, and no new CSS-variable definitions are required** — this page is
assembled entirely from the existing editorial-brutalist light admin surface.

Sources of truth (do not redefine):
- CSS variables → `monexup-app/src/styles/tokens.css`
- Component classes → `monexup-app/src/styles/globals.css`
- Tailwind theme extension → `monexup-app/tailwind.config.js`

---

## 1. Page chrome (identical to UserSearchPage / ProductSearchPage)

| Element | Exact classes |
|---|---|
| Page root | `main.mnx-surface-light bg-mnx-neutral-50 min-h-screen` |
| Content shell | `div.max-w-container mx-auto px-shell pt-6 pb-12` |
| Header band | `section.flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up` |
| Orange accent bar | `span.inline-block w-[2px] h-5 rounded-full bg-orange-500` (`aria-hidden`) |
| Page title | `h1.display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight` → text `Extrato` |
| Breadcrumb nav | `nav[aria-label="Breadcrumb"].mt-2 ml-[14px] text-sm` |
| Breadcrumb list | `ol.flex items-center gap-1 text-graphite-500` |
| Crumb link | `Link.hover:text-orange-600 transition-colors duration-fast` → `Dashboard` (`to="/admin/dashboard"`, i18n `footer_dashboard`) |
| Crumb separator | `li[aria-hidden].text-graphite-300` wrapping `<ChevronRight size={14} />` |
| Current crumb | `li[aria-current="page"].font-medium text-graphite-700 truncate max-w-[14rem]` → `Extrato` |
| Optional header CTA (Export) | `button.cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast` — omit if export is out of scope |
| Body card | `section.auth-card relative p-4 sm:p-6 animate-fade-up` |

---

## 2. Balance summary strip (reuses BalanceCard + CountPart vocabulary)

Compact three-figure strip above the card. `Saldo total` is the focal dark
tile (reuses `BalanceCard`'s dark mesh); the two light tiles reuse the
`mnx-stat-chip` icon-chip vocabulary from the dashboard `CountPart`.

| Element | Exact classes |
|---|---|
| Strip grid | `section.grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-up` |
| Focal dark tile (Saldo total) | `article.mnx-surface-dark relative rounded-2xl overflow-hidden bg-mesh-balance p-5 text-mnx-neutral-50` + inner `div.balance-grid absolute inset-0 pointer-events-none` (`aria-hidden`) |
| Light tile (Liberado / Maturando) | `div.rounded-xl border border-mnx-neutral-200 bg-white p-5` |
| Tile label | `p.text-xs uppercase tracking-wider font-semibold text-graphite-500` (dark tile: `text-graphite-300`) |
| Figure wrapper | `p.mnx-num mt-2 flex items-baseline gap-1.5` |
| Currency prefix | `span.text-sm text-graphite-400` (dark: `text-graphite-300`) → `R$` |
| Amount | `span.text-2xl font-bold text-graphite-900` (dark focal: `text-4xl text-mnx-neutral-50`) |
| Icon chip — Liberado | `span.mnx-stat-chip mnx-stat-chip--green` (emerald, released) |
| Icon chip — Maturando | `span.mnx-stat-chip mnx-stat-chip--orange` (or amber tint; `--green`/`--orange`/`--blue` are the only defined variants — use `--orange` to stay on token, see note) |

> Note: `mnx-stat-chip` ships `--orange` / `--blue` / `--green` variants only
> (globals.css). For the "maturando" amber accent use the **status chip** amber
> tint on the row/figure (section 3) and keep the tile icon-chip on `--orange`
> — this avoids adding a new `mnx-stat-chip--amber` class. If an amber icon chip
> is desired, it is a one-line addition to globals.css, but it is **not
> required** for this page.

Figures come from the balance endpoint (same source as `BalanceCard`):
`Saldo total` = balance, `Liberado para saque` = availableBalance,
`Ainda maturando` = `balance − availableBalance` (or a dedicated field if the
endpoint exposes one).

---

## 3. Statement table / rows (StatementPart promoted to a page)

Reuse the existing `mnx-stmt-table` (globals.css) verbatim. The full page drops
the 8-column dashboard layout down to the 5 columns the spec asks for
(Data / Origem / Status / Valor, plus the leading indicator cell).

| Element | Exact classes |
|---|---|
| Scroll wrapper | `div.overflow-x-auto` inside `div.rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white` |
| Table | `table.mnx-stmt-table` |
| Caption (a11y) | `caption.sr-only` |
| Header cells | `th[scope="col"]` (amount header adds `.is-num`) |
| Body cell | `td` (`mnx-stmt-table` styles padding/border/color) |
| Amount cell | `td.is-num` — right-aligned, `graphite-900`, semibold, tabular-nums |
| Leading indicator | `span.mnx-status-pill` (green $ for paid — reuse as-is for released) |
| Origin title | `span.block font-semibold text-graphite-900` (reuse StatementPart `description` styling) |
| Origin subline | `span.block text-xs text-graphite-500` → `Rede · Comprador` |
| Date cell | wrap value in `<Moment format="DD/MM/YYYY">` (as StatementPart does) |

### Amount formatting
Match StatementPart exactly: `` `R$ ${statement.amount}` ``. For reversed rows,
prefix a minus sign so the sign is explicit: `` `− R$ ${Math.abs(amount)}` ``
(and the row already carries the rose color + `Estornado` chip, so sign is not
color-only). Keep the `.is-num` + `.mnx-num` tabular-nums treatment.

### Status chip mapping (geometry from `UserSearchRow.statusPillClasses`)
Base chip geometry (identical to the role/status chips already used on
UserSearchPage): `inline-flex items-center gap-1 h-[26px] px-2 rounded-full text-xs font-semibold ring-1`.

| Status | Meaning | Tint classes (already used in app) | Label |
|---|---|---|---|
| Released | `Liberado` | `bg-emerald-500/10 text-emerald-700 ring-emerald-500/20` | `Liberado` |
| Maturing | `Maturando` | `bg-amber-500/10 text-amber-700 ring-amber-500/20` | `Maturando` |
| Reversed | `Estornado` | `bg-rose-500/10 text-rose-700 ring-rose-500/20` | `Estornado` |

Emerald/rose tints are the exact ones in `statusPillClasses`
(`UserSearchRow.tsx`). Amber uses Tailwind's built-in `amber-*` scale at the
same `/10 · 700 · /20` recipe (no config change — `amber` is a default Tailwind
palette; only `orange`/`graphite`/`mnx-neutral` were remapped).

A small colored `dot` inside the chip is optional and mirrors the existing
`dashboard_filter_status_paid` chip (`<span className="w-1.5 h-1.5 rounded-full">`
with an inline status color). Keep the **text label** as the primary carrier —
never color-only.

### Reversed row distinction
- Row wrapper adds a muted class: `text-graphite-400` on the cells (title uses
  `text-graphite-500 line-through`).
- Leading `mnx-status-pill` recolored inline to rose
  (`bg-rose-500/10 text-rose-700`) instead of the green paid pill.
- Amount `.is-num` recolored to `text-rose-700` with an explicit `−` sign.

Derive status client-side from `StatementInfo` (no DTO change strictly required):
`amount < 0` → reversed; `withdrawalDueDate` in the future → maturing; otherwise
released. If the ledger endpoint returns an explicit status enum, prefer it.

---

## 4. Pagination (existing admin-list control, page size 15)

Use the **UserSearchPage / ProductSearchPage** pager (prev / "Página X de Y" /
next), not the numbered `mnx-pager`, so it matches the other admin lists.

| Element | Exact classes |
|---|---|
| Nav | `nav[aria-label="Pagination"].mt-4 flex items-center justify-between gap-3` |
| Prev / Next button | `button.inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500` |
| Prev icon | `<ChevronLeft size={16} aria-hidden />` + label `userSearchPage.actions.previous` |
| Next icon | label `userSearchPage.actions.next` + `<ChevronRight size={16} aria-hidden />` |
| Page indicator | `span.text-xs text-graphite-500 mnx-num tabular-nums` → i18n `userSearchPage.pageOf` `{ current, total }` |

`PAGE_SIZE = 15` (constant in the page module, mirroring
`ProductSearchPage`'s `PAGE_SIZE = 20`). The backend already returns
`StatementListPagedInfo { statements, pageNum, pageCount }`, so
`total = pageCount`, `current = pageNum`.

> Alternative: if the numbered pager is preferred to stay closer to the current
> `StatementPart`, `.mnx-pager` (globals.css) is also available and needs no new
> tokens. This spec defaults to the admin-list control per the brief.

---

## 5. States

| State | Reuse |
|---|---|
| Loading | `div[aria-busy="true"]` with `<Skeleton>` from `Components/ui/skeleton` — same shape as ProductSearchPage: 4 desktop grid rows + 3 mobile card rows. Balance strip tiles show a `Skeleton` figure (like `BalanceCard`'s `loadingBalance`). |
| Empty | Centered block `div.px-6 py-14 text-center` with `span.mnx-stat-chip mnx-stat-chip--orange mx-auto` (icon), `h3.mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight` → **"Nenhuma comissão recebida ainda"**, `p.mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed`. Identical to ProductSearchPage/UserSearchPage empty state. |
| Populated | Table on `md+`, stacked cards `< md` (see section 6). |

---

## 6. Responsive

Follow the UserSearchRow dual-layout pattern:
- Desktop/tablet (`md+`): `table.mnx-stmt-table` (or a `hidden md:!grid grid-cols-12`
  row set if the engineer prefers the grid rows used by UserSearchRow — either is
  in-vocabulary; the table is closer to StatementPart).
- Mobile (`< md`): `md:hidden` stacked cards — origin title + amount on top row,
  status chip + date on the meta row. Reversed cards carry the same muted +
  rose-amount + `line-through` treatment.

---

## 7. Confirmation: no new tokens

- Colors: `orange-*`, `graphite-*`, `mnx-neutral-*` already mapped in
  `tailwind.config.js`; `emerald-*`, `amber-*`, `rose-*` are Tailwind defaults
  (untouched by the config remap) and already used by `UserSearchRow`.
- Component classes (`auth-card`, `mnx-stmt-table`, `mnx-status-pill`,
  `mnx-num`, `display-headline`, `mnx-stat-chip`, `balance-grid`,
  `bg-mesh-balance`, `cta-primary`, `animate-fade-up`, `shadow-glow-md`,
  `px-shell`, `max-w-container`) all exist.
- Spacing/radius/shadow/duration utilities all resolve to existing CSS vars.

**Net new CSS/Tailwind required: none.** (Only optional nicety:
`mnx-stat-chip--amber`, one rule, if an amber icon chip is wanted on the
"Ainda maturando" tile — otherwise use `--orange`.)

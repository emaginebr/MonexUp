# Extrato — Component Spec

Design spec only. React implementation belongs to `frontend-react-developer`.
Route: `/admin/statement` (+ `/admin/statement/:pageNum`), rendered inside
`LayoutAdmin` (no page chrome from the component itself — same as
UserSearchPage/ProductSearchPage). All classes are the existing ones mapped in
`statement-tokens.md`; this document defines the component tree, props, and a11y.

Data contracts already in the codebase:
- `StatementInfo` (`src/DTO/Domain/StatementInfo.tsx`)
- `StatementListPagedInfo { statements, pageNum, pageCount }` (`src/DTO/Domain/StatementListPagedInfo.tsx`)
- Balance figures from the balance endpoint feeding `BalanceCard` today.

---

## Component tree

```
StatementPage                         (route container, owns data + paging)
├── PageHeaderBand                     (accent bar + title "Extrato" + breadcrumb)
├── BalanceSummaryStrip                (optional; 3 figures)
│   ├── BalanceFocalTile   (Saldo total — dark mesh)
│   ├── BalanceStatTile    (Liberado para saque)
│   └── BalanceStatTile    (Ainda maturando)
└── StatementCard  (auth-card)
    ├── StatementTable                 (md+; <table class="mnx-stmt-table">)
    │   └── StatementRow  ×N           (Data / Origem / StatusChip / Valor)
    ├── StatementCardList              (< md; stacked cards)
    │   └── StatementCardItem ×N
    ├── StatementEmpty                 (when !loading && rows === 0)
    ├── StatementLoading               (skeleton)
    └── StatementPagination            (prev / pageOf / next)
```

`StatusChip` is a shared leaf used by both `StatementRow` and
`StatementCardItem`.

---

## 1. StatementPage

Container. Fetches the paged ledger and (optionally) the balance figures,
owns page state, renders header + strip + card.

**Props:** none (route component; reads context/hooks like the sibling pages).

**State / data it orchestrates:**
| Name | Type | Source |
|---|---|---|
| `result` | `StatementListPagedInfo \| null` | ledger context/hook |
| `loading` | `boolean` | ledger context/hook |
| `balance` | `{ total; released; maturing }` (pre-formatted strings) | balance endpoint (same as BalanceCard) |
| `loadingBalance` | `boolean` | balance endpoint |
| `pageNum` | `number` | `useParams()` (default 1) |

**Constants:** `PAGE_SIZE = 15`.

**Derived:** `rows = result?.statements ?? []`; `isEmpty = !loading && rows.length === 0`;
`currentPage = result?.pageNum ?? 1`; `totalPages = result?.pageCount ?? 1`;
`showPagination = !loading && !!result && totalPages > 1`.

**Behavior:** on mount / `pageNum` change, call the ledger search with
`(pageNum, PAGE_SIZE)`; surface errors via `MessageToast` (Error variant), same
pattern as ProductSearchPage. Changing page navigates to
`/admin/statement/:pageNum` (or updates state) then refetches.

---

## 2. PageHeaderBand

Static header. Identical structure to UserSearchPage/ProductSearchPage headers.

**Props:**
| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | i18n → `statementPage.title` ("Extrato") |
| `onExport?` | `() => void` | optional; renders the `cta-primary` Export button only when provided |

**a11y:** `section aria-labelledby="statement-page-title"`; `h1#statement-page-title`;
`nav[aria-label="Breadcrumb"]` with `ol`, current crumb `aria-current="page"`.
Accent bar and `ChevronRight` separator are `aria-hidden`.

---

## 3. BalanceSummaryStrip

Optional compact strip. Render only when balance figures are available (or show
skeleton tiles while `loadingBalance`).

**Props:**
| Prop | Type | Notes |
|---|---|---|
| `total` | `string` | pre-formatted, e.g. `"18.420,00"` |
| `released` | `string` | Liberado para saque |
| `maturing` | `string` | Ainda maturando |
| `loading?` | `boolean` | show `<Skeleton>` figures |
| `labels` | `{ total; released; maturing }` | i18n strings |

**BalanceFocalTile props:** `label`, `amount`, `loading`. Dark mesh tile
(`mnx-surface-dark bg-mesh-balance` + `balance-grid`), `R$` prefix + `mnx-num`.

**BalanceStatTile props:** `label`, `amount`, `loading`, `tone: "green" | "orange"`.
Light tile with `mnx-stat-chip mnx-stat-chip--{tone}` icon + `mnx-num` figure.
Released → `green` + check icon; Maturing → `orange` + clock icon.

**a11y:** strip `section aria-label` (localized "Resumo de saldo"); figures are
plain text (screen readers read label + `R$` + amount). Decorative grid/mesh
`aria-hidden`.

---

## 4. StatementTable + StatementRow (md+)

`<table class="mnx-stmt-table">` with a `<caption class="sr-only">`.
Columns: indicator · Data · Origem · Status · Valor(`.is-num`).

**StatementRow props:**
| Prop | Type | Notes |
|---|---|---|
| `item` | `StatementInfo` | one commission |
| `status` | `"released" \| "maturing" \| "reversed"` | derived by parent (see below) |
| `labels` | `StatementRowLabels` | localized status labels + currency prefix |

**StatementRowLabels:**
```
{ released: string; maturing: string; reversed: string;
  currency: string;      // "R$"
  reversedNote?: string; // e.g. "Pagamento estornado" appended to origin subline
  statusColumnLabel: string; dateColumnLabel: string;
  originColumnLabel: string; amountColumnLabel: string; }
```

**Cell content:**
- Indicator `<td>`: `span.mnx-status-pill` — green $ (released), amber clock
  (maturing), rose reverse-arrow (reversed). `aria-hidden` (status is already
  conveyed by the Status column text).
- Data `<td class="mnx-num">`: `<Moment format="DD/MM/YYYY">{item.paidAt}</Moment>`.
- Origem `<td>`: `span.block font-semibold` = `item.description`; sub `span.block
  text-xs text-graphite-500` = `` `${item.networkName} · ${item.buyerName}` `` (append
  `reversedNote` when reversed).
- Status `<td>`: `<StatusChip status={status} labels={labels} />`.
- Valor `<td class="is-num mnx-num">`: `` `${currency} ${format(item.amount)}` ``;
  reversed → prefix `−` and add `text-rose-700` (also set on the whole row via a
  `is-reversed` modifier that mutes non-amount cells).

**Status derivation (parent helper, no DTO change required):**
```
reversed  if item.amount < 0                         (or explicit reversed flag)
maturing  if withdrawalDueDate exists && is in the future
released  otherwise
```
Prefer an explicit status field if the ledger endpoint provides one.

---

## 5. StatementCardList + StatementCardItem (< md)

`md:hidden` stacked cards mirroring UserSearchRow's mobile card.

**StatementCardItem props:** same as `StatementRow` (`item`, `status`, `labels`).
Layout: top row = origin title + amount (right, `mnx-num`); meta row =
`<StatusChip>` + date. Reversed item: `line-through` title, `text-rose-700`
amount with `−` sign.

---

## 6. StatusChip (shared leaf)

**Props:**
| Prop | Type |
|---|---|
| `status` | `"released" \| "maturing" \| "reversed"` |
| `labels` | `{ released; maturing; reversed }` (localized text) |

**Render:** `span` with base chip geometry
`inline-flex items-center gap-1 h-[26px] px-2 rounded-full text-xs font-semibold ring-1`
plus tint by status:
- released → `bg-emerald-500/10 text-emerald-700 ring-emerald-500/20`
- maturing → `bg-amber-500/10 text-amber-700 ring-amber-500/20`
- reversed → `bg-rose-500/10 text-rose-700 ring-rose-500/20`

Optional leading `span.w-1.5 h-1.5 rounded-full` dot (status color).
**The visible text label is mandatory** (`Liberado` / `Maturando` / `Estornado`) —
status is never conveyed by color/dot alone.

---

## 7. StatementPagination

Admin-list pager (prev / pageOf / next), `PAGE_SIZE = 15`.

**Props:**
| Prop | Type |
|---|---|
| `currentPage` | `number` |
| `totalPages` | `number` |
| `onPrev` | `() => void` |
| `onNext` | `() => void` |
| `labels` | `{ previous; next; pageOf(current,total) }` |

Buttons disabled at bounds (`disabled:opacity-40 disabled:cursor-not-allowed`),
`focus-visible:ring-2 focus-visible:ring-orange-500`. Page indicator
`aria-live="polite"`.

---

## 8. StatementEmpty

Centered empty block. `mnx-stat-chip mnx-stat-chip--orange` icon,
`h3` = **"Nenhuma comissão recebida ainda"**, body paragraph.

**Props:** `{ title; body }` (i18n). No CTA (nothing to create from this page).

---

## 9. StatementLoading

`aria-busy="true"`. Balance strip: `<Skeleton>` figures in the 3 tiles. Table:
4 desktop skeleton rows (grid) + 3 mobile skeleton cards, matching
ProductSearchPage's loading block shapes (avatar/pill/line widths).

---

## 10. Accessibility notes

- **Table semantics:** real `<table>` with `<caption class="sr-only">`,
  `<thead>`/`<th scope="col">`, `<tbody>`. If the engineer uses the
  `role="row"/"cell"` grid instead (UserSearchRow style), preserve those roles
  and add a `columnheader` row.
- **Status not color-only:** every status is carried by chip **text**
  (`Liberado`/`Maturando`/`Estornado`); the colored dot and the leading
  `mnx-status-pill` icon are `aria-hidden` decoration. Reversed amount also
  carries an explicit `−` sign (not just rose color).
- **Contrast:** emerald-700/amber-700/rose-700 on `/10` tinted backgrounds and
  graphite-700/900 body text all meet ≥ 4.5:1. Amber-700 (#B45309) is used for
  text (not amber-500) precisely to clear AA.
- **Focus:** all interactive controls (breadcrumb link, pager buttons, export
  CTA) get the app's visible focus ring — `focus-visible:ring-2
  focus-visible:ring-orange-500` (or the global 3px orange outline from
  `.mnx-surface-light :focus-visible`).
- **Touch targets:** pager buttons `h-9` (36px) with padding reach the ≥ 44px
  hit area via the surrounding flex row; chips are non-interactive. Export CTA
  `h-9` with horizontal padding.
- **Live regions:** page indicator `aria-live="polite"`; error toast via the
  existing `MessageToast`.
- **Reduced motion:** `animate-fade-up` and skeleton shimmer already respect
  `prefers-reduced-motion` (globals.css + tokens.css).
- **Amount semantics:** consider `aria-label` on reversed amount cells, e.g.
  "menos R$ 240,00, estornado", so screen-reader users get the sign + status
  unambiguously.

---

## Handoff

- Visual contract: `statement-mockup.html`
- Token/class map: `statement-tokens.md`
- No `.tsx` here by design — implementation by `frontend-react-developer`.
- No new Tailwind tokens or config changes required (see tokens §7).

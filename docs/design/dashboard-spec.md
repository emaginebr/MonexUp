# MonexUp Dashboard — Component Spec

**Direction:** Editorial Brutalist · Dark/Light Split (inherits the home & login system).
**Stack target:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui (Radix primitives).
**Mockup:** `docs/design/dashboard-redesign.html`
**Source code being translated visually (do NOT modify):**
- `monexup-app/src/Pages/DashboardPage/index.tsx`
- `monexup-app/src/Pages/DashboardPage/CountPart.tsx`
- `monexup-app/src/Pages/DashboardPage/StatementPart.tsx`

The dashboard is the first **post-login surface** in the system. It alternates the **dark sticky navbar** (verbatim from the home/login mockups) over a **light dashboard shell** (`mnx-surface-light`, `bg-neutral-50`), with one **dark balance card** breaking the rhythm to draw the eye to money — the same brutalist accent move used by the home's inverted feature card and the login's halo glow card.

## Global rules (apply to every dashboard section)

- **Container:** `max-w-container` (1200px) + `px-shell` + center.
- **Vertical rhythm:** `pt-10 pb-16` on the page shell; sections inside use `mb-10`. KPIs/balance/tabs sit on a single light surface — no inter-section dividers (the cards' borders carry the structure).
- **Surface intent:** the page shell is `mnx-surface-light bg-neutral-50`. The balance card opts in to `mnx-surface-dark` so its inner text/border tokens flip; the rest stays light. The footer reuses `mnx-surface-dark`.
- **Numerics:** every monetary or count value uses `.num` (Space Grotesk + `font-feature-settings: 'tnum' 1, 'lnum' 1`) so digits align in tabular columns and never reflow when the data updates.
- **Focus ring:** `:focus-visible` → 3px orange outline, 3px offset. Never removed.
- **Touch target:** every interactive element ≥ 44×44 px. Icon buttons are `w-10 h-10`; pagination buttons are `min-w-10 h-10`; primary CTA is `h-12`.
- **Motion:** 150 ms `--duration-fast` for color/border, 220 ms `--duration-normal` for shadow, 320 ms slow for entrance. All transitions disable under `prefers-reduced-motion: reduce`.
- **Contrast (WCAG AA, verified):**
  - `text-graphite-900` on `bg-neutral-0` → 19.0:1
  - `text-graphite-500` on `bg-neutral-50` → 7.5:1
  - `text-orange-700` on `bg-neutral-0` → 7.1:1 (used for eyebrow + KPI accent text)
  - white on `orange-500` → 3.4:1 → only used at ≥18 px semibold (large-text AA pass)
  - `text-graphite-300` on `graphite-900` → 8.0:1 (balance card meta)

---

## 1. `<DashboardHeader />` — Greeting + actions (LIGHT)

**Purpose.** Personal greeting + contextual role label + quick actions. Replaces the current `<div className="mnx-page-header"><h2>Dashboard</h2></div>` with a fully editorial band that anchors the page.

**Composition (shadcn primitives):**
- Plain `<section>` wrapper — no shadcn primitive needed.
- `Button` shadcn variants: `outline` ("Sacar saldo") + `ghost`-icon (filter, export). Both `size="sm"` to keep the band slim.
- Optional shadcn `Avatar` once the seller's photo is available — for now we render the role label in text only.

**Structure:**
1. Eyebrow (`Painel`, orange-700 uppercase, with a 20 px orange dash).
2. `<h1 class="display-headline">` greeting — `text-4xl sm:text-5xl`, locked to `text-graphite-900`.
3. Subtitle (current date · role · network).
4. Right cluster: filter icon button · export icon button · "Sacar saldo" outline.

**Props (suggested API):**
```ts
interface DashboardHeaderProps {
  /** First name (no surname — kept short for the headline). */
  firstName: string;
  /** Localized full date (e.g., "Quinta-feira, 1 de maio de 2026"). */
  todayLabel: string;
  /** Localized role (e.g., "Gerente de rede"). UserRoleEnum → label. */
  roleLabel: string;
  /** Active network name. Optional for User role. */
  networkName?: string;
  /** Greeting variant — "morning" | "afternoon" | "evening" derived in caller. */
  greeting?: "morning" | "afternoon" | "evening";
  /** Disabled when user has no available balance. */
  onWithdraw?: () => void;
  /** Filter / export wired to existing `searchStatements` + report endpoints. */
  onFilter?: () => void;
  onExport?: () => void;
}
```

**Breakpoints:**
- `< lg`: stack vertically — greeting block on top, action cluster on a new row.
- `≥ lg`: greeting left, actions right (`lg:items-end lg:justify-between`).

**States:**
- **Loading:** show a 3-line skeleton (`Skeleton` shadcn) for the greeting + subtitle. Right cluster stays disabled until role context resolves.
- **Empty (User role):** "Sacar saldo" hides; subtitle drops the role/network and shows "Bem-vindo à MonexUp".
- **Error:** the existing `MessageToast` handles it. The header itself keeps the last good state.

**A11y:**
- `<h1 id="page-title">` is the only `<h1>` on the page.
- Filter / export icon buttons have `aria-label`.
- "Sacar saldo" is a `<a>` (navigates to `/withdrawal`), not `<button>` — preserves right-click → "open in new tab".

---

## 2. `<KpiCard />` — reusable stat card (LIGHT)

**Purpose.** Mirrors `CountPart.tsx` (3 metrics) but as a single reusable component that any page can compose. Used 3× on this page: Vendas (orange), Clientes (blue), Faturas (green).

**Composition:**
- Plain `<article>` shell on shadcn `Card` (when migrated). Use `CardContent` only — no `CardHeader`.
- Icon: lucide-react (`Box`, `Users`, `DollarSign`) — match the FontAwesome semantics of the current code (`faBox` / `faUser` / `faDollar`).
- Trend pill: tiny inline component (`TrendPill`) with `up`/`down`/`flat` variants tied to the `success-50` / red-50 / graphite-50 token triplets.

**Structure:**
1. Top row: `stat-chip` (44 px square, color variant) + `trend-pill` (top-right).
2. Big numeric value (`.num text-4xl`).
3. Uppercase label (`text-xs tracking-wider text-graphite-400`).
4. Sub-line (`text-xs text-graphite-500`) — context such as "vs. mês anterior".

**Props (suggested API):**
```ts
interface KpiCardProps {
  /** Lucide icon component or fa icon definition. */
  icon: LucideIcon;
  /** Color variant of the icon chip — locked to the 3 semantic accents. */
  tone: "orange" | "blue" | "green";
  /** Pre-formatted value (e.g., "7", "R$ 1.480,00"). Component does NOT format. */
  value: string;
  /** Short uppercase label ("Vendas realizadas"). */
  label: string;
  /** Optional sub-text below the label. */
  caption?: string;
  /** Optional trend indicator — defaults to no pill. */
  trend?: { delta: string; direction: "up" | "down" | "flat"; ariaLabel: string };
  /** Optional click target — turns the article into a navigable card. */
  href?: string;
  /** Loading skeleton — replaces value + caption with shimmer. */
  loading?: boolean;
}
```

**Breakpoints:**
- `< sm`: 1 column.
- `sm`–`lg`: 3 columns inside the 8-col KPI grid (so KPI grid = `sm:grid-cols-3`).
- `≥ lg`: KPI grid spans `lg:col-span-8`; balance card spans `lg:col-span-4`.

**States:**
- **Idle:** white surface, `border-graphite-100 shadow-sm`. Hover lifts shadow to `shadow-md` (200 ms).
- **Loading:** chip stays solid (color is metadata about the metric, not the value); value + caption become `Skeleton` blocks.
- **Empty:** show "—" in `.num` and a neutral trend pill `flat` ("Sem dados").
- **Error:** keep last good value with a tiny `text-error-500` label "Falha ao atualizar" beneath the caption.

**A11y:**
- `<article aria-labelledby="kpi-{id}">`, with the value carrying the id.
- Icon SVGs `aria-hidden="true"` (the label conveys the meaning).
- Trend pill carries the FULL semantic via `aria-label="Aumento de 12% comparado ao mês anterior"` — never relies on color alone.

---

## 3. `<BalanceCard />` — Saldo atual (DARK variant)

**Purpose.** Focal money tile. Shows current balance, released-for-withdrawal amount, a trend sparkline, and the primary "Solicitar saque" CTA. Mirrors the current `mnx-balance-card` block in `DashboardPage/index.tsx` but rebuilt in the new visual language.

**Composition:**
- `<article>` with `mnx-surface-dark` opt-in + `bg-mesh-balance` (radial orange glow + dark gradient — defined in `tailwind.config.snippet.js → backgroundImage`).
- shadcn `Button variant="default"` for the CTA, with `cta-primary` glow class applied.
- Sparkline: inline SVG (no Chart.js needed for a 30-day dot trend). When the dashboard adds detailed analytics, swap for shadcn `<Chart>` (Recharts).
- Subtle 40 px grid texture (`balance-grid`, masked radial fade — same recipe as the home `.hero-grid`, just smaller cell + stronger fade).

**Structure:**
1. Top row: "Saldo atual" eyebrow + "Ao vivo" pill (orange-soft).
2. Big amount (`R$` small + `18.420,00` huge — display family, tabular nums, `text-graphite-300` for the cents).
3. Divider (`border-white/10`).
4. "Liberado para saque" label + smaller numeric (Seller role only — hidden for NetworkManager).
5. Sparkline + delta caption ("+24% nos últimos 30 dias").
6. Primary CTA — full width, `h-12`, glow.

**Props:**
```ts
interface BalanceCardProps {
  /** Total balance in cents (component formats to "R$ N.NNN,NN"). */
  balanceCents: number;
  /** Available-for-withdrawal in cents. Hidden when undefined or role !== Seller. */
  availableCents?: number;
  /** Trend points for the sparkline — array of relative values 0..1. */
  trend?: number[];
  /** Trend delta label, e.g. "+24%" or "-3%". */
  trendDelta?: string;
  /** Localized current-balance label (i18n key `dashboard_current_balance`). */
  balanceLabel: string;
  /** Localized released-for-withdrawal label. */
  availableLabel?: string;
  /** Withdrawal CTA props. */
  cta: { label: string; href: string; disabled?: boolean };
  /** Loading state — both numerics replaced by Skeleton. */
  loading?: boolean;
}
```

**Breakpoints:**
- `< lg`: stacks BELOW the KPI grid (full width). The card's content stays the same; padding tightens to `p-6`.
- `≥ lg`: sits in the right column (`lg:col-span-4`) at the same row height as the KPI grid.

**States:**
- **Idle:** dark mesh surface, glow shadow on the CTA.
- **Loading:** `balanceCents` and `availableCents` show `Skeleton`; sparkline hides; CTA disabled with "Carregando saldo".
- **Disabled CTA:** when `cta.disabled` is true (e.g., balance below minimum withdrawal threshold), the button drops the glow (`cta-primary::after` opacity 0), keeps the orange fill at 50% opacity, and gains `aria-disabled="true"`. Existing code already disables the button — this just gives it a real disabled visual.
- **Reduced motion:** sparkline is static; CTA aura keeps its idle opacity but no transition.

**A11y:**
- `<article aria-labelledby="balance-label">`.
- Sparkline is decorative (`aria-hidden="true"`); the trend delta beneath it is a real text node and conveys the same info.
- Currency is rendered as plain text (no icon-only money signals). Screen readers announce "Saldo atual: dezoito mil quatrocentos e vinte reais" naturally.
- "Ao vivo" badge has `aria-label="Atualizado há instantes"` so SR users get the meaning.

---

## 4. `<Tabs />` — Extrato / Pedidos (LIGHT)

**Purpose.** Replicates the React-Bootstrap `<Tabs>` in `DashboardPage/index.tsx` (Extrato active, Pedidos disabled). New look: flat tab bar with bottom border, active tab gets a 2 px orange underline.

**Composition (shadcn primitives):**
- shadcn `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` (Radix `Tabs`).
- Icons via lucide-react (`DollarSign`, `Package`).

**Structure:**
- `<div role="tablist">` with `border-b border-graphite-100`.
- Each `<button role="tab">` is `h-12 px-4`, gap `0.5rem` between icon and label.
- Active tab: `text-graphite-900 border-b-2 border-orange-500` (the trigger overlaps the bar's bottom border via `mb-[-1px]`).
- Disabled tab: `text-graphite-300 cursor-not-allowed` + a tiny `em breve` pill in `text-graphite-300 uppercase tracking-wider`.

**Props:**
```ts
type TabKey = "statement" | "orders";

interface TabsProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
  /** Tabs whose content is not implemented yet. */
  disabled?: TabKey[];
}
```

**Breakpoints:**
- All sizes: same horizontal layout. On `< sm`, the disabled "em breve" suffix can hide via `hidden sm:inline` to keep the bar from wrapping.

**States:**
- **Idle:** muted text, no underline.
- **Hover:** `text-graphite-900`, no underline (the underline is reserved for active).
- **Active:** `text-graphite-900` + orange underline.
- **Disabled:** `text-graphite-300` + `aria-disabled="true"` + `tabIndex={-1}` so the tab still receives `aria-selected="false"` correctly without being keyboard-focusable.

**A11y:**
- `aria-controls` on each trigger pointing at its panel id; `aria-labelledby` on each panel pointing back at its trigger.
- The disabled tab has `aria-disabled="true"`; the visible "em breve" text reinforces the state for sighted users.
- Tab key cycles only between non-disabled triggers.

---

## 5. `<StatementTable />` — Extrato (LIGHT)

**Purpose.** Light, modern reimplementation of `StatementPart.tsx`. Same columns, same data shape, new visual.

**Composition (shadcn primitives):**
- shadcn `Table` (`<Table>` + `<TableHeader>` + `<TableBody>` + `<TableRow>` + `<TableCell>`) — currently we mock it with a raw `<table class="stmt-table">`.
- shadcn `Input` for the search filter.
- shadcn `DropdownMenu` for the date range chip and status chip (the chips look the same as in the mockup; the mock uses static `<button>`s only because shadcn isn't installed yet).
- shadcn `Badge` for the green dollar status pill.

**Structure:**
- Outer card: `bg-white rounded-2xl border border-graphite-100 shadow-sm overflow-hidden`.
- Filter bar (`p-5 border-b border-neutral-200`): search input (`flex-1 max-w-md`) + date-range chip + status chip + network chip.
- Table inside `<div class="overflow-x-auto">` so columns can horizontally scroll on narrow viewports without resizing the card.
- Row hover: `bg-neutral-50` (very subtle — keeps focus on numerics).
- Numeric column (`Valor`) is right-aligned + `text-graphite-900 font-semibold` + tabular nums.
- Optional `meta` second-line under product / buyer / seller cells (recurrence id, leader level) — purely informative, `text-xs text-graphite-400`.

**Columns (fixed order, mirrors `StatementPart.tsx`):**
1. **Status** (green dollar pill)
2. **Data de pagamento** — `DD/MM/YYYY`
3. **Rede** — name only
4. **Produto** — product name + meta line (recurrence/order id)
5. **Comprador** — full name + meta line (truncated email)
6. **Vendedor** — full name + meta line (role/level)
7. **Valor** — right-aligned, monospaced, `R$ N.NNN,NN`
8. **Pago em** — `DD/MM HH:mm`

**Props:**
```ts
interface StatementRow {
  id: string;
  paymentDate: string;        // ISO
  networkName: string;
  product: { name: string; reference: string };
  buyer:   { name: string; email: string };
  seller:  { name: string; role: string; level: number };
  amountCents: number;        // formatted in component
  paidAt: string;             // ISO
  status: "paid" | "pending" | "failed";
}

interface StatementFilters {
  query: string;
  dateRange: { from: string; to: string } | null;
  statuses: Array<"paid" | "pending" | "failed">;
  networkIds: string[] | null;   // null = all
}

interface StatementTableProps {
  rows: StatementRow[];
  loading: boolean;
  filters: StatementFilters;
  onFiltersChange: (next: StatementFilters) => void;
  /** Localized empty-state copy (existing key `statement_no_statement_found`). */
  emptyLabel: string;
}
```

**Breakpoints:**
- `< md`: filter bar stacks vertically (search on top, chips wrap below). Table scrolls horizontally inside the card.
- `≥ md`: filter bar single row. Table renders all columns inline.

**States:**
- **Idle:** as in mockup.
- **Loading:** rows replaced by 6 `Skeleton` rows (mirroring column widths). Filters stay enabled — they just queue while the request is in flight.
- **Empty:** centered illustration + `emptyLabel` (`statement_no_statement_found`) + "Limpar filtros" link if any filter is active.
- **Error:** keep last good rows + a `text-error-500` banner "Falha ao atualizar — tente novamente". The existing `MessageToast` carries the toast.
- **Row hover:** `bg-neutral-50`. Row click is NOT enabled by default (the row is informative). Add `onRowClick` only when a detail page exists.
- **Status pill:** green for `paid`, amber for `pending` (use `var(--color-warn-500)`), red for `failed`. Each pill carries `aria-label` with the status text — never color-only.

**A11y:**
- `<caption class="sr-only">` describes the table content ("Extrato de pagamentos da rede no período selecionado.").
- Each `<th scope="col">` declared explicitly.
- Status column header reads "Status" via `aria-label` (the visible text is "·" — used as a visual separator, but SRs hear the proper label).
- Sort/filter changes announce via `aria-live="polite"` on the row count line ("Mostrando 1–8 de 42 lançamentos").
- Numeric column uses `font-feature-settings: 'tnum'` — visual alignment, not a11y, but it prevents reflow when filtering.

---

## 6. `<Pagination />` — numbered + chevrons (LIGHT)

**Purpose.** Replaces the React-Bootstrap `<Pagination>` block at the bottom of `StatementPart.tsx`. Numbered buttons + prev/next chevrons. Active page = filled orange. Others = transparent with `hover:bg-neutral-100`.

**Composition (shadcn primitives):**
- shadcn does not ship a Pagination primitive in v0; use the documented composition: a `<nav aria-label>` containing `<button>` elements styled via the `Button` recipe.
- `lucide-react` `ChevronLeft` / `ChevronRight` for the chevrons.

**Structure:**
- Wrapper `<nav class="pager" aria-label="Paginação do extrato">`.
- Buttons are `min-w-10 h-10`. The page numbers + chevrons share the `pager button` class set.
- Active page: `bg-orange-500 text-white shadow-glow-md/2` (smaller glow than the CTA).
- Disabled prev/next: `text-graphite-300 cursor-not-allowed` + `aria-disabled="true"`.
- Ellipsis: `<span aria-hidden="true">…</span>` (decorative).

**Props:**
```ts
interface PaginationProps {
  currentPage: number;       // 1-indexed
  pageCount: number;
  onChange: (page: number) => void;
  /** Optional: localized labels for prev/next. */
  prevLabel?: string;
  nextLabel?: string;
  /** Hide ellipses when pageCount ≤ 7 — defaults to true. */
  smartCollapse?: boolean;
}
```

The page-number sequence to render (with `smartCollapse: true`):
- always `1`, `pageCount`
- always `currentPage − 1`, `currentPage`, `currentPage + 1`
- ellipsis whenever there's a gap > 1

**Breakpoints:**
- `< sm`: collapse to chevrons + active page only (no number neighbors). Always show prev / current / next.
- `≥ sm`: full sequence as above.

**States:**
- **Idle:** transparent buttons.
- **Hover:** `bg-neutral-100` (active button keeps its orange — never overridden on hover).
- **Active:** orange fill + small glow; `aria-current="page"`.
- **Disabled (boundary):** prev disabled at page 1, next disabled at `pageCount`.

**A11y:**
- `<nav aria-label="Paginação do extrato">` wraps the controls.
- Each button has `aria-label="Página N"` (or `aria-label="Página anterior"` / `aria-label="Próxima página"`).
- Active button has `aria-current="page"` (NOT `aria-selected` — that's tab semantics).
- Live region next to the pager announces the new page count after a navigation: existing "Mostrando X–Y de Z" already serves this; wrap it in `aria-live="polite"`.

---

## 7. `<MiniFooter />` — condensed footer (DARK, distinct from `<Footer />`)

**Purpose.** Slim, single-row footer for **post-login pages**. Visually clearly the same brand as the home/login footer (dark mesh, orange-accent logo) but compressed to **one horizontal strip**, ~64 px tall. The user explicitly asked for a "rodapé resumido" — this component exists to fulfill that need without forcing the marketing footer onto every signed-in screen.

**Why a separate component?**
- The home/login footer (`<Footer />`) carries marketing weight: 4-column sitemap, social links, tagline, legal links.
- A signed-in dashboard does NOT need a sitemap (the user has the navbar). It only needs a discreet brand presence + copyright + a tiny social row.
- Mixing both into one configurable component would be tempting but bloats props (`variant: "full" | "compact"`), tangles the responsive logic, and dilutes intent. Keep them separate; reuse the same atoms (logo, social icons).

**Composition (shadcn primitives):**
- Plain `<footer role="contentinfo">` — no shadcn primitive needed.
- `mnx-mark mnx-mark--sm` (smaller variant of the home logo lockup, defined alongside the existing atoms).
- Lucide icons for socials (16 px outline, no fill — matches editorial tone).

**Structure:**
- Outer: `mnx-surface-dark bg-mesh-footer text-graphite-300 border-t border-white/5`.
- Inner: `max-w-container px-shell py-6` — vertical padding is 24 px (vs. 80 px on the marketing footer).
- Layout: `flex flex-col sm:flex-row items-center justify-between gap-4`.
  - Left: small wordmark (`mnx-mark--sm`).
  - Center: `© 2026 MonexUp · Todos os direitos reservados`.
  - Right: `<ul>` with 4 social `<a>` icons (32 px touch size — `w-8 h-8` is ABOVE the 24 px visual, with the icon itself 16 px. Verify against the touch-target rule: visually 32 px, padded `p-2` minimum so the hit area reaches ≥ 44 px when combined with adjacent gap. If a stricter audit demands 44, bump to `w-11 h-11`).

**Props:**
```ts
interface MiniFooterProps {
  /** Full year — defaults to new Date().getFullYear(). */
  year?: number;
  /** Localized copyright text (i18n: minifooter_copyright). */
  copyright?: string;
  /** Social links — defaults to the brand's 4 default networks. */
  social?: Array<{
    icon: LucideIcon;
    href: string;
    label: string;        // aria-label, e.g. "Facebook"
  }>;
}
```

**Breakpoints:**
- `< sm`: stack vertically — wordmark, copyright, socials each on their own row, centered.
- `≥ sm`: single row, three regions justified between.

**States:**
- **Idle:** muted gray, dark surface.
- **Hover (link):** `text-graphite-300 → text-orange-400 + bg-white/5` (200 ms).
- **Focus-visible:** standard 3 px orange outline against dark — uses `--ring-offset` from the dark surface (graphite-900) so the ring doesn't disappear on the dark mesh.

**A11y:**
- `<footer role="contentinfo">`.
- Social `<ul aria-label="Redes sociais">` — the list semantic helps SR users scan the icons as a group.
- Every social `<a>` has explicit `aria-label` ("Facebook", "Twitter", "Instagram", "LinkedIn"). SVG `aria-hidden="true"`.
- Color contrast: `text-graphite-300` (#9A9AA3) on graphite-900 = 8.0:1 (AAA pass). Hover orange-400 on graphite-900 = 5.4:1 (AA pass).

---

## shadcn/ui mapping (when migrated)

When the project moves to Vite + Tailwind + shadcn/ui, these primitives replace the bespoke atoms used above:

| Mockup atom                  | shadcn primitive                                             |
| ---------------------------- | ------------------------------------------------------------ |
| `<article class="stat-card">`| `<Card><CardContent>` with the same Tailwind class string    |
| `tab-bar` + `.tab`           | `<Tabs><TabsList><TabsTrigger>`                              |
| `filter-input`               | `<Input>` wrapped with the search icon + custom hover/focus  |
| `filter-chip`                | `<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">` |
| `status-pill`                | `<Badge variant="success">` (custom variant tied to success-50 token) |
| `pager button[aria-current]` | `<Button size="icon" variant="default">` (orange via theme)  |
| `MessageToast`               | `<Toaster>` + `sonner`                                       |

The shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--ring`, etc.) should bind to the same semantic tokens documented in `component-spec.md → shadcn/ui mapping`. No new mapping is required for this delivery.

---

## Loading / empty / error matrix (page-wide)

| Surface          | Loading                                | Empty                                  | Error                                          |
| ---------------- | -------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| DashboardHeader  | 3-line skeleton on greeting + meta     | `User` role: drop role/network meta    | Keeps last good state; toast handles it        |
| KpiCard          | Value/caption skeleton, chip stays     | "—" + `flat` trend pill                | Last value + small `text-error-500` line       |
| BalanceCard      | Skeleton on amounts; sparkline hidden  | "Sem saldo no período" + CTA disabled  | Last value + small `text-error-500` line       |
| Tabs             | n/a                                    | n/a                                    | n/a (no fetch happens here)                    |
| StatementTable   | 6 skeleton rows                        | Centered "Sem lançamentos" + clear-filters link | Last rows + `text-error-500` banner above the table |
| Pagination       | Hidden during loading                  | Hidden when `pageCount === 1`          | Hidden when the table is in error              |
| MiniFooter       | Always visible                         | n/a                                    | n/a                                            |

---

## i18n keys (existing — reuse, do NOT invent)

From `monexup-app/public/locales/{lang}/translation.json`:

| Key                                          | Used by             |
| -------------------------------------------- | ------------------- |
| `dashboard_current_balance`                  | BalanceCard label   |
| `dashboard_amount_released_for_withdrawal`   | BalanceCard sub     |
| `dashboard_withdrawal`                       | BalanceCard CTA     |
| `dashboard_statement`                        | Tab label           |
| `dashboard_orders_tab`                       | Tab label           |
| `dashboard_count_sales`                      | KpiCard 1 label     |
| `dashboard_count_done`                       | KpiCard 1 label     |
| `dashboard_count_customers`                  | KpiCard 2 label     |
| `dashboard_count_added`                      | KpiCard 2 label     |
| `dashboard_count_paid`                       | KpiCard 3 label     |
| `dashboard_count_invoices`                   | KpiCard 3 label     |
| `statement_pay_date` / `statement_network` / `statement_product` / `statement_buyer` / `statement_seller` / `statement_amount` / `statement_paid_at` | StatementTable headers |
| `statement_no_statement_found`               | StatementTable empty|
| `loading`                                    | Skeleton SR fallback|

New keys that may be needed (defer to the i18n owner):
- `dashboard_greeting_morning` / `dashboard_greeting_afternoon` / `dashboard_greeting_evening`
- `dashboard_role_network_manager` / `dashboard_role_seller` / `dashboard_role_user`
- `dashboard_filter` / `dashboard_export`
- `dashboard_balance_live` (the "Ao vivo" pill)
- `dashboard_balance_trend` (e.g. "{{delta}} nos últimos 30 dias")
- `dashboard_search_placeholder` (statement search)
- `pagination_prev` / `pagination_next` / `pagination_page_n`
- `minifooter_copyright`

If the team prefers the literal Portuguese strings in code until the i18n owner ships these keys, that is acceptable for the initial migration — but log a TODO so the strings get keys before any second locale ships.

---

## Accessibility checklist (validate on the React build)

- [ ] All text passes WCAG AA (4.5:1 body, 3:1 large) on its surface.
- [ ] No information conveyed by color alone — status pill, trend pill, balance "Ao vivo" badge all carry text/`aria-label`.
- [ ] Focus-visible ring on every interactive element; 3 px orange outline, 3 px offset against the current surface.
- [ ] Touch targets ≥ 44×44 px (cards: not a target; buttons: ≥ 44; pagination buttons: 40 px visible — bump to 44 if Lighthouse flags).
- [ ] `prefers-reduced-motion: reduce` neutralizes the CTA aura transition, the card shadow transition, and any future skeleton shimmer.
- [ ] Heading order: `h1` (greeting) → `h2` (Movimentações section, sr-only) → `h3` if any KpiCard ever needs a sub-title (currently the value carries the meaning via `aria-labelledby`).
- [ ] Tab key cycles header actions → KPI cards (if `href` set) → BalanceCard CTA → Tabs → filter bar → table rows (if interactive) → pagination → mini-footer socials. No skipped focusables.
- [ ] Lighthouse a11y score ≥ 95 target on `/dashboard`.
- [ ] Screen-reader pass: VoiceOver/NVDA reads the greeting headline, the role/network meta, each KPI's value + label + trend, the balance amounts, the table caption + first row, and the pagination state.

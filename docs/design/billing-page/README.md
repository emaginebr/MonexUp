# BillingPage — `/admin/billing` redesign

Design source: `mockup.html` (self-contained HTML, Tailwind CDN + token shim). The mockup is the pixel contract; this README covers rationale, i18n suggestions, and the handoff notes for `frontend-react-developer`.

**Named visual direction:** editorial-brutalist light surface — same DNA as `OrderSearchPage`, `ProductSearchPage`, `InvoiceDetailPage`. Warm neutral canvas (`bg-mnx-neutral-50`), 20px-radius `auth-card`, 2px orange leading rule on the H1, serif `display-headline`, tabular-nums money column.

## Tokens & rationale (≤10 bullets)

- Reuses the exact status pill mapping from `Pages/InvoiceDetailPage/invoiceHelpers.ts` (`invoiceStatusPill`) — Paid emerald, Sent sky, Pending amber, Overdue orange, Cancelled graphite, Expired rose. No new pill colors; import the helper — do not re-implement it.
- Reuses `invoiceTotal(inv)` from the same helpers file to derive the row's `R$` amount (`total ?? Σ max(0, qty×unitPrice − item.discount) − inv.discount`).
- Dates render with `formatDateTimeShort` (existing helper) trimmed to `dd/MM/yyyy` for the desktop `Vencimento` column; the mobile card can keep the full `dd/MM/yyyy HH:mm` if space allows.
- Card shell = `auth-card p-4 sm:p-6`; inner table shell = `rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white`. Header row `h-11 bg-mnx-neutral-50` with `text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500`. Data rows `h-14`, hover `bg-orange-500/5`. All identical to `OrderSearchPage`.
- Money column uses `mnx-num tabular-nums font-semibold text-graphite-900` with a `<span class="text-graphite-400 font-normal mr-1">R$</span>` currency prefix — matches `OrderSearchRow` and `OrderDetailPage`'s payment card.
- Invoice number is rendered in `font-mono` (JetBrains Mono via `tailwind.config.fontFamily.mono`) to stress its identifier nature, hovering to `text-orange-700` like every other tabular ID link across the admin.
- Overdue rows highlight the `Vencimento` cell in `text-rose-700 font-semibold` in addition to the status pill so screen-readers and colorblind users still get a strong signal (never rely on color alone).
- Cancelled rows strike-through the value (`line-through` + `text-graphite-500`) so the eye immediately skips them when scanning the money column.
- Filter chip uses a custom pill (transparent → `bg-orange-500/10 text-orange-700 ring border-orange-500/30` when active). Renderable as a `<button>` cluster inside a `role="group"` — no new dependency, no `Select` — keeps the toolbar to a single row on md+.
- CTA slot in the page header is intentionally EMPTY — invoices are auto-created by the checkout / ProxyPay pipeline. Preserving the flex slot keeps horizontal balance with sibling admin pages that DO have CTAs (add / new).

## Responsive stacking

- **md+ (≥768 px):** 12-col grid rows as illustrated. Toolbar is a single horizontal row: search (`md:max-w-sm`) on the left, filter chip cluster on the right (`flex-wrap` so it degrades gracefully at mid-widths).
- **<md:** rows collapse to the stacked mobile card block already prototyped. Invoice number + status pill on the top line, buyer name + email underneath, then a two-column `<dl>` with `Vendedor` (manager view only), `Vencimento`, `Valor`. The eye action stays anchored at the top-right.
- **Toolbar mobile:** the filter chips wrap onto their own row underneath the search input. No horizontal scroll — chip count ≤ 5.
- **Sticky column header:** NOT needed for this page — same as sibling pages, pagination bounds the row count (≤ 20/page) so the header stays reachable via scroll.

## Role gating — which columns render

| Column        | NetworkManager / Administrator | Seller | User |
|---------------|:-:|:-:|:-:|
| Nº fatura     | col-span-2 | col-span-3 | (redirect out) |
| Comprador     | col-span-3 | col-span-4 | — |
| Vendedor      | col-span-2 | — | — |
| Vencimento    | col-span-1 | col-span-1 | — |
| Valor         | col-span-2 | col-span-2 | — |
| Status        | col-span-1 | col-span-1 | — |
| Ações         | col-span-1 | col-span-1 | — |
| **Total**     | **12**     | **12**     | — |

The mobile card `<dl>` omits the `Vendedor` row for Seller view (implicit = current session user).

`User` role: this page is a permission redirect to `/dashboard`. If the developer still lands here, render the empty state block from the mockup (icon + title + body) so nothing appears broken.

## Notes for `frontend-react-developer`

### File layout (mirrors `OrderSearchPage`)

```
monexup-app/src/Pages/Admin/BillingPage/
  index.tsx                → shell (state + fetch + role gate + role → columns switch)
  BillingSearchRow.tsx      → single row (accepts a `role` prop for column layout)
```

If the `role` split adds too many conditionals to a single row component, split into `BillingRowManager.tsx` and `BillingRowSeller.tsx` — they share the pill/total/date helpers already exported from `Pages/InvoiceDetailPage/invoiceHelpers.ts`. Prefer sharing over prop-drilling.

### Data source

- **NetworkManager / Administrator:** call the invoice-search endpoint filtered by network + store (no seller filter).
- **Seller:** same endpoint, but filtered by `sellerId = session.userId`. The server must join the invoice → parent order → seller so a Seller only sees invoices whose parent order has `Order.SellerId == session.userId`. If the endpoint doesn't yet accept a `sellerId` filter, request that BE change through `dotnet-senior-developer` before wiring the row.
- The response shape must be equivalent to `MonexUp.DTO.Invoice.InvoiceInfo[]` with a joined `Buyer` and `Seller` DTO for the manager view. Reuse the existing paginated result shape (`invoices`, `pageNum`, `pageCount`) from `orderContext.searchResult` — do not invent a new envelope.

### Lucide icons to import

```ts
import {
  ChevronLeft, ChevronRight, Search, Eye,   // toolbar / row action / pagination
  FileText,                                  // empty-state chip
  Check, Clock, Send, AlertTriangle, XCircle, X,  // status pill icons
} from "lucide-react";
```

Map to `invoiceStatusPill` output:
- Paid → `Check`
- Sent → `Send`
- Pending → `Clock`
- Overdue → `AlertTriangle`
- Cancelled → `XCircle`
- Expired → `X`

Add the same tiny `StatusIcon` switch used in `OrderSearchRow.tsx`; keep it in `BillingSearchRow.tsx`.

### Existing helpers to reuse (do NOT duplicate)

- `Pages/InvoiceDetailPage/invoiceHelpers.ts` → `invoiceStatusPill`, `invoiceTotal`, `formatPrice`, `formatDateTimeShort`, `isValidDate`.
- `Components/ui/skeleton.tsx` → `<Skeleton />`.
- `Contexts/Auth/AuthContext`, `Contexts/Network/NetworkContext` — for the role gate.

### i18n suggestions — `billingPage.*` namespace

The user requested a `billingPage.*` namespace, so DO NOT reuse the existing `invoiceSearchPage.*` keys (see `public/locales/pt/translation.json:664`). Keep the two namespaces disjoint:

```jsonc
"billingPage": {
  "title": "Cobranças",
  "breadcrumb": "Cobranças",
  "searchPlaceholder": "Buscar por número, cliente ou vendedor",
  "searchPlaceholderSeller": "Buscar por número ou cliente",

  "columns": {
    "invoiceNumber": "Nº fatura",
    "buyer": "Comprador",
    "seller": "Vendedor",
    "dueDate": "Vencimento",
    "amount": "Valor",
    "status": "Status",
    "actions": "Ações"
  },

  "filters": {
    "all": "Todas",
    "paid": "Pagas",
    "pending": "Pendentes",
    "overdue": "Vencidas",
    "cancelled": "Canceladas",
    "srLabel": "Filtro por status"
  },

  "empty": {
    "storeTitle": "Nenhuma cobrança emitida",
    "storeBody": "Assim que uma fatura for gerada pelo checkout ou pela ProxyPay para essa rede, ela aparecerá aqui com status, vencimento e valor.",
    "filterTitle": "Nenhuma fatura corresponde ao filtro.",
    "filterBody": "Tente outro termo ou volte para todas.",
    "filterReset": "Todas"
  },

  "actions": {
    "viewDetails": "Ver detalhes"
  },

  "pagination": {
    "previous": "Anterior",
    "next": "Próxima",
    "pageOf": "{{current}} de {{total}}"
  }
}
```

Status labels themselves stay on the shared `orderDetailPage.invoice_status_*` keys already read by `invoiceStatusPill(status, t)` — no duplication.

### Action link target

The eye icon links to `/admin/orders/{orderId}/invoices/{invoiceId}` — matches the route already used in `InvoiceDetailPage`. The `orderId` MUST come from the `InvoiceInfo` payload; make sure the BE join returns it (server-side rejection if missing is safer than a client-side fallback).

### Accessibility

- All rows carry `role="row"` / `role="cell"`, table shell `role="rowgroup"` — mirrors `OrderSearchPage`.
- Search input has explicit `<label>` (visually rendered) + `aria-label` for the sub-caption case.
- Filter chip group wrapped in `role="group" aria-label="{filters.srLabel}"`.
- Eye action has `aria-label` + `title` (both use `billingPage.actions.viewDetails`).
- Overdue emphasis on the date column doubles up the color signal so screen-readers and colorblind users pick it up from weight, not hue alone.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-orange-500` on every interactive element — same as OrderSearchPage.

### What NOT to build

- No manual "new invoice" CTA — the checkout / ProxyPay pipeline owns creation. Leave the header CTA cluster empty.
- No inline status changes / actions on the row — send/pay/cancel already live inside `InvoiceDetailPage`. Row action is view-only.
- No client-side re-implementation of `invoiceStatusPill` — import from `invoiceHelpers.ts`.
- Do NOT introduce a new context. Reuse `InvoiceContext` (or add a `searchByStore(networkId, sellerId?, page)` method to it if missing). If the context change is non-trivial, request it via a scoped skill invocation (`react-arch`) rather than expanding it inline in the page.
- Do NOT overlap with the existing `invoiceSearchPage.*` i18n keys — keep `billingPage.*` disjoint.

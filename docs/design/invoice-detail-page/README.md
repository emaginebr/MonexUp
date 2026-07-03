# InvoiceDetailPage — Design Notes

Route: `/admin/orders/:orderId/invoices/:invoiceId`
Rendered inside `LayoutAdmin`. Mockup does NOT include page chrome.
Deliverable: [`mockup.html`](./mockup.html) — self-contained (Tailwind CDN + token shim). The `<script>` and `<style>` blocks are mock-only and must NOT be copied to the .tsx.

Visual DNA: 1:1 mirror of `Pages/OrderDetailPage/index.tsx` + `Pages/Admin/ProductSearchPage/index.tsx` + `Pages/EditAccountPage/index.tsx`. Nothing new was invented.

---

## Tokens & rationale (≤10)

1. **Surface stack** — `bg-mnx-neutral-50` main → `auth-card` (`bg-white` + `border-mnx-neutral-200` + 20px radius + subtle shadow) for the body card. Same as OrderDetailPage.
2. **Header band** — 2px orange rule (`w-[2px] h-5 rounded-full bg-orange-500`) + `display-headline` (Fraunces) h1 with the invoice number rendered inline as `font-mono` graphite-700 so it reads as data, not title. Breadcrumb `ml-[14px]` to align under the rule, `ChevronRight size={14}` graphite-300 separators.
3. **Section rhythm** — `space-y-8` inside the card. Each section preceded by a `text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500` label (Resumo / Metadados / Itens / Notas). Copied from `OrderDetailPage` section headers.
4. **Status pill mapping** (identical to `invoiceStatusPill` in OrderDetailPage): Paid `emerald-500/10`, Pending `amber-500/10`, Sent `sky-500/10`, Overdue `orange-500/10`, Cancelled `graphite-100`, Expired `rose-500/10`. Method pill uses `orange-500/10` for PIX and `graphite-100` for anything else. All pills 24px tall, `text-[11px] font-semibold ring-1` — same shape as ProductSearchRow.
5. **Meta grid** — 2 `<dl>` cards side-by-side (md+), single column below md. Internal `grid-cols-[9rem_1fr]` gives labels a fixed lane so both cards align. Labels are 11px uppercase graphite-500, values 14px graphite-900. Total row has `border-t border-mnx-neutral-100 pt-3` divider + 15px semibold to echo the OrderDetailPage totals footer.
6. **Items table** — byte-identical shell to OrderDetailPage products (`rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white`, 44px header row on `bg-mnx-neutral-50`, 56px data rows with hover `bg-orange-500/5`). Column ratios `5/2/2/1/2 = 12`. Currency values use `mnx-num tabular-nums` right-aligned with `R$` prefix in graphite-400.
7. **Qtd chip** — reuses the graphite pill (`bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200`) already used for Frequency/Type chips on ProductSearchRow — visual continuity across admin tables.
8. **Totals footer** — placed inside the table shell on a `bg-mnx-neutral-50` band so it reads as part of the invoice, not a separate widget. Subtotal / Desconto / Total stacked right, values in a fixed `w-28` lane so the R$ prefix column-aligns.
9. **Notes block** — full-width `border border-mnx-neutral-200 rounded-xl p-4 bg-mnx-neutral-50`, 11px uppercase label + `text-sm text-graphite-700 whitespace-pre-line leading-relaxed`. Only rendered when `invoice.notes` is truthy.
10. **Skeleton** — shape-for-shape mirror of the 4 sections (strip / 2 dl blocks / 3 items rows / notes) using `.skeleton` (Components/ui/skeleton). Zero layout jump on `loading` flip.

---

## Responsive stacking

- **≥ md (768px)**: header strip flex-wrap; meta grid 2 cols; items table renders as the 12-col grid (`hidden md:!grid`); totals footer right-stacked with `w-28` value lane.
- **< md**: header strip wraps naturally (already flex-wrap); meta grid collapses to 1 col; items table hides the grid rows and shows mobile cards — description + `<dl grid-cols-3>` for Qtd / Preço unit / Subtotal (item.discount dropped since invoice-level discount is shown in the meta card); totals footer stays right-aligned (fits mobile because value lane is only 28 units).
- **< sm (640px)**: the "Voltar" button loses no width — it stays at 36px height (`h-9`) so the header remains one row with `flex-row items-start` per the compact page-header pattern.
- Touch targets: back button 36×min-96px, all buttons 44px+ tap area via padding, meets ≥ 44×44 minimum.

---

## Consumer instructions for `frontend-react-developer`

The page is pure read-only detail — no mutation. Convert the HTML above into TSX. Do **not** add libraries.

### File placement

- Component: `monexup-app/src/Pages/Admin/InvoiceDetailPage/index.tsx`
- Route: register under the existing `LayoutAdmin` block in `App.tsx` as `path="/admin/orders/:orderId/invoices/:invoiceId"`

### Data flow

- URL params: `useParams<{ orderId: string; invoiceId: string }>()` — parse both as `Number`, guard `NaN` → `not_found`.
- Fetch: reuse `OrderContext.listInvoices(orderId)` (already used by `OrderDetailPage`'s `PaymentCard`) and pick the row whose `invoiceId === Number(invoiceId)`. If the context doesn't yet expose a single-invoice getter, add `getInvoiceById(orderId, invoiceId)` in `OrderService` + `OrderContext` — same DTO shape (`InvoiceInfo`).
- Role gate: mirror OrderDetailPage — `NetworkManager | Administrator | Seller | User` allowed; Seller/User must own the parent order (check `order.sellerId === sessionUserId` / `order.userId === sessionUserId` after fetching the order).
- `PageState = "loading" | "ready" | "error" | "not_found" | "not_authorized"` — copy the state machine verbatim.

### Helpers to reuse (already in `OrderDetailPage`)

- `formatDateTimeShort(iso)` → `dd/MM/yyyy HH:mm`
- `isValidDate(iso)` → guards ProxyPay `0001-01-01`
- `invoiceStatusPill(status, t)` → status pill class + label
- `invoiceTotal(inv)` → derives total from items when backend omits it
- `formatPrice(value)` → pt-BR fixed 2 decimals
- Extract these to `Pages/Admin/InvoiceDetailPage/invoiceHelpers.ts` and import from BOTH pages so OrderDetailPage.tsx and InvoiceDetailPage.tsx stay in sync.

### Payment method labels

Add a `paymentMethodLabel(t, code)` helper (Pix / Boleto / Card / …) reading `PaymentMethodEnum` (already imported by `InvoiceInfo`). Only PIX gets the orange pill; the rest use the graphite pill.

### lucide-react icons

- `ArrowLeft` — back button
- `ChevronRight` — breadcrumb separator (size 14)
- `Check` — status Paid
- `Send` — status Sent
- `Clock` — status Pending
- `AlertTriangle` — status Overdue
- `X` — status Cancelled
- `CircleSlash` — status Expired
- `FileText` — optional visual anchor for the notes block if you want a leading icon (not shown in the mockup — keep it out unless a UX review asks for it)

### i18n key suggestions (add under `invoiceDetailPage.*`)

Ship keys in all four locales (`pt/en/es/fr/translation.json`).

```
invoiceDetailPage.title                     "Fatura {{invoiceNumber}}"
invoiceDetailPage.breadcrumb_subscriptions  "Assinaturas"
invoiceDetailPage.breadcrumb_order          "#{{orderId}}"
invoiceDetailPage.breadcrumb_current        "Fatura #{{invoiceId}}"
invoiceDetailPage.back_button               "Voltar"
invoiceDetailPage.section_summary           "Resumo"
invoiceDetailPage.section_meta              "Metadados"
invoiceDetailPage.section_items             "Itens"
invoiceDetailPage.section_notes             "Notas"
invoiceDetailPage.label_paid_at             "Pago em"
invoiceDetailPage.label_due_date            "Vencimento"
invoiceDetailPage.label_method              "Método"
invoiceDetailPage.label_createdAt           "Criada em"
invoiceDetailPage.label_updatedAt           "Atualizada em"
invoiceDetailPage.label_expiresAt           "Expira em"
invoiceDetailPage.label_externalCode        "External code"
invoiceDetailPage.label_status              "Status"
invoiceDetailPage.label_paymentMethod       "Método de pagamento"
invoiceDetailPage.label_discount            "Desconto"
invoiceDetailPage.label_discount_invoice    "Desconto (fatura)"
invoiceDetailPage.label_total               "Total"
invoiceDetailPage.label_subtotal            "Subtotal"
invoiceDetailPage.label_description         "Descrição"
invoiceDetailPage.label_quantity            "Qtd"
invoiceDetailPage.label_unit_price          "Preço unit"
invoiceDetailPage.label_item_discount       "Desc."
invoiceDetailPage.label_item_subtotal       "Subtotal"
invoiceDetailPage.load_error                "Não foi possível carregar a fatura."
invoiceDetailPage.not_found                 "Fatura não encontrada."
invoiceDetailPage.not_authorized            "Você não tem permissão para ver esta fatura."
invoiceDetailPage.payment_method_pix        "PIX"
invoiceDetailPage.payment_method_boleto     "Boleto"
invoiceDetailPage.payment_method_card       "Cartão"
```

Status labels reuse the existing `orderDetailPage.invoice_status_*` keys (Pago / Enviada / Pendente / Vencida / Cancelada / Expirada) — don't duplicate.

### Do not

- Do **not** add a config extension — every class in the mockup already resolves against `monexup-app/tailwind.config.js` + `index.scss` (`auth-card`, `mnx-num`, `display-headline`, `mnx-neutral-*`, `graphite-*`, `orange-*`, `max-w-container`, `px-shell`, `shadow-glow-md`, `duration-fast`).
- Do **not** copy the `<script>` (tailwind.config CDN) or the `<style>` block from the mockup — those are shims that already ship in the app.
- Do **not** render page chrome — `LayoutAdmin` owns the sidebar + NavBar.
- Do **not** add a status-change modal or an edit affordance — the invoice detail is read-only in this iteration (the order still owns status changes via OrderDetailPage's `StatusChangeModal`).

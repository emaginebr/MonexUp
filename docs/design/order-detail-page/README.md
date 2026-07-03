# OrderDetailPage — Design Delivery

Route: `/admin/orders/:orderId` (Admin, inside `LayoutAdmin`).
Sibling patterns mirrored: `Pages/EditAccountPage/index.tsx`,
`Pages/Admin/ProductSearchPage/index.tsx`, `Pages/Admin/ProductSearchPage/ProductSearchRow.tsx`.

## Artifacts

| File                                              | Purpose                                                                                     | Skill of origin       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `mockup.html`                                     | Self-contained HTML mockup: live state + skeleton state + status-pill catalog. Sample data hardcoded (order #42, 3 items). | `ui-ux-pro-max`       |
| `README.md`                                       | This index (artifacts + tokens & rationale + responsive notes).                             | `ui-ux-pro-max`       |

No new tokens introduced. No `.tsx`. No framer-motion. All Tailwind classes
resolve against the existing `monexup-app/tailwind.config.js` +
`monexup-app/src/index.scss`.

## Tokens & rationale — deviations from `ProductSearchRow`

1. Order id in the page title is rendered `font-mono text-graphite-700
   font-normal` next to the display serif headline. The mono weight signals
   "identifier" and keeps the serif reserved for editorial title language —
   the pattern already appears on `EditAccountPage` where the user's real
   name is set with the serif and everything else is Inter.
2. Section headings inside the auth-card use the existing eyebrow style
   (`text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500`),
   the same class ProductSearchPage uses for its table column headers. No
   nested cards — one auth-card surface, hairline dividers.
3. The products table shell is the exact ProductSearchPage shell —
   `rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white`,
   `h-11 bg-mnx-neutral-50` column header, `h-14 border-b border-mnx-neutral-100`
   rows, `hover:bg-orange-500/5`. Column ratio changed to 6/2/2/2 because we
   only carry 4 columns instead of 6, but the visual weights stay identical.
4. Qtd chip reuses the Frequência chip from ProductSearchRow verbatim
   (`bg-graphite-100 text-graphite-700 ring-graphite-200`, `h-[24px] px-2
   rounded-full text-[11px] font-semibold`) plus `mnx-num tabular-nums` for
   the numeric character.
5. Total footer sits inside the same table shell (`border-t
   border-mnx-neutral-200`, `bg-mnx-neutral-50`) so the total feels like the
   sheet's own row, not a floating panel. Same row height (`h-14`), same
   right-align + `mnx-num tabular-nums`.
6. Payment section is `grid grid-cols-1 md:grid-cols-2 gap-4` `<dl>` — no
   inner card. When the invoice hasn't been generated yet, the dd renders
   as `text-sm italic text-graphite-500` with the copy "Ainda não gerado"
   (shown as an HTML comment in the mockup for engineer reference).
7. Header primary CTA is "Mudar status" (bg-orange-500, shadow-glow-md) and
   the secondary is "Voltar" (`border border-mnx-neutral-300` — same
   variant EditAccountPage uses). Both are h-9, matching the established
   header CTA row height across the admin.
8. Status pill on the Resumo strip uses the same 24px chip pattern as
   ProductSearchRow, but the five subscription states expand the icon set:
   Active → Check, Suspended → double-bar pause, Finished → Circle,
   Expired → X, Incoming → Clock (over Circle). All emojis in ring/bg
   pairs already documented in the brief.
9. Skeleton reuses `Components/ui/skeleton.tsx` verbatim (`animate-pulse
   rounded-md`). Row heights match the live tree 1:1 (24px pills, 40px
   avatar, `h-11` header, `h-14` product rows, `h-14` total footer) so
   there is zero layout jump when `loading` flips to `false`.
10. No new colors, no new fonts, no new radii, no new shadow tokens. The
    only design-time decision the engineer needs to make is the icon
    library import for the 5 status variants — all live in `lucide-react`
    which is already a project dep.

## Responsive stacking (md breakpoint)

- **Page header**: identical to ProductSearchPage — button row stays inline
  with the title on all breakpoints via `flex-row items-start
  sm:items-center justify-between`. The title truncates naturally, the
  breadcrumb wraps when there is no room.
- **Resumo strip**: `flex flex-wrap items-center gap-x-4 gap-y-3` — pills
  and text wrap onto multiple lines below `sm`. No hidden data.
- **Comprador**: avatar + name/email stay side-by-side at every width; the
  CPF `<dl>` on the right is `hidden sm:block`. Below `sm` a second `<dl
  grid-cols-2>` renders CPF underneath. Same trick as ProductSearchRow.
- **Produtos**: hard swap at `md`. Above `md` the 12-col grid renders (header
  + rows); below `md` the mobile stacked cards render (mirrors
  ProductSearchRow lines 242–338 verbatim in structure). The Total footer
  uses `grid grid-cols-12` at both breakpoints so it looks correct in both
  worlds — mobile shrinks the label span from `md:col-span-10` to
  `col-span-6`.
- **Pagamento**: `grid-cols-1 md:grid-cols-2`. On mobile the two `<dl>` blocks
  stack vertically, both left-aligned. On desktop the right block flips to
  `md:text-right` so the amount right-aligns against the card edge.

## Consumer notes (for `frontend-react-developer`)

- Convert only the two `<section>` blocks inside the `max-w-container
  mx-auto px-shell` wrapper. The outer `<main class="mnx-surface-light
  bg-mnx-neutral-50 min-h-screen">` is standard LayoutAdmin body wrapper.
- Import `Check`, `Pause`, `Circle`, `X`, `Clock`, `ArrowLeft`, `ChevronRight`,
  `MessageSquareText` (Mudar status) from `lucide-react`.
- Skeleton component is already in `Components/ui/skeleton.tsx`.
- Currency prefix `R$` should come through i18n
  (`t("productSearchPage.currency", "R$")`) to match ProductSearchRow.
- i18n keys to introduce (suggestion, not prescriptive):
  `orderDetailPage.title`, `orderDetailPage.breadcrumb.myNetwork`,
  `orderDetailPage.breadcrumb.orders`, `orderDetailPage.actions.back`,
  `orderDetailPage.actions.changeStatus`, `orderDetailPage.sections.summary`,
  `orderDetailPage.sections.buyer`, `orderDetailPage.sections.products`,
  `orderDetailPage.sections.payment`, `orderDetailPage.labels.id`,
  `orderDetailPage.labels.createdAt`, `orderDetailPage.labels.updatedAt`,
  `orderDetailPage.labels.cpf`, `orderDetailPage.labels.quantity`,
  `orderDetailPage.labels.unitPrice`, `orderDetailPage.labels.subtotal`,
  `orderDetailPage.labels.total`, `orderDetailPage.labels.invoice`,
  `orderDetailPage.labels.totalPaid`, `orderDetailPage.invoiceMissing`,
  `orderDetailPage.status.{active,suspended,finished,expired,incoming}`.
- No new Tailwind config extensions required.

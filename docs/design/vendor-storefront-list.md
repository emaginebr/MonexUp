# Vendor Storefront — Product List (Design Approval)

Design feature: **Public product listing on the vendor storefront**
Route: `/{networkSlug}/store/{sellerSlug}` (e.g. `/teste1/store/rodrigo-landim`)
Owner agent: `ui-ux-pro-max-designer`
Status: **Awaiting approval** — direction must match whatever was picked for the detail page (`vendor-storefront-product.html`).

## What this page is

The storefront index — the landing screen for a vendor's public catalog. Each card in the grid links to the existing product detail page at `/{networkSlug}/store/{sellerSlug}/{productSlug}`. The buyer's journey is: storefront list -> product detail -> CTA -> checkout modal.

## Relationship to the detail page

This list is **not** a new art direction. It is the **same two variations** already approved on `vendor-storefront-product.html`, extended to a grid scenario. All tokens, palette, typography, header, vendor chip, and condensed MonexUp footer are reused **verbatim**. Only the body content changes (grid + pagination + empty state).

| | Variation A — Editorial Premium | Variation B — Vibrant Social |
|---|---|---|
| **Display type (reused)** | Fraunces (variable serif, opsz aware) | Bricolage Grotesque (variable display sans) |
| **Body type (reused)** | Inter 400/500 | Geist 400/500/600 |
| **Palette (reused)** | Cream `#F4F1EA` / warm-black `#1A1812` / terracotta `#8B3A2A` / brass `#B68C4E` | Off-white `#FFF9F0` / ink `#15131F` / purple `#6D28D9` / coral `#FF7849` / yellow `#FFC93C` |
| **Card aspect ratio** | **4 / 5** (taller, magazine feel) | **1 / 1** (square, sticker feel) |
| **Card chrome** | No border, no shadow — image sits on cream, body text below in a tight column | Rounded 24px card with 1px hairline + soft purple shadow, inner image rounded 18px |
| **Title weight on hover** | Color shifts to terracotta `--accent` + 1px hairline overlay appears on media | Card lifts 4px + larger purple glow + border tints purple |
| **Price** | Fraunces 600, 18px, tabular-nums | Bricolage 800, 20px, tabular-nums |
| **Frequency pill** | Outlined hairline pill | Solid ink (#15131F) pill with mint dot |
| **Donation tag** | Outlined square tag (border `--ink`, uppercase, hairlines) | Gradient brand pill (purple -> coral), soft shadow |
| **Pagination style** | Underlined serif numerals (Fraunces 16, 1px rule under current page in terracotta) | Pill-shaped numerals, active page = gradient brand pill |

## Grid breakpoints

Mobile-first; same breakpoints across both variations so the layout grammar reads continuously between detail and list:

- `>= 980px` — **3 columns** (desktop)
- `>= 640px` — **2 columns** (tablet)
- `< 640px` — **1 column** (mobile)

Card gap: editorial uses a larger horizontal whitespace (`clamp(20px, 2.5vw, 32px)`) to keep the magazine air; vibrant uses a tighter gap (`clamp(20px, 3vw, 32px)`) because the cards already carry shadow + radius weight.

On mobile, the title and price/badge **never collapse** — only the grid stacks. Touch targets remain the entire card (>= 44px tall after media).

## Card content (both variations)

Every card is a single `<a>` wrapping the entire content, mapped to:

| Card field | Source (existing model) |
|---|---|
| Image | `StorefrontProductInfo.imageUrl` (square crop in B, 4:5 crop in A) |
| Badge (top-left, optional) | derived: `Edicao limitada`, `Novo`, `Top da semana`, or `Causa`/`Apoio` for donation products |
| Title | `StorefrontProductInfo.name` |
| Price OR Donation tag | if `isOpenDonation(product)` -> render donation tag; else render `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` of `StorefrontProductInfo.price` |
| Frequency pill | derived from `productType` + future recurrence field: `Unico`, `Mensal` |
| `href` | `/{networkSlug}/store/{sellerSlug}/{productSlug}` |

`aria-label` on the `<a>` always combines title + price/donation + frequency so screen readers don't have to crawl through child nodes.

## Pagination

Centralized below the grid in both variations. Controls:

- `Anterior` arrow (disabled on page 1, `aria-disabled="true"` + `pointer-events: none`)
- Numeric pages 1, 2, 3 ... 5 — current page marked `aria-current="page"`
- Ellipsis (`...`) is decorative (`aria-hidden`) and non-interactive
- `Proxima` arrow

Touch target is enforced at `min-width: 44px; height: 44px` per item in both variations. Focus rings reuse the shared `outline: 3px solid currentColor; outline-offset: 3px` rule from the harness.

## Empty state

Rendered when the vendor has zero public products. Both variations keep the **same header** so the brand still introduces itself; only the body changes.

- **Variation A** — Inset block with hairline-bordered circle glyph, terracotta eyebrow, Fraunces headline ("O ateliê está preparando a próxima fornada."), short paragraph, single horizontal rule. No CTA.
- **Variation B** — Soft circular glow glyph (purple/coral gradient), yellow sticker badge "Em breve", Bricolage headline ("Os criadores ainda estão aquecendo a primeira leva."), short paragraph. Future option: subscribe-for-launch CTA — out of scope for this iteration.

Empty state never shows pagination.

## Accessibility (non-negotiables, inherited)

- Contrast >= 4.5:1 for every body text + price on every surface used. Verified manually against the same tokens already approved on the detail page.
- Card focus ring: `outline: 3px solid currentColor` with 3px offset (terracotta in A, brand purple in B).
- Pagination focus ring: same rule, applied per pill/link.
- Touch target >= 44x44px on every pagination link, even on dense mobile rows.
- Donation vs. price is **never** signaled by color alone — donation cards carry a textual tag (`Doacao` / `Apoio` / `Causa`) and a dedicated badge.
- Information about frequency uses both shape (pill) and label text — color is auxiliary.
- `aria-label` on every `<a>` card and every nav control.
- Hover lift in B is small (4px) and instant (`transition: transform .25s ease`) so it does not violate `prefers-reduced-motion` users in any harmful way — no parallax or large translate transforms.

## Files in this delivery

| File | Purpose |
|---|---|
| `docs/design/vendor-storefront-list.html` | Self-contained HTML mockup — 2 variations x 2 states (4 instances total), TOC at top |
| `docs/design/vendor-storefront-list.md` | This document |

## Hand-off

When approved:

1. The chosen variation lives **alongside** the chosen detail-page variation (they must match — same vendor brand reads across both screens).
2. React implementation moves to `frontend-react-developer`. Each grid card becomes a `<Link>` to `/{networkSlug}/store/{sellerSlug}/{productSlug}`. The existing `StorefrontPage` component is the natural host.
3. Tokens stay in the vendor-scope override layer added when the detail page was approved (`.mnx-vendor-editorial` / `.mnx-vendor-vibrant`) — no new tokens needed for the list itself.

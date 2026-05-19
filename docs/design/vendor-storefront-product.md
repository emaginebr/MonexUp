# Vendor Storefront — Product Page (Design Approval)

Design feature: **Public product page on the vendor storefront**
Route: `/{store-slug}/store/{vendor-slug}` (e.g. `/teste1/store/rodrigo-landim`)
Owner agent: `ui-ux-pro-max-designer`
Status: **Awaiting approval** — pick one variation (A or B), then production code goes to `frontend-react-developer`.

## What this page is

The public product detail page on a vendor's storefront. It's the screen a buyer lands on after clicking a product from the storefront grid (the existing `StorefrontPage`). It hosts: hero gallery, product description, price (fixed or open-amount), frequency, payment method (Boleto / PIX / Card) and a single primary CTA (Comprar / Doar).

## Why this page must look different from the MonexUp admin

The admin product list and dashboard use the **Editorial Brutalist · Dark/Light Split** system (see `home-redesign.html`, `tokens.css`). That system is intentionally bold and MonexUp-branded — it's the operator's environment.

This page is the **buyer's** environment. The brand that should win attention is the **vendor's**, not MonexUp's. So the page borrows the discipline of the MonexUp design system (typography rhythm, spacing scale, contrast minimums, focus rings) but exposes a completely different visual surface where the store's identity (logo, color, voice) is the protagonist. MonexUp is reduced to one line in a condensed dark footer.

## Two art directions

| | Variation A — Editorial Premium | Variation B — Vibrant Social |
|---|---|---|
| **Vibe** | Aēsop · Apple · Stripe Atlas · long-form magazine | GoFundMe · Patreon · Kickstarter · creator economy |
| **Best for** | Artisanal goods, physical products, services with a curated feel, premium pricing | Digital products, courses, mentorships, community causes, recurring donations |
| **Display type** | `Fraunces` (variable serif, optical-size aware) — italics for accent | `Bricolage Grotesque` (variable display sans, tight tracking) |
| **Body type** | `Inter` 400/500 | `Geist` 400/500/600 |
| **Palette** | Cream `#F4F1EA` · warm-black `#1A1812` · terracotta `#8B3A2A` · brass `#B68C4E` | Off-white `#FFF9F0` · ink `#15131F` · purple `#6D28D9` · coral `#FF7849` · yellow `#FFC93C` |
| **Shapes** | Square edges, 1px rules, no shadows on surfaces, asymmetric magazine gallery | Rounded 18–28px corners, soft purple glows, sticker-style floating badges, info card with shadow |
| **CTA** | Black rectangle, hover → terracotta fill | Gradient pill, soft purple glow, hover lift |
| **Density** | Generous whitespace, single-column info, vertical rhythm | Compact info card, social-proof meta row (rating · students · duration), urgency eyebrow |
| **Tone of voice** | Curatorial, descriptive ("Peça única torneada manualmente em argila local") | Direct, action-oriented ("Doar R$ 100,00 · 2 bolsas") |

Both variations meet the same **non-negotiables** from `ui-ux-pro-max`:

- Contrast ≥ 4.5:1 on body text against every surface used.
- Every interactive control has a min touch target of 44×44px (CTAs are 60–64px tall).
- Focus rings are visible on all controls (`outline: 3px solid currentColor` with 3px offset).
- Information is never conveyed by color alone — the selected payment option uses border + dot indicator + `aria-checked`, not just a color swap.
- `prefers-reduced-motion` disables the live-pulse dot in Variation B.
- Inputs use `inputmode="decimal"` for mobile, with the BRL prefix outside the input value so the number column stays tabular.
- All gallery thumbnails are real `<button>`s with `aria-label`, not divs.

## States shown in the mockup

Each variation is rendered twice in the same HTML so reviewers can compare side by side:

1. **State 1** — fixed-price product, **PIX** selected, CTA reads **"Comprar"** (or "Comprar com PIX" / "Comprar agora com PIX").
2. **State 2** — open-amount donation, **Cartão** selected, CTA reads **"Doar"** (or "Doar R$ X no cartão").

The selected payment option flips visual state via `aria-checked="true"` — no JS needed in the mockup.

## Layout

- **Single product per page.** No related-products carousel in this iteration — keep the conversion path tight.
- **Mobile-first.** At < 980px the gallery stacks above the info column. At < 520px the 3-up payment grid stacks to 1 column.
- **Vendor identification** sits inside a small chip next to the store header — it's secondary; the store name and tagline win the hierarchy.
- **Gallery** is one hero + 3 thumbs. Variation A uses an asymmetric 6-column magazine grid; Variation B uses a centered hero card + 4 rounded thumbnail buttons below.
- **MonexUp footer** is a single condensed dark strip with the orange MonexUp mark, "Powered by MonexUp", and two legal links. No marketing nav.

## Data binding (when this becomes React)

The mockup uses placeholder values that map to existing types in `monexup-app/src/Pages/StorefrontPage/types.ts`:

| Mockup field | Source (existing model) |
|---|---|
| Store name | `NetworkContext.network.name` |
| Store tagline | `NetworkContext.network.description` (or new field) |
| Store logo | `NetworkContext.network.logoUrl` (or first letter fallback) |
| Vendor chip name | `NetworkContext.seller.user.name` |
| Vendor avatar | initials from seller name |
| Product title | `StorefrontProductInfo.name` |
| Product description | `StorefrontProductInfo.description` |
| Gallery | `StorefrontProductInfo.imageUrl` + future `images[]` |
| Fixed price | `StorefrontProductInfo.price` (BRL via `Intl.NumberFormat`) |
| Open-amount input | shown only when `isOpenDonation(product)` → `DonationModeEnum.Open` |
| Min amount | `StorefrontProductInfo.minimumDonationAmount` (validate ≥ this) |
| Frequency pill | derive from `productType` + future recurrence field |
| CTA label | `isDonation(product)` → `t("btn_donate")` else `t("btn_buy")` |
| Payment selected | new local state, initial value = `PIX` |

## What is intentionally NOT in scope here

- The PIX/Card checkout modal flow (already handled by `PixModalContainer` and the existing payment context). The mockup ends at the CTA press.
- Multi-product cart. The vendor storefront treats each product as an independent landing.
- Vendor profile page (separate route; this is the *product* page).
- Tokens file. Each variation is self-contained — tokens travel with the chosen direction once approved.

## How to use this delivery

1. Open `vendor-storefront-product.html` in a browser. Resize the window to verify mobile breakpoints (try 375px, 768px, 1280px).
2. Compare Variation A and Variation B side by side. Use the in-page TOC to jump between them.
3. Approve one variation (or request a hybrid).
4. After approval, the chosen variation's tokens get added to `tokens.css` as a vendor-scope override layer (`.mnx-vendor-editorial` / `.mnx-vendor-vibrant`), and the page itself moves to `frontend-react-developer` for a `.tsx` build in the React app.

## Files in this delivery

| File | Purpose |
|---|---|
| `docs/design/vendor-storefront-product.html` | Self-contained HTML mockup with both variations and both states (4 instances total) |
| `docs/design/vendor-storefront-product.md` | This document |

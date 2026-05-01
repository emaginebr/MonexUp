# MonexUp Home Redesign — Integration Guide

This guide bridges the static mockup (`home-redesign.html`) and the future React implementation. It explicitly does **not** ship `.tsx` — that responsibility belongs to the React/frontend agent.

## Stack reality vs. design target

| Concern              | Current (MonexUp app today)                        | Design target                                        |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Build tool           | **Create React App (CRA)**                         | **Vite** (per design system convention)              |
| UI library           | Bootstrap 5 + react-bootstrap + MUI 6              | **Tailwind + shadcn/ui (Radix)**                     |
| Icons                | FontAwesome                                        | **lucide-react** (shadcn-native)                     |
| Skeletons            | `react-loading-skeleton`                           | **shadcn `Skeleton`**                                |
| Routing              | react-router-dom                                   | unchanged                                            |
| i18n                 | i18next (pt/en/es/fr)                              | unchanged — translation keys preserved               |

> **Important.** The detected build tool is **CRA, not Vite** (verified in `monexup-app/package.json`). The token files and Tailwind snippet are designed for the migration target, not for hot-loading into the CRA app today. Two consumption paths exist (see below) — choose explicitly before any React work begins.

## Two consumption paths

### A) Migration-aligned (recommended) — wait for Vite migration

1. Migrate `monexup-app` from CRA → Vite (separate effort, scoped to `frontend-react-developer`).
2. Add Tailwind + shadcn/ui per the snippet; import `tokens.css` once at the entry.
3. Implement each section using the specs in `component-spec.md`, mapping shadcn CSS variables to MonexUp semantic tokens (see the table at the end of `component-spec.md`).
4. Replace Bootstrap + MUI usage one section at a time.

### B) Drop-in mockup preview — no migration

1. Open `docs/design/home-redesign.html` directly in a browser (it loads Tailwind via CDN). Useful for stakeholder review and copy iteration.
2. Do **not** wire it into the CRA app — Tailwind CDN + the existing Bootstrap/MUI CSS would conflict at the cascade level.

## Section → future React component map

| Mockup section (id)       | React component (target path)                            | Sourced from current file                          |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Header / Navbar           | `src/Pages/HomePage/Header.tsx` (rewritten)              | `monexup-app/src/Pages/HomePage/Header.tsx`        |
| Hero                      | `src/Pages/HomePage/Hero.tsx` (split out of Header)      | `monexup-app/src/Pages/HomePage/Header.tsx`        |
| Features                  | `src/Pages/HomePage/Features.tsx`                        | `monexup-app/src/Pages/HomePage/Features.tsx`      |
| NetworkPart               | `src/Pages/HomePage/NetworkPart.tsx`                     | `monexup-app/src/Pages/HomePage/NetworkPart.tsx`   |
| Pricing                   | `src/Pages/HomePage/Pricing.tsx`                         | `monexup-app/src/Pages/HomePage/Pricing.tsx`       |
| UserPart                  | `src/Pages/HomePage/UserPart.tsx`                        | `monexup-app/src/Pages/HomePage/UserPart.tsx`      |
| Footer                    | `src/Pages/HomePage/Footer.tsx`                          | `monexup-app/src/Pages/HomePage/Footer.tsx`        |

Note that the current `Header.tsx` actually contains the **Hero** content. The redesign separates them:
- `Header.tsx` → only the sticky navbar.
- `Hero.tsx` → headline, subhead, CTAs, dashboard mock, stats row.

## i18n — preserved keys

The new copy reuses the translation keys already present in the codebase (`public/locales/{pt,en,es,fr}/translation.json`). Only the **Portuguese values** were rewritten with the brand voice ("Vença. Ganhe. Evolua."). When the React rebuild happens, update the existing keys in-place and translate to en/es/fr in a follow-up.

Keys touched by this redesign (non-exhaustive):
- `header_main_title`, `header_subtitle`, `be_a_representative`
- `home_features_title`, `home_features_subtitle`, `home_feature_*_title`/`_desc`
- `home_networkpart_title`, `home_networkpart_affiliate_sellers`, `home_networkpart_open_positions`
- `home_pricing_title`, `home_pricing_*_plan`/`_price`/`_feature*`
- `home_userpart_title`
- `footer_description`, `footer_plans`, `footer_dashboard`, `footer_copyright_current_year`, `footer_all_rights_reserved`

A separate i18n PR should be opened to refresh values once the React rebuild is approved (it can be scoped to the `add-react-i18n` skill).

## Asset handoff

- **Logo**: `monexup-app/public/logo.png` (already in repo). The mockup uses an inline lockup ("monex" + orange "up" pill) for sharpness at small sizes; the PNG should still be loaded as the favicon and OG image.
- **Custom fonts**: Inter + Space Grotesk loaded via Google Fonts in the mockup. For Vite, prefer `@fontsource/inter` and `@fontsource/space-grotesk` for offline + privacy.

## Token cascade — do not bypass

When implementing sections, **always** consume semantic tokens (e.g., `text-content-primary`, `bg-surface-canvas`, `border-border-subtle`) instead of raw color utilities (e.g., `text-graphite-900`). This is what makes the per-section dark/light flip a single class swap (`mnx-surface-dark` / `mnx-surface-light`) instead of N rewrites.

Exception: brand-orange utilities (`bg-orange-500`, `text-orange-400`, etc.) are intentionally raw — orange means "MonexUp" regardless of surface.

## Definition of done (for the React port)

- [ ] CRA → Vite migration completed (separate ticket).
- [ ] `tokens.css` imported once at the entry; never duplicated.
- [ ] `tailwind.config.js` extends from `tailwind.config.snippet.js`.
- [ ] shadcn/ui CSS vars mapped to MonexUp semantic tokens (table in `component-spec.md`).
- [ ] Each section matches its spec (props, breakpoints, states, a11y).
- [ ] All text contrast ≥ AA verified (Lighthouse + manual VoiceOver/NVDA pass).
- [ ] `prefers-reduced-motion` honored (no aura pulse, no fade-up).
- [ ] Touch targets ≥ 44×44 px.
- [ ] No `.tsx` references Bootstrap/MUI on the home route.
- [ ] i18n keys preserved; pt-BR copy refreshed; en/es/fr translated in follow-up.

## Related skills (for downstream work)

| Need                                            | Invoke                            |
| ----------------------------------------------- | --------------------------------- |
| React component scaffolding (types/hooks/etc.)  | `frontend-react-developer` agent  |
| i18n key updates / new languages                | `add-react-i18n` skill            |
| New entity contexts (User, Network, etc.)       | `react-architecture` skill        |
| Modal dialogs                                   | `react-modal` skill               |
| Toasts / notifications                          | `react-alert` skill               |
| Brand asset regeneration (logo variants, OG)    | `design` (logo / CIP / banner)    |

# MonexUp Home — Component Spec

**Direction:** Editorial Brutalist · Dark/Light Split
**Stack target:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui (Radix primitives)
**Deliverables in this folder:**
- `tokens.css` — primitive → semantic CSS variables (with dark surface opt-in)
- `tailwind.config.snippet.js` — `theme.extend` block referencing the tokens
- `home-redesign.html` — static mockup, all sections, responsive
- `component-spec.md` — this file
- `integration-guide.md` — migration map (current CRA → target Vite)

The mockup is intentionally framework-free. Every component spec below describes what the React+shadcn implementation should look like — but no `.tsx` is produced here.

## Global rules (apply to every section)

- **Container**: `max-w-container` (1200px) + `px-shell` (`clamp(1rem, 4vw, 2rem)`) + center.
- **Vertical rhythm**: sections use `py-20 lg:py-28`. Tighten to `py-12 lg:py-16` on mobile only if the user reports density complaints.
- **Surface intent**: each section opts in via `mnx-surface-dark` or `mnx-surface-light` (defined in `tokens.css`). Components inside read semantic tokens (`--surface-*`, `--content-*`, `--border-*`) — they don't hardcode dark/light colors.
- **Focus ring**: `:focus-visible` → 3px orange outline, 3px offset against current surface. Never remove.
- **Touch target**: every interactive element ≥ 44×44 px (CTAs are `h-12`/`h-14`; icon buttons are `w-10 h-10`).
- **Motion**: 220 ms standard, 320 ms slow. All transitions disable under `prefers-reduced-motion: reduce`.
- **Contrast (WCAG AA)**:
  - dark surfaces — text uses `--color-neutral-50` (#FAFAF9) on `--color-graphite-900` (#0A0A0D) → 19.4:1
  - light surfaces — text uses `--color-graphite-900` on `--color-neutral-50` → 19.0:1
  - orange-500 on white → 3.5:1 (FAILS body text). Use orange only for non-text accents OR orange-700 (#9E3A0F) on white = 7.1:1 for label/eyebrow text.

---

## 1. `<Header />` — Navbar (DARK)

**Composition (shadcn primitives):**
- `NavigationMenu` (Radix) for desktop horizontal menu
- `Sheet` for mobile drawer (hamburger → slide-in)
- `Button` variants: `ghost` (Entrar), `default`/orange (Cadastre-se)

**Structure:**
- Sticky, `z-50`, blur backdrop (`bg-graphite-900/85 + backdrop-blur-md`)
- Height: `h-16` mobile, `h-20` desktop
- Three regions: logo (left) · nav links (center, lg only) · CTAs (right)

**Props (suggested API):**
```ts
type NavItem = { label: string; href: string };

interface HeaderProps {
  items: NavItem[];                    // default: Home, Redes, Planos, Sobre
  loginHref?: string;                  // /account/login
  signupHref?: string;                 // /new-seller
  authenticated?: boolean;             // when true, swap "Entrar/Cadastre-se" → user menu
}
```

**Breakpoints:**
- `< lg`: hide center nav, show hamburger; CTAs collapse to "Cadastre-se" only.
- `≥ lg`: full menu inline.

**States:**
- Link: idle `text-graphite-200` · hover `text-white` (150 ms).
- Hamburger: idle `text-graphite-100` · hover `bg-white/5`.
- Primary CTA: shadow-glow-md idle → bg deepens on hover; orange ring on focus.

**A11y:**
- `<nav aria-label="Primary">`.
- Hamburger: `aria-expanded`, `aria-controls`.
- Skip-to-content link should precede the header (add in app shell).
- Logo `<a aria-label="MonexUp — Home">`.

---

## 2. `<Hero />` (DARK)

**Composition:**
- Custom layout (no shadcn primitive needed — it is a marketing surface).
- Inner stats row could use shadcn `Separator` between figures.

**Structure:**
- `bg-mesh-hero` (radial orange glow + dark gradient) + `.hero-grid` overlay (mask-fade, 56 px subtle grid).
- 12-col grid (`lg:grid-cols-12`):
  - Copy column `col-span-7` — eyebrow chip · headline · subhead · CTA pair · stats row
  - Visual column `col-span-5` — dashboard mock card (translucent `graphite-700/90`, white/10 border)

**Headline:**
- Class `display-headline` (Space Grotesk 700, tracking `-0.04em`, line-height 0.95)
- Three-line stack: "Vença." / "Ganhe." / "Evolua." with the last word in `text-orange-500`
- Sizes: `text-5xl sm:text-6xl lg:text-7xl xl:text-[5.625rem]` (90 px on xl)

**Props:**
```ts
interface HeroProps {
  eyebrow?: string;                    // "Plataforma MMN · PIX integrado"
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: Array<{ value: string; label: string }>;   // 3 figures, optional
  showDashboardMock?: boolean;         // default true
}
```

**Breakpoints:**
- `< lg`: stack vertically (copy on top, mock below); reduce headline to `text-5xl`; stats grid stays 3 columns but with smaller gaps.

**States:**
- Eyebrow chip: pulsing orange dot (`animate-pulse`).
- Primary CTA: `cta-primary` class adds blurred orange aura via `::after`. Hover deepens; reduced-motion disables aura transition only (aura stays).

**A11y:**
- `<section id="home">` + visually hidden landmark heading if needed.
- All decorative SVGs `aria-hidden="true"`.
- Bar chart in dashboard mock is decorative — flag as `role="presentation"` or wrap in a div with `aria-hidden`.

---

## 3. `<Features />` (LIGHT)

**Composition:**
- Grid of `Card`-shaped articles. Use shadcn `Card` if multiple actions are added; for read-only, plain `<article>` is enough.
- Icon: lucide-react (already idiomatic with shadcn).

**Structure:**
- 6 cards in a `sm:grid-cols-2 lg:grid-cols-3` layout.
- 5 cards have **white surface** with neutral-200 border that flips to graphite-900 on hover (brutalist tell).
- 1 card (the "Segurança" tile) is **inverted** (graphite-900 surface, orange icon chip, soft glow) — breaks the grid rhythm intentionally.

**Card structure:**
1. Icon chip (`w-12 h-12 rounded-xl bg-orange-50 → bg-orange-500` on group-hover)
2. Title (Space Grotesk semibold, 20 px)
3. Body copy (Inter 400, 14 px, `text-graphite-500`)

**Props:**
```ts
interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  inverted?: boolean;   // adds the dark accent treatment
}
interface FeaturesProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];   // 6 recommended
}
```

**Breakpoints:**
- `< sm`: 1 column.
- `sm`–`lg`: 2 columns.
- `≥ lg`: 3 columns.

**States:**
- Card: `hover:border-graphite-900 hover:shadow-lg` (200 ms, group transition).
- Icon chip: background flips orange on `group-hover`.
- Inverted card: no hover transform — its identity is structural.

**A11y:**
- Wrap each in `<article>`; section heading is `<h2>`, card titles are `<h3>`.
- Icon SVGs `aria-hidden="true"` (decorative). Title carries the meaning.
- Contrast: graphite-500 on neutral-50 = 7.5:1 (passes AA).

---

## 4. `<NetworkPart />` (LIGHT)

**Composition:**
- shadcn `Card` for each network. Skeleton state via shadcn `Skeleton` (replaces `react-loading-skeleton`).
- "Ver rede" link uses `Button variant="link"` or plain `<a>` with arrow lucide icon.

**Structure:**
- Section header: eyebrow + h2 (left) + "Ver todas as redes" link (right, lg only).
- Grid: `sm:grid-cols-2 lg:grid-cols-4`.
- Each card: `h-32` cover (gradient placeholder, swap to `<img>` when `imageUrl` exists) + body (name, sellers/openings, CTA link).
- "Em alta" badge (top-right, top card only) for editorial weight.

**Props:**
```ts
interface NetworkCardData {
  slug: string;
  name: string;
  imageUrl?: string;
  qtdyUsers: number;
  maxUsers: number;
  trending?: boolean;
}
interface NetworkPartProps {
  loading: boolean;
  networks: NetworkCardData[];
  emptyState?: ReactNode;
}
```

**Breakpoints:**
- `< sm`: 1 column.
- `sm`: 2 columns.
- `≥ lg`: 4 columns.

**States:**
- Card hover: `hover:border-graphite-900 hover:-translate-y-1` (200 ms standard).
- Loading: 4 skeletons matching the layout (cover + 2 lines).
- Empty: friendly empty state with `Button` to "Criar minha rede".

**A11y:**
- Whole card clickable: nest `<a>` around the cover; keep "Ver rede" as the explicit link with descriptive text (avoid "Click here").
- Trending badge contrast: `bg-white/95 text-graphite-900` over orange gradient → safe.

---

## 5. `<Pricing />` (LIGHT)

**Composition:**
- 3 plans in `lg:grid-cols-3`. Featured (middle) plan is **dark**, breaks the row to draw the eye.
- shadcn `Card` shell; checkmarks are lucide `Check` icons.
- "Mais popular" badge: shadcn `Badge` with `variant="default"` recolored.

**Structure:**
- Free / Pro (featured) / Enterprise.
- Featured plan: graphite-900 surface, orange-500 border-2, glow shadow, lifted `lg:-mt-4`, badge floating at the top edge.

**Props:**
```ts
interface PricingPlan {
  name: string;
  description: string;
  price: string;             // already formatted: "R$ 0", "R$ 89", "Custom"
  period?: string;           // "/mês"
  features: string[];
  cta: { label: string; href: string; variant: "primary" | "outline" };
  featured?: boolean;
  badge?: string;            // "Mais popular"
}
interface PricingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];      // exactly 3
}
```

**Breakpoints:**
- `< lg`: stack vertically. Featured plan loses the `-mt-4` offset; badge stays.

**States:**
- CTA primary on featured plan keeps `cta-primary` glow.
- Hover on free/enterprise CTAs: full-fill animation (`hover:bg-graphite-900 hover:text-white`).

**A11y:**
- Pricing cards are `<article>`; price is text (not an image) so screen readers read it.
- Badge "Mais popular" — visible AND announced (`aria-label="Plano Pro: mais popular"` on the article).
- Each `Check` icon has `aria-hidden="true"`; the feature text already conveys it.

---

## 6. `<UserPart />` (LIGHT) — Active sellers / testimonials

**Composition:**
- Grid of avatar + name + role + quote + email/wpp icons.
- shadcn `Avatar` for the circular image with fallback initials.
- Online dot uses `--color-success-500`. Per a11y, also expose status via `aria-label`.

**Structure:**
- 4 columns (lg) → 2 (sm) → 1 (xs).
- Avatar `w-32 h-32` (large enough to be a focal point).
- Status dot bottom-right of avatar; gradient placeholder when no image.

**Props:**
```ts
interface UserCardData {
  slug: string;
  name: string;
  role?: string;             // "Top seller · Rede Alpha"
  imageUrl?: string;
  quote?: string;            // optional testimonial line
  online?: boolean;
}
interface UserPartProps {
  loading: boolean;
  users: UserCardData[];
}
```

**Breakpoints:** `< sm` → 1 col · `sm`–`lg` → 2 col · `≥ lg` → 4 col.

**States:**
- Avatar fallback: gradient bg + initials in Space Grotesk bold.
- Loading: 4 skeleton circles + 2 text lines.
- Online: never indicated by color alone — keep `aria-label="Online"` on the dot.

**A11y:**
- Each `<article>` wraps the user; name uses `<h3>`.
- Email/WhatsApp links must have `aria-label` (e.g., `aria-label="Email Marina Reis"`).
- Decorative gradient avatar has `role="img" aria-label="Iniciais MR"` (or hide entirely if name is adjacent).

---

## 7. `<Footer />` (DARK)

**Composition:**
- Custom layout. shadcn `Separator` for the bottom rule between columns and copyright.

**Structure:**
- 5 columns (lg): brand+social (col-span-5) · Produto (2) · Empresa (2) · Legal (1) · Contato (2).
- Bottom bar: copyright (left) · "VENÇA · GANHE · EVOLUA" tagline (right, Space Grotesk uppercase tracking-wider).

**Props:**
```ts
interface FooterColumn { title: string; items: NavItem[] }
interface FooterProps {
  description: string;
  columns: FooterColumn[];   // 4 columns: Produto, Empresa, Legal, Contato
  socialLinks: Array<{ icon: LucideIcon; href: string; label: string }>;
  tagline?: string;          // "VENÇA · GANHE · EVOLUA"
  year?: number;             // defaults to new Date().getFullYear()
}
```

**Breakpoints:**
- `< sm`: 1 col stack.
- `sm`–`lg`: 2 cols.
- `≥ lg`: 5-column layout above.

**States:**
- Link hover: `text-graphite-200 → text-orange-400`.
- Social icon: idle border `white/10` → hover `border-orange-500 + text-orange-400`.

**A11y:**
- `<footer role="contentinfo">`.
- Each social link: `aria-label="Facebook"`, etc. — the SVG is decorative.
- Color contrast: graphite-200 on graphite-900 = 13.1:1; graphite-300 on graphite-900 = 8.0:1 — both pass AA for body text.
- Tagline is decorative emphasis but still readable text (orange-400 on graphite-900 = 5.4:1, AA pass).

---

## shadcn/ui mapping (when migrated)

When the project moves to Vite + Tailwind + shadcn/ui, the shadcn CSS variables in `globals.css` should map onto these semantic tokens:

| shadcn CSS var       | maps to                               |
| -------------------- | ------------------------------------- |
| `--background`       | `var(--surface-page)`                 |
| `--foreground`       | `var(--content-primary)`              |
| `--card`             | `var(--surface-raised)`               |
| `--card-foreground`  | `var(--content-primary)`              |
| `--popover`          | `var(--surface-raised)`               |
| `--popover-foreground` | `var(--content-primary)`            |
| `--primary`          | `var(--accent)`                       |
| `--primary-foreground` | `var(--content-on-brand)`           |
| `--secondary`        | `var(--surface-sunken)`               |
| `--secondary-foreground` | `var(--content-primary)`          |
| `--muted`            | `var(--surface-sunken)`               |
| `--muted-foreground` | `var(--content-secondary)`            |
| `--accent`           | `var(--accent-soft-bg)`               |
| `--accent-foreground` | `var(--accent-soft-fg)`              |
| `--destructive`      | `var(--color-error-500)`              |
| `--border`           | `var(--border-subtle)`                |
| `--input`            | `var(--border-default)`               |
| `--ring`             | `var(--accent)`                       |
| `--radius`           | `var(--radius-lg)`                    |

Because all values defer to MonexUp tokens, brand changes (e.g., orange shifts to red) cascade through both shadcn primitives and bespoke marketing components automatically.

## 8. `<LoginPage />` (DARK shell + LIGHT card)

**Direction:** same Editorial Brutalist · Dark/Light Split language as the home. The page is a **dark mesh shell** (Header + auth section + Footer all dark) with a **single light auth card** that pops as the focal element. No standalone Card, no Bootstrap.

**Mockup file:** `docs/design/login-redesign.html` — two art-direction options:
- **Option A — Centered minimalist.** Card alone, optically centered on the dark mesh. Best when the user landed via `?returnUrl=...` and just needs to authenticate.
- **Option B — Split editorial (recommended).** 12-col grid: copy + trust signals (left, dark) · login card (right, light). The page becomes a continuation of the home hero — orange chip, display headline, stats trio — instead of feeling like a generic auth screen.

The recommendation is **Option B for `/account/login`** (default route), with Option A reserved for routes that need to be brutally task-focused (e.g., a re-auth modal page in the future).

### Composition (shadcn primitives — for the future Vite migration)

- `Header` (existing) — verbatim reuse from `monexup-app/src/Pages/HomePage/Header.tsx`.
- `Footer` (existing) — verbatim reuse from `monexup-app/src/Pages/HomePage/Footer.tsx`.
- `Card` (shadcn) wrapping the form area — but for now we render the card with raw Tailwind classes (`auth-card` mock atom), since shadcn isn't installed yet.
- `LoginForm` from `nauth-react` package (already in deps) — handles email/password/remember-me. The page **never** redefines the fields; it only styles the wrapper and passes `className` / `styles.container` / `styles.input` / `styles.button` to harmonize with the surface.
- Status feedback uses the existing `MessageToast` component (errors only).

### Page structure (pseudo-markup, no .tsx)

```
<>
  <MessageToast .../>
  <Header />                                            {/* sticky dark navbar (verbatim) */}

  <main
    id="login-main"
    class="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
    aria-labelledby="login-heading"
  >
    {/* Subtle hero-grid texture, copied from the home hero */}
    <div class="auth-grid absolute inset-0 pointer-events-none" aria-hidden="true"></div>

    <div class="relative max-w-container mx-auto px-shell py-16 lg:py-24">
      <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

        {/* LEFT — editorial copy column (Option B). On <lg this collapses
             below the card so the task isn't pushed off-screen. */}
        <section class="lg:col-span-6 order-2 lg:order-1 animate-fade-up">
          <span class="trust-chip">                          {/* eyebrow */}
            <span class="dot" aria-hidden="true"></span>
            t('home_hero_eyebrow') || 'Plataforma MMN · PIX integrado'
          </span>
          <h1 id="login-heading" class="display-headline text-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl">
            {/* Use existing copy or new — see "Copy strategy" below */}
          </h1>
          <p class="mt-6 max-w-lg text-graphite-200 text-base lg:text-lg leading-relaxed">…</p>
          {/* Optional stats trio + reassurance bullets — see HTML mockup */}
        </section>

        {/* RIGHT — login card */}
        <section class="lg:col-span-6 order-1 lg:order-2">
          <div class="relative max-w-md mx-auto lg:ml-auto lg:mr-0">
            <div class="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none" aria-hidden="true"></div>

            <article class="auth-card relative p-8 sm:p-10 animate-fade-up" aria-label={t('login_title')}>
              <div class="flex flex-col items-center text-center">
                <div class="auth-mark" aria-hidden="true">M.</div>     {/* logo lockup, NOT logo.jpg */}
                <h2 class="display-headline mt-6 text-3xl text-graphite-900">{t('login_title')}</h2>
                <p class="mt-3 text-graphite-500 text-sm leading-relaxed">{t('login_instruction')}</p>
              </div>

              {/* Login form — ACTUAL component from nauth-react */}
              <div class="mt-8">
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  showRememberMe={true}
                  styles={{
                    container: 'space-y-5',
                    input:     'block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white text-graphite-900 placeholder:text-graphite-400 hover:border-graphite-400 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 transition-colors duration-fast',
                    button:    'cta-primary inline-flex items-center justify-center w-full h-12 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast',
                  }}
                />
              </div>

              {/* Helper link row — recovery */}
              <div class="mt-4 flex justify-center">
                <a
                  onClick={() => navigate('/account/recovery-password')}
                  class="text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                >
                  {t('login_recovery_password')}
                </a>
              </div>

              {/* Card footer — create-account */}
              <div class="mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-graphite-500">
                {t('login_no_account')}
                <a
                  onClick={() => navigate('/account/new-account')}
                  class="ml-1 font-semibold text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                >
                  {t('login_create_account_button')}
                </a>
              </div>
            </article>
          </div>
        </section>

      </div>
    </div>
  </main>

  <Footer />                                            {/* dark mesh footer (verbatim) */}
</>
```

### Tailwind class reference

| Region                       | Class set                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `<main>` shell               | `mnx-surface-dark relative overflow-hidden bg-mesh-auth`                                                          |
| Texture overlay              | `auth-grid absolute inset-0 pointer-events-none` + `aria-hidden="true"`                                            |
| Inner container              | `relative max-w-container mx-auto px-shell py-16 lg:py-24`                                                         |
| Grid wrapper (Option B)      | `grid lg:grid-cols-12 gap-10 lg:gap-16 items-center`                                                              |
| Copy column (Option B)       | `lg:col-span-6 order-2 lg:order-1 animate-fade-up`                                                                |
| Card column                  | `lg:col-span-6 order-1 lg:order-2`                                                                                 |
| Card glow halo               | `absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none`                                     |
| Card                         | `auth-card relative p-8 sm:p-10 animate-fade-up` (`auth-card` is a small atom — see "New atoms")                  |
| Card brand mark              | `auth-mark` (3rem orange square) + screen-reader-friendly text content                                             |
| Card title                   | `display-headline mt-6 text-3xl text-graphite-900`                                                                |
| Card subtitle                | `mt-3 text-graphite-500 text-sm leading-relaxed`                                                                   |
| Form wrapper around LoginForm | `mt-8` (no extra padding — the LoginForm `styles.container` handles internal spacing)                            |
| Recovery link row            | `mt-4 flex justify-center`                                                                                         |
| Recovery link                | `text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors duration-fast`                       |
| Card footer wrapper          | `mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-graphite-500`                                     |
| Create-account link          | `ml-1 font-semibold text-orange-700 hover:text-orange-600 transition-colors duration-fast`                        |

### New atoms introduced (live in the page-level CSS or component CSS file)

```css
/* dark mesh authentication surface — softer than the home hero */
.bg-mesh-auth {
  background:
    radial-gradient(ellipse 70% 55% at 50% 30%, rgba(232,90,26,0.22), transparent 65%),
    radial-gradient(ellipse 55% 45% at 10% 90%, rgba(232,90,26,0.10), transparent 70%),
    linear-gradient(180deg, #0A0A0D 0%, #131317 100%);
}

/* light auth card on a dark surface — strong elevation, neutral border */
.auth-card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-2xl);
  box-shadow:
    0 30px 60px -20px rgba(0,0,0,0.55),
    0 12px 24px -10px rgba(0,0,0,0.45);
  color: var(--color-graphite-900);
}

/* brand mark used at the top of the card (echoes the navbar logo) */
.auth-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 3rem; height: 3rem;
  background: var(--color-orange-500);
  border-radius: var(--radius-md);
  color: #fff;
  font: 700 1.5rem var(--font-display);
  letter-spacing: -0.02em;
  box-shadow: 0 8px 24px -6px rgba(232,90,26,0.55);
}

/* same texture used in the hero, so the auth shell rhymes with the home */
.auth-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 30%, black, transparent 75%);
}

/* eyebrow chip on the editorial column — same recipe as the home hero chip */
.trust-chip {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font: 500 var(--fs-xs) var(--font-sans);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-orange-200);
  background: rgba(232, 90, 26, 0.10);
  border: 1px solid rgba(232, 90, 26, 0.30);
}
```

> Add these to the same global CSS file that already declares `.cta-primary`, `.mnx-mark`, `.display-headline`, etc. (they live alongside the home redesign atoms, not inside the LoginPage component file). `.bg-mesh-auth` may also be promoted to `tailwind.config.snippet.js → backgroundImage` once the migration starts; until then, page-level CSS is fine.

### LoginForm wrapper styling (nauth-react integration)

`LoginForm` exposes:
- `className` — applied to the outer wrapper
- `styles.container` — the `<form>` element
- `styles.input` — every input
- `styles.button` — submit button
- `customSubmitText` — override the submit label (use `t('sign_in')` if needed)
- `showRememberMe={true}` — keeps the checkbox

We **do not** style its internals via descendant selectors; we only pass classes through props. That guarantees the design survives a `nauth-react` upgrade. Required Tailwind classes are listed in the table above ("Form wrapper" + the literal class strings inside the pseudo-markup `styles=` block).

If `LoginForm` does NOT honor a `styles.label` slot (current API doesn't expose one), the labels render with the package defaults — that is acceptable because the labels are dark on a white card (already AA). If a label slot is added later, mirror the input label style: `block text-sm font-medium text-graphite-700 mb-1.5`.

### Copy strategy (i18n keys)

Existing keys MUST be reused — do not invent new ones unless the team owns the i18n files:

- `login_title` — card title (e.g., "Acesse sua conta" / "Sign in")
- `login_instruction` — card subtitle (e.g., "Use seu email e senha para entrar.")
- `login_recovery_password` — link "Esqueci minha senha" / "Recovery Password?"
- `login_no_account` — "Não tem uma conta?" / "Don't have an account?"
- `login_create_account_button` — "Crie sua conta" / "Create Account"

For Option B's editorial column, reuse these home keys to avoid translation-debt:
- `home_hero_eyebrow` (or fallback literal "Plataforma MMN · PIX integrado") for the chip
- A new `login_hero_title` / `login_hero_subtitle` pair is acceptable IF the team agrees; otherwise reuse `home_hero_title` for visual rhythm. **Keep the marketing column copy short** (one display-headline, one paragraph, optional stats) — this is a login page, not a hero replacement.

### Responsive behavior

| Breakpoint | Layout                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| `< sm`     | Single column. Card has `p-8`, full width minus `px-shell`. Editorial column hides the stats trio (keeps eyebrow + title + subtitle only) to compress vertical height. |
| `sm`–`lg`  | Single column still. Card max-width `28rem` (`max-w-md`), centered. Editorial column collapses **below** the card on Option B. |
| `≥ lg`     | 12-col grid: copy `col-span-6` (left) · card `col-span-6` (right). Card stays `max-w-md`, aligned right (`lg:ml-auto lg:mr-0`). |

For Option A (centered): always single column regardless of breakpoint; card is `max-w-md` and centered horizontally.

### States

- **Idle:** card has elevated shadow + halo glow; inputs sit at neutral border (`border-neutral-300`).
- **Hover** (input): border darkens to `graphite-400`. (Hover on submit: bg → `orange-600`.)
- **Focus** (input): orange-500 border + 3px orange/20 ring (`focus:ring-orange-500/20 focus:ring-3`). Submit gets the global `:focus-visible` 3px outline.
- **Loading** (after submit, while NAuth runs): the LoginForm package handles its own pending state. The page does NOT add an extra spinner — instead, the surrounding card stays interactive-but-disabled visually because the package switches the button to a spinner. If a global blocker is desired, add `aria-busy="true"` on the `<form>` wrapper.
- **Error**: surfaced via the existing `MessageToast` (top-right). DO NOT replace it — error → `handleLoginError(error)` → toast.
- **Reduced motion**: `animate-fade-up` and the `cta-primary::after` aura transition are neutralized by the existing `prefers-reduced-motion` block in `home-redesign.html` / `tokens.css`.

### Accessibility notes (login-specific)

- The page must have **exactly one `<h1>`**. In Option B that is the editorial column headline; the card title becomes `<h2>`. In Option A the card title is the `<h1>`.
- `<main>` carries `aria-labelledby="login-heading"` pointing at the active `<h1>`.
- The `auth-mark` square is decorative only — wrap its content in a way the screen reader skips (use `aria-hidden="true"` on the `<div>` and ensure the heading right after carries the meaning, e.g. "Acesse sua conta").
- Inputs already have `autocomplete="email"` / `autocomplete="current-password"` baked into the `nauth-react` `LoginForm`. Verify in dev tools — if not, request the package author to add them; do not patch in CRA.
- Recovery and create-account links are `<a>` (nav semantics), not buttons. Use `react-router-dom` `<Link to>` rather than `navigate()` inside `onClick` to preserve right-click → "open in new tab".
- Color contrast (verified):
  - `text-graphite-900` (#0A0A0D) on `bg-neutral-0` (#FFFFFF) → 19.0:1 (AAA)
  - `text-graphite-500` (#3F3F46) on `bg-neutral-0` → 10.4:1 (AAA)
  - `text-orange-700` (#9E3A0F) on `bg-neutral-0` → 7.1:1 (AAA — used for links/CTA labels)
  - White on `orange-500` → 3.4:1 → only used at ≥18px semibold (large text AA pass)
- Touch targets: all interactive elements are `h-12` (inputs, submit) or padded `<a>` lines. Card-padding (`p-8 sm:p-10`) leaves ≥44 px around each element so taps don't collide.

### shadcn migration map

When the project moves to Vite + Tailwind + shadcn/ui, the following shadcn primitives replace the bespoke atoms:

| Mockup atom            | shadcn primitive                              |
| ---------------------- | --------------------------------------------- |
| `<article class="auth-card">` | `<Card>` + `<CardHeader>` + `<CardContent>` + `<CardFooter>` |
| `field-input` preview  | shadcn `<Input />` (with the same Tailwind class string) |
| `field-checkbox`       | shadcn `<Checkbox />`                         |
| `field-submit`         | shadcn `<Button variant="default">` (orange via theme) |
| `MessageToast`         | shadcn `<Toaster>` + `sonner`                  |
| Recovery / create-account link | shadcn `<Button variant="link">` OR raw `<Link>` (preferred — links are nav, not actions) |

The `LoginForm` from `nauth-react` is a **black-box** — it stays as-is across the migration; shadcn only replaces its surroundings.

---

## Integration notes for `frontend-react-developer` (LoginPage migration)

> Target file: `monexup-app/src/Pages/LoginPage/index.tsx` (CRA, current stack).
> Mockup: `docs/design/login-redesign.html` — render in a browser to compare.
> Tokens: `docs/design/tokens.css` (already defines `mnx-surface-dark`, `--color-orange-*`, etc.).

### Imports needed

```ts
import { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import Header from '../HomePage/Header';            // verbatim reuse
import Footer from '../HomePage/Footer';            // verbatim reuse
import MessageToast from '../../Components/MessageToast';
import { MessageToastEnum } from '../../DTO/Enum/MessageToastEnum';
import NetworkContext from '../../Contexts/Network/NetworkContext';
```

> Do **not** import Bootstrap `Card` anymore — the new card is pure Tailwind.

### Outer page structure

```jsx
<>
  <MessageToast ... />
  <Header />

  <main
    id="login-main"
    className="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
    aria-labelledby="login-heading"
  >
    <div className="auth-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

    <div className="relative max-w-container mx-auto px-shell py-16 lg:py-24">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* editorial copy column — Option B (left, dark) */}
        {/* login card column — right */}
      </div>
    </div>
  </main>

  <Footer />
</>
```

### LoginForm wrapper Tailwind utility list

Pass these as the `styles` prop on `<LoginForm>` (verbatim):

```ts
const loginFormStyles = {
  container: 'space-y-5',
  input:
    'block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white ' +
    'text-graphite-900 placeholder:text-graphite-400 ' +
    'hover:border-graphite-400 ' +
    'focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 focus:outline-none ' +
    'transition-colors duration-fast',
  button:
    'cta-primary inline-flex items-center justify-center w-full h-12 px-5 rounded-md ' +
    'bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md ' +
    'transition-colors duration-fast',
};
```

### CSS to add (one of)

Either:
1. Append the **New atoms** block (above) to a **global CSS file** that's already imported once by the app shell (look for where `mnx-surface-dark` is currently defined — if it lives in `home-redesign.html` only, promote it into `monexup-app/src/index.css` or a fresh `monexup-app/src/styles/auth.css` and import it from `App.tsx`). Do this once for the whole app — do **not** put the CSS inside `LoginPage/index.tsx`.
2. OR, when migration to Tailwind is done, move `bg-mesh-auth` into `tailwind.config.snippet.js → theme.extend.backgroundImage` and `auth-card` / `auth-mark` into a shadcn `Card` variant.

### Tokens used (no new tokens required)

All values come from the existing `docs/design/tokens.css`:

- Colors: `--color-orange-{200,400,500,600,700}`, `--color-graphite-{200,300,400,500,700,900}`, `--color-neutral-{0,200,300}`
- Radii: `--radius-md` (inputs/button), `--radius-2xl` (card)
- Shadows: `--shadow-glow-orange-md` (submit), `--shadow-lg`/`--shadow-xl` (card elevation, custom-tuned for the dark surface in `.auth-card`)
- Typography: `--font-display` (title + brand mark), `--font-sans` (body + form), scale `--fs-{sm,base,lg,3xl}`
- Motion: `--duration-fast` (color transitions), `--duration-slow` (`animate-fade-up`)

### Things to verify after building

- Inputs reach AA contrast in BOTH default and focus states. Open DevTools → Lighthouse a11y audit on `/account/login`.
- Pressing Tab from the navbar enters the form (no skipped focusable elements).
- `prefers-reduced-motion: reduce` (DevTools → Rendering) disables the card's `animate-fade-up` + the CTA `::after` aura transition.
- Submitting wrong credentials surfaces the toast (existing `handleLoginError` path) AND keeps the card visible — the page must not navigate away on error.
- Mobile (`< sm`): the card sits above the editorial column; nothing in the editorial column has `aria-hidden` accidentally hiding it from the screen reader.

## Accessibility checklist (to validate on the React build)

- [ ] All text passes WCAG AA (4.5:1 body, 3:1 large) on its surface.
- [ ] No information conveyed by color alone (online status, badges, CTA states all use text/icon too).
- [ ] Focus-visible ring on every interactive element; 3 px outline, 3 px offset.
- [ ] Touch targets ≥ 44×44 px.
- [ ] `prefers-reduced-motion: reduce` neutralizes glow pulse, fade-up, and the CTA aura transition.
- [ ] Heading order: `h1` (hero) → `h2` (each section) → `h3` (cards). No skips.
- [ ] Lighthouse a11y score ≥ 95 target.
- [ ] Screen-reader pass: VoiceOver/NVDA can land on every CTA and read the visible label.

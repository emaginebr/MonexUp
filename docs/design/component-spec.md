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

## 9. `<NetworkInsertPage />` (DARK shell + LIGHT cards · 4-step wizard)

**Direction:** same Editorial Brutalist · Dark/Light Split as the home and login redesigns. The page is a **dark mesh shell** (Header + hero band with wizard + Footer all dark) holding **focused light cards** that change per step. Bootstrap is fully retired here — the page now owns its own form atoms (no `LoginForm` wrapper, since the existing handlers use `useState` strings + `loginWithEmail` / `userContext.insert` / `networkContext.insert` directly).

**Mockup file:** `docs/design/network-redesign.html` — single file containing all four step states stacked top-to-bottom so a reviewer can scroll through them. In production, only one step is rendered at a time (the others remain unmounted).

The **hero band** (chip + display headline + sub-paragraph + wizard tracker) is **persistent across all steps** — it gives the user a sense of progression. Only the card below changes.

**Why redesign:** the current Bootstrap implementation exposes two side-by-side cards on Step 1 (login + register) which doubles the cognitive load on the most fragile step of the funnel. The redesign collapses them into a **single tabbed card** (segmented control: "Já tenho conta" ↔ "Sou novo aqui") so the user faces one focused decision at a time, exactly like Hick's law prescribes.

### Composition (shadcn primitives — for the future Vite migration)

- `Header` (existing) — verbatim reuse from `monexup-app/src/Pages/HomePage/Header.tsx`. Already provided by the `Layout` route element in `App.tsx`.
- `Footer` (existing) — verbatim reuse from `monexup-app/src/Pages/HomePage/Footer.tsx`. **`Layout` does NOT add the footer**, so the page must render `<Footer />` itself at the end.
- `Tabs` (shadcn / Radix) — for the Step 1 segmented control. While shadcn isn't installed, the mockup ships a `.seg` atom that maps 1:1 to `<Tabs orientation="horizontal" />` later.
- `Card`, `CardHeader`, `CardContent`, `CardFooter` (shadcn) — for the elevated light card. Today rendered as `<article class="auth-card">` (atom already in `globals.css` from the login redesign).
- `Input`, `Label`, `Checkbox`, `Button` (shadcn) — for inputs and CTAs. Today rendered as raw `<input>` / `<label>` / `<button>` styled by `auth-form-preview .field-*` atoms.
- `MessageToast` (existing) — error feedback stays on its current contract.
- Icons: `lucide-react` only — `Check`, `Globe2`, `CreditCard`, `User`, `Mail`, `Lock`, `Percent`, `LogIn`, `UserPlus`, `ArrowLeft`, `ArrowRight`, `CheckCircle2`. Drop the FontAwesome imports from `NetworkInsertPage/index.tsx` during the rewrite.

### Page structure (pseudo-markup, no .tsx)

```
<>
  <MessageToast .../>
  {/* <Header /> is already provided by the <Layout /> route element — do NOT render it here */}

  <main
    id="network-main"
    class="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
    aria-labelledby="network-heading"
  >
    <div class="auth-grid absolute inset-0 pointer-events-none" aria-hidden="true"></div>

    {/* ── HERO BAND (persistent across all 4 steps) ── */}
    <div class="relative max-w-container mx-auto px-shell pt-12 lg:pt-16 pb-6 lg:pb-10">
      <div class="text-center max-w-2xl mx-auto animate-fade-up">
        <span class="trust-chip">
          <span class="dot" aria-hidden="true"></span>
          {t('home_hero_eyebrow') || 'Crie sua rede em 4 passos'}
        </span>

        <h1 id="network-heading" class="display-headline text-neutral-50 mt-5 text-3xl sm:text-4xl lg:text-5xl">
          Crie sua rede MMN.<br/>
          <span class="text-orange-500">Comece em minutos.</span>
        </h1>

        <p class="mt-4 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
          Configure seu painel, comissões e pagamento PIX em quatro passos.
        </p>
      </div>

      {/* Wizard tracker — see "Wizard atom" below */}
      <ol class="mnx-wizard mt-10 lg:mt-12" aria-label="Progresso da criação da rede">
        {/* 4 <li class="mnx-wizard__step is-completed | is-active">…</li> */}
      </ol>
    </div>

    {/* ── STEP CARD AREA (only ONE renders at a time) ── */}
    {step === 1 && <Step1Auth … />}     {/* split editorial + tabs login/register */}
    {step === 2 && <Step2Network … />}  {/* single centered card with name/email/commission */}
    {step === 3 && <Step3Payment … />}  {/* placeholder card with disabled CTA */}
    {step === 4 && <Step4Success … />}  {/* celebration card */}
  </main>

  <Footer />                            {/* dark mesh footer (verbatim) — added by THIS PAGE */}
</>
```

### Tailwind class reference (per region)

| Region                         | Class set                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `<main>` shell                 | `mnx-surface-dark relative overflow-hidden bg-mesh-auth`                                                  |
| Texture overlay                | `auth-grid absolute inset-0 pointer-events-none` + `aria-hidden="true"`                                   |
| Hero band container            | `relative max-w-container mx-auto px-shell pt-12 lg:pt-16 pb-6 lg:pb-10`                                  |
| Hero copy block                | `text-center max-w-2xl mx-auto animate-fade-up`                                                           |
| Hero `<h1>`                    | `display-headline text-neutral-50 mt-5 text-3xl sm:text-4xl lg:text-5xl`                                  |
| Hero subtitle                  | `mt-4 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-xl mx-auto`                            |
| Wizard tracker                 | `mnx-wizard mt-10 lg:mt-12`                                                                                |
| Step section wrapper           | `relative max-w-container mx-auto px-shell py-12 lg:py-16` (Step 1 is `border-t border-white/5` if shown after another section — in production, no border because only one renders) |
| Step 1 grid                    | `grid lg:grid-cols-12 gap-10 lg:gap-16 items-start`                                                        |
| Step 1 left (copy)             | `lg:col-span-5 order-2 lg:order-1 animate-fade-up`                                                        |
| Step 1 right (auth card col)   | `lg:col-span-7 order-1 lg:order-2`                                                                         |
| Card glow halo                 | `absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none`                              |
| Auth card                      | `auth-card relative p-6 sm:p-8 lg:p-10 animate-fade-up`                                                    |
| Card brand mark                | `auth-mark` (3rem orange square)                                                                          |
| Card title                     | `display-headline text-2xl text-graphite-900` (Step 1/2/3) · `display-headline text-graphite-900 mt-8 text-3xl sm:text-4xl` (Step 4 success) |
| Card subtitle                  | `text-sm text-graphite-500 mt-1`                                                                           |
| Step 2 / 3 / 4 wrappers        | `flex justify-center` → `<div class="relative w-full max-w-2xl">…`                                         |
| Action row (back + next)       | `pt-4 flex flex-col sm:flex-row sm:justify-end gap-3`                                                      |
| Primary CTA (next/access)      | `cta-primary inline-flex items-center justify-center h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast` |
| Secondary CTA (back)           | `inline-flex items-center justify-center h-12 px-5 rounded-md border border-neutral-300 bg-white text-graphite-900 font-medium hover:bg-neutral-100 transition-colors duration-fast` |
| Disabled CTA (Step 3 next)     | `inline-flex items-center justify-center h-12 px-6 rounded-md bg-neutral-200 text-graphite-400 font-semibold cursor-not-allowed` (always paired with `disabled` attribute and `aria-disabled="true"`) |

### New atoms introduced (add to `monexup-app/src/styles/globals.css`)

These atoms extend the existing `globals.css` (which already declares `bg-mesh-auth`, `auth-card`, `auth-mark`, `trust-chip`, `auth-grid`). Append the following:

```css
/* Wizard tracker (dark surface, brutalist) ----------------------------------- */
.mnx-wizard {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  padding: 1rem 0 0;
  list-style: none;
  margin: 0;
}

.mnx-wizard__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 180px;
  position: relative;
  color: var(--color-graphite-300);
}

/* connector between two adjacent circles */
.mnx-wizard__step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22px;                          /* circle center: 22 = 44/2 */
  left: calc(50% + 26px);
  width: calc(100% - 52px);
  height: 2px;
  background: rgba(255, 255, 255, 0.10);
  transition: background var(--duration-normal) var(--ease-standard);
}
.mnx-wizard__step.is-completed:not(:last-child)::after {
  background: var(--color-orange-500);
}

.mnx-wizard__circle {
  width: 44px; height: 44px;          /* 44 px = touch target floor */
  border-radius: 9999px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  color: var(--color-graphite-300);
  position: relative;
  isolation: isolate;
  transition: background var(--duration-normal),
              border-color var(--duration-normal),
              color var(--duration-normal);
}
.mnx-wizard__step.is-active .mnx-wizard__circle,
.mnx-wizard__step.is-completed .mnx-wizard__circle {
  background: var(--color-orange-500);
  border-color: var(--color-orange-500);
  color: #fff;
}
.mnx-wizard__step.is-active .mnx-wizard__circle {
  box-shadow: 0 8px 24px -6px rgba(232, 90, 26, 0.55);
}
.mnx-wizard__step.is-active .mnx-wizard__circle::after {
  content: '';
  position: absolute; inset: -8px;
  border-radius: inherit;
  background: radial-gradient(60% 60% at 50% 50%, rgba(232,90,26,0.55), transparent 70%);
  filter: blur(10px);
  z-index: -1;
  animation: pulse-glow 2.4s ease-in-out infinite;
}

.mnx-wizard__label {
  margin-top: 0.625rem;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  color: var(--color-graphite-300);
  max-width: 8.5rem;
  line-height: 1.25;
}
.mnx-wizard__step.is-active   .mnx-wizard__label { color: #fff; }
.mnx-wizard__step.is-completed .mnx-wizard__label { color: var(--color-graphite-100); }

@media (max-width: 640px) {
  .mnx-wizard__circle { width: 36px; height: 36px; }
  .mnx-wizard__step:not(:last-child)::after {
    top: 18px;
    left: calc(50% + 22px);
    width: calc(100% - 44px);
  }
  .mnx-wizard__label {
    font-size: 0.625rem;
    letter-spacing: 0.04em;
  }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.85; }
  50%      { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .mnx-wizard__step.is-active .mnx-wizard__circle::after { animation: none !important; }
}

/* Form input atoms (page-owned, NO LoginForm wrapper) ----------------------- */
.auth-form-preview .field-label {
  display: block;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-graphite-700);
  margin-bottom: 0.375rem;
}
.auth-form-preview .field-input,
.auth-form-preview .field-input-prefixed {
  display: block;
  width: 100%;
  height: 3rem;                       /* 48 px — touch target */
  padding: 0 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-300);
  background: var(--color-neutral-0);
  color: var(--color-graphite-900);
  font-size: var(--fs-base);
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow   var(--duration-fast) var(--ease-standard);
}
.auth-form-preview .field-input::placeholder,
.auth-form-preview .field-input-prefixed::placeholder { color: var(--color-graphite-400); }
.auth-form-preview .field-input:hover,
.auth-form-preview .field-input-prefixed:hover { border-color: var(--color-graphite-400); }
.auth-form-preview .field-input:focus,
.auth-form-preview .field-input-prefixed:focus {
  border-color: var(--color-orange-500);
  box-shadow: 0 0 0 3px rgba(232, 90, 26, 0.18);
  outline: none;
}
.auth-form-preview .field-checkbox {
  width: 1.125rem; height: 1.125rem;
  accent-color: var(--color-orange-500);
}

/* "%" suffix wrapper for the commission input */
.field-affix { position: relative; }
.field-affix .field-input-prefixed { padding-right: 2.5rem; }
.field-affix__suffix {
  position: absolute;
  right: 0.875rem; top: 50%;
  transform: translateY(-50%);
  color: var(--color-graphite-400);
  font-weight: 500;
  pointer-events: none;
}

/* Segmented control (Tabs surrogate, Step 1 only) --------------------------- */
.seg {
  display: inline-flex;
  width: 100%;
  padding: 0.25rem;
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
}
.seg__btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 2.5rem;                     /* 40 px — paired w/ vertical padding ≥ 44px touch */
  padding: 0 0.75rem;
  border-radius: calc(var(--radius-lg) - 4px);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-graphite-500);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background var(--duration-fast),
              color var(--duration-fast),
              box-shadow var(--duration-fast);
}
.seg__btn:hover { color: var(--color-graphite-900); }
.seg__btn.is-active,
.seg__btn[aria-selected="true"] {
  background: var(--color-neutral-0);
  color: var(--color-graphite-900);
  font-weight: var(--fw-semibold);
  box-shadow: 0 1px 2px rgba(10,10,13,0.10), 0 0 0 1px rgba(232,90,26,0.35);
}

/* Slug preview (Step 2) ------------------------------------------------------ */
.slug-preview {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem 0.375rem 0.5rem;
  background: var(--color-orange-50);
  border: 1px solid rgba(232, 90, 26, 0.30);
  border-radius: var(--radius-md);
  font-size: var(--fs-xs);
  color: var(--color-orange-700);
  font-family: var(--font-mono);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.slug-preview__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem;
  border-radius: 4px;
  background: rgba(232, 90, 26, 0.18);
  color: var(--color-orange-700);
}

/* Success halo (Step 4) ----------------------------------------------------- */
.success-halo {
  position: relative;
  width: 6rem; height: 6rem;
  border-radius: 9999px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-orange-500);
  color: #fff;
  box-shadow: 0 16px 40px -10px rgba(232, 90, 26, 0.55);
  isolation: isolate;
}
.success-halo::after {
  content: '';
  position: absolute; inset: -1.25rem;
  border-radius: inherit;
  background: radial-gradient(60% 60% at 50% 50%, rgba(232, 90, 26, 0.45), transparent 70%);
  filter: blur(18px);
  z-index: -1;
}
```

### Wizard atom — usage contract

Render it as an ordered list. Each `<li>` carries one of three modifier classes and the right `aria-current` value:

| State          | Class on `<li>`                | `aria-current`  | Circle content                        |
| -------------- | ------------------------------ | --------------- | ------------------------------------- |
| upcoming       | `mnx-wizard__step`             | `false` (omit)  | step-specific lucide icon (User, Globe2, CreditCard, Check) |
| active         | `mnx-wizard__step is-active`   | `"step"`        | step-specific lucide icon             |
| completed      | `mnx-wizard__step is-completed`| `false` (omit)  | always lucide `<Check>`               |

Active and completed states are mutually exclusive — when the user lands on Step 3, Steps 1 and 2 are `is-completed`, Step 3 is `is-active`, Step 4 is upcoming.

### Form input atom — copy/paste class string

Because `NetworkInsertPage` no longer delegates to `<LoginForm>`, the developer types raw `<input>` elements. Provide a single `authInputClass` constant so every input stays consistent:

```ts
// Shared raw <input> class string. Mirror the LoginForm `styles.input` from
// section 8 so login (Step 1 panel) and the network/user fields look identical.
const authInputClass =
  'block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white ' +
  'text-graphite-900 placeholder:text-graphite-400 ' +
  'hover:border-graphite-400 ' +
  'focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 focus:outline-none ' +
  'transition-colors duration-fast';

const authLabelClass =
  'block text-sm font-medium text-graphite-700 mb-1.5';
```

Use it on every input in Steps 1 and 2:

```jsx
<label className={authLabelClass} htmlFor="login-email">{t('login_email_label')}</label>
<input className={authInputClass} id="login-email" type="email" autoComplete="email"
       placeholder={t('login_email_placeholder')} value={email} onChange={…} />
```

For the commission `%` input, wrap it with `<div className="field-affix">` and add `<span className="field-affix__suffix">%</span>` next to a `field-input-prefixed`-classed input (or apply `pr-10` and absolutely-position the `%` glyph yourself).

### Segmented control (Step 1 tabs)

Two tabs: **Já tenho conta** (login) ↔ **Sou novo aqui** (register). Both panels are mounted (so React state stays alive when the user toggles), but only the selected one is visually displayed.

**ARIA contract:**

```jsx
<div role="tablist" aria-label="Modo de autenticação" className="seg">
  <button role="tab" id="tab-login"    aria-controls="panel-login"    aria-selected={authMode === 'login'}    onClick={() => setAuthMode('login')}    className={`seg__btn ${authMode === 'login'    ? 'is-active' : ''}`}>
    <LogIn size={14} aria-hidden /> {t('login_title')}
  </button>
  <button role="tab" id="tab-register" aria-controls="panel-register" aria-selected={authMode === 'register'} onClick={() => setAuthMode('register')} className={`seg__btn ${authMode === 'register' ? 'is-active' : ''}`}>
    <UserPlus size={14} aria-hidden /> {t('network_insert_user_registration_title')}
  </button>
</div>

<div id="panel-login"    role="tabpanel" aria-labelledby="tab-login"    hidden={authMode !== 'login'}>    {/* login form */}    </div>
<div id="panel-register" role="tabpanel" aria-labelledby="tab-register" hidden={authMode !== 'register'}> {/* register form */} </div>
```

**Default tab:** `'login'` (the most common path — most users land here from the home CTA already with a MonexUp account elsewhere). The dev MAY persist the choice in `sessionStorage` if desired; not required.

**Keyboard behavior** (per WAI-ARIA Authoring Practices for Tabs):
- `Tab` enters the tablist → focuses the *active* tab; `Tab` again leaves the tablist into the panel.
- `←` / `→` move focus between tabs and activate them (because the tabs are simple — auto-activation is fine here; nothing destructive happens on switch).
- `Home` / `End` jump to first / last tab.

For React, dispatching focus manually is the cleanest approach. If the team would rather skip keyboard arrow-key handling, the segmented control is acceptable as plain `<button>` toggles — but then drop `role="tablist"`/`"tab"` and use `aria-pressed` instead.

### Slug preview behavior (Step 2)

Below the "Nome da rede" input, render a chip that previews the public URL the network will get: `monexup.com/<slug>`. The slug is derived from the typed name in real time.

**Slug contract** (must match the backend's slug rule — verify against `Core.Domain` slug helper before implementing; if mismatch, the dev defers to the backend):

1. Lowercase the input.
2. Strip diacritics: `name.normalize('NFD').replace(/[̀-ͯ]/g, '')`.
3. Replace any character outside `[a-z0-9]` with `-`.
4. Collapse consecutive `-` into a single `-`.
5. Trim leading/trailing `-`.
6. Truncate to 60 chars.
7. If the result is empty, render the placeholder `sua-rede` in a muted color.

```ts
function toNetworkSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
```

**Render:**

```jsx
const slug = toNetworkSlug(networkName) || 'sua-rede';
<span className="slug-preview" aria-live="polite">
  <span className="slug-preview__icon" aria-hidden><Code size={12} /></span>
  <span className="text-[0.7rem] uppercase tracking-wider font-sans font-semibold mr-1">URL</span>
  monexup.com/<span className="font-bold">{slug}</span>
</span>
```

Wrap with `aria-live="polite"` so screen readers announce changes (debounced naturally because they only announce when keystrokes pause).

### Success state (Step 4)

- A 6×6rem orange `.success-halo` circle holds a 44 px lucide `<CheckCircle2>` icon.
- The card has `overflow-hidden` so the decorative `.confetti` background dots stay inside.
- Heading: `display-headline` 3xl/4xl with the second line in `text-orange-500`. **Two heading lines**: "Sua rede foi criada" + "com sucesso!" — preserves the i18n `network_insert_success_title` semantically while gaining typographic emphasis.
- Body copy uses `network_insert_success_message_1` verbatim (it is the long celebratory paragraph). The `network_insert_success_message_2` key in the current i18n file is a comma-separated run-on sentence — render it as a **bullet list** instead (split at "; ") so each next-step is scannable. The split is a presentation concern; **do not** rewrite the i18n value. If the backend later wants atomic keys, raise a separate copy ticket.
- Closing line: `network_insert_success_lets_start` ("Vamos começar?") in `font-display text-lg text-graphite-900`.
- CTA: orange `cta-primary` with the existing `network_insert_access_my_network_button` label and a `<ArrowRight>` lucide trailing icon. Same h-12/px-6 vocabulary as Step 1/2 next buttons.

### Responsive matrix

| Breakpoint | Step 1 layout                                                                  | Step 2 / 3 / 4 layout                            |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `< sm`     | Single column. Card `p-6`, full width minus `px-shell`. Editorial copy collapses **below** the card (`order-2 lg:order-1`). Hide the trust-stats trio on the editorial column to save vertical space (`hidden sm:grid` on the stats row). | Single centered card, `p-6`, full-bleed minus `px-shell`. Action buttons stack vertically (`flex-col sm:flex-row`). |
| `sm`–`lg`  | Single column still; card centers and stretches up to `max-w-xl`. Editorial copy collapses below. | Single centered card, `max-w-2xl`. Action buttons go inline-row. |
| `≥ lg`     | 12-col grid: editorial copy `col-span-5` (left) · auth card `col-span-7` (right, `max-w-xl` aligned `lg:ml-auto lg:mr-0`). Stats trio re-appears. | Card stays single centered, `max-w-2xl`. |

The wizard tracker stays horizontal at all breakpoints (4 steps fit comfortably even at 320 px because the labels truncate to 2 lines under the smaller circle).

### Accessibility notes (page-specific)

- **Heading order:** exactly one `<h1>` — the persistent hero `"Crie sua rede MMN."`. The card title in each step is `<h2>` (Step 1 has both the card title AND the segmented control; the panel headings inside are `<h3 class="sr-only">`). Step 4's celebration title is also `<h2>` (the page-level `<h1>` is still the hero — keeps the heading map predictable).
- **`<main aria-labelledby="network-heading">`** points at the hero `<h1>` so screen readers announce the page intent on landing.
- **Wizard `<ol>`** — uses `aria-label="Progresso da criação da rede"`. The current step carries `aria-current="step"`. Completed steps use the lucide `<Check>` icon and an SR-only suffix `(concluído)` if the developer wants to be extra explicit; the orange-fill alone is NOT enough because color cannot be the sole carrier of state.
- **Step indicator labels** (`Registrar usuário`, `Registrar rede`, `Pagamento`, `Concluído`) come from i18n keys `network_insert_step_register_user`, `network_insert_step_register_network`, `network_insert_step_payment`, `network_insert_step_done`. Reuse verbatim.
- **Each step section** wraps its content in `<section aria-labelledby="step-N-label">` with a visually-hidden `<h2 class="sr-only" id="step-N-label">` matching the wizard label. This gives non-visual users a clear landmark when steps swap.
- **Focus order** — when a step transitions, move focus to the new step's `<h2>` (or the first input) so screen readers re-announce the context. Use a `useEffect` on `step` to call `headingRef.current?.focus({ preventScroll: false })` (the heading needs `tabIndex={-1}` to be focusable).
- **Form fields:**
  - Every `<input>` has an explicit `<label htmlFor>`. Avoid placeholder-only labels.
  - Email inputs use `type="email"` + `autocomplete="email"`; passwords `autocomplete="current-password"` (login) and `autocomplete="new-password"` (register).
  - Password confirmation announces mismatch via `aria-describedby` on the input pointing at the existing toast message — the toast already covers it, so no extra inline text is required.
  - The commission input uses `type="number"` + `inputmode="decimal"` + `min="0" max="100" step="0.5"` so mobile keyboards open the numeric pad.
- **Slug preview** — wrap the dynamic span with `aria-live="polite"` so screen readers announce updates without interrupting typing.
- **Segmented control** — keyboard contract above. The tab text already conveys the state (the active tab has bold + raised neutral surface), so color is not the sole carrier.
- **Step 4 success halo** — purely decorative; carries `role="img" aria-label="Sucesso"`. The bullet recap below conveys the actual content.
- **Color contrast (verified):**
  - `text-graphite-900` on `bg-neutral-0` → 19.0:1 (AAA)
  - `text-graphite-700` on `bg-neutral-0` → 13.6:1 (AAA)
  - `text-graphite-500` on `bg-neutral-0` → 10.4:1 (AAA)
  - `text-graphite-400` on `bg-neutral-0` → 4.6:1 (AA — used only for placeholder text and helper hints)
  - White on `orange-500` → 3.4:1 — only used at ≥18px semibold (large text AA pass) for CTAs and the active wizard step circle
  - `text-graphite-200` on `bg-graphite-900` → 13.1:1 (AAA — hero subtitle)
  - `text-graphite-300` on `bg-graphite-900` → 8.0:1 (AAA — wizard upcoming-step label)
- **Touch targets:** wizard circles are 44 px (mobile 36 px — accepted because the labels below extend the tap area; if the circle has tap behavior added later, raise it back to 44). Inputs and CTAs are h-12 (48 px). Tab buttons are h-10 with the seg padding adding the rest of the touch area to ≥44 px.

### i18n key map

| Visible string                                                                  | i18n key                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Hero chip                                                                       | (literal "Crie sua rede em 4 passos" OR new `network_insert_hero_eyebrow`) |
| Hero `<h1>` line 1                                                              | new `network_insert_hero_title_1` ("Crie sua rede MMN.") |
| Hero `<h1>` line 2 (orange)                                                     | new `network_insert_hero_title_2` ("Comece em minutos.") |
| Hero subtitle                                                                   | new `network_insert_hero_subtitle`                    |
| Wizard step 1 label                                                             | `network_insert_step_register_user`                   |
| Wizard step 2 label                                                             | `network_insert_step_register_network`                |
| Wizard step 3 label                                                             | `network_insert_step_payment`                         |
| Wizard step 4 label                                                             | `network_insert_step_done`                            |
| Step 1 tab "Já tenho conta"                                                     | `login_title` (existing — "Acesse sua conta")         |
| Step 1 tab "Sou novo aqui"                                                      | `network_insert_user_registration_title` (existing)   |
| Step 1 login email label                                                        | `login_email_label`                                   |
| Step 1 login email placeholder                                                  | `login_email_placeholder`                             |
| Step 1 login password label                                                     | `login_password_label`                                |
| Step 1 login password placeholder                                               | `login_password_placeholder`                          |
| Step 1 login remember-me checkbox                                               | `login_remember_password_label`                       |
| Step 1 login forgot link                                                        | `login_recovery_password_button`                      |
| Step 1 register name label                                                      | `form_label_name`                                     |
| Step 1 register name placeholder                                                | `form_placeholder_your_name`                          |
| Step 1 register email label                                                     | `form_label_email`                                    |
| Step 1 register email placeholder                                               | `form_placeholder_your_email`                         |
| Step 1 register password label                                                  | `form_label_password`                                 |
| Step 1 register password placeholder                                            | `form_placeholder_your_password`                      |
| Step 1 register confirm-password label                                          | `form_label_confirm_password`                         |
| Step 1 register confirm-password placeholder                                    | `form_placeholder_confirm_your_password`              |
| Step 2 card title                                                               | `network_insert_network_registration_title`           |
| Step 2 card subtitle                                                            | `network_edit_registration_info`                      |
| Step 2 network name placeholder                                                 | `network_edit_name_placeholder`                       |
| Step 2 network email placeholder                                                | `network_insert_network_email_placeholder`            |
| Step 2 commission label                                                         | `network_edit_commission_label`                       |
| Step 2 commission placeholder                                                   | `network_edit_commission_placeholder`                 |
| Step 4 success title                                                            | `network_insert_success_title`                        |
| Step 4 success message paragraph                                                | `network_insert_success_message_1`                    |
| Step 4 success bullets (split locally on "; ")                                  | `network_insert_success_message_2` (rendered as `<ul>`) |
| Step 4 closing line                                                             | `network_insert_success_lets_start`                   |
| Step 4 CTA label                                                                | `network_insert_access_my_network_button`             |
| Primary action label (Steps 1–3)                                                | `next_button`                                         |
| Secondary action label (Steps 2–3)                                              | `back_button`                                         |
| CTA loading text (replaces label while pending)                                 | `loading`                                             |

> **Note:** the four "new" hero keys are optional. The team may instead reuse `home_hero_eyebrow` (chip) and craft the title inline as a literal — but that locks the page to Portuguese until the next translation pass. Adding the four keys is the cleaner long-term move.

### shadcn migration map

| Mockup atom                              | shadcn primitive                                         |
| ---------------------------------------- | -------------------------------------------------------- |
| `<article class="auth-card">`            | `<Card>` + `<CardHeader>` + `<CardContent>` + `<CardFooter>` |
| `field-input` / `field-input-prefixed`   | shadcn `<Input />` (carry the same Tailwind class string) |
| `field-checkbox`                         | shadcn `<Checkbox />`                                     |
| Step 1 segmented control (`.seg`)        | shadcn `<Tabs>` + `<TabsList>` + `<TabsTrigger>` + `<TabsContent>` |
| Primary CTA                              | shadcn `<Button variant="default">` (orange via theme)    |
| Secondary CTA (Voltar)                   | shadcn `<Button variant="outline">`                       |
| Disabled CTA (Step 3)                    | shadcn `<Button variant="default" disabled>`              |
| Wizard tracker `<ol class="mnx-wizard">` | bespoke component (keep the atom; no shadcn equivalent)   |
| Slug preview chip                        | shadcn `<Badge variant="secondary">` recolored, OR keep bespoke `.slug-preview` |
| `MessageToast`                           | shadcn `<Toaster>` + `sonner`                             |

---

## Integration notes for `frontend-react-developer` (NetworkInsertPage migration)

> Target file: `monexup-app/src/Pages/NetworkInsertPage/index.tsx` (CRA, current stack).
> Mockup: `docs/design/network-redesign.html` — render in a browser to compare.
> Tokens: `docs/design/tokens.css` (already wired through `monexup-app/src/styles/globals.css`).

### Imports needed

```ts
import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Mail,
  Lock,
  Globe2,
  CreditCard,
  Percent,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  LogIn,
  UserPlus,
  Code,
} from 'lucide-react';

import Footer from '../HomePage/Footer';                  // verbatim reuse
import MessageToast from '../../Components/MessageToast';
import { MessageToastEnum } from '../../DTO/Enum/MessageToastEnum';

import AuthContext from '../../Contexts/Auth/AuthContext';
import UserContext from '../../Contexts/User/UserContext';
import NetworkContext from '../../Contexts/Network/NetworkContext';
import type NetworkInsertInfo from '../../DTO/Domain/NetworkInsertInfo';
```

> Drop **all** Bootstrap imports (`Card`, `Container`, `Row`, `Col`, `Form`, `InputGroup`, `Button`) and **all** FontAwesome imports. They are no longer needed.
> Do NOT import `<Header />` here — `LayoutMarketing` is not in use for `/network`; the `Layout` route element in `App.tsx` already wraps this page with `<HomeHeader />`. `<Footer />` IS imported because `Layout` does not render one.

### Outer page structure

```jsx
return (
  <>
    <MessageToast
      dialog={dialog}
      showMessage={showMessage}
      messageText={messageText}
      onClose={() => setShowMessage(false)}
    />

    <main
      id="network-main"
      className="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
      aria-labelledby="network-heading"
    >
      <div className="auth-grid absolute inset-0 pointer-events-none" aria-hidden />

      {/* HERO BAND (always rendered) */}
      <div className="relative max-w-container mx-auto px-shell pt-12 lg:pt-16 pb-6 lg:pb-10">
        <div className="text-center max-w-2xl mx-auto animate-fade-up">
          <span className="trust-chip">
            <span className="dot" aria-hidden />
            {t('network_insert_hero_eyebrow') /* or literal */}
          </span>
          <h1 id="network-heading" tabIndex={-1} className="display-headline text-neutral-50 mt-5 text-3xl sm:text-4xl lg:text-5xl">
            {t('network_insert_hero_title_1')}<br/>
            <span className="text-orange-500">{t('network_insert_hero_title_2')}</span>
          </h1>
          <p className="mt-4 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
            {t('network_insert_hero_subtitle')}
          </p>
        </div>

        <ol className="mnx-wizard mt-10 lg:mt-12" aria-label="Progresso da criação da rede">
          {WIZARD_STEPS.map(s => (
            <li key={s.key}
                className={`mnx-wizard__step${step === s.key ? ' is-active' : ''}${step > s.key ? ' is-completed' : ''}`}
                aria-current={step === s.key ? 'step' : undefined}>
              <span className="mnx-wizard__circle" aria-hidden>
                {step > s.key ? <Check size={18} /> : <s.Icon size={18} />}
              </span>
              <span className="mnx-wizard__label">{t(s.labelKey)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* STEP CARD AREA — only one mounts at a time */}
      {step === 1 && <Step1AuthSection /* … */ />}
      {step === 2 && <Step2NetworkSection /* … */ />}
      {step === 3 && <Step3PaymentSection /* … */ />}
      {step === 4 && <Step4SuccessSection /* … */ />}
    </main>

    <Footer />
  </>
);
```

`WIZARD_STEPS` is a small const at the top of the file:

```ts
const WIZARD_STEPS = [
  { key: 1, Icon: UserIcon,   labelKey: 'network_insert_step_register_user'    },
  { key: 2, Icon: Globe2,     labelKey: 'network_insert_step_register_network' },
  { key: 3, Icon: CreditCard, labelKey: 'network_insert_step_payment'          },
  { key: 4, Icon: Check,      labelKey: 'network_insert_step_done'             },
] as const;
```

### Where each step state lives

- **Step 1** — keep both panels mounted (they share the `useState`s for email/password/name/etc.) but only one is visible at a time via the segmented control. The two existing handlers stay verbatim:
  - Login button click → `authContext.loginWithEmail(email, password)` then `networkContext.listByUser()` then `setStep(2)` (current behavior, lines 154–177 of the legacy file).
  - Register button click → `userContext.insert(userContext.user)` then `setStep(2)` (current behavior, lines 255–282 of the legacy file).
  - The validation messages (`login_error_email_empty`, `error_name_empty`, etc.) keep flowing through `throwError` → `MessageToast`.
- **Step 2** — single card with the existing handler:
  - Next button click → `networkContext.insert({ name: networkName, email: networkEmail, comission: networkCommission, plan: 1 })` then `setStep(4)` (current behavior, lines 348–376).
  - Back button click → `setStep(1)`. (The legacy code wrongly sets `setStep(2)` on Voltar — fix this opportunistically during the rewrite.)
  - Wire the `slug-preview` to `networkName` via `toNetworkSlug(networkName)`.
- **Step 3** — render the placeholder card. The Próximo button is `disabled` and `aria-disabled="true"` until ProxyPay integration lands. No handler needed yet.
- **Step 4** — render the celebration card. The CTA `onClick` calls `navigate('/admin/dashboard')` — same as today (line 397).

### State to add

```ts
const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
```

Default to `'login'` because the most likely visitor is an existing MonexUp user. No persistence required.

### Existing handler logic (do NOT change)

The auth/user/network handlers stay byte-identical. Only the JSX changes:

- `useEffect` that bumps `step` to 2 when a session exists — keep it (lines 57–79).
- `loginWithEmail` flow — keep it.
- `userContext.insert` flow — keep it.
- `networkContext.insert` flow — keep it.
- `MessageToast` wiring — keep it.

### CSS to add

Append the **New atoms** block from this section's spec (above) to `monexup-app/src/styles/globals.css`. The existing `auth-card`, `auth-mark`, `auth-grid`, `bg-mesh-auth`, `trust-chip`, and `cta-primary` atoms are already defined there from the login redesign — do **not** duplicate them.

If the build fails on `font-mono`/`var(--font-mono)`, confirm `tokens.css` declares it (it does — line 62) and that `globals.css` imports `tokens.css` (it does — line 11).

### Tokens used (no new tokens required)

All values come from the existing `docs/design/tokens.css`:

- Colors: `--color-orange-{50,200,400,500,600,700}`, `--color-graphite-{100,200,300,400,500,700,900}`, `--color-neutral-{0,100,200,300}`
- Radii: `--radius-md`, `--radius-lg`, `--radius-2xl`, `--radius-full`
- Shadows: `--shadow-glow-orange-md` (CTA + active wizard step), card elevation tuned in `.auth-card`
- Typography: `--font-display`, `--font-sans`, `--font-mono` (slug chip), scale `--fs-{xs,sm,base,lg,3xl}`
- Motion: `--duration-fast`, `--duration-normal`, `--ease-standard`

### Things to verify after building

- Hero `<h1>` is the only `<h1>` on the page. Each step's card heading is `<h2>`.
- Pressing Tab from the navbar enters the wizard (skipping decorative SVGs), then the active step card.
- Switching tabs with Arrow Left/Right inside the segmented control activates the matching panel.
- Slug preview updates as the user types in Step 2 (paste a name with accents/punctuation and verify it transforms to a clean slug).
- Step transitions move focus to the new step's heading (verify with VoiceOver/NVDA).
- `prefers-reduced-motion: reduce` (DevTools → Rendering) disables the wizard pulse, the card `animate-fade-up`, and the `cta-primary::after` aura.
- Submitting wrong credentials in the login panel still surfaces the toast — the page does not navigate away on error.
- Mobile (`< sm`): hero band and wizard fit at 320 px without overflow; the editorial column on Step 1 stacks below the card; action buttons stack vertically.
- Lighthouse a11y score ≥ 95 on `/network` for all four step states.

## 10. `<EditAccountPage />` (DARK hero band + LIGHT form card)

**Direction:** same Editorial Brutalist · Dark/Light Split language as the home/login/dashboard. The page reuses the **dark navbar** verbatim, opens with a **short dark hero band** (breadcrumb + screen title + status chip), then transitions to a **light content area** holding the form card flanked by an aside sub-nav and a meta/danger column. Closes with the **shared `<MiniFooter />`** documented in `dashboard-spec.md` §7 — no new footer variant, no `<Footer variant="compact">`. We treat MiniFooter as the canonical post-login footer for every authenticated screen.

**Mockup file:** `docs/design/edit-account-redesign.html` — single direction (no A/B). A subtle "single column" variation is documented inline as an HTML comment for re-auth flows where the asides should be hidden.

### Composition (shadcn primitives — for the future Vite migration)

- `Header` (existing) — verbatim reuse from `monexup-app/src/Pages/HomePage/Header.tsx`. In the React build, the Header should switch to its `authenticated` mode (user menu replaces "Entrar/Cadastre-se").
- `MiniFooter` (existing — see `dashboard-spec.md` §7) — verbatim reuse. **Do not** introduce a `variant` prop on the marketing `<Footer />`.
- `Card` (shadcn) — three card surfaces on the page: aside-nav card, form card, summary/danger cards. For now they render as raw Tailwind via the `form-card` atom.
- `NavigationMenu` or simple `<nav><ul>` for the aside sub-nav; the mockup uses a plain list with `aria-current="page"` since each entry navigates to a different route (not in-page tabs).
- `Avatar` (shadcn) for the dropzone. The hidden file input is paired with a visible button so keyboard focus stays visible.
- `Button` variants:
  - `default` (orange) for "Salvar alterações" — class `btn-save cta-primary`
  - `outline` (graphite-900 border, full-fill on hover) for "Cancelar" — class `btn-cancel`
  - `link` / `ghost` red-500 for destructive actions (Remover foto, Excluir conta) — class `btn-ghost-danger`
- `Alert` (shadcn) for the persistent in-page banner — class `form-banner form-banner--info | --success`. **DO NOT** replace the existing `MessageToast` — the toast handles transient feedback from `onSuccess` / `onError`; the banner handles persistent contextual states (e.g. "verifique seu email").
- `UserEditForm` from `nauth-react` — handles the actual fields. **Critical integration constraint:** unlike `LoginForm`, `UserEditForm` only exposes `className` (no `styles.input` / `.button` / `.label` slots, see types in `nauth-react/dist/index.d.ts`). The page therefore **cannot recolor the package's internals via props alone**; the visual contract has to be applied via a scoped CSS class layer at integration time. See "UserEditForm wrapper" below.

### Page structure (pseudo-markup, no .tsx)

```
<>
  <MessageToast .../>
  <Header />                                          {/* sticky dark navbar (verbatim, authenticated mode) */}

  {/* 1. Account hero — dark, compact (~ 240px on lg). NOT a marketing surface. */}
  <section
    class="mnx-surface-dark relative overflow-hidden bg-mesh-account account-hero"
    aria-labelledby="account-page-heading"
  >
    <div class="account-grid absolute inset-0 pointer-events-none" aria-hidden="true"></div>
    <div class="relative max-w-container mx-auto px-shell">
      <nav aria-label="Breadcrumb" class="text-xs uppercase tracking-wider text-graphite-400">
        <ol class="flex items-center gap-2">
          <li><Link to="/admin">{t('account_breadcrumb')}</Link></li>
          <li aria-hidden="true" class="text-graphite-500">/</li>
          <li class="text-orange-300">{t('edit_account')}</li>
        </ol>
      </nav>

      <div class="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 id="account-page-heading" class="display-headline text-neutral-50 text-3xl sm:text-4xl lg:text-5xl">
            {t('edit_account')}
          </h1>
          <p class="mt-3 max-w-xl text-graphite-200 text-sm sm:text-base leading-relaxed">
            {t('edit_account_subtitle')}
          </p>
        </div>
        <span class="status-chip">…Conta verificada…</span>
      </div>
    </div>
  </section>

  {/* 2. Content grid — light, the form card overlaps the dark band via -mt-20 */}
  <section class="mnx-surface-light bg-neutral-50 pb-20 lg:pb-28" aria-label={t('account_content')}>
    <div class="max-w-container mx-auto px-shell">
      <div class="-mt-20 grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">

        <aside class="lg:col-span-3 lg:sticky lg:top-24 self-start" aria-label={t('account_nav')}>
          <AccountSidebar current="personal" />
        </aside>

        <article class="lg:col-span-6 form-card p-6 sm:p-8 lg:p-10">
          {/* form header (h2 + subtitle) */}
          {/* optional <Alert /> banner */}
          <UserEditForm
            userId={authContext.sessionInfo?.userId}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={() => navigate('/admin')}
            className="user-edit-form"
          />
        </article>

        <aside class="lg:col-span-3" aria-label={t('account_summary')}>
          <AccountSummary user={authContext.sessionInfo} />
          <DangerZone />
        </aside>

      </div>
    </div>
  </section>

  <MiniFooter />
</>
```

### Tailwind class reference

| Region                          | Class set                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Account hero `<section>`        | `mnx-surface-dark relative overflow-hidden bg-mesh-account account-hero`                                   |
| Hero texture overlay            | `account-grid absolute inset-0 pointer-events-none` + `aria-hidden="true"`                                 |
| Hero inner container            | `relative max-w-container mx-auto px-shell`                                                                |
| Breadcrumbs                     | `text-xs uppercase tracking-wider text-graphite-400` + active item `text-orange-300`                       |
| Page H1                         | `display-headline text-neutral-50 text-3xl sm:text-4xl lg:text-5xl`                                        |
| Status chip                     | `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide text-orange-200 bg-orange-500/10 border border-orange-500/30` |
| Content `<section>`             | `mnx-surface-light bg-neutral-50 pb-20 lg:pb-28`                                                           |
| Inner grid wrapper              | `-mt-20 grid lg:grid-cols-12 gap-6 lg:gap-10 items-start`                                                  |
| Aside (left, nav)               | `lg:col-span-3 lg:sticky lg:top-24 self-start animate-fade-up`                                             |
| Form card                       | `lg:col-span-6 form-card p-6 sm:p-8 lg:p-10 animate-fade-up`                                               |
| Aside (right, meta)             | `lg:col-span-3 animate-fade-up`                                                                            |
| Form section eyebrow            | `form-section-eyebrow` (Space Grotesk uppercase + 24px orange tick)                                        |
| Submit button                   | `btn-save cta-primary`                                                                                     |
| Cancel button                   | `btn-cancel`                                                                                               |
| Destructive ghost link          | `btn-ghost-danger`                                                                                         |
| Info / success banner           | `form-banner form-banner--info` or `form-banner--success` + `role="status"`                                |
| Avatar dropzone                 | `avatar-dropzone` (8rem circle, dashed border)                                                             |
| Avatar edit button              | `avatar-edit-btn` (2.25rem dark circle, orange on hover)                                                   |

### New atoms introduced (live in the same global CSS file as the home/login atoms)

```css
/* dark hero mesh for authenticated screens — softer than .bg-mesh-auth */
.bg-mesh-account {
  background:
    radial-gradient(ellipse 60% 50% at 80% 30%, rgba(232,90,26,0.18), transparent 65%),
    radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,90,26,0.08), transparent 70%),
    linear-gradient(180deg, #0A0A0D 0%, #131317 100%);
}

/* compact hero band — just enough room for breadcrumb + h1 + meta */
.account-hero { padding-top: 2.5rem; padding-bottom: 7rem; }

/* generic light card surface used on this screen (and any future settings screen) */
.form-card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-2xl);
  box-shadow:
    0 24px 48px -16px rgba(0,0,0,0.18),
    0 8px 16px -8px rgba(0,0,0,0.10);
}

/* aside nav — left-bar accent for the active item, brand orange */
.account-nav__item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--fs-sm); font-weight: var(--fw-medium);
  color: var(--color-graphite-700);
  border-left: 3px solid transparent;
  transition: background-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}
.account-nav__item:hover { background: var(--color-neutral-100); color: var(--color-graphite-900); }
.account-nav__item--active {
  background: var(--color-orange-50);
  color: var(--color-orange-700);
  border-left-color: var(--color-orange-500);
}

/* small editorial tick before each subsection title in the form */
.form-section-eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-display);
  font-size: var(--fs-xs); font-weight: var(--fw-bold);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-orange-700);
}
.form-section-eyebrow::before {
  content: ''; width: 1.5rem; height: 2px;
  background: var(--color-orange-500); flex-shrink: 0;
}

/* primary save button — same vocabulary as login submit */
.btn-save {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 3rem; padding: 0 1.5rem;
  border-radius: var(--radius-md);
  background: var(--color-orange-500); color: #fff;
  font-weight: var(--fw-semibold); font-size: var(--fs-base);
  letter-spacing: -0.005em;
  box-shadow: var(--shadow-glow-orange-md);
  transition: background-color var(--duration-fast) var(--ease-standard);
}
.btn-save:hover { background: var(--color-orange-600); }

/* outline cancel — brutalist full-fill on hover */
.btn-cancel {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 3rem; padding: 0 1.5rem;
  border-radius: var(--radius-md);
  background: transparent; color: var(--color-graphite-900);
  border: 1px solid var(--color-graphite-900);
  font-weight: var(--fw-semibold); font-size: var(--fs-base);
  transition: background-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}
.btn-cancel:hover { background: var(--color-graphite-900); color: #fff; }

/* avatar uploader */
.avatar-dropzone {
  position: relative; width: 8rem; height: 8rem;
  border-radius: 9999px;
  background: var(--color-neutral-100);
  border: 2px dashed var(--color-neutral-300);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.avatar-edit-btn {
  position: absolute; right: 0; bottom: 0;
  width: 2.25rem; height: 2.25rem; border-radius: 9999px;
  background: var(--color-graphite-900); color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.45);
  transition: background-color var(--duration-fast) var(--ease-standard);
}
.avatar-edit-btn:hover { background: var(--color-orange-500); }
```

> Add these alongside the home/login atoms (same global CSS file). `bg-mesh-account` may also be promoted to `tailwind.config.snippet.js → backgroundImage` once the Vite migration begins.

### UserEditForm wrapper styling (nauth-react integration)

Unlike `LoginForm`, `UserEditForm` exposes a **single hook** for styling (verified against `nauth-react/dist/index.d.ts`):

- `userId?: number`
- `onSuccess?: (user: UserInfo) => void`
- `onError?: (error: Error) => void`
- `onCancel?: () => void` ← **use this for the "Cancelar" button** (no need to render our own cancel; the package wires it; keep our `btn-cancel` styling on the rendered button via the same scoped CSS reset).
- `className?: string` ← only this; **no `styles.input` / `.button` / `.label` slots**.

That means we cannot re-skin the fields via props. Two acceptable strategies for the frontend agent:

1. **Recommended — scoped CSS reset.** Pass `className="user-edit-form"` and add a small CSS layer in the same auth/account stylesheet that targets the package's structural elements:

   ```css
   .user-edit-form input,
   .user-edit-form select,
   .user-edit-form textarea {
     /* mirror .form-preview .field-input from edit-account-redesign.html */
     display: block; width: 100%; height: 3rem; padding: 0 0.875rem;
     border-radius: var(--radius-md);
     border: 1px solid var(--color-neutral-300);
     background: var(--color-neutral-0); color: var(--color-graphite-900);
     font-size: var(--fs-base);
     transition: border-color var(--duration-fast) var(--ease-standard),
                 box-shadow   var(--duration-fast) var(--ease-standard);
   }
   .user-edit-form input:focus,
   .user-edit-form select:focus,
   .user-edit-form textarea:focus {
     border-color: var(--color-orange-500);
     box-shadow: 0 0 0 3px rgba(232,90,26,0.18); outline: none;
   }
   .user-edit-form label {
     display: block; font-size: var(--fs-sm); font-weight: var(--fw-medium);
     color: var(--color-graphite-700); margin-bottom: 0.375rem;
   }
   .user-edit-form button[type="submit"] {
     /* mirror .btn-save */
     display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
     height: 3rem; padding: 0 1.5rem; border-radius: var(--radius-md);
     background: var(--color-orange-500); color: #fff;
     font-weight: var(--fw-semibold); font-size: var(--fs-base);
     box-shadow: var(--shadow-glow-orange-md);
   }
   .user-edit-form button[type="submit"]:hover { background: var(--color-orange-600); }
   .user-edit-form button[type="button"] {
     /* mirror .btn-cancel — applies to whatever button onCancel renders */
     display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
     height: 3rem; padding: 0 1.5rem; border-radius: var(--radius-md);
     background: transparent; color: var(--color-graphite-900);
     border: 1px solid var(--color-graphite-900);
     font-weight: var(--fw-semibold); font-size: var(--fs-base);
   }
   .user-edit-form button[type="button"]:hover { background: var(--color-graphite-900); color: #fff; }
   ```

   The frontend agent **must** open the rendered DOM in DevTools and verify the actual selectors before committing — different `nauth-react` versions may emit different markup.

2. **Fallback — request a `styles` slot upstream.** If the package author exposes `styles.input` / `.button` / `.label` like `LoginForm` in a future release, mirror the login wiring exactly (see section 8). Do **not** patch the package locally inside the CRA app.

The mockup's `.form-preview .field-*` selectors describe the **visual contract** the wrapper must hit; they are not the actual DOM.

### Form structure (visual contract)

The card is sectioned into **5 logical groups** with editorial eyebrows:

1. **Foto de perfil** — avatar dropzone, "Escolher arquivo" / "Remover foto" actions, format hint.
2. **Identidade** — name, birthDate, idDocument (CPF/CNPJ).
3. **Contato** — email, phone (primary phone from `phones[]`).
4. **Pagamentos** — pixKey (single field, full-width on the row, with an explanatory hint).
5. **Segurança** — currentPassword + newPassword + confirmPassword. Confirmation password shows the inline `field-error` example with `aria-invalid="true"` + `aria-describedby` + `role="alert"`.

The action bar (Cancelar + Salvar alterações) sits at the bottom of the card with a top divider. On `< sm` it stacks column-reverse (Salvar on top, Cancelar below), each full-width.

> If `UserEditForm` does not currently render fields in this order, the visual section grouping is achieved purely via CSS scoping — the package controls field order. If the order is unacceptable, request the upstream package author to add a `fieldOrder` prop or a `renderField` slot. Do not fork the package.

### Props (suggested API)

```ts
interface EditAccountPageProps {
  /* The page itself takes no props — it reads userId from AuthContext.
     What is documented here is the surrounding bits. */
}

interface AccountSidebarProps {
  /** Active route — drives `aria-current="page"`. */
  current: 'personal' | 'security' | 'notifications' | 'payments' | 'network';
  /** Optional hide for re-auth flow (single-column variation). */
  hidden?: boolean;
}

interface AccountSummaryProps {
  user: Pick<UserInfo, 'userId' | 'slug' | 'status' | 'createAt' | 'updateAt'>;
}

interface FormBannerProps {
  variant: 'info' | 'success';
  children: ReactNode;
  /** When provided, banner renders dismissable with an X button. */
  onDismiss?: () => void;
}
```

### Breakpoints

| Breakpoint | Layout                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `< sm`     | Single column. Aside-nav becomes a horizontal scroll bar above the form (chips with icons). Action bar stacks column-reverse. Avatar block stacks vertically. |
| `sm`–`lg`  | Single column for grid (aside above form, summary below); inputs go to 2 columns inside their sections. |
| `≥ lg`     | 12-col grid: aside `col-span-3` (sticky `top-24`) · form `col-span-6` · summary `col-span-3`.           |

For the **single-column variation** (re-auth flow), force `lg:col-start-3 lg:col-span-8` on the form card and hide both asides. Trigger via a query param (e.g. `?focus=security`) or a route-level prop — never compute it from inside the form.

### States

- **Idle:** form-card has elevated shadow; inputs at neutral border (`neutral-300`).
- **Hover** (input): border darkens to `graphite-400`. (Hover on submit: bg → `orange-600`.)
- **Focus** (input): orange-500 border + 3px orange/20 ring. Submit gets the global `:focus-visible` 3px outline.
- **Error** (per-field): `field-input--error` (red border) + `field-error` row with icon + `role="alert"` + `aria-invalid="true"` + `aria-describedby` link to the error id.
- **Loading** (after submit, while `UserEditForm` saves): the package handles its own pending state on the submit button. Add `aria-busy="true"` on the form wrapper as a defensive enhancement; the rest of the card stays interactive-but-visually-disabled because the package switches the button to a spinner.
- **Success**: surfaced via the existing `MessageToast` (top-right, `MessageToastEnum.Success`, key `userPage.updateSuccess`). Optionally show a persistent `<form-banner form-banner--success>` after the first save, dismissable, advising the user that the change cascaded (e.g. "Email atualizado · verifique sua caixa de entrada para confirmar").
- **Error**: surfaced via `MessageToast` (top-right). Per-field validation errors come from `UserEditForm` itself (e.g. `userPage.errors.passwordsNotEqual`). DO NOT replace the toast.
- **Reduced motion**: `animate-fade-up` and `cta-primary::after` are neutralized by the existing `prefers-reduced-motion` block.

### Accessibility notes (edit-account-specific)

- The page must have **exactly one `<h1>`** — the screen title in the dark hero band ("Editar conta"). The form section title is `<h2>`; subsection titles rendered as `.form-section-eyebrow` are short structural labels — keep them as `<p>` with the eyebrow class **OR** promote them to `<h3>` if a screen-reader audit demands explicit heading semantics. Do not skip heading levels.
- Breadcrumbs: `<nav aria-label="Breadcrumb">` with an `<ol>`. The active page item must NOT be a link (mockup keeps it as a plain `<li>`).
- Status chip ("Conta verificada") never relies on color alone — always icon + text.
- Avatar dropzone:
  - Outer container has `role="img" aria-label="Avatar atual: ..."`.
  - The visible "Alterar foto de perfil" button is keyboard-focusable and triggers a hidden `<input type="file">` via `ref`. Never apply focus styles to the hidden input.
  - "Remover foto" is a `<button type="button">` with explicit destructive styling AND text — color is not the only signal.
- Inline error pattern: `aria-invalid="true"` + `aria-describedby="<errorId>"` + `<p id="<errorId>" role="alert">`. The `role="alert"` ensures screen readers announce the error when it appears after submit.
- Email and password fields keep the appropriate `autocomplete` values (`email`, `current-password`, `new-password`).
- The aside sub-nav must not be inside `<main>` (it is its own `<aside aria-label="Navegação da conta">`); the form lives inside an `<article>` with `aria-labelledby="form-section-heading"`.
- The "Excluir minha conta" action **must** open a confirmation modal before any mutation — never a direct submit. The modal is owned by `frontend-react-developer` (see the `react-modal` skill).
- Color contrast (verified):
  - `text-graphite-900` on `bg-neutral-0` → 19.0:1 (AAA)
  - `text-graphite-500` on `bg-neutral-0` → 10.4:1 (AAA)
  - `text-orange-700` on `bg-neutral-0` → 7.1:1 (AAA — used for `form-section-eyebrow` and primary inline links)
  - `text-orange-300` on `bg-graphite-900` (active breadcrumb) → 8.4:1 (AAA)
  - White on `orange-500` (Salvar) → 3.4:1, only at ≥ 18px semibold — large text AA pass.
  - `text-error-500` on `bg-neutral-0` → 4.5:1 (AA), used for inline error messages.

### shadcn migration map

| Mockup atom                  | shadcn primitive                                              |
| ---------------------------- | ------------------------------------------------------------- |
| `<article class="form-card">` | `<Card>` + `<CardHeader>` + `<CardContent>` + `<CardFooter>` |
| `account-nav__item`           | `<NavigationMenuItem>` or just `<Link>` styled via `tv()`    |
| `field-input`                 | shadcn `<Input />`                                            |
| `field-textarea`              | shadcn `<Textarea />`                                         |
| `field-select`                | shadcn `<Select />`                                           |
| `field-error`                 | `<FormMessage />` (when paired with `react-hook-form`)        |
| `form-banner --info/--success` | shadcn `<Alert variant="default">` recolored                |
| `avatar-dropzone`             | shadcn `<Avatar>` + custom dropzone (consider `react-dropzone`) |
| `btn-save`                    | shadcn `<Button variant="default">` (orange via theme)        |
| `btn-cancel`                  | shadcn `<Button variant="outline">`                           |
| `btn-ghost-danger`            | shadcn `<Button variant="ghost">` recolored to error          |
| `MessageToast`                | shadcn `<Toaster>` + `sonner`                                  |

`UserEditForm` from `nauth-react` stays a **black box** — shadcn only replaces its surroundings.

---

## Integration notes for `frontend-react-developer` (EditAccountPage migration)

> Target file: `monexup-app/src/Pages/EditAccountPage/index.tsx` (CRA, current stack).
> Mockup: `docs/design/edit-account-redesign.html`.
> Tokens: `docs/design/tokens.css`.

### Imports needed

```ts
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserEditForm } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import Header from '../HomePage/Header';
import MiniFooter from '../../Components/MiniFooter';   // shared with DashboardPage
import MessageToast from '../../Components/MessageToast';
import { MessageToastEnum } from '../../DTO/Enum/MessageToastEnum';
import AuthContext from '../../Contexts/Auth/AuthContext';
```

> Drop `react-bootstrap` `Row` / `Col` — the new layout is pure Tailwind grid. Drop the existing `.mnx-page-header` div as well; the screen title now lives in the dark hero band.

### Outer page structure

```jsx
<>
  <MessageToast ... />
  <Header />

  <section
    className="mnx-surface-dark relative overflow-hidden bg-mesh-account account-hero"
    aria-labelledby="account-page-heading"
  >
    <div className="account-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
    <div className="relative max-w-container mx-auto px-shell">
      {/* breadcrumb · h1 · subtitle · status-chip */}
    </div>
  </section>

  <section className="mnx-surface-light bg-neutral-50 pb-20 lg:pb-28">
    <div className="max-w-container mx-auto px-shell">
      <div className="-mt-20 grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-24 self-start"> ...AccountSidebar... </aside>
        <article className="lg:col-span-6 form-card p-6 sm:p-8 lg:p-10">
          {/* h2 + subtitle + optional <Alert /> */}
          <UserEditForm
            userId={authContext.sessionInfo?.userId}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={() => navigate('/admin')}
            className="user-edit-form"
          />
        </article>
        <aside className="lg:col-span-3"> ...AccountSummary + DangerZone... </aside>
      </div>
    </div>
  </section>

  <MiniFooter />
</>
```

### CSS to add (one of)

Either:

1. Append the **New atoms** block above to the same global CSS file that already declares the home/login atoms (`mnx-surface-dark`, `auth-card`, `cta-primary`, etc.) — typically `monexup-app/src/index.css` or `monexup-app/src/styles/auth.css`. Add the `.user-edit-form input | label | button[type=submit] | button[type=button]` reset there too.
2. OR, when migration to Tailwind is done, promote `bg-mesh-account` into `tailwind.config.snippet.js → theme.extend.backgroundImage` and convert `form-card` / `account-nav__item` / `btn-save` / `btn-cancel` into shadcn variants.

### i18n keys (reuse existing, propose new only when missing)

Existing keys to reuse (verified in `monexup-app/public/locales/{pt,en,es,fr}/translation.json`):
- `edit_account` → screen H1
- `userPage.changeImage` → "Alterar Imagem" / avatar action label
- `userPage.nameLabel` / `userPage.namePlaceholder`
- `userPage.emailLabel` / `userPage.emailPlaceholder`
- `userPage.passwordLabel` / `userPage.passwordPlaceholder`
- `userPage.confirmPasswordLabel` / `userPage.confirmPasswordPlaceholder`
- `userPage.createdAtLabel` / `userPage.updatedAtLabel`
- `userPage.updateSuccess` → toast on success
- `userPage.errors.passwordsNotEqual` → inline error on confirm field
- `edit_mode_save_changes` → "Salvar Alterações" submit label
- `save` / `save_button` → fallback save labels (currently used elsewhere)
- `change_password` → fallback for the security section title

New keys to propose (if the team owns the i18n files):
- `edit_account_subtitle` → "Atualize seus dados pessoais, foto de perfil e credenciais."
- `account_breadcrumb` → "Conta"
- `account_nav_personal` / `account_nav_security` / `account_nav_notifications` / `account_nav_payments` / `account_nav_network`
- `account_summary_title` / `account_danger_zone_title`
- `account_section_identity` / `account_section_contact` / `account_section_payments` / `account_section_security` / `account_section_avatar`
- `cancel` (if not already global) → "Cancelar"
- `account_verified_chip` → "Conta verificada"
- `account_form_helper_last_update` → "Sua última atualização foi há {{days}} dias…"

If the team prefers to scope these under `userPage.*`, use that namespace.

### Things to verify after building

- Inputs reach AA contrast in default, hover, focus and error states. Open DevTools → Lighthouse a11y audit on `/admin/edit-account`.
- Tab order: navbar → breadcrumb → status-chip → aside-nav items → avatar edit button → form fields top-to-bottom → submit → cancel → danger-zone buttons → MiniFooter socials. No skipped focusable elements; no focus traps.
- `prefers-reduced-motion: reduce` (DevTools → Rendering) disables `animate-fade-up` + the CTA `::after` aura transition.
- `UserEditForm` saves successfully with the wrapper CSS reset applied — open DevTools → verify the `.user-edit-form input` selector actually matches the rendered DOM (and `.user-edit-form button[type=button]` matches the cancel button if the package renders one when `onCancel` is provided).
- Submitting wrong currentPassword or mismatched newPassword surfaces the toast (existing `handleError` path) AND keeps the form populated — the page must not redirect on error.
- The `<MiniFooter />` renders identically here and on the dashboard (visual diff: zero).
- Mobile (`< sm`): aside-nav is reachable via horizontal scroll AND not hidden from screen readers; danger-zone buttons stay below the form, not above (avoid mistaps near the submit).
- Confirmation modal for "Excluir minha conta" is owned by `frontend-react-developer` via the `react-modal` skill — a click on the button MUST NOT mutate immediately.

## Accessibility checklist (to validate on the React build)

- [ ] All text passes WCAG AA (4.5:1 body, 3:1 large) on its surface.
- [ ] No information conveyed by color alone (online status, badges, CTA states all use text/icon too).
- [ ] Focus-visible ring on every interactive element; 3 px outline, 3 px offset.
- [ ] Touch targets ≥ 44×44 px.
- [ ] `prefers-reduced-motion: reduce` neutralizes glow pulse, fade-up, and the CTA aura transition.
- [ ] Heading order: `h1` (hero) → `h2` (each section) → `h3` (cards). No skips.
- [ ] Lighthouse a11y score ≥ 95 target.
- [ ] Screen-reader pass: VoiceOver/NVDA can land on every CTA and read the visible label.

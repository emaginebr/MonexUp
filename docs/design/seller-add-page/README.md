# SellerAddPage — Compact Redesign

**Route:** `/new-seller` (+ network-scoped variants `/:networkSlug/new-seller`)
**Source:** `monexup-app/src/Pages/SellerAddPage/index.tsx`
**Mockup:** [`mockup.html`](./mockup.html) — both variants stacked (A = logged-in / edit, B = insert). Open in a browser.

Design DNA: **editorial-brutalist**, dark hero + light form surface. This redesign **preserves** the visual identity (Space Grotesk display, orange eyebrow chip, mesh hero, numbered sections, glow CTA) but **compacts** vertical rhythm so the entire form clears one viewport on md+ desktops.

---

## Before → After — vertical footprint

Rough estimates measured at `lg` (≥ 1024px). Numbers exclude the app chrome (Navbar/Footer).

| Region | Before | After | Delta |
|---|---|---|---|
| Hero band | ~360–420 px (`pt-16 lg:pt-20 pb-14 lg:pb-20` + `text-6xl` display) | ~140–160 px (`py-8 lg:py-8` + inline eyebrow/h1 at `text-[2rem]`) | **−250 px** |
| Info strip | ~90 px (`py-6` + `text-sm` + `border-b`) | ~44 px (`py-3` + `text-xs`, no divider) | **−46 px** |
| Personal (5 fields) | 3 rows × ~92 px = ~280 px (`md:grid-cols-2` + `h-12` + `gap-5`) | 3 rows × ~76 px = ~230 px (`md:grid-cols-6` — same 3 rows, tighter) | **−50 px** |
| Address (6 fields) | 3 rows × ~92 px = ~280 px | 3 rows × ~76 px = ~230 px | **−50 px** |
| Password (2 fields, insert only) | ~92 px | ~76 px | **−16 px** |
| Inter-section gaps (2× or 3×) | 40 px each (`space-y-10`) | 24 px each (`space-y-6`) | **−32 to −48 px** |
| Form section outer padding | 224 px total (`py-14 lg:py-20` × 2) | 80 px total (`py-8 lg:py-10` × 2) | **−144 px** |
| Card outer form padding | 80 px total (`py-8 lg:py-10` × 2) | 64 px total (`py-6 lg:py-8` × 2) | **−16 px** |

**Total desktop height (edit mode, 2 sections):** ~1400–1500 px → **~840–900 px** (≈ 1 viewport at 1440×900).
**Total desktop height (insert mode, 3 sections):** ~1580–1680 px → **~940–1000 px** (just over the fold, submit still visible after ~1 scroll unit).

Mobile heights are essentially unchanged — this redesign optimizes for md+ because the fields already stack 1-col below `md`.

---

## Layout tables

### Hero strip

Composition changes on md+:

| Element | Before | After |
|---|---|---|
| Container padding | `pt-16 lg:pt-20 pb-14 lg:pb-20` | `py-6 lg:py-8` |
| Eyebrow chip | Standalone row, `mt-6` gap to h1 | Same row as h1 on md+ (`flex flex-wrap items-center gap-3`) |
| H1 | `display-headline text-4xl sm:text-5xl lg:text-6xl mt-6` | `display-headline text-2xl sm:text-3xl lg:text-[2rem] leading-tight` |
| Subtitle | `mt-5 text-base lg:text-lg` | `mt-2 text-sm lg:text-base`, still `max-w-2xl` |
| Wrapper max width | `max-w-3xl` | `max-w-3xl` (unchanged) |
| Mesh + hero-grid | Kept | Kept |

Wrap behavior: on `<sm`, the eyebrow chip and h1 wrap onto separate lines (via `flex-wrap`), keeping mobile identical in structure to today.

### Section 01 — Personal

| Field | Grid span (md+) | Icon | Notes |
|---|---|---|---|
| Nome | `md:col-span-6` | `User` | Full row |
| CPF | `md:col-span-3` | `IdCard` | Row 2 left half |
| Data de nasc. | `md:col-span-3` | `Calendar` | Row 2 right half |
| Email | `md:col-span-4` | `Mail` | Row 3 wider (email is long) |
| Telefone | `md:col-span-2` | `Phone` | Row 3 narrower |

Grid: `grid grid-cols-1 md:grid-cols-6 gap-4` (was `md:grid-cols-2 gap-5`).

### Section 02 — Endereço

| Field | Grid span (md+) | Icon | Notes |
|---|---|---|---|
| CEP | `md:col-span-2` | `MapPin` | Row 1 short |
| Endereço | `md:col-span-4` | `Home` | Row 1 wide |
| Complemento | `md:col-span-2` | `Building2` | Row 2 short |
| Bairro | `md:col-span-3` | `MapPin` | Row 2 medium |
| Cidade | `md:col-span-2` | `Building2` | Row 2 short — completes row 2 (2+3+2 doesn't fit in 6, see note) |
| Estado | `md:col-span-1` | `MapPin` | Row 3 with Cidade — see note |

**Row layout correction** (mockup is authoritative):
- Row 1: CEP(2) + Endereço(4) = 6
- Row 2: Complemento(2) + Bairro(3) + Estado(1) = 6 (Complemento is short so pairs with Bairro)
- Row 3: Cidade(2) fills the leftmost. If the visual asymmetry bothers you at rebuild time, an alternative is Complemento(2)+Bairro(4) row 2 / Cidade(4)+Estado(2) row 3 — same 6-col chassis.

The mockup ships the compact variant that fills exactly 3 rows: CEP(2)+Endereço(4) / Complemento(2)+Bairro(3)+Estado(1) is 6, then Cidade(2) alone on row 3. Discuss with the developer if the trailing empty span looks wrong in practice — the responsive collapse to 1-col below md hides the issue entirely on phones.

### Section 03 — Senha (insert only)

Unchanged grid: `grid grid-cols-1 md:grid-cols-2 gap-4` (gap tightened from 5 → 4). Fields: `Senha` + `Confirmar senha`, both `Lock` icons, `type="password"`.

---

## Class-by-class handoff for `frontend-react-developer`

**Do NOT change:** business logic, `handleSubmit`, `useEffect`, i18n keys, `MessageToast`, `SectionHeading`'s existence (only its internal classes), `insertMode` gating, the two form input helper strings' *purpose* (just their values). No new deps.

### File-level constants (top of component)

```diff
- const inputBase =
-   "w-full h-12 pl-11 pr-3 rounded-md bg-white border border-graphite-200 text-graphite-900 placeholder:text-graphite-400 outline-none transition-colors duration-fast focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
+ const inputBase =
+   "w-full h-11 md:h-10 pl-10 md:pl-9 pr-3 rounded-md bg-white border border-graphite-200 text-graphite-900 placeholder:text-graphite-400 outline-none transition-colors duration-fast focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

- const labelBase =
-   "block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-2";
+ const labelBase =
+   "block text-[11px] font-semibold uppercase tracking-wider text-graphite-500 mb-1.5";

  const iconWrap =
-   "absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400 pointer-events-none";
+   "absolute left-3 md:left-2.5 top-1/2 -translate-y-1/2 text-graphite-400 pointer-events-none";
```

All lucide icons: `size={18}` → `size={16}`.

### Hero band

```diff
- <div className="relative max-w-container mx-auto px-shell pt-16 lg:pt-20 pb-14 lg:pb-20">
-   <div className="max-w-3xl animate-fade-up">
-     <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs …">
-       <Zap size={12} … /> {t("sellerAddPage.eyebrow")}
-     </span>
-     <h1 className="display-headline text-mnx-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl">
-       {t("sellerAddPage.title")}
-     </h1>
-     <p className="mt-5 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-2xl">
-       {t("sellerAddPage.subtitle")}
-     </p>
-   </div>
- </div>
+ <div className="relative max-w-container mx-auto px-shell py-6 lg:py-8">
+   <div className="max-w-3xl animate-fade-up">
+     <div className="flex flex-wrap items-center gap-3">
+       <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase text-orange-200 bg-orange-500/10 border border-orange-500/30">
+         <Zap size={12} aria-hidden="true" />
+         {t("sellerAddPage.eyebrow")}
+       </span>
+       <h1 className="display-headline text-mnx-neutral-50 text-2xl sm:text-3xl lg:text-[2rem] leading-tight">
+         {t("sellerAddPage.title")}
+       </h1>
+     </div>
+     <p className="mt-2 text-graphite-200 text-sm lg:text-base leading-relaxed max-w-2xl">
+       {t("sellerAddPage.subtitle")}
+     </p>
+   </div>
+ </div>
```

### Form section wrapper

```diff
- <section className="mnx-surface-light bg-mnx-neutral-50 py-14 lg:py-20">
+ <section className="mnx-surface-light bg-mnx-neutral-50 py-8 lg:py-10">
```

### Card info strip

```diff
- <div className="px-6 lg:px-10 py-6 border-b border-graphite-200 bg-mnx-neutral-50">
-   <p className="text-sm text-graphite-600 leading-relaxed">
+ <div className="px-6 lg:px-10 py-3 bg-mnx-neutral-50">
+   <p className="text-xs text-graphite-600 leading-relaxed">
     {t("sellerAddPage.registrationNote")}
   </p>
 </div>
```

### Form container

```diff
- <form onSubmit={handleSubmit} className="px-6 lg:px-10 py-8 lg:py-10 space-y-10" noValidate>
+ <form onSubmit={handleSubmit} className="px-6 lg:px-10 py-6 lg:py-8 space-y-6" noValidate>
```

### Section 01 grid

```diff
- <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
+ <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-0">
```

Field wrappers:
- Nome — `<div className="md:col-span-6">`
- CPF — `<div className="md:col-span-3">`
- Data — `<div className="md:col-span-3">`
- Email — `<div className="md:col-span-4">`
- Telefone — `<div className="md:col-span-2">`

### Section 02 grid

Already `md:grid-cols-6`. Change `gap-5` → `gap-4`, `mt-6` → `mt-0`. Field spans:

- CEP `2`, Endereço `4`, Complemento `2`, Bairro `3`, Estado `1`, Cidade `2` (see layout note above).

### Section 03 grid

```diff
- <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
+ <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0">
```

### `SectionHeading` component

```diff
  function SectionHeading({ index, title }: { index: string; title: string }) {
    return (
-     <div className="flex items-baseline gap-4 border-b border-graphite-200 pb-3">
-       <span className="font-display text-sm font-bold tracking-wider text-orange-500">
+     <div className="flex items-baseline gap-3 border-b border-mnx-neutral-100 pb-2 mb-4">
+       <span className="font-display text-xs font-bold tracking-wider text-orange-500">
          {index}
        </span>
-       <h2 className="font-display text-xl lg:text-2xl font-bold text-graphite-900 tracking-tight">
+       <h2 className="font-display text-base lg:text-lg font-bold text-graphite-900 tracking-tight">
          {title}
        </h2>
      </div>
    );
  }
```

Because heading now has its own `mb-4`, remove the `mt-6` from each section's inner grid (see grid diffs above).

### Actions row

```diff
- <div className="pt-4 border-t border-graphite-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
+ <div className="pt-3 border-t border-mnx-neutral-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
    <button type="button" …
-     className="inline-flex h-12 items-center justify-center px-5 rounded-md text-sm font-semibold text-graphite-700 border border-graphite-300 hover:border-graphite-500 hover:bg-graphite-50 transition-colors duration-fast">
-     <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
+     className="inline-flex h-11 md:h-10 items-center justify-center px-5 rounded-md text-sm font-semibold text-graphite-700 border border-graphite-300 hover:border-graphite-500 hover:bg-graphite-50 transition-colors duration-fast">
+     <ArrowLeft size={16} className="mr-2" aria-hidden="true" />
      {t("buttons.back")}
    </button>
    <button type="submit" …
-     className="cta-primary inline-flex h-12 items-center justify-center px-7 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-fast shadow-glow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500">
-     <Save size={18} className="mr-2" aria-hidden="true" />
+     className="cta-primary inline-flex h-11 md:h-10 items-center justify-center px-7 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-fast shadow-glow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500">
+     <Save size={16} className="mr-2" aria-hidden="true" />
```

---

## Responsive behavior

- **`<sm` (< 640px):** hero eyebrow chip and h1 wrap onto separate lines via `flex-wrap`. H1 stays at `text-2xl`. Inputs stay at `h-11` (44px tap target). All grids collapse to `grid-cols-1`.
- **`sm` (640–768px):** h1 grows to `text-3xl`. Grids still 1-col (grid `md:` breakpoint hasn't kicked in). Fields remain full-width.
- **`md` (768–1024px):** grid switches to 6-col. Input heights drop to `h-10`, icons re-anchor to `left-2.5`, padding to `pl-9`. Sections stop stacking.
- **`lg` (≥ 1024px):** h1 reaches `text-[2rem]`, form section padding hits `py-10`, card outer form `py-8`. Full 3-section form clears the fold on a 1440×900 desktop.

Contrast and focus: unchanged — orange 500 on white for focus ring (`ring-2 ring-orange-500/30`), graphite-900 text on neutral-0 card (>13:1). Reduced-motion honored by existing `--duration-*` tokens.

---

## Constraints upheld

- Editorial-brutalist DNA kept: `display-headline`, mesh hero, `hero-grid` overlay, eyebrow chip, numbered sections, `cta-primary` glow.
- No new colors, no new fonts, no new tokens.
- All lucide icons retained, just resized `18 → 16`.
- Password section preserved as-is (only rendered when `insertMode`).
- Mobile tap targets stay `≥ 44 px` (`h-11`), only shrunk on `md+`.
- i18n untouched — no new keys, all `t("sellerAddPage.*")` calls reused verbatim.
- No new dependencies.

## Not included

- `.tsx` React code — this is design handoff only. Route the actual React implementation to `frontend-react-developer` with this README as the spec.
- Modal/alert changes — none needed.
- Tests — none needed (visual-only change).

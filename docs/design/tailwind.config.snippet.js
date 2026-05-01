/**
 * MonexUp — Tailwind CSS configuration snippet (theme.extend)
 * ----------------------------------------------------------------------------
 * Direction: Editorial Brutalist · Dark/Light Split
 *
 * How to consume:
 *   - Drop this `theme.extend` block into the future Vite project's
 *     `tailwind.config.js` (or merge with the existing one).
 *   - Pair with `tokens.css` imported once at the app entry — every Tailwind
 *     utility below resolves to a CSS variable, so flipping a section's
 *     surface (mnx-surface-dark / mnx-surface-light) re-skins everything.
 *   - When shadcn/ui is added, its CSS variables (--background, --foreground,
 *     --primary, etc.) should map onto the semantic tokens here. See
 *     `component-spec.md` § "shadcn/ui mapping".
 *
 * Note: The current app runs on CRA + Bootstrap + MUI. This snippet is for
 *       the migration target (Vite + Tailwind + shadcn/ui), NOT for the
 *       current app. The mockup HTML uses Tailwind via CDN with these tokens.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand
        orange: {
          50:  'var(--color-orange-50)',
          100: 'var(--color-orange-100)',
          200: 'var(--color-orange-200)',
          300: 'var(--color-orange-300)',
          400: 'var(--color-orange-400)',
          500: 'var(--color-orange-500)',
          600: 'var(--color-orange-600)',
          700: 'var(--color-orange-700)',
          800: 'var(--color-orange-800)',
          900: 'var(--color-orange-900)',
          DEFAULT: 'var(--color-orange-500)',
        },
        graphite: {
          50:  'var(--color-graphite-50)',
          100: 'var(--color-graphite-100)',
          200: 'var(--color-graphite-200)',
          300: 'var(--color-graphite-300)',
          400: 'var(--color-graphite-400)',
          500: 'var(--color-graphite-500)',
          600: 'var(--color-graphite-600)',
          700: 'var(--color-graphite-700)',
          800: 'var(--color-graphite-800)',
          900: 'var(--color-graphite-900)',
        },
        neutral: {
          0:   'var(--color-neutral-0)',
          50:  'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
        },

        // Semantic aliases (recommended bind point for components)
        surface: {
          page:    'var(--surface-page)',
          canvas:  'var(--surface-canvas)',
          raised:  'var(--surface-raised)',
          sunken:  'var(--surface-sunken)',
        },
        content: {
          primary:   'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          tertiary:  'var(--content-tertiary)',
          'on-brand': 'var(--content-on-brand)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          active:  'var(--accent-active)',
          soft:    'var(--accent-soft-bg)',
        },
        border: {
          subtle:  'var(--border-subtle)',
          default: 'var(--border-default)',
          strong:  'var(--border-strong)',
        },

        // Status (decoupled from brand)
        success: 'var(--color-success-500)',
        warn:    'var(--color-warn-500)',
        error:   'var(--color-error-500)',
        info:    'var(--color-info-500)',
      },

      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },

      fontSize: {
        xs:   ['var(--fs-xs)',   { lineHeight: 'var(--lh-normal)' }],
        sm:   ['var(--fs-sm)',   { lineHeight: 'var(--lh-normal)' }],
        base: ['var(--fs-base)', { lineHeight: 'var(--lh-normal)' }],
        md:   ['var(--fs-md)',   { lineHeight: 'var(--lh-relaxed)' }],
        lg:   ['var(--fs-lg)',   { lineHeight: 'var(--lh-snug)' }],
        xl:   ['var(--fs-xl)',   { lineHeight: 'var(--lh-snug)' }],
        '2xl':['var(--fs-2xl)',  { lineHeight: 'var(--lh-snug)' }],
        '3xl':['var(--fs-3xl)',  { lineHeight: 'var(--lh-tight)' }],
        '4xl':['var(--fs-4xl)',  { lineHeight: 'var(--lh-tight)' }],
        '5xl':['var(--fs-5xl)',  { lineHeight: 'var(--lh-tight)' }],
        '6xl':['var(--fs-6xl)',  { lineHeight: 'var(--lh-tight)' }],
        '7xl':['var(--fs-7xl)',  { lineHeight: 'var(--lh-tight)' }],
      },

      fontWeight: {
        light:    'var(--fw-light)',
        regular:  'var(--fw-regular)',
        medium:   'var(--fw-medium)',
        semibold: 'var(--fw-semibold)',
        bold:     'var(--fw-bold)',
        black:    'var(--fw-black)',
      },

      letterSpacing: {
        tighter: 'var(--ls-tighter)',
        tight:   'var(--ls-tight)',
        normal:  'var(--ls-normal)',
        wide:    'var(--ls-wide)',
        wider:   'var(--ls-wider)',
      },

      spacing: {
        // Tailwind already covers 0-96 in 4px steps; only add brand-specific
        // tokens that go beyond defaults or use non-standard values.
        'gutter': 'var(--grid-gutter)',
        'shell':  'var(--container-pad)',
      },

      maxWidth: {
        container: 'var(--container-max)',
        prose:     '65ch',
      },

      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl':'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'glow-sm': 'var(--shadow-glow-orange-sm)',
        'glow-md': 'var(--shadow-glow-orange-md)',
        'glow-lg': 'var(--shadow-glow-orange-lg)',
      },

      transitionTimingFunction: {
        standard:    'var(--ease-standard)',
        emphasized:  'var(--ease-emphasized)',
        out:         'var(--ease-out)',
      },

      transitionDuration: {
        fast:   'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow:   'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      backgroundImage: {
        // Hero mesh: subtle dark mesh with orange glow off-center.
        'mesh-hero':
          'radial-gradient(ellipse 80% 60% at 75% 30%, rgba(232, 90, 26, 0.28), transparent 60%),' +
          'radial-gradient(ellipse 60% 50% at 15% 80%, rgba(232, 90, 26, 0.10), transparent 65%),' +
          'linear-gradient(180deg, #0A0A0D 0%, #131317 100%)',
        'mesh-footer':
          'linear-gradient(180deg, #131317 0%, #0A0A0D 100%)',
        'angular-divider':
          'linear-gradient(170deg, var(--color-graphite-900) 0%, var(--color-graphite-900) 50%, var(--color-neutral-50) 50.5%, var(--color-neutral-50) 100%)',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: 'var(--shadow-glow-orange-md)' },
          '50%':      { boxShadow: 'var(--shadow-glow-orange-lg)' },
        },
      },
      animation: {
        'fade-up':    'fade-up var(--duration-slow) var(--ease-out) both',
        'pulse-glow': 'pulse-glow 2.4s var(--ease-standard) infinite',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('tailwindcss-animate'),  // shadcn/ui dep
  ],
};

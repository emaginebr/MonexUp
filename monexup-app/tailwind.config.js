/**
 * MonexUp — Tailwind configuration
 *
 * Coexistence note: Bootstrap 5 + MUI continue to power every page outside
 * the home route. To prevent Tailwind's preflight from globally resetting
 * elements that Bootstrap also resets (creating layering surprises in legacy
 * pages), we DISABLE preflight here. The home route opts in to a scoped
 * reset via the `mnx-surface-dark` / `mnx-surface-light` wrappers in
 * `src/styles/globals.css`.
 *
 * The `theme.extend` block below is copied from `docs/design/tailwind.config.snippet.js`.
 * Source of truth for design tokens lives in `src/styles/tokens.css`.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  corePlugins: {
    // Bootstrap already provides a reset (Reboot). Preflight on top of it
    // double-resets and breaks legacy pages. The home route applies its own
    // scoped reset via `.mnx-surface-*` selectors in globals.css.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Brand
        orange: {
          50: "var(--color-orange-50)",
          100: "var(--color-orange-100)",
          200: "var(--color-orange-200)",
          300: "var(--color-orange-300)",
          400: "var(--color-orange-400)",
          500: "var(--color-orange-500)",
          600: "var(--color-orange-600)",
          700: "var(--color-orange-700)",
          800: "var(--color-orange-800)",
          900: "var(--color-orange-900)",
          DEFAULT: "var(--color-orange-500)",
        },
        graphite: {
          50: "var(--color-graphite-50)",
          100: "var(--color-graphite-100)",
          200: "var(--color-graphite-200)",
          300: "var(--color-graphite-300)",
          400: "var(--color-graphite-400)",
          500: "var(--color-graphite-500)",
          600: "var(--color-graphite-600)",
          700: "var(--color-graphite-700)",
          800: "var(--color-graphite-800)",
          900: "var(--color-graphite-900)",
        },
        // Use a dedicated `mnx-neutral` namespace so we don't clobber Tailwind's
        // built-in `neutral-*` palette (Bootstrap-side code may rely on it).
        "mnx-neutral": {
          0: "var(--color-neutral-0)",
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
        },

        // Semantic aliases (recommended bind point for components)
        surface: {
          page: "var(--surface-page)",
          canvas: "var(--surface-canvas)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
        },
        content: {
          primary: "var(--content-primary)",
          secondary: "var(--content-secondary)",
          tertiary: "var(--content-tertiary)",
          "on-brand": "var(--content-on-brand)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          soft: "var(--accent-soft-bg)",
        },
        "mnx-border": {
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          strong: "var(--border-strong)",
        },

        // Status (decoupled from brand)
        success: "var(--color-success-500)",
        warn: "var(--color-warn-500)",
        error: "var(--color-error-500)",
        info: "var(--color-info-500)",
      },

      fontFamily: {
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },

      maxWidth: {
        container: "var(--container-max)",
        prose: "65ch",
      },

      spacing: {
        gutter: "var(--grid-gutter)",
        shell: "var(--container-pad)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "glow-sm": "var(--shadow-glow-orange-sm)",
        "glow-md": "var(--shadow-glow-orange-md)",
        "glow-lg": "var(--shadow-glow-orange-lg)",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
        out: "var(--ease-out)",
      },

      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },

      backgroundImage: {
        "mesh-hero":
          "radial-gradient(ellipse 80% 60% at 75% 30%, rgba(232, 90, 26, 0.28), transparent 60%)," +
          "radial-gradient(ellipse 60% 50% at 15% 80%, rgba(232, 90, 26, 0.10), transparent 65%)," +
          "linear-gradient(180deg, #0A0A0D 0%, #131317 100%)",
        "mesh-balance":
          "radial-gradient(ellipse 60% 80% at 85% 20%, rgba(232, 90, 26, 0.30), transparent 60%)," +
          "radial-gradient(ellipse 40% 60% at 10% 90%, rgba(232, 90, 26, 0.10), transparent 70%)," +
          "linear-gradient(135deg, #0A0A0D 0%, #131317 100%)",
        "mesh-footer":
          "linear-gradient(180deg, #131317 0%, #0A0A0D 100%)",
        "angular-divider":
          "linear-gradient(170deg, var(--color-graphite-900) 0%, var(--color-graphite-900) 50%, var(--color-neutral-50) 50.5%, var(--color-neutral-50) 100%)",
      },

      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "var(--shadow-glow-orange-md)" },
          "50%": { boxShadow: "var(--shadow-glow-orange-lg)" },
        },
      },
      animation: {
        "fade-up": "fade-up var(--duration-slow) var(--ease-out) both",
        "pulse-glow": "pulse-glow 2.4s var(--ease-standard) infinite",
      },
    },
  },
  plugins: [],
};

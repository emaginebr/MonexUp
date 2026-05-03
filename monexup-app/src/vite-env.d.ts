/// <reference types="vite/client" />

/**
 * Compatibility shim for the CRA → Vite migration.
 *
 * Existing code reads `process.env.REACT_APP_*`. We replace those at build
 * time via `vite.config.ts -> define`. This ambient declaration keeps the
 * TypeScript compiler happy while the rename happens incrementally.
 *
 * For NEW code, prefer `import.meta.env.VITE_*` and the `ImportMetaEnv`
 * interface below.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;

    // Legacy CRA variables — still consumed by code; replaced at build time.
    readonly REACT_APP_PRODUCTION?: string;
    readonly REACT_APP_SITE_BASENAME?: string;
    readonly REACT_APP_PROJECT_NAME?: string;
    readonly REACT_APP_WEBSITE_NAME?: string;
    readonly REACT_APP_TENANT_ID?: string;
    readonly REACT_APP_API_URL?: string;
    readonly REACT_APP_NAUTH_API_URL?: string;
    readonly REACT_APP_LOFN_API_URL?: string;
    readonly REACT_APP_DEDALO_API_URL?: string;
    readonly REACT_APP_PROXYPAY_API_URL?: string;
    readonly REACT_APP_PROXYPAY_CLIENT_ID?: string;
    readonly REACT_APP_PROXYPAY_TENANT_ID?: string;
    readonly REACT_APP_STRIPE_PUBLISHABLE_KEY?: string;

    // Allow any REACT_APP_* lookup without a typo error.
    readonly [key: `REACT_APP_${string}`]: string | undefined;
  }
}

interface ImportMetaEnv {
  readonly VITE_TENANT_ID?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_NAUTH_API_URL?: string;
  readonly VITE_LOFN_API_URL?: string;
  readonly VITE_DEDALO_API_URL?: string;
  readonly VITE_PROXYPAY_API_URL?: string;
  readonly VITE_PROXYPAY_CLIENT_ID?: string;
  readonly VITE_PROXYPAY_TENANT_ID?: string;
  readonly VITE_SITE_BASENAME?: string;
  readonly VITE_PROJECT_NAME?: string;
  readonly VITE_WEBSITE_NAME?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

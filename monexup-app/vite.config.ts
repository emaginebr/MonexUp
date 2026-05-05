/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * MonexUp — Vite configuration
 *
 * Migration notes (CRA → Vite):
 *  - Existing source code reads `process.env.REACT_APP_*` everywhere. Rather
 *    than rewriting every call site in a single sweep, we expose those reads
 *    as compile-time `define` substitutions sourced from the same `.env` files.
 *  - Going forward, NEW code should prefer `import.meta.env.VITE_*`. We accept
 *    BOTH `REACT_APP_*` and `VITE_*` in `.env` and surface them under both
 *    names so the codebase can migrate variable-by-variable.
 *  - Dev server pinned to port 3000 to match prior CRA expectations.
 */
export default defineConfig(({ mode }) => {
  // Load every key (no prefix filter) so we can pick up REACT_APP_* without
  // forcing rename in .env files. We still also consume VITE_* aliases.
  const env = loadEnv(mode, process.cwd(), "");

  // Map every REACT_APP_* (or NODE_ENV/PUBLIC_URL) key in the .env into a
  // `process.env.<name>` define. Vite replaces these at build time so the
  // existing `process.env.REACT_APP_FOO` reads keep working without code change.
  const reactAppDefines: Record<string, string> = {};
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("REACT_APP_") ||
      key === "NODE_ENV" ||
      key === "PUBLIC_URL"
    ) {
      reactAppDefines[`process.env.${key}`] = JSON.stringify(env[key] ?? "");
    }
  }

  // VITE_* aliases: if a `VITE_FOO` exists, also expose it as
  // `process.env.REACT_APP_FOO` for the legacy code paths.
  for (const key of Object.keys(env)) {
    if (key.startsWith("VITE_")) {
      const reactKey = "REACT_APP_" + key.slice("VITE_".length);
      // Don't overwrite an explicit REACT_APP_* value if it exists.
      if (!(`process.env.${reactKey}` in reactAppDefines)) {
        reactAppDefines[`process.env.${reactKey}`] = JSON.stringify(
          env[key] ?? ""
        );
      }
    }
  }

  // Make sure NODE_ENV is always defined (i18n.tsx reads it).
  if (!("process.env.NODE_ENV" in reactAppDefines)) {
    reactAppDefines["process.env.NODE_ENV"] = JSON.stringify(mode);
  }

  return {
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            "legacy-js-api",
            "import",
            "global-builtin",
            "color-functions",
            "if-function",
          ],
          quietDeps: true,
        },
      },
    },
    server: {
      port: 3000,
      open: false,
    },
    preview: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      ...reactAppDefines,
      // Some deps reference plain `process.env` — keep it as an empty object
      // so destructuring against it doesn't throw in the browser bundle.
      "process.env.PUBLIC_URL": JSON.stringify(env.PUBLIC_URL ?? "/"),
    },
    build: {
      outDir: "build",
      sourcemap: false,
    },
    optimizeDeps: {
      include: ["moment"],
    },
    test: {
      environment: "jsdom",
      globals: false,
      include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
      // Avoid pulling the legacy CRA setupTests.js that depends on jest-dom
      // — re-enable once we author a vitest-native setup file.
      setupFiles: [],
    },
    // Keep CRA-style `.env` resolution semantics; Vite already loads from
    // .env, .env.<mode>, .env.local, .env.<mode>.local automatically.
  };
});

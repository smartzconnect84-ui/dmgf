// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Vite only exposes VITE_-prefixed vars to the dev server process, but the SSR
// code (src/integrations/supabase/client.server.ts etc.) reads the unprefixed
// SUPABASE_* names. Bridge every value from .env into process.env so the server
// can see them in local dev without duplicating keys with a VITE_ prefix.
const __dmgfEnv = loadEnv("development", process.cwd(), "");
for (const [__k, __v] of Object.entries(__dmgfEnv)) {
  if (process.env[__k] === undefined) process.env[__k] = __v;
}

const devSupabaseRedirectUrl =
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  __dmgfEnv.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  "";

export default defineConfig({
  vite: {
    define: {
      __DMGF_DEV_SUPABASE_REDIRECT_URL__: JSON.stringify(devSupabaseRedirectUrl),
    },
    // Vercel expects a standard Vite SPA build output in dist. We override the
    // build output directory so npm run build -> dist (for the Vercel SPA route).
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

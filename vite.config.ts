// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const devSupabaseRedirectUrl =
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  loadEnv("development", process.cwd(), "").NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  "";

export default defineConfig({
  vite: {
    define: {
      __DMGF_DEV_SUPABASE_REDIRECT_URL__: JSON.stringify(devSupabaseRedirectUrl),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

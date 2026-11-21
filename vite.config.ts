import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const env = loadEnv("development", process.cwd(), "");
const devSupabaseRedirectUrl =
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  "";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  define: {
    __DMGF_DEV_SUPABASE_REDIRECT_URL__: JSON.stringify(devSupabaseRedirectUrl),
  },
  build: { outDir: "dist", emptyOutDir: true },
  server: { host: "0.0.0.0", port: 8080 },
});

function createSupabaseClient() {
  // Public config: VITE_ vars are injected at build time for the browser.
  // On this host, add them under Backend → Secrets so both dev and
  // production builds can read them. Server-side rendering falls back to
  // plain SUPABASE_* names when VITE_ vars are not present.
  // Accepts both the new publishable key name and the legacy anon key name
  // (Lovable / older Supabase projects use VITE_SUPABASE_ANON_KEY).
  const SUPABASE_URL =
    getPublicEnv("VITE_SUPABASE_URL") ||
    getPublicEnv("SUPABASE_URL") ||
    getPublicEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    "https://npsxzfyuqfynaobilqdp.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    getPublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getPublicEnv("SUPABASE_PUBLISHABLE_KEY") ||
    getPublicEnv("VITE_SUPABASE_ANON_KEY") ||
    getPublicEnv("SUPABASE_ANON_KEY") ||
    getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    getPublicEnv("VITE_SUPABASE_KEY") ||
    getPublicEnv("SUPABASE_KEY") ||
    "sb_publishable_ahLDKIcXfJ0moZV8dC3Xfg_XvsQfI5U";

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) under Backend → Secrets and restart.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});

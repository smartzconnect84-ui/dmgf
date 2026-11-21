// Server-only owner credentials. The .server.ts suffix prevents Vite from
// bundling this file into the browser — the initial password never reaches
// client JavaScript. Reads env at request time (Cloudflare-style binds).
export const OWNER_EMAIL = "info24dmgf@gmail.com";
export const OWNER_DISPLAY_NAME = "DMGF App Owner";
// Owner-requested initial credential. Set OWNER_INITIAL_PASSWORD under
// Backend → Secrets to override without code changes.
export const OWNER_INITIAL_PASSWORD = process.env.OWNER_INITIAL_PASSWORD || "Deesire@2024";

// Static asset Worker for the DMGF SPA.
// Wrangler's ASSETS binding serves the Vite build from ./dist and falls back to
// index.html for client-side routes (not_found_handling: single-page-application).
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};

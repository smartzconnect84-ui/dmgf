// Auth session storage for the Supabase client.
// Uses the browser's localStorage on every host (preview + production).
// Kept as a separate module so the client import stays unchanged.

/** Storage accepted by Supabase's `auth.storage` option. */
export interface PreviewAuthStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

/**
 * Returns localStorage in the browser, undefined during SSR.
 * Local auth per browser is the correct behaviour in production —
 * sessions must never be shared across visitors.
 */
export function brokeredPreviewStorage(): PreviewAuthStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

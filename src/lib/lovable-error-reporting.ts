// Generic client-side error hook. Previously wired to an external preview
// reporter; now a safe no-op that logs to the console so the app behaves
// identically in every deployment environment.

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) {
    console.error("[app-error]", error, context);
  }
}

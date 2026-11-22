import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2, Mail } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: search.next === "/reset-password" ? "/reset-password" : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    errorCode: typeof search.error_code === "string" ? search.error_code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verifying Reset Link · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { error, errorCode } = Route.useSearch();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let active = true;

    if (error || errorCode) {
      setExpired(true);
      return;
    }

    const timer = window.setTimeout(() => {
      if (active) setExpired(true);
    }, 12000);

    const finishRecovery = () => {
      if (!active) return;
      window.clearTimeout(timer);
      void navigate({ to: "/reset-password", search: { recovery: true } });
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        finishRecovery();
      }
    });

    void supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        window.clearTimeout(timer);
        setExpired(true);
      } else if (sessionData.session) {
        finishRecovery();
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [error, errorCode, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-gold/20 bg-[#11110f]/95 p-8 shadow-2xl shadow-black/40">
        {expired ? (
          <>
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 text-red-200">
              <AlertTriangle aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl">This reset link is no longer valid.</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Request a fresh password reset email, then open the newest link in the same browser.
            </p>
            <Link
              to="/auth"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-medium text-ink shadow-gold"
            >
              <Mail aria-hidden="true" className="size-4" /> Request a fresh link
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3 text-sm text-white/65" role="status">
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-gold" /> Verifying your
            secure reset link…
          </div>
        )}
      </section>
    </main>
  );
}

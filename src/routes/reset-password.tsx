import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    recovery: search.recovery === true || search.recovery === "true" || search.recovery === "1",
  }),
  head: () => ({
    meta: [{ title: "Reset Password · DMGF" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { recovery } = Route.useSearch();
  const [ready, setReady] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [linkExpired, setLinkExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const linkError = query.get("error_code") ?? hash.get("error_code") ?? query.get("error");
    const linkType = query.get("type") ?? hash.get("type");
    const isRecoveryLink = recovery || linkType === "recovery";

    if (linkError) {
      setCheckingLink(false);
      setLinkExpired(true);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!active) return;
      setCheckingLink(false);
      setLinkExpired(true);
    }, 12000);

    const markReady = () => {
      if (!active) return;
      window.clearTimeout(timer);
      setReady(true);
      setCheckingLink(false);
      setLinkExpired(false);
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && isRecoveryLink && session)) {
        markReady();
      }
    });

    const accessToken = query.get("access_token") ?? hash.get("access_token");
    const refreshToken = query.get("refresh_token") ?? hash.get("refresh_token");
    if (accessToken && refreshToken && isRecoveryLink) {
      void supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data: setData, error: setError }) => {
          if (!active) return;
          if (setError || !setData.session) {
            window.clearTimeout(timer);
            setCheckingLink(false);
            setLinkExpired(true);
          } else {
            markReady();
          }
        });
    }

    void supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        window.clearTimeout(timer);
        setCheckingLink(false);
        setLinkExpired(true);
      } else if (sessionData.session && isRecoveryLink) {
        markReady();
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [recovery]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Check both fields and try again.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        const message = updateError.message.toLowerCase();
        if (
          message.includes("expired") ||
          message.includes("session") ||
          message.includes("token")
        ) {
          setLinkExpired(true);
        } else if (message.includes("weak") || message.includes("characters")) {
          setError("Choose a stronger password that meets the account's password requirements.");
        } else {
          setError(
            "We couldn't update your password. Try again, or request a fresh reset link if this link has expired.",
          );
        }
        return;
      }

      setPassword("");
      setConfirm("");
      setUpdated(true);
      try {
        await supabase.auth.signOut();
      } catch {
        // The password update succeeded; keep the success state even if sign-out is unavailable.
      }
    } catch {
      setError(
        "We couldn't update your password. Try again, or request a fresh reset link if this link has expired.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 text-white px-5 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_55%)]"
      />
      <section className="relative w-full max-w-md rounded-3xl border border-gold/20 bg-white/5 p-7 shadow-2xl shadow-gray-400 sm:p-9">
        <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
          {updated ? <CheckCircle2 aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
        </div>

        {updated ? (
          <>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-gold">
              Password updated
            </p>
            <h1 className="font-display text-3xl">You're all set.</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Your new password is ready to use. Sign in with it to continue to your account.
            </p>
            <Link
              to="/auth"
              className="btn-fx mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-medium text-white shadow-gold"
            >
              <ArrowLeft aria-hidden="true" className="size-4" /> Go to sign in
            </Link>
          </>
        ) : linkExpired ? (
          <>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-gold">
              Reset link unavailable
            </p>
            <h1 className="font-display text-3xl">This link may have expired.</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Reset links can only be used once and expire for your security. Return to sign in,
              choose "Forgot password?", then open the newest email on this device.
            </p>
            <Link
              to="/auth"
              className="btn-fx mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-medium text-white shadow-gold"
            >
              <Mail aria-hidden="true" className="size-4" /> Request a fresh link
            </Link>
          </>
        ) : (
          <>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-gold">
              Secure account recovery
            </p>
            <h1 className="font-display text-3xl">Set a new password</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {checkingLink
                ? "Verifying your secure reset link…"
                : ready
                  ? "Choose a new password for your DMGF account."
                  : "Open the reset link from your email to continue."}
            </p>

            {checkingLink ? (
              <div
                className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-400"
                role="status"
              >
                <Loader2 aria-hidden="true" className="size-4 animate-spin text-gold" /> Checking
                your link…
              </div>
            ) : ready ? (
              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "reset-error password-hint" : "password-hint"}
                      className="w-full rounded-xl border border-gray-300 bg-white/04 px-4 py-3 text-white outline-none transition placeholder:text-gray-300 focus:border-gold/70 focus:ring-2 focus:ring-gold/15"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                      aria-controls="new-password confirm-password"
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-450 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                  <p id="password-hint" className="mt-2 text-xs text-gray-300">
                    Use at least 8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "reset-error" : undefined}
                    className="w-full rounded-xl border border-gray-300 bg-white/04 px-4 py-3 text-white outline-none transition placeholder:text-gray-300 focus:border-gold/70 focus:ring-2 focus:ring-gold/15"
                    placeholder="Enter the new password again"
                  />
                </div>

                {error && (
                  <div
                    id="reset-error"
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-200"
                  >
                    <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-fx mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-medium text-white shadow-gold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <LockKeyhole aria-hidden="true" className="size-4" />
                  )}
                  {loading ? "Updating password…" : "Update password"}
                </button>
              </form>
            ) : (
              <div
                className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-gray-400"
                role="status"
              >
                The reset link was not detected. Use the newest email link in the same browser, or
                request another one.
              </div>
            )}
          </>
        )}

        {!updated && (
          <Link
            to="/auth"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 text-xs text-gray-400 transition hover:text-gold"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
}

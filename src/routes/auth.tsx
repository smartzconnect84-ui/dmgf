import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureOwnerAdmin, ensureProductionSettings } from "@/lib/admin.functions";
import { getMyStaffProfile } from "@/lib/staff.functions";
import { Loader2, Lock, ShieldCheck, Mail, Eye, EyeOff, AlertTriangle } from "lucide-react";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "Incorrect email or password. Check both and try again.";
  if (m.includes("email not confirmed") || m.includes("email not verified"))
    return "This email isn't confirmed yet. Use the confirmation link or ask an admin to confirm it in Supabase.";
  if (m.includes("too many requests") || m.includes("rate limit"))
    return "Too many attempts. Wait a minute, then try again.";
  if (m.includes("missing supabase environment"))
    return "Sign-in is not configured yet. Ask the site owner to add the Supabase keys under Backend → Secrets and restart.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Couldn't reach the sign-in service. Check your connection and try again — if you were offline, verify whether you signed in before retrying.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const ensureOwner = useServerFn(ensureOwnerAdmin);
  const ensureSettings = useServerFn(ensureProductionSettings);
  const fetchProfile = useServerFn(getMyStaffProfile);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [bootNote, setBootNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Already signed in? Route by role. Boot provisioning runs in the
  // background and never blocks the form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        if (data.session && !cancelled) {
          await redirectByRole();
          return;
        }
      } catch (e) {
        if (!cancelled)
          setError(friendlyAuthError(e instanceof Error ? e.message : "Sign-in unavailable."));
      } finally {
        if (!cancelled && mounted.current) setCheckingSession(false);
      }
    })();

    Promise.allSettled([ensureOwner(), ensureSettings()]).then((results) => {
      if (cancelled || !mounted.current) return;
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length === 0) setBootNote("System ready.");
      else
        setBootNote(
          "Heads up: server setup check didn't finish. You can still sign in; an admin can review server logs.",
        );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function redirectByRole() {
    try {
      const p = await fetchProfile();
      if (p.isAdmin) {
        navigate({ to: "/admin" });
        return;
      }
      if (p.isStaff) {
        navigate({ to: "/staff" });
        return;
      }
      // Authenticated but no staff/admin role: don't strand them on the
      // homepage looking signed in. Sign out and explain.
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore sign-out errors here */
      }
      setError("This account is signed in but has no staff access. Ask an administrator to assign you a role.");
    } catch {
      // Role lookup failed (e.g. token not yet attached). The account is
      // authenticated, so send them to the staff area where guards re-check.
      navigate({ to: "/staff" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (err) {
        setError(friendlyAuthError(err.message));
        return;
      }
      await redirectByRole();
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Sign-in failed."));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function handleReset() {
    setError(null);
    setNotice(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter your email above first, then choose “Forgot password?”.");
      return;
    }
    setResetBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) setError(friendlyAuthError(err.message));
      else setNotice("Password reset email sent — check your inbox (and spam folder).");
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Couldn't send reset email."));
    } finally {
      if (mounted.current) setResetBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink via-ink to-ink/95 px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-6 sm:mb-8 group">
          <img
            src={logoAsset.url}
            alt="DMGF"
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
          />
          <div className="text-white text-left">
            <div className="font-display text-lg sm:text-xl">
              Deesire Moore <span className="text-gradient-gold">Grace</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Staff &amp; Admin</div>
          </div>
        </Link>

        <div className="rounded-3xl border border-gold/20 bg-ink/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.28em] mb-2">
            <Lock className="h-3.5 w-3.5" /> Sign In
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/60 mb-6">Use your assigned staff credentials to manage the site.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "auth-error" : undefined}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "auth-error" : undefined}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white outline-none focus:border-gold transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-gold transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                id="auth-error"
                role="alert"
                className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 flex items-start gap-2"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {notice && !error && (
              <div className="rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" /> {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || checkingSession}
              className="btn-fx w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-3 rounded-xl shadow-gold hover-lift active:scale-[0.98] transition disabled:opacity-60"
            >
              {loading || checkingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {checkingSession ? "Checking session…" : loading ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={resetBusy || loading}
              className="w-full text-xs text-white/50 hover:text-gold flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Mail className="h-3 w-3" /> {resetBusy ? "Sending reset email…" : "Forgot password?"}
            </button>
          </form>

          {bootNote && (
            <p className="mt-4 text-center text-[11px] text-white/30" aria-live="polite">
              {bootNote}
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/40 hover:text-gold">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}

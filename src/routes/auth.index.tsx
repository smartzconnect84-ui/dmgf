import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@/lib/use-server-fn";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureOwnerAdmin,
  ensureProductionSettings,
  grantSelfFullAccess,
  OWNER_EMAIL,
} from "@/lib/admin.functions";
import { getMyStaffProfile } from "@/lib/staff.functions";
import { Loader2, Lock, ShieldCheck, Mail, Eye, EyeOff, AlertTriangle } from "lucide-react";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };
declare const __DMGF_DEV_SUPABASE_REDIRECT_URL__: string;

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [{ title: "Sign In · DMGF" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AuthPage,
});

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid email or password") ||
    m.includes("user not found")
  )
    return "Incorrect email or password. Check both and try again.";
  if (m.includes("email not confirmed") || m.includes("email not verified"))
    return "This email still needs confirmation. Use the confirmation link or ask a DMGF administrator for help.";
  if (
    m.includes("too many requests") ||
    m.includes("rate limit") ||
    m.includes("over_email_send_rate_limit")
  )
    return "Too many sign-in attempts. Wait a few minutes, then try again.";
  if (m.includes("missing supabase environment"))
    return "Sign-in isn't configured yet. Contact a site administrator.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Couldn't reach the sign-in service. Check your connection and try again.";
  return "We couldn't sign you in. Please try again.";
}

function AuthPage() {
  const navigate = useNavigate();
  const ensureOwner = useServerFn(ensureOwnerAdmin);
  const ensureSettings = useServerFn(ensureProductionSettings);
  const fetchProfile = useServerFn(getMyStaffProfile);
  const grantAccess = useServerFn(grantSelfFullAccess);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [bootNote, setBootNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsGrant, setNeedsGrant] = useState(false);
  const [grantBusy, setGrantBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        if (data.session && !cancelled) {
          await redirectByRole(data.session.user.email);
          return;
        }
      } catch (e) {
        if (!cancelled)
          setError(friendlyAuthError(e instanceof Error ? e.message : "Sign-in unavailable."));
      } finally {
        if (!cancelled && mounted.current) setCheckingSession(false);
      }
    })();

    Promise.all([ensureOwner(), ensureSettings()])
      .then(() => {
        if (!cancelled && mounted.current) setBootNote("System ready.");
      })
      .catch(() => {
        if (!cancelled && mounted.current) setBootNote("Site configuration could not be verified.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function redirectByRole(accountEmail?: string | null) {
    try {
      const p = await fetchProfile();
      if (p.isAdmin) {
        if (mounted.current) setNeedsGrant(false);
        navigate({ to: "/admin" });
        return;
      }
      if (p.isStaff) {
        if (mounted.current) setNeedsGrant(false);
        navigate({ to: "/staff" });
        return;
      }
      const isOwner = accountEmail?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
      if (isOwner) {
        try {
          await grantAccess();
          const after = await fetchProfile();
          if (after.isAdmin) {
            if (mounted.current) {
              setNeedsGrant(false);
              setError(null);
            }
            navigate({ to: "/admin" });
            return;
          }
          if (after.isStaff) {
            if (mounted.current) {
              setNeedsGrant(false);
              setError(null);
            }
            navigate({ to: "/staff" });
            return;
          }
        } catch (grantErr) {
          const message = grantErr instanceof Error ? grantErr.message.toLowerCase() : "";
          if (!message.includes("forbidden")) throw grantErr;
        }
      }
      if (mounted.current) {
        setNeedsGrant(isOwner);
        setError(
          isOwner
            ? "This owner account is signed in but does not have staff access. Repair owner permissions or contact support."
            : "This account is signed in but does not have staff access. Ask a DMGF administrator to grant access.",
        );
      }
    } catch (err) {
      if (mounted.current) {
        setNeedsGrant(false);
        setError(
          friendlyAuthError(
            err instanceof Error
              ? err.message
              : "Signed in, but staff access could not be verified. Please try again.",
          ),
        );
      }
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
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (err) {
        setError(friendlyAuthError(err.message));
        return;
      }
      await redirectByRole(data.user?.email ?? cleanEmail);
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Sign-in failed."));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function handleGrant() {
    setError(null);
    setNotice(null);
    setGrantBusy(true);
    try {
      await grantAccess();
      const after = await fetchProfile();
      if (after.isAdmin) {
        setNeedsGrant(false);
        navigate({ to: "/admin" });
        return;
      }
      if (after.isStaff) {
        setNeedsGrant(false);
        navigate({ to: "/staff" });
        return;
      }
      setError(
        "Access was granted but roles are not visible yet. Wait a few seconds and try signing in again.",
      );
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Couldn't grant access.";
      setError(friendlyAuthError(raw));
    } finally {
      if (mounted.current) setGrantBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logoAsset.url}
            alt="DMGF"
            className="h-16 w-16 mx-auto object-contain bg-transparent"
          />
          <h1 className="mt-4 font-serif text-2xl text-stone-900">
            Deesire Moore Grace Foundation
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700 mt-1">
            Staff &amp; Administration
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-8">
          <div className="mb-6 text-center">
            <h2 className="font-serif text-xl text-stone-900">Sign In</h2>
            <p className="text-sm text-stone-500 mt-1">Use your assigned staff credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
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
                autoCapitalize="none"
                inputMode="email"
                spellCheck={false}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-error" : undefined}
                placeholder="you@example.com"
                className="w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
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
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "auth-error" : undefined}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 pr-11 text-stone-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-controls="auth-password"
                  aria-pressed={showPw}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                id="auth-error"
                role="alert"
                className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 flex items-start gap-2"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {notice && !error && (
              <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" /> {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || checkingSession}
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 text-white font-medium py-2.5 rounded-md hover:bg-amber-800 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading || checkingSession ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {checkingSession ? "Checking session…" : loading ? "Signing in…" : "Sign In"}
            </button>

            <Link
              to="/forgot-password"
              className="w-full text-xs text-stone-500 hover:text-amber-700 flex items-center justify-center gap-1.5"
            >
              <Mail className="h-3 w-3" /> Forgot password?
            </Link>

            {needsGrant && (
              <button
                type="button"
                onClick={handleGrant}
                disabled={grantBusy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-amber-600 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
              >
                {grantBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {grantBusy ? "Repairing owner access…" : "Repair owner access"}
              </button>
            )}
          </form>

          {bootNote && (
            <p className="mt-5 text-center text-[11px] text-stone-400" aria-live="polite">
              {bootNote}
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-stone-500 hover:text-amber-700">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}

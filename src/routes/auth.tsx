import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureOwnerAdmin, ensureProductionSettings, removeDemoAccounts } from "@/lib/admin.functions";
import { getMyStaffProfile } from "@/lib/staff.functions";
import { Loader2, Lock, ShieldCheck, Mail } from "lucide-react";
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

function AuthPage() {
  const navigate = useNavigate();
  const ensureOwner = useServerFn(ensureOwnerAdmin);
  const ensureSettings = useServerFn(ensureProductionSettings);
  const cleanupDemos = useServerFn(removeDemoAccounts);
  const fetchProfile = useServerFn(getMyStaffProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await redirectByRole();
    });
    Promise.all([ensureOwner(), ensureSettings(), cleanupDemos().catch(() => ({ removed: [] as string[] }))])
      .then(() => setNotice("System ready. Sign in with your assigned credentials."))
      .catch((e) => setNotice(`Startup warning: ${e.message}`))
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function redirectByRole() {
    try {
      const p = await fetchProfile();
      if (p.isAdmin) navigate({ to: "/admin" });
      else if (p.isStaff) navigate({ to: "/staff" });
      else navigate({ to: "/" });
    } catch {
      navigate({ to: "/" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await redirectByRole();
    setLoading(false);
  }

  async function handleReset() {
    if (!email) return setError("Enter your email first.");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) setError(err.message);
    else setNotice("Reset email sent (check inbox).");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink via-ink to-ink/95 px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-6 sm:mb-8 group">
          <img src={logoAsset.url} alt="DMGF" className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
          <div className="text-white text-left">
            <div className="font-display text-lg sm:text-xl">Deesire Moore <span className="text-gradient-gold">Grace</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Staff & Admin</div>
          </div>
        </Link>

        <div className="rounded-3xl border border-gold/20 bg-ink/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.28em] mb-2">
            <Lock className="h-3.5 w-3.5" /> Sign In
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/60 mb-6">Use your assigned credentials to manage the site.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                id="auth-email"
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                id="auth-password"
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>
            )}
            {notice && !error && (
              <div className="rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" /> {notice}
              </div>
            )}

            <button
              type="submit" disabled={loading || !ready}
              className="btn-fx w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-3 rounded-xl shadow-gold hover-lift active:scale-[0.98] transition disabled:opacity-60"
            >
              {loading || !ready ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {!ready ? "Preparing…" : loading ? "Signing in…" : "Sign in"}
            </button>

            <button type="button" onClick={handleReset} className="w-full text-xs text-white/50 hover:text-gold flex items-center justify-center gap-1.5">
              <Mail className="h-3 w-3" /> Forgot password?
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/40 hover:text-gold">← Back to site</Link>
        </div>
      </div>
    </main>
  );
}

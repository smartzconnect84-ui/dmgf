import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureDemoAdmin } from "@/lib/admin.functions";
import { Loader2, Lock, Sparkles, Mail } from "lucide-react";
import logoAsset from "@/assets/dmgf-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const seed = useServerFn(ensureDemoAdmin);
  const [email, setEmail] = useState("admin@dmgf.org");
  const [password, setPassword] = useState("DemoAdmin2026!");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // On mount: redirect if already signed in; seed demo admin if needed.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    seed()
      .then((r) => {
        setSeedMsg(r.status === "created" ? "Demo admin provisioned." : null);
      })
      .catch((e) => setSeedMsg(`Seeder warning: ${e.message}`))
      .finally(() => setSeeding(false));
  }, [navigate, seed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  async function handleReset() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) setError(err.message);
    else setSeedMsg("Reset email sent (check inbox).");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink via-ink to-ink/95 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8 group">
          <img src={logoAsset.url} alt="DMGF" className="h-14 w-14 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
          <div className="text-white">
            <div className="font-display text-xl">Deesire Moore <span className="text-gradient-gold">Grace</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Admin Console</div>
          </div>
        </Link>

        <div className="rounded-3xl border border-gold/20 bg-ink/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.28em] mb-2">
            <Lock className="h-3.5 w-3.5" /> Sign In
          </div>
          <h1 className="font-display text-3xl text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/60 mb-6">Use your admin credentials to manage the site.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                {error}
              </div>
            )}
            {seedMsg && !error && (
              <div className="rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> {seedMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || seeding}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-3 rounded-xl shadow-gold hover-lift disabled:opacity-60"
            >
              {loading || seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {seeding ? "Preparing…" : loading ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full text-xs text-white/50 hover:text-gold flex items-center justify-center gap-1.5"
            >
              <Mail className="h-3 w-3" /> Forgot password?
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          <div className="text-gold uppercase tracking-[0.25em] text-[10px] mb-2">Demo Credentials</div>
          <div className="space-y-1 font-mono">
            <div>admin@dmgf.org</div>
            <div>DemoAdmin2026!</div>
          </div>
          <p className="mt-3 text-white/40 text-[11px]">Auto-provisioned on first visit. Change the password from the admin Account page after signing in.</p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/40 hover:text-gold">← Back to site</Link>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureDemoAdmin } from "@/lib/admin.functions";
import { ensureDemoStaff, listDemoStaff, getMyStaffProfile } from "@/lib/staff.functions";
import { Loader2, Lock, Sparkles, Mail, ChevronDown, Copy, Check } from "lucide-react";
import logoAsset from "@/assets/dmgf-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff & Admin Sign In · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

type Demo = { email: string; password: string; role: string; name: string };

function AuthPage() {
  const navigate = useNavigate();
  const seedAdmin = useServerFn(ensureDemoAdmin);
  const seedStaff = useServerFn(ensureDemoStaff);
  const listStaff = useServerFn(listDemoStaff);
  const fetchProfile = useServerFn(getMyStaffProfile);
  const [email, setEmail] = useState("admin@dmgf.org");
  const [password, setPassword] = useState("DemoAdmin2026!");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [showStaff, setShowStaff] = useState(false);
  const [staff, setStaff] = useState<Demo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await redirectByRole();
    });
    Promise.all([seedAdmin(), seedStaff(), listStaff()])
      .then(([a, _s, list]) => {
        setStaff(list);
        if (a.status === "created") setSeedMsg("Demo accounts provisioned.");
      })
      .catch((e) => setSeedMsg(`Seeder warning: ${e.message}`))
      .finally(() => setSeeding(false));
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
    else setSeedMsg("Reset email sent (check inbox).");
  }

  function useCreds(d: Demo) {
    setEmail(d.email);
    setPassword(d.password);
    setError(null);
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
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
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>
            )}
            {seedMsg && !error && (
              <div className="rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> {seedMsg}
              </div>
            )}

            <button
              type="submit" disabled={loading || seeding}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-3 rounded-xl shadow-gold hover-lift active:scale-[0.98] transition disabled:opacity-60"
            >
              {loading || seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {seeding ? "Preparing demo accounts…" : loading ? "Signing in…" : "Sign in"}
            </button>

            <button type="button" onClick={handleReset} className="w-full text-xs text-white/50 hover:text-gold flex items-center justify-center gap-1.5">
              <Mail className="h-3 w-3" /> Forgot password?
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <button
            onClick={() => setShowStaff((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition"
          >
            <div>
              <div className="text-gold uppercase tracking-[0.25em] text-[10px]">Demo Credentials</div>
              <div className="text-xs text-white/60 mt-0.5">Admin + 6 staff roles · click to fill</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-white/60 transition ${showStaff ? "rotate-180" : ""}`} />
          </button>
          {showStaff && (
            <div className="px-3 pb-3 space-y-2 max-h-72 overflow-y-auto">
              <DemoRow d={{ email: "admin@dmgf.org", password: "DemoAdmin2026!", role: "admin", name: "Administrator" }} onUse={useCreds} onCopy={copy} copied={copied} />
              {staff.map((d) => (
                <DemoRow key={d.email} d={d} onUse={useCreds} onCopy={copy} copied={copied} />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/40 hover:text-gold">← Back to site</Link>
        </div>
      </div>
    </main>
  );
}

function DemoRow({ d, onUse, onCopy, copied }: { d: Demo; onUse: (d: Demo) => void; onCopy: (t: string, k: string) => void; copied: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink/40 p-3 text-xs">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-white font-medium">{d.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-gold/70">{d.role.replace(/_/g, " ")}</div>
        </div>
        <button onClick={() => onUse(d)} className="text-[10px] uppercase tracking-wider bg-gold text-ink px-2.5 py-1 rounded-full font-medium hover:opacity-90 active:scale-95 transition">Use</button>
      </div>
      <div className="space-y-1 font-mono text-white/70">
        <button onClick={() => onCopy(d.email, d.email)} className="flex items-center gap-1.5 hover:text-gold w-full text-left">
          {copied === d.email ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />} {d.email}
        </button>
        <button onClick={() => onCopy(d.password, d.password)} className="flex items-center gap-1.5 hover:text-gold w-full text-left">
          {copied === d.password ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />} {d.password}
        </button>
      </div>
    </div>
  );
}

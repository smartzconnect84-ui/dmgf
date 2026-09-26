import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password · DMGF" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash on load; wait for the session
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else navigate({ to: "/admin" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gold/20 bg-ink/80 p-8 shadow-2xl">
        <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.28em] mb-2">
          <Lock className="h-3.5 w-3.5" /> Reset Password
        </div>
        <h1 className="font-display text-2xl text-white mb-6">Set a new password</h1>

        {!ready ? (
          <p className="text-sm text-white/60">Open the reset link from your email. If this page stays loading, request a new link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold"
            />
            <input
              type="password"
              placeholder="Confirm password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-gold"
            />
            {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="btn-fx w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-3 rounded-xl shadow-gold disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
            </button>
          </form>
        )}

        <Link to="/auth" className="block text-center mt-6 text-xs text-white/40 hover:text-gold">← Back to sign in</Link>
      </div>
    </main>
  );
}

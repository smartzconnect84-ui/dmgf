import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteSettings } from "@/lib/site-data.functions";
import { Loader2, Mail, ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import logoAssetSrc from "@/assets/dmgf-logo.png";
const logoAsset = { url: logoAssetSrc };

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot Password · DMGF" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [authBg, setAuthBg] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings()
      .then((s: { auth_background_url?: string | null }) => {
        if (s?.auth_background_url) setAuthBg(s.auth_background_url);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      if (err) {
        setError(err.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-stone-100 flex items-center justify-center px-4 py-12"
      style={
        authBg
          ? { backgroundImage: `url(${authBg})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logoAsset.url}
            alt="DMGF"
            className="h-16 w-16 mx-auto object-contain bg-transparent shadow-none drop-shadow-none"
          />
          <h1 className="mt-4 font-serif text-2xl text-stone-900">
            Deesire Moore Grace Foundation
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700 mt-1">
            Staff &amp; Administration
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-8">
          {sent ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-xl text-stone-900">Check your email</h2>
                <p className="text-sm text-stone-500 mt-1">
                  If an account exists for <span className="font-medium">{email.trim()}</span>, a
                  reset link is on its way. Open it on this device to set a new password.
                </p>
              </div>
              <Link
                to="/auth"
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 text-white font-medium py-2.5 rounded-md hover:bg-amber-800 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="font-serif text-xl text-stone-900">Reset your password</h2>
                <p className="text-sm text-stone-500 mt-1">
                  Enter the email on your account and we'll send a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                    spellCheck={false}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 flex items-start gap-2"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 text-white font-medium py-2.5 rounded-md hover:bg-amber-800 active:scale-[0.99] transition disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "Sending reset email…" : "Send reset link"}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/auth" className="text-xs text-stone-500 hover:text-amber-700">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { staffUpdatePassword } from "@/lib/staff.functions";
import { KeyRound, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const fn = useServerFn(staffUpdatePassword);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ kind: "err", text: "Password must be at least 8 characters." });
    if (pw !== confirm) return setMsg({ kind: "err", text: "Passwords do not match." });
    setBusy(true);
    try {
      await fn({ data: { newPassword: pw } });
      setMsg({ kind: "ok", text: "Password updated." });
      setPw(""); setConfirm("");
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-display text-2xl flex items-center gap-2"><KeyRound className="h-5 w-5 text-gold" />Account</h1>
        <p className="text-sm text-muted-foreground">Update your sign-in password.</p>
      </div>
      <form onSubmit={submit} className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">New password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-gold outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Confirm</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-gold outline-none" />
        </div>
        {msg && <div className={`rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}
        <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium py-2.5 rounded-lg shadow-gold transition-transform active:scale-95 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
        </button>
      </form>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { staffUpdatePassword, getMyStaffProfile, updateMyStaffProfile } from "@/lib/staff.functions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { KeyRound, Loader2, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyStaffProfile);
  const updateProfile = useServerFn(updateMyStaffProfile);
  const updatePassword = useServerFn(staffUpdatePassword);

  const { data } = useQuery({ queryKey: ["staff-profile"], queryFn: () => fetchProfile(), staleTime: 60_000 });

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.displayName ?? "");
      setAvatar(data.avatarUrl ?? "");
    }
  }, [data]);

  const saveProfile = useMutation({
    mutationFn: () => updateProfile({ data: { display_name: name, avatar_url: avatar || null } }),
    onSuccess: () => {
      toast2("Profile updated.");
      qc.invalidateQueries({ queryKey: ["staff-profile"] });
    },
    onError: (e: Error) => setMsg({ kind: "err", text: e.message }),
  });

  async function submitPw(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ kind: "err", text: "Password must be at least 8 characters." });
    if (pw !== confirm) return setMsg({ kind: "err", text: "Passwords do not match." });
    setBusy(true);
    try {
      await updatePassword({ data: { newPassword: pw } });
      setMsg({ kind: "ok", text: "Password updated." });
      setPw("");
      setConfirm("");
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function toast2(text: string) {
    setMsg({ kind: "ok", text });
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl flex items-center gap-2"><User className="h-5 w-5 text-gold" />Account & Profile</h1>
        <p className="text-sm text-muted-foreground">Update your display name, avatar and password.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }}
        className="bg-white rounded-2xl border border-border p-6 space-y-4"
      >
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-gold outline-none" />
        </div>
        <ImageUpload label="Avatar / photo" value={avatar} onChange={setAvatar} folder="profiles" hint="Square crop recommended (400×400+)." />
        <button disabled={saveProfile.isPending} className="inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium px-5 py-2.5 rounded-lg shadow-gold transition-transform active:scale-95 disabled:opacity-60">
          {saveProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
        </button>
      </form>

      <form onSubmit={submitPw} className="bg-white rounded-2xl border border-border p-6 space-y-4">
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
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@/lib/use-server-fn";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  staffListDonations,
  staffUpsertDonation,
  staffDeleteDonation,
  getMyStaffProfile,
} from "@/lib/staff.functions";
import { Plus, Trash2, DollarSign, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/donations")({
  component: DonationsPage,
});

type Donation = {
  id: string;
  donor_name: string;
  donor_email: string | null;
  amount_usd: number;
  method: string | null;
  status: string;
  note: string | null;
  received_at: string;
};

export function DonationsPage() {
  const qc = useQueryClient();
  const list = useServerFn(staffListDonations);
  const upsert = useServerFn(staffUpsertDonation);
  const del = useServerFn(staffDeleteDonation);
  const profileFn = useServerFn(getMyStaffProfile);
  const {
    data,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["staff", "donations"],
    queryFn: () => list(),
  });
  // Shared with StaffLayout, so this does not issue an extra request.
  const { data: profile } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: () => profileFn(),
    staleTime: 60_000,
  });
  // The API only lets financial directors (or admins) write donations; the CEO
  // role is read-only. Hide the write controls instead of letting them 403.
  const canWrite = Boolean(
    profile && (profile.isAdmin || profile.roles.includes("financial_director")),
  );
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    donor_name: "",
    donor_email: "",
    amount_usd: "",
    method: "Cash",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const donations = (data ?? []) as Donation[];
  const total = donations.reduce((s, d) => s + Number(d.amount_usd || 0), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await upsert({
        data: {
          donor_name: form.donor_name.trim(),
          donor_email: form.donor_email.trim() || null,
          amount_usd: Number(form.amount_usd),
          method: form.method || null,
          status: "received" as const,
          note: form.note.trim() || null,
        },
      });
      setForm({ donor_name: "", donor_email: "", amount_usd: "", method: "Cash", note: "" });
      qc.invalidateQueries({ queryKey: ["staff", "donations"] });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the donation.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this donation record?")) return;
    setSaveError("");
    try {
      await del({ data: { id } });
      qc.invalidateQueries({ queryKey: ["staff", "donations"] });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not delete the donation.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">Donations</h1>
          <p className="text-sm text-muted-foreground">Record gifts and pledges.</p>
        </div>
        <div className="rounded-2xl bg-ink text-white px-5 py-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gold" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">
              Total received
            </div>
            <div className="font-display text-lg">
              USD{" "}
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{saveError}</div>
      )}

      {canWrite && (
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-border p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <Input
            label="Donor name"
            value={form.donor_name}
            onChange={(v) => setForm({ ...form, donor_name: v })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.donor_email}
            onChange={(v) => setForm({ ...form, donor_email: v })}
          />
          <Input
            label="Amount (USD)"
            type="number"
            step="0.01"
            min="0"
            value={form.amount_usd}
            onChange={(v) => setForm({ ...form, amount_usd: v })}
            required
          />
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Method
            </label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white"
            >
              <option>Cash</option>
              <option>MoMo</option>
              <option>Bank</option>
              <option>Card</option>
              <option>Other</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink font-medium px-5 py-2.5 rounded-lg shadow-gold transition-transform active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{" "}
            Record
          </button>
          <div className="sm:col-span-2 lg:col-span-5">
            <Input label="Note" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        {loadError && (
          <div className="p-6 text-sm text-red-600">{(loadError as Error).message}</div>
        )}
        {!isLoading && donations.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">No donations recorded yet.</div>
        )}
        {donations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Donor</th>
                  <th className="text-left p-3">Method</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-left p-3">Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {new Date(d.received_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{d.donor_name}</div>
                      {d.donor_email && (
                        <div className="text-xs text-muted-foreground">{d.donor_email}</div>
                      )}
                    </td>
                    <td className="p-3">{d.method ?? "—"}</td>
                    <td className="p-3 text-right font-mono">
                      $
                      {Number(d.amount_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate">{d.note ?? ""}</td>
                    <td className="p-3 text-right">
                      {canWrite && (
                        <button
                          onClick={() => remove(d.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white focus:border-gold outline-none"
        {...rest}
      />
    </div>
  );
}

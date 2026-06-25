import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchSiteSettings } from "@/lib/site-data.functions";
import { adminUpdateSettings } from "@/lib/cms.functions";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type Settings = {
  site_name: string;
  short_name: string;
  tagline: string;
  address?: string | null;
  hours?: string | null;
  email?: string | null;
  phone_primary?: string | null;
  phone_secondary?: string | null;
  phone_whatsapp?: string | null;
  payment_orange_money?: string | null;
  payment_mtn_momo?: string | null;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_twitter?: string | null;
  social_youtube?: string | null;
  logo_url?: string | null;
};

function SettingsPage() {
  const qc = useQueryClient();
  const get = useServerFn(fetchSiteSettings);
  const upd = useServerFn(adminUpdateSettings);
  const { data } = useQuery({ queryKey: ["adm", "settings"], queryFn: () => get() });
  const [form, setForm] = useState<Settings | null>(null);

  useEffect(() => {
    if (data && !form) setForm(data as Settings);
  }, [data, form]);

  const save = useMutation({
    mutationFn: (v: Settings) => upd({ data: v }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["adm", "settings"] });
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const f = (k: keyof Settings, label: string) => (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        value={(form[k] as string | null) ?? ""}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Name, contact info, payments and socials.</p>
        </div>
        <button
          onClick={() => save.mutate(form)}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all
        </button>
      </div>

      <Section title="Identity">
        {f("site_name", "Site name")}
        {f("short_name", "Short name")}
        {f("tagline", "Tagline")}
        {f("logo_url", "Logo URL (override)")}
      </Section>
      <Section title="Contact">
        {f("address", "Address")}
        {f("hours", "Hours")}
        {f("email", "Email")}
        {f("phone_primary", "Phone primary")}
        {f("phone_secondary", "Phone secondary")}
        {f("phone_whatsapp", "WhatsApp")}
      </Section>
      <Section title="Mobile Money">
        {f("payment_orange_money", "Orange Money")}
        {f("payment_mtn_momo", "MTN MoMo")}
      </Section>
      <Section title="Social">
        {f("social_facebook", "Facebook URL")}
        {f("social_instagram", "Instagram URL")}
        {f("social_twitter", "Twitter / X URL")}
        {f("social_youtube", "YouTube URL")}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-border rounded-2xl overflow-hidden">
      <header className="px-5 py-3 bg-ink text-white text-xs uppercase tracking-[0.25em] text-gold">{title}</header>
      <div className="p-5 grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

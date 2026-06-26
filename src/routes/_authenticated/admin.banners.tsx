import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteBanner, adminListBanners, adminUpsertBanner } from "@/lib/cms.functions";
import { Trash2, Plus, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersPage,
});

type Banner = {
  id?: string;
  image_url: string;
  eyebrow: string;
  title: string;
  body: string;
  date_text?: string | null;
  location?: string | null;
  cta_label: string;
  cta_to: string;
  focus_class?: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Banner = {
  image_url: "",
  eyebrow: "",
  title: "",
  body: "",
  date_text: "",
  location: "",
  cta_label: "Learn more",
  cta_to: "/programs",
  focus_class: "",
  sort_order: 0,
  is_active: true,
};

function BannersPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBanners);
  const upsert = useServerFn(adminUpsertBanner);
  const del = useServerFn(adminDeleteBanner);
  const [editing, setEditing] = useState<Banner | null>(null);

  const { data } = useQuery({ queryKey: ["adm", "banners"], queryFn: () => list() });

  const save = useMutation({
    mutationFn: (b: Banner) => upsert({ data: b }),
    onSuccess: () => {
      toast.success("Banner saved");
      qc.invalidateQueries({ queryKey: ["adm", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["adm", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Hero Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">The rotating slides on the homepage.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, sort_order: (data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink"
        >
          <Plus className="h-4 w-4" /> Add banner
        </button>
      </div>

      <div className="space-y-3">
        {data?.map((b) => (
          <div key={b.id} className="bg-white border border-border rounded-xl p-4 flex gap-4 items-center">
            <img src={b.image_url} alt="" className="h-16 w-24 object-cover rounded-md bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gold uppercase tracking-wider">{b.eyebrow}</div>
              <div className="font-display text-lg truncate">{b.title}</div>
              <div className="text-xs text-muted-foreground">#{b.sort_order} · {b.is_active ? "Active" : "Hidden"}</div>
            </div>
            <button onClick={() => setEditing(b as Banner)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-gold">Edit</button>
            <button
              onClick={() => confirm("Delete this banner?") && remove.mutate(b.id!)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{editing.id ? "Edit banner" : "New banner"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-muted rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Image URL" v={editing.image_url} onChange={(v) => setEditing({ ...editing, image_url: v })} placeholder="https://..." />
              <Field label="Eyebrow" v={editing.eyebrow} onChange={(v) => setEditing({ ...editing, eyebrow: v })} />
              <Field label="Title" v={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Body" v={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} textarea />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Date text" v={editing.date_text ?? ""} onChange={(v) => setEditing({ ...editing, date_text: v })} />
                <Field label="Location" v={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />
                <Field label="CTA label" v={editing.cta_label} onChange={(v) => setEditing({ ...editing, cta_label: v })} />
                <Field label="CTA path" v={editing.cta_to} onChange={(v) => setEditing({ ...editing, cta_to: v })} />
                <Field label="Sort order" v={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })} />
                <Field label="Focus class (opt)" v={editing.focus_class ?? ""} onChange={(v) => setEditing({ ...editing, focus_class: v })} placeholder="object-[50%_30%]" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-border rounded-lg">Cancel</button>
              <button
                onClick={() => save.mutate(editing)}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-60"
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, v, onChange, textarea, placeholder }: { label: string; v: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      {textarea ? (
        <textarea value={v} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
      ) : (
        <input value={v} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
      )}
    </div>
  );
}

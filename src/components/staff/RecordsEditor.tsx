import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Loader2, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Field = { key: string; label: string; type?: "text" | "textarea" | "image" | "number" | "bool" };
type Row = Record<string, unknown> & { id?: string };

export function RecordsEditor({
  table,
  title,
  subtitle,
  fields,
  titleKey,
  imageKey,
  defaults,
}: {
  table: "programs" | "gallery_items" | "events" | "news_posts";
  title: string;
  subtitle: string;
  fields: Field[];
  titleKey: string;
  imageKey: string;
  defaults: Row;
}) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | null>(null);
  const qk = ["staff", table];

  const { data, isLoading } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const { id, created_at: _c, updated_at: _u, ...rest } = r;
      const q = id
        ? supabase.from(table).update(rest as never).eq("id", id)
        : supabase.from(table).insert(rest as never);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: qk }); setEdit(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: qk }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string, v: unknown) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <button onClick={() => setEdit({ ...defaults })} className="btn-fx inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-white text-sm">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              {r[imageKey] ? <img src={String(r[imageKey])} alt="" loading="lazy" className="w-full aspect-video object-cover" /> : <div className="aspect-video bg-muted" />}
              <div className="p-4">
                <div className="font-display text-lg line-clamp-2">{String(r[titleKey] ?? "Untitled")}</div>
                {r.is_active === false && <div className="text-xs text-muted-foreground mt-1">Hidden</div>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEdit(r)} className="btn-fx inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm min-h-11"><Pencil className="h-3.5 w-3.5" />Edit</button>
                  <button onClick={() => confirm("Delete this item?") && r.id && remove.mutate(r.id)} className="btn-fx inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-destructive min-h-11"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                </div>
              </div>
            </div>
          ))}
          {data?.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{edit.id ? "Edit" : "New"}</h2>
              <button onClick={() => setEdit(null)} aria-label="Close" className="p-2"><X className="h-5 w-5" /></button>
            </div>
            {fields.map((f) => {
              const v = edit[f.key];
              if (f.type === "image") return <ImageUpload key={f.key} label={f.label} value={String(v ?? "")} onChange={(u) => set(f.key, u)} folder={table} />;
              if (f.type === "bool") return (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}
                </label>
              );
              return (
                <label key={f.key} className="block text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea rows={4} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2" />
                  ) : (
                    <input type={f.type === "number" ? "number" : "text"} value={String(v ?? "")} onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 min-h-11" />
                  )}
                </label>
              );
            })}
            <button disabled={save.isPending} onClick={() => save.mutate(edit)} className="btn-fx w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-ink text-white text-sm">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Loader2, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PUBLIC_QUERY_KEYS, type RecordTable } from "@/lib/cms.functions";
import { deleteRecord, listRecords, saveRecord, setPublished } from "@/lib/records";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishToggle } from "@/components/admin/PublishToggle";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "number" | "bool";
};
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
  table: RecordTable;
  title: string;
  subtitle: string;
  fields: Field[];
  titleKey: string;
  imageKey: string;
  defaults: Row;
}) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | null>(null);
  const qk = ["adm", table];
  const publicKey = PUBLIC_QUERY_KEYS[table];

  const refreshPublic = () => {
    void qc.invalidateQueries({ queryKey: publicKey });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: qk,
    queryFn: () => listRecords(table),
  });

  const save = useMutation({
    mutationFn: (row: Row) => saveRecord(table, row),
    onSuccess: () => {
      toast.success("Saved");
      void qc.invalidateQueries({ queryKey: qk });
      refreshPublic();
      setEdit(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRecord(table, id),
    onSuccess: () => {
      toast.success("Deleted");
      void qc.invalidateQueries({ queryKey: qk });
      refreshPublic();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publish = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => setPublished(table, v.id, v.published),
    onSuccess: (_d, v) => {
      toast.success(v.published ? "Published — live on the site" : "Unpublished — hidden");
      void qc.invalidateQueries({ queryKey: qk });
      refreshPublic();
    },
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
        <button
          onClick={() => setEdit({ ...defaults })}
          className="btn-fx inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-white text-sm"
        >
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Could not load records: {error instanceof Error ? error.message : "unknown error"}
        </p>
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((r) => {
            const published = r.is_active !== false;
            const busy = publish.isPending && publish.variables?.id === r.id;
            return (
              <div
                key={String(r.id)}
                className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col"
              >
                {r[imageKey] ? (
                  <img
                    src={String(r[imageKey])}
                    alt=""
                    loading="lazy"
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-muted" />
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="font-display text-lg line-clamp-2">
                    {String(r[titleKey] ?? "Untitled")}
                  </div>
                  {!published && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Draft — not visible on the public site
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <PublishToggle
                      published={published}
                      busy={busy}
                      onToggle={() =>
                        r.id && publish.mutate({ id: String(r.id), published: !published })
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setEdit(r)}
                      className="btn-fx inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm min-h-11"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        confirm("Delete this item?") && r.id && remove.mutate(String(r.id))
                      }
                      className="btn-fx inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-destructive min-h-11"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {data?.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{edit.id ? "Edit" : "New"}</h2>
              <button onClick={() => setEdit(null)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            {fields.map((f) => {
              const v = edit[f.key];
              if (f.type === "image")
                return (
                  <ImageUpload
                    key={f.key}
                    label={f.label}
                    value={String(v ?? "")}
                    onChange={(u) => set(f.key, u)}
                    folder={table}
                  />
                );
              if (f.type === "bool")
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(v)}
                      onChange={(e) => set(f.key, e.target.checked)}
                    />{" "}
                    {f.label}
                  </label>
                );
              return (
                <label key={f.key} className="block text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={String(v ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="mt-1 w-full border border-border rounded-lg px-3 py-2"
                    />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={String(v ?? "")}
                      onChange={(e) =>
                        set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                      }
                      className="mt-1 w-full border border-border rounded-lg px-3 py-2 min-h-11"
                    />
                  )}
                </label>
              );
            })}
            <button
              disabled={save.isPending}
              onClick={() => save.mutate(edit)}
              className="btn-fx w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-ink text-white text-sm"
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}{" "}
              Save
            </button>
            {edit.is_active === false && (
              <p className="text-xs text-muted-foreground text-center">
                This item stays unpublished until you publish it from the list.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

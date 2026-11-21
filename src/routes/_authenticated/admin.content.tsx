import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@/lib/use-server-fn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminListContent,
  adminListMedia,
  adminUpdateContentValue,
  adminUpsertContentBlock,
  adminDeleteContentBlock,
  adminExportContent,
  adminImportContent,
} from "@/lib/cms.functions";
import { Loader2, Save, Plus, Trash2, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

type Block = {
  id?: string;
  page: string;
  block_key: string;
  label: string;
  kind: string;
  value: string;
  sort_order: number;
};

const empty: Block = {
  page: "home",
  block_key: "",
  label: "",
  kind: "text",
  value: "",
  sort_order: 0,
};

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentPage,
});

export function ContentPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListContent);
  const listMedia = useServerFn(adminListMedia);
  const exportFn = useServerFn(adminExportContent);
  const importFn = useServerFn(adminImportContent);
  const update = useServerFn(adminUpdateContentValue);
  const upsert = useServerFn(adminUpsertContentBlock);
  const del = useServerFn(adminDeleteContentBlock);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Block | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importText, setImportText] = useState("");
  const { data: mediaList } = useQuery({ queryKey: ["adm", "media"], queryFn: () => listMedia() });

  const { data } = useQuery({ queryKey: ["adm", "content"], queryFn: () => list() });

  const save = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => update({ data: { id, value } }),
    onSuccess: (_d, vars) => {
      toast.success("Saved");
      setDirty((d) => {
        const c = { ...d };
        delete c[vars.id];
        return c;
      });
      qc.invalidateQueries({ queryKey: ["adm", "content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveBlock = useMutation({
    mutationFn: (b: Block) => upsert({ data: b }),
    onSuccess: () => {
      toast.success("Block saved");
      qc.invalidateQueries({ queryKey: ["adm", "content"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["adm", "content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = (data ?? []).reduce<Record<string, NonNullable<typeof data>>>((acc, row) => {
    const list = acc[row.page] ?? [];
    list.push(row);
    acc[row.page] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Pages & Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the headings, body text and labels across every page.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const r = await exportFn({ data: { format: "json" } });
                const blob = new Blob([r.content], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "content-blocks.json";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Exported JSON");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Export failed");
              }
            }}
            className="inline-flex items-center gap-2 border border-border text-sm px-3 py-2 rounded-lg hover:bg-muted"
          >
            Export JSON
          </button>
          <button
            onClick={async () => {
              try {
                const r = await exportFn({ data: { format: "csv" } });
                const blob = new Blob([r.content], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "content-blocks.csv";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Exported CSV");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Export failed");
              }
            }}
            className="inline-flex items-center gap-2 border border-border text-sm px-3 py-2 rounded-lg hover:bg-muted"
          >
            Export CSV
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 border border-border text-sm px-3 py-2 rounded-lg hover:bg-muted"
          >
            Import
          </button>
          <button
            onClick={() => setEditing({ ...empty, sort_order: (data?.length ?? 0) + 1 })}
            className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> Add block
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([page, rows]) => (
        <section key={page} className="bg-white border border-border rounded-2xl overflow-hidden">
          <header className="px-5 py-3 bg-ink text-white">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">{page}</div>
            <div className="font-display text-lg">
              /{page === "home" ? "" : page.replace("_", "-")}
            </div>
          </header>
          <div className="divide-y divide-border">
            {rows?.map((r) => {
              const val = dirty[r.id] ?? r.value ?? "";
              const changed = val !== (r.value ?? "");
              return (
                <div
                  key={r.id}
                  className="p-5 grid md:grid-cols-[200px_1fr_auto_auto] gap-3 items-start"
                >
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                      {r.kind}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.block_key}</div>
                  </div>
                  {r.kind === "richtext" || (r.value?.length ?? 0) > 80 ? (
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => setDirty({ ...dirty, [r.id]: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={val}
                        onChange={(e) => setDirty({ ...dirty, [r.id]: e.target.value })}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
                      />
                      {r.kind === "image_url" && (
                        <button
                          type="button"
                          onClick={() => setPickerFor(r.id)}
                          className="shrink-0 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted"
                        >
                          Pick
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    disabled={!changed || save.isPending}
                    onClick={() => save.mutate({ id: r.id, value: val })}
                    className="inline-flex items-center gap-1.5 bg-ink text-white text-xs px-3 py-2 rounded-lg disabled:opacity-40 hover:bg-gold hover:text-ink"
                  >
                    {save.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => confirm("Delete this block?") && remove.mutate(r.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {pickerFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Choose an image</h2>
              <button onClick={() => setPickerFor(null)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {(mediaList ?? []).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setDirty((d) => ({ ...d, [pickerFor]: m.public_url }));
                    setPickerFor(null);
                  }}
                  className="group rounded-lg border border-border overflow-hidden hover:border-gold"
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={m.public_url}
                      alt={m.alt_text || m.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-1.5 text-[10px] truncate text-muted-foreground">
                    {m.filename}
                  </div>
                </button>
              ))}
              {(!mediaList || mediaList.length === 0) && (
                <div className="col-span-full text-sm text-muted-foreground p-6 text-center">
                  No media uploaded yet. Upload in Media Library first.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{editing.id ? "Edit block" : "New block"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <Field
                label="Page"
                v={editing.page}
                onChange={(v) => setEditing({ ...editing, page: v })}
              />
              <Field
                label="Block key"
                v={editing.block_key}
                onChange={(v) => setEditing({ ...editing, block_key: v })}
              />
              <Field
                label="Label"
                v={editing.label}
                onChange={(v) => setEditing({ ...editing, label: v })}
              />
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Kind
                </label>
                <select
                  value={editing.kind}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white"
                >
                  <option value="text">text</option>
                  <option value="richtext">richtext</option>
                  <option value="heading">heading</option>
                  <option value="cta">cta</option>
                  <option value="image_url">image_url</option>
                </select>
              </div>
              {editing.kind === "image_url" ? (
                <ImageUpload
                  label="Image"
                  value={editing.value}
                  onChange={(v) => setEditing({ ...editing, value: v })}
                />
              ) : (
                <Field
                  label="Value"
                  v={editing.value}
                  onChange={(v) => setEditing({ ...editing, value: v })}
                  textarea
                />
              )}
              <Field
                label="Sort order"
                v={String(editing.sort_order)}
                onChange={(v) => setEditing({ ...editing, sort_order: parseInt(v) || 0 })}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border border-border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => saveBlock.mutate(editing)}
                disabled={saveBlock.isPending}
                className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-60"
              >
                {saveBlock.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}{" "}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {importOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Import content blocks</h2>
              <button onClick={() => setImportOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setImportFormat("json")}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${importFormat === "json" ? "bg-ink text-white" : "border-border"}`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setImportFormat("csv")}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${importFormat === "csv" ? "bg-ink text-white" : "border-border"}`}
                >
                  CSV
                </button>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={12}
                placeholder={importFormat === "json" ? '[{"page":"home","block_key":"hero_title","label":"Hero title","kind":"heading","value":"...","sort_order":0}]' : "page,block_key,label,kind,value,sort_order"}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono outline-none focus:border-gold"
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2 justify-end">
              <button onClick={() => setImportOpen(false)} className="px-4 py-2 text-sm border border-border rounded-lg">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const r = await importFn({ data: { format: importFormat, payload: importText } });
                    toast.success(`Imported ${r.count} blocks`);
                    qc.invalidateQueries({ queryKey: ["adm", "content"] });
                    setImportOpen(false);
                    setImportText("");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Import failed");
                  }
                }}
                className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  v,
  onChange,
  textarea,
}: {
  label: string;
  v: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={v}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
        />
      ) : (
        <input
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
        />
      )}
    </div>
  );
}

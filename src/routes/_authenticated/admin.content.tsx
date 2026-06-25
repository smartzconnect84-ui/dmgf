import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListContent, adminUpdateContentValue } from "@/lib/cms.functions";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentPage,
});

function ContentPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListContent);
  const update = useServerFn(adminUpdateContentValue);
  const [dirty, setDirty] = useState<Record<string, string>>({});

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

  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, row) => {
    (acc[row.page] ||= [] as any).push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Pages & Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit the headings, body text and labels across every page.</p>
      </div>

      {Object.entries(grouped).map(([page, rows]) => (
        <section key={page} className="bg-white border border-border rounded-2xl overflow-hidden">
          <header className="px-5 py-3 bg-ink text-white">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">{page}</div>
            <div className="font-display text-lg">/{page === "home" ? "" : page.replace("_", "-")}</div>
          </header>
          <div className="divide-y divide-border">
            {rows?.map((r) => {
              const val = dirty[r.id] ?? r.value ?? "";
              const changed = val !== (r.value ?? "");
              return (
                <div key={r.id} className="p-5 grid md:grid-cols-[200px_1fr_auto] gap-3 items-start">
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{r.kind}</div>
                  </div>
                  {r.kind === "richtext" || (r.value?.length ?? 0) > 80 ? (
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => setDirty({ ...dirty, [r.id]: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  ) : (
                    <input
                      value={val}
                      onChange={(e) => setDirty({ ...dirty, [r.id]: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  )}
                  <button
                    disabled={!changed || save.isPending}
                    onClick={() => save.mutate({ id: r.id, value: val })}
                    className="inline-flex items-center gap-1.5 bg-ink text-white text-xs px-3 py-2 rounded-lg disabled:opacity-40 hover:bg-gold hover:text-ink"
                  >
                    {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

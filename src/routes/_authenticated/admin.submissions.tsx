import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@/lib/use-server-fn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteSubmission,
  adminListSubmissions,
  adminMarkSubmission,
} from "@/lib/cms.functions";
import { Mail, Trash2, Check, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListSubmissions);
  const mark = useServerFn(adminMarkSubmission);
  const del = useServerFn(adminDeleteSubmission);

  const { data } = useQuery({ queryKey: ["adm", "subs"], queryFn: () => list() });

  const m = useMutation({
    mutationFn: (v: { id: string; is_read: boolean }) => mark({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adm", "subs"] }),
  });

  const r = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["adm", "subs"] });
    },
  });

  function exportCsv() {
    const rows = data ?? [];
    const headers = ["kind", "name", "email", "phone", "subject", "message", "created_at"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? "")).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dmgf-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Form Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contact, volunteer and newsletter submissions.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {data?.length === 0 && (
          <div className="bg-white border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            <Mail className="h-6 w-6 mx-auto mb-2 opacity-50" />
            No submissions yet.
          </div>
        )}
        {data?.map((s) => (
          <details
            key={s.id}
            className={`bg-white border rounded-xl ${s.is_read ? "border-border" : "border-gold/40 shadow-sm"}`}
          >
            <summary className="p-4 cursor-pointer flex items-center gap-3 list-none">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  m.mutate({ id: s.id, is_read: !s.is_read });
                }}
                className="h-5 w-5 rounded-full border grid place-items-center"
                aria-label="Toggle read"
              >
                {s.is_read ? (
                  <Check className="h-3 w-3 text-gold" />
                ) : (
                  <Circle className="h-2 w-2 fill-gold text-gold" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider bg-ink text-white px-2 py-0.5 rounded">
                    {s.kind}
                  </span>
                  <span className="font-medium text-sm truncate">
                    {s.name || s.email || "Anonymous"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {s.subject || s.message?.slice(0, 80) || "—"}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </summary>
            <div className="px-4 pb-4 space-y-1 text-sm border-t border-border pt-3">
              {s.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <a className="hover:text-gold" href={`mailto:${s.email}`}>
                    {s.email}
                  </a>
                </div>
              )}
              {s.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span> {s.phone}
                </div>
              )}
              {s.subject && (
                <div>
                  <span className="text-muted-foreground">Subject:</span> {s.subject}
                </div>
              )}
              {s.message && (
                <div className="whitespace-pre-wrap text-foreground/90 mt-2">{s.message}</div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => confirm("Delete?") && r.mutate(s.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

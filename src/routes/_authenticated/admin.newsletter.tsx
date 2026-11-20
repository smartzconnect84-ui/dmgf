import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDeleteSubmission, adminListSubmissions } from "@/lib/cms.functions";
import { Mail, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListSubmissions);
  const del = useServerFn(adminDeleteSubmission);
  const { data } = useQuery({ queryKey: ["adm", "subs"], queryFn: () => list() });
  const items = (data ?? []).filter((s: any) => s.kind === "newsletter");

  const r = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adm", "subs"] }); } });

  function exportCsv() {
    const headers = ["email", "name", "created_at"];
    const csv = [headers.join(","), ...items.map((s: any) => headers.map((h) => JSON.stringify(s[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dmgf-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-1">Email subscribers and newsletter sign-ups.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">Email</th><th className="text-left p-3">Name</th><th className="text-left p-3">Date</th><th /></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No subscribers yet.</td></tr>}
            {items.map((s: any) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">{s.email ?? "—"}</td>
                <td className="p-3">{s.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => confirm("Delete?") && r.mutate(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
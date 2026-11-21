import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@/lib/use-server-fn";
import { useQuery } from "@tanstack/react-query";
import { staffListSubmissions } from "@/lib/staff.functions";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/submissions")({
  component: SubmissionsPage,
});

type Sub = {
  id: string;
  kind: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

function SubmissionsPage() {
  const fn = useServerFn(staffListSubmissions);
  const { data, isLoading, error } = useQuery({ queryKey: ["staff", "subs"], queryFn: () => fn() });
  const items = (data ?? []) as Sub[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-gold" />
          Form Inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          Contact and volunteer submissions, filtered to your role.
        </p>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-red-600">{(error as Error).message}</div>}
      {!isLoading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
          No submissions yet.
        </div>
      )}

      <div className="grid gap-3">
        {items.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-border p-5 hover:border-gold/40 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] bg-ink text-gold px-2 py-0.5 rounded-full">
                  {s.kind}
                </span>
                <div className="font-medium mt-2">{s.name ?? "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="hover:text-gold">
                      {s.email}
                    </a>
                  )}
                  {s.phone && <span className="ml-3">{s.phone}</span>}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
            {s.message && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2">{s.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

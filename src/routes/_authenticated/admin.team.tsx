import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteTeam, adminListTeam, adminUpsertTeam } from "@/lib/cms.functions";
import { Plus, Trash2, Save, Loader2, X, User } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: TeamPage,
});

type Member = {
  id?: string;
  name: string;
  role_title: string;
  photo_url?: string | null;
  bio?: string | null;
  email?: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Member = { name: "", role_title: "", photo_url: "", bio: "", email: "", sort_order: 0, is_active: true };

function TeamPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListTeam);
  const upsert = useServerFn(adminUpsertTeam);
  const del = useServerFn(adminDeleteTeam);
  const [edit, setEdit] = useState<Member | null>(null);

  const { data } = useQuery({ queryKey: ["adm", "team"], queryFn: () => list() });

  const save = useMutation({
    mutationFn: (m: Member) => upsert({ data: m }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["adm", "team"] });
      setEdit(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["adm", "team"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Leadership and ambassadors shown on the Team page.</p>
        </div>
        <button
          onClick={() => setEdit({ ...empty, sort_order: (data?.length ?? 0) + 1 })}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink"
        >
          <Plus className="h-4 w-4" /> Add member
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {data?.map((m) => (
          <div key={m.id} className="bg-white border border-border rounded-xl p-4 flex gap-3 items-center">
            {m.photo_url ? (
              <img src={m.photo_url} alt="" className="h-14 w-14 object-cover rounded-full bg-muted" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted grid place-items-center text-muted-foreground"><User className="h-5 w-5" /></div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.role_title}</div>
              <div className="text-[10px] text-muted-foreground">#{m.sort_order} · {m.is_active ? "Active" : "Hidden"}</div>
            </div>
            <button onClick={() => setEdit(m as Member)} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:border-gold">Edit</button>
            <button onClick={() => confirm("Delete?") && remove.mutate(m.id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{edit.id ? "Edit member" : "New member"}</h2>
              <button onClick={() => setEdit(null)} className="p-2 hover:bg-muted rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <F l="Name" v={edit.name} on={(v) => setEdit({ ...edit, name: v })} />
              <F l="Role title" v={edit.role_title} on={(v) => setEdit({ ...edit, role_title: v })} />
              <F l="Photo URL" v={edit.photo_url ?? ""} on={(v) => setEdit({ ...edit, photo_url: v })} />
              <F l="Email" v={edit.email ?? ""} on={(v) => setEdit({ ...edit, email: v })} />
              <F l="Bio" v={edit.bio ?? ""} on={(v) => setEdit({ ...edit, bio: v })} textarea />
              <F l="Sort order" v={String(edit.sort_order)} on={(v) => setEdit({ ...edit, sort_order: parseInt(v) || 0 })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2 justify-end">
              <button onClick={() => setEdit(null)} className="px-4 py-2 text-sm border border-border rounded-lg">Cancel</button>
              <button onClick={() => save.mutate(edit)} disabled={save.isPending} className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-60">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ l, v, on, textarea }: { l: string; v: string; on: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{l}</label>
      {textarea ? (
        <textarea value={v} onChange={(e) => on(e.target.value)} rows={4} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
      ) : (
        <input value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
      )}
    </div>
  );
}

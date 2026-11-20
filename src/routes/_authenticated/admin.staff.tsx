import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminAssignRole, adminListStaffUsers, adminRemoveRole } from "@/lib/admin.functions";
import { inviteStaff } from "@/lib/admin.functions";
import { ShieldCheck, Plus, Trash2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["admin", "ceo", "global_director", "communication_director", "program_director", "financial_director", "brand_ambassador", "volunteer", "editor"] as const;

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: StaffMgmtPage,
});

function StaffMgmtPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListStaffUsers);
  const assign = useServerFn(adminAssignRole);
  const remove = useServerFn(adminRemoveRole);
  const invite = useServerFn(inviteStaff);
  const { data } = useQuery({ queryKey: ["adm", "staff-users"], queryFn: () => list() });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("editor");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("editor");

  const inviteM = useMutation({
    mutationFn: () => invite({ data: { email, role: role as any } }),
    onSuccess: () => { toast.success("Invited"); qc.invalidateQueries({ queryKey: ["adm", "staff-users"] }); setEmail(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignM = useMutation({
    mutationFn: () => assign({ data: { userId: selectedUser, role: selectedRole as any } }),
    onSuccess: () => { toast.success("Role assigned"); qc.invalidateQueries({ queryKey: ["adm", "staff-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: (v: { userId: string; role: string }) => remove({ data: { userId: v.userId, role: v.role as any } }),
    onSuccess: () => { toast.success("Role removed"); qc.invalidateQueries({ queryKey: ["adm", "staff-users"] }); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Invite staff and manage their roles.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Invite new staff</div>
        <div className="flex flex-wrap gap-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" className="flex-1 min-w-[200px] rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-white">
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => email && inviteM.mutate()} disabled={!email || inviteM.isPending} className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-40">
            {inviteM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Invite
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Assign role to existing user</div>
        <div className="flex flex-wrap gap-3">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border border-border px-3 py-2 text-sm bg-white">
            <option value="">Select user…</option>
            {(data ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-white">
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => selectedUser && assignM.mutate()} disabled={!selectedUser || assignM.isPending} className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-40">
            <Plus className="h-4 w-4" /> Assign
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(data ?? []).map((u: any) => (
          <div key={u.id} className="bg-white border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="font-medium text-sm">{u.display_name || u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(u.roles ?? []).map((r: string) => (
                <span key={r} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-ink text-gold border border-gold/30 px-2 py-1 rounded-full">
                  {r}
                  <button onClick={() => removeM.mutate({ userId: u.id, role: r })} className="hover:text-red-300"><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
              {(u.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listStaffRecipients, listStaffMessages, sendStaffMessage, markStaffMessageRead } from "@/lib/staff.functions";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/staff/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const qc = useQueryClient();
  const recipientsFn = useServerFn(listStaffRecipients);
  const messagesFn = useServerFn(listStaffMessages);
  const sendFn = useServerFn(sendStaffMessage);
  const markFn = useServerFn(markStaffMessageRead);

  const { data: recipients } = useQuery({ queryKey: ["staff-recipients"], queryFn: () => recipientsFn() });
  const { data: messages } = useQuery({ queryKey: ["staff-messages"], queryFn: () => messagesFn(), refetchInterval: 5000 });

  const [to, setTo] = useState("");
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: () => sendFn({ data: { recipient_id: to, body } }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["staff-messages"] }); },
  });

  // mark read on view
  // (optional) mark all incoming as read
  if (messages) {
    for (const m of messages as any[]) {
      if (m.recipient_id && !m.read_at) {
        // fire and forget
        markFn({ data: { id: m.id } }).catch(() => {});
      }
    }
  }

  const myId = (messages as any[])?.[0]?.sender_id; // not reliable; display names from recipients
  const nameFor = (id: string) => (recipients as any[])?.find((r) => r.id === id)?.display_name || id.slice(0, 8);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl flex items-center gap-2"><MessageSquare className="h-5 w-5 text-gold" />Direct Messages</h1>
        <p className="text-sm text-muted-foreground">Message other staff members.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
        <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">Select recipient…</option>
          {(recipients ?? []).map((r: any) => (
            <option key={r.id} value={r.id}>{r.display_name || r.id.slice(0, 8)}</option>
          ))}
        </select>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Type a message…" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <button
          onClick={() => to && body.trim() && send.mutate()}
          disabled={!to || !body.trim() || send.isPending}
          className="inline-flex items-center gap-2 bg-gradient-gold text-ink font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
        >
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {(messages ?? []).length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
        {(messages ?? []).map((m: any) => (
          <div key={m.id} className="border-b border-border pb-2 last:border-0">
            <div className="text-xs text-muted-foreground">
              {nameFor(m.sender_id)} → {nameFor(m.recipient_id)} · {new Date(m.created_at).toLocaleString()}
            </div>
            <div className="text-sm mt-1 whitespace-pre-wrap">{m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
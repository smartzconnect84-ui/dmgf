import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteMedia, adminListMedia, adminRegisterMedia } from "@/lib/cms.functions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Copy, Trash2, Images, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaPage,
});

export function MediaPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListMedia);
  const reg = useServerFn(adminRegisterMedia);
  const del = useServerFn(adminDeleteMedia);
  const { data } = useQuery({ queryKey: ["adm", "media"], queryFn: () => list() });
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const save = useMutation({
    mutationFn: () => reg({ data: { storage_path: url.split("/").pop() || "upload", public_url: url, filename: name || url.split("/").pop() || "image", content_type: null, size_bytes: null, alt_text: null } }),
    onSuccess: () => { toast.success("Registered"); qc.invalidateQueries({ queryKey: ["adm", "media"] }); setUrl(""); setName(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adm", "media"] }); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Media Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Uploaded images and assets. Upload new or register existing URLs.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <ImageUpload label="Upload image" value={url} onChange={setUrl} folder="library" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name (optional)" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={() => url && save.mutate()} disabled={!url || save.isPending} className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-40">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />} Register in library
        </button>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data ?? []).map((m: any) => (
          <div key={m.id} className="bg-white border border-border rounded-xl overflow-hidden">
            <img src={m.public_url} alt={m.alt_text || m.filename} className="w-full aspect-square object-cover" />
            <div className="p-3 space-y-2">
              <div className="text-xs font-medium truncate">{m.filename}</div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(m.public_url); toast.success("URL copied"); }} className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-lg py-1.5 hover:border-gold">
                  <Copy className="h-3 w-3" /> Copy URL
                </button>
                <button onClick={() => confirm("Delete?") && remove.mutate(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="col-span-full text-sm text-muted-foreground">No media registered yet.</div>}
      </div>
    </div>
  );
}
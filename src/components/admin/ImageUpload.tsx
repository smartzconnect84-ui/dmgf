import { useRef, useState } from "react";
import { Upload, Loader2, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
};

/**
 * Reusable image uploader for admin forms.
 * Uploads to the public `site-media` Supabase bucket and returns the public URL.
 * Also allows pasting an external URL directly.
 */
export function ImageUpload({ label = "Image", value, onChange, folder = "uploads", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safe = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .toLowerCase()
        .slice(0, 40);
      const path = `${folder}/${Date.now()}-${safe || "img"}.${ext}`;
      const { error } = await supabase.storage.from("site-media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative h-24 w-32 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-[10px] uppercase tracking-wider text-muted-foreground">
              No image
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 h-6 w-6 grid place-items-center rounded-full bg-black/60 text-white hover:bg-red-500"
              aria-label="Clear image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink transition disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? "Uploading…" : "Upload image"}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            <span>or paste URL</span>
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-gold"
          />
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

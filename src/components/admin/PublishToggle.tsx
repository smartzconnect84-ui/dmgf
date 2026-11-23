import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Publish / unpublish control for a content row.
 *
 * Publishing flips the row's `is_active` flag, which is what the public pages
 * filter on, so the change is live for visitors as soon as the public data
 * refetches (on focus, on navigation and at most every 15s).
 */
export function PublishToggle({
  published,
  busy,
  onToggle,
  compact,
}: {
  published: boolean;
  busy?: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const label = published ? "Published" : "Unpublished";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      aria-pressed={published}
      title={
        published
          ? "Unpublish — hide this from the public site"
          : "Publish — show this on the public site"
      }
      className={`btn-fx inline-flex items-center gap-1.5 rounded-lg border text-xs min-h-9 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      } ${
        published
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
      } disabled:opacity-60`}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : published ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { RecordsEditor } from "@/components/staff/RecordsEditor";
import { staffExportPrograms, staffImportPrograms } from "@/lib/staff.functions";
import { Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff/programs")({
  component: ProgramsPage,
});

type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, string | number | boolean>;

type ProgramImportRow = {
  title: string;
  tag?: string | null;
  summary?: string | null;
  body?: string | null;
  image_url?: string | null;
  date_text?: string | null;
  location?: string | null;
  is_highlight?: boolean;
  sort_order?: number;
  is_active?: boolean;
};

function toCsv(rows: Record<string, CsvValue>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: CsvValue) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQ = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ",") {
          out.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const obj: CsvRow = {};
    header.forEach((h, i) => {
      obj[h.trim()] = vals[i] ?? "";
    });
    // coerce
    if (obj.sort_order !== undefined && obj.sort_order !== "")
      obj.sort_order = Number(obj.sort_order);
    if (obj.is_highlight !== undefined)
      obj.is_highlight = String(obj.is_highlight).toLowerCase() === "true";
    if (obj.is_active !== undefined)
      obj.is_active = String(obj.is_active).toLowerCase() !== "false";
    return obj;
  });
}

function ProgramsPage() {
  const qc = useQueryClient();
  const exportFn = useServerFn(staffExportPrograms);
  const importFn = useServerFn(staffImportPrograms);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setBusy(true);
    try {
      const rows = await exportFn();
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "programs.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported programs.csv");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      let rows: ProgramImportRow[] = [];
      if (file.name.toLowerCase().endsWith(".json")) {
        rows = JSON.parse(text) as ProgramImportRow[];
      } else {
        rows = parseCsv(text) as unknown as ProgramImportRow[];
      }
      if (!Array.isArray(rows) || rows.length === 0) throw new Error("No rows found");
      const res = await importFn({ data: { rows } });
      toast.success(`Imported ${res.inserted} programs`);
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExport}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{" "}
          Export CSV
        </button>
        <label className="inline-flex items-center gap-2 bg-ink text-white text-sm px-4 py-2 rounded-lg hover:bg-gold hover:text-ink cursor-pointer">
          <Upload className="h-4 w-4" /> Import CSV/JSON
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
            }}
          />
        </label>
      </div>
      <RecordsEditor
        table="programs"
        title="Programs"
        subtitle="Add and update the foundation's programs."
        titleKey="title"
        imageKey="image_url"
        defaults={{
          title: "",
          summary: "",
          body: "",
          image_url: "",
          tag: "",
          date_text: "",
          location: "",
          is_highlight: false,
          sort_order: 0,
          is_active: true,
        }}
        fields={[
          { key: "title", label: "Title" },
          { key: "tag", label: "Tag (e.g. Women Empowerment)" },
          { key: "summary", label: "Summary", type: "textarea" },
          { key: "body", label: "Full description", type: "textarea" },
          { key: "image_url", label: "Flyer / photo", type: "image" },
          { key: "date_text", label: "Date" },
          { key: "location", label: "Location" },
          { key: "sort_order", label: "Order", type: "number" },
          { key: "is_highlight", label: "Highlight", type: "bool" },
          { key: "is_active", label: "Visible on site", type: "bool" },
        ]}
      />
    </div>
  );
}

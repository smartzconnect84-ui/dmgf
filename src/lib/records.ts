import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteRecord,
  adminListRecords,
  adminSaveRecord,
  adminSetPublished,
  type PublishableTable,
  type RecordTable,
} from "@/lib/cms.functions";

/**
 * Data access for the record editors.
 *
 * Writes go through the `dmgf-api` edge function, which validates the payload
 * and checks the caller's role. A deployment of this app can reach a function
 * that predates the records actions, which answers "Unknown API operation.";
 * in that window we fall back to the same RLS-protected table write so editors
 * keep working. Once `dmgf-api` is redeployed the fallback is never reached.
 */
function isStaleFunction(error: unknown) {
  return error instanceof Error && /unknown api operation/i.test(error.message);
}

export async function listRecords(table: RecordTable) {
  try {
    return await adminListRecords({ data: { table } });
  } catch (error) {
    if (!isStaleFunction(error)) throw error;
    const { data, error: queryError } = await supabase.from(table).select("*").order("sort_order");
    if (queryError) throw queryError;
    return (data ?? []) as Record<string, unknown>[];
  }
}

export async function saveRecord(table: RecordTable, row: Record<string, unknown>) {
  try {
    return await adminSaveRecord({ data: { table, row } });
  } catch (error) {
    if (!isStaleFunction(error)) throw error;
    const { id, created_at: _c, updated_at: _u, ...rest } = row;
    const query = id
      ? supabase
          .from(table)
          .update(rest as never)
          .eq("id", String(id))
      : supabase.from(table).insert(rest as never);
    const { error: writeError } = await query;
    if (writeError) throw writeError;
    return { ok: true };
  }
}

export async function deleteRecord(table: RecordTable, id: string) {
  try {
    return await adminDeleteRecord({ data: { table, id } });
  } catch (error) {
    if (!isStaleFunction(error)) throw error;
    const { error: writeError } = await supabase.from(table).delete().eq("id", id);
    if (writeError) throw writeError;
    return { ok: true };
  }
}

export async function setPublished(table: PublishableTable, id: string, published: boolean) {
  try {
    return await adminSetPublished({ data: { table, id, published } });
  } catch (error) {
    if (!isStaleFunction(error)) throw error;
    const { error: writeError } = await supabase
      .from(table)
      .update({ is_active: published })
      .eq("id", id);
    if (writeError) throw writeError;
    return { ok: true };
  }
}

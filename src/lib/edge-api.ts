import { supabase } from "@/integrations/supabase/client";

export type EdgeAction = (...args: never[]) => Promise<unknown>;

export function createEdgeAction<T = unknown>(action: string) {
  return async (input?: unknown): Promise<T> => {
    const payload =
      input && typeof input === "object" && "data" in input
        ? (input as { data: unknown }).data
        : (input ?? {});
    const { data, error } = await supabase.functions.invoke("dmgf-api", {
      body: { action, data: payload },
    });
    if (error) throw new Error(error.message || "The request could not be completed.");
    if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
      throw new Error(data.error);
    }
    return data as T;
  };
}

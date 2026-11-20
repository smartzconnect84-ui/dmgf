// Role-scoped server functions for the staff portal.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type StaffRole =
  | "admin"
  | "ceo"
  | "global_director"
  | "communication_director"
  | "program_director"
  | "financial_director"
  | "brand_ambassador"
  | "volunteer";

const ALL_STAFF_ROLES: StaffRole[] = [
  "admin",
  "ceo",
  "global_director",
  "communication_director",
  "program_director",
  "financial_director",
  "brand_ambassador",
];

async function getRoles(ctx: { supabase: any; userId: string }): Promise<StaffRole[]> {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { role: StaffRole }) => r.role);
}

async function requireAny(ctx: { supabase: any; userId: string }, roles: StaffRole[]) {
  const mine = await getRoles(ctx);
  const ok = mine.some((r) => roles.includes(r)) || mine.includes("admin");
  if (!ok) throw new Error("Forbidden: insufficient role");
  return mine;
}

// ====== Profile ======
export const getMyStaffProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await getRoles(context);
    const isStaff = roles.some((r) => ALL_STAFF_ROLES.includes(r));
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();
    return {
      userId: context.userId,
      roles,
      isStaff,
      isAdmin: roles.includes("admin"),
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(200),
  avatar_url: z.string().max(2000).nullable().optional(),
});

export const updateMyStaffProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, display_name: data.display_name, avatar_url: data.avatar_url || null }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ====== Legacy demo seeding (disabled for production) ======
// Demo accounts were removed. These stubs remain so older clients don't
// break: they create nothing and expose no credentials.
export const ensureDemoStaff = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true, provisioned: 0, disabled: true };
});

export const listDemoStaff = createServerFn({ method: "GET" }).handler(async () => {
  return [] as { email: string; password: string; role: string; name: string }[];
});

// ====== Donations (financial_director + admin) ======
export const staffListDonations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAny(context, ["financial_director", "ceo"]);
    const { data, error } = await context.supabase
      .from("donations")
      .select("*")
      .order("received_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const donationSchema = z.object({
  id: z.string().uuid().optional(),
  donor_name: z.string().trim().min(1).max(200),
  donor_email: z.string().trim().email().max(255).nullable().optional(),
  amount_usd: z.number().nonnegative().max(10_000_000),
  method: z.string().trim().max(60).nullable().optional(),
  status: z.enum(["received", "pending", "refunded"]).default("received"),
  note: z.string().trim().max(2000).nullable().optional(),
  received_at: z.string().optional(),
});

export const staffUpsertDonation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => donationSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAny(context, ["financial_director"]);
    const { error } = await context.supabase.from("donations").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const staffDeleteDonation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAny(context, ["financial_director"]);
    const { error } = await context.supabase.from("donations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ====== Form submissions (read for several roles) ======
export const staffListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const mine = await requireAny(context, ["communication_director", "ceo", "brand_ambassador"]);
    let q = context.supabase.from("form_submissions").select("*").order("created_at", { ascending: false });
    if (!mine.includes("admin") && !mine.includes("communication_director") && !mine.includes("ceo")) {
      // Brand ambassadors see volunteer submissions only
      q = q.eq("kind", "volunteer");
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ====== Update own password ======
export const staffUpdatePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ newPassword: z.string().min(8).max(72) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

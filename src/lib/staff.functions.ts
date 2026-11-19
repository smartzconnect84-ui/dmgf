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
    return { userId: context.userId, roles, isStaff, isAdmin: roles.includes("admin") };
  });

// ====== Demo staff seed (idempotent) ======
const DEMO_STAFF: { email: string; password: string; role: StaffRole; name: string }[] = [
  { email: "ceo@dmgf.org", password: "CeoDemo2026!", role: "ceo", name: "Deesire Moore (CEO)" },
  { email: "global@dmgf.org", password: "GlobalDemo2026!", role: "global_director", name: "Shedrick Nungehn" },
  { email: "comms@dmgf.org", password: "CommsDemo2026!", role: "communication_director", name: "Communication Director" },
  { email: "programs@dmgf.org", password: "ProgramsDemo2026!", role: "program_director", name: "Program Director" },
  { email: "finance@dmgf.org", password: "FinanceDemo2026!", role: "financial_director", name: "Financial Director" },
  { email: "ambassador@dmgf.org", password: "AmbassadorDemo2026!", role: "brand_ambassador", name: "Sannah Ballah" },
];

export const ensureDemoStaff = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw new Error(listErr.message);
  const byEmail = new Map(list.users.map((u) => [u.email?.toLowerCase(), u.id] as const));

  let provisioned = 0;
  for (const s of DEMO_STAFF) {
    let uid = byEmail.get(s.email);
    if (!uid) {
      const { data: c, error } = await supabaseAdmin.auth.admin.createUser({
        email: s.email,
        password: s.password,
        email_confirm: true,
        user_metadata: { display_name: s.name },
      });
      if (error) continue;
      uid = c.user?.id;
      provisioned++;
    }
    if (uid) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: uid, role: s.role }, { onConflict: "user_id,role" });
    }
  }
  return { ok: true, provisioned };
});

export const listDemoStaff = createServerFn({ method: "GET" }).handler(async () => {
  return DEMO_STAFF.map(({ email, password, role, name }) => ({ email, password, role, name }));
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

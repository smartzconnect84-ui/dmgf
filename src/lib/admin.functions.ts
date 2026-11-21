import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const OWNER_EMAIL = "info24dmgf@gmail.com";

/** Every privileged role — owner holds all of them for full access. */
const OWNER_ROLES = [
  "admin",
  "ceo",
  "global_director",
  "communication_director",
  "program_director",
  "financial_director",
  "brand_ambassador",
] as const;

/** Legacy demo accounts removed for production. */
const DEMO_EMAILS = [
  "admin@dmgf.org",
  "ceo@dmgf.org",
  "global@dmgf.org",
  "comms@dmgf.org",
  "programs@dmgf.org",
  "finance@dmgf.org",
  "ambassador@dmgf.org",
];

/**
 * Delete all legacy demo accounts (auth users + their roles). Admin-only so
 * it can be re-run from production if demo users were seeded earlier.
 */
export const removeDemoAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);

    const targets = list.users.filter((u) => DEMO_EMAILS.includes((u.email ?? "").toLowerCase()));
    let removed = 0;
    for (const t of targets) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", t.id);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(t.id);
      if (!error) removed++;
    }
    return { ok: true, removed };
  });

/**
 * Idempotently ensure the Super Admin / App owner exists and holds every
 * privileged role. Public on purpose — calling it when the owner already
 * exists only refreshes roles and confirms an unconfirmed email; it never
 * resets an existing owner password. Called from the sign-in page so a
 * fresh production database self-provisions the owner.
 */
export const ensureOwnerAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { OWNER_INITIAL_PASSWORD, OWNER_DISPLAY_NAME } = await import("@/lib/owner.server");

  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  const lower = (e?: string | null) => (e ?? "").toLowerCase();
  const existing = list.users.find((u) => lower(u.email) === OWNER_EMAIL);
  let userId = existing?.id;

  if (!userId) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: OWNER_INITIAL_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: OWNER_DISPLAY_NAME },
    });
    if (createErr) throw new Error(createErr.message);
    userId = created.user?.id;
  } else if (!existing?.email_confirmed_at) {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: { display_name: OWNER_DISPLAY_NAME },
    });
  }
  if (!userId) throw new Error("Failed to provision owner admin user");

  for (const role of OWNER_ROLES) {
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (roleErr) throw new Error(roleErr.message);
  }

  return { status: "ready" as const, email: OWNER_EMAIL };
});

/**
 * Ensure the singleton production site_settings row (id = 1) exists with
 * safe production defaults. Never overwrites contact details an admin has
 * already configured — only fills a missing row.
 */
export const ensureProductionSettings = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing, error: readErr } = await supabaseAdmin
    .from("site_settings")
    .select("id")
    .eq("id", 1)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (existing) return { status: "exists" as const };

  const { error: insertErr } = await supabaseAdmin.from("site_settings").insert({
    id: 1,
    site_name: "Deesire Moore Grace Foundation",
    short_name: "DMGF",
    tagline: "Grace in action — serving communities with love.",
    address: "Monrovia, Liberia",
    hours: "Mon–Fri, 9:00–17:00",
    email: OWNER_EMAIL,
    phone_primary: null,
    phone_secondary: null,
    phone_whatsapp: null,
    payment_orange_money: null,
    payment_mtn_momo: null,
    social_facebook: null,
    social_instagram: null,
    social_twitter: null,
    social_youtube: null,
    logo_url: null,
  });
  if (insertErr) throw new Error(insertErr.message);
  return { status: "created" as const };
});

/**
 * Repair the allowlisted system-owner roles after authentication. No other
 * account can bootstrap or self-grant privileged access.
 */
export const grantSelfFullAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve the caller's email: JWT claim first, admin lookup fallback.
    let email = "";
    const claimEmail = (context as { claims?: { email?: string } }).claims?.email;
    if (typeof claimEmail === "string") email = claimEmail.toLowerCase().trim();
    if (!email) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      email = (userData.user?.email ?? "").toLowerCase().trim();
    }

    const isOwner = email === OWNER_EMAIL;
    if (!isOwner) {
      throw new Error("Forbidden: only the system owner can repair owner access.");
    }

    for (const role of OWNER_ROLES) {
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role }, { onConflict: "user_id,role" });
      if (roleErr) throw new Error(roleErr.message);
    }
    return { ok: true as const, email };
  });

/** Returns the current signed-in user's admin status. */
// ============== STAFF MANAGEMENT ==============
export const adminListStaffUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 500,
    });
    if (error) throw new Error(error.message);
    const ids = (list.users ?? []).map((u) => u.id);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id,role")
      .in("user_id", ids);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id,display_name,avatar_url")
      .in("id", ids);
    const roleMap: Record<string, string[]> = {};
    for (const r of roles ?? []) (roleMap[r.user_id] ||= []).push(r.role);
    const profMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    for (const p of profiles ?? [])
      profMap[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
    return (list.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      email_confirmed_at: u.email_confirmed_at,
      roles: roleMap[u.id] ?? [],
      display_name: profMap[u.id]?.display_name ?? null,
      avatar_url: profMap[u.id]?.avatar_url ?? null,
    }));
  });

const staffRoleValues = [
  "admin",
  "ceo",
  "global_director",
  "communication_director",
  "program_director",
  "financial_director",
  "brand_ambassador",
  "volunteer",
  "editor",
] as const;

const staffRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(staffRoleValues),
});

export const adminAssignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => staffRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => staffRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role);
    return { isAdmin: roles.includes("admin"), roles, userId: context.userId };
  });

// Must accept every role the Staff Management screen offers, otherwise picking
// anything other than admin/editor fails validation when the invitation is sent.
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(staffRoleValues).default("editor"),
});

/** Admin-only: invite/create another staff account. */
export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);
    if (error) throw new Error(error.message);
    if (invited.user) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: invited.user.id, role: data.role }, { onConflict: "user_id,role" });
    }
    return { ok: true };
  });

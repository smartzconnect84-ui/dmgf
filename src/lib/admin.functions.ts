import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const DEMO_EMAIL = "admin@dmgf.org";
const DEMO_PASSWORD = "DemoAdmin2026!";

/**
 * Idempotently ensure a demo admin exists. Public on purpose — calling it
 * when an admin already exists is a no-op. Used to bootstrap the demo
 * environment so the user can log in with seeded credentials.
 */
export const ensureDemoAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Already an admin? do nothing.
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "admin");
  if ((count ?? 0) > 0) {
    return { status: "exists" as const, email: DEMO_EMAIL };
  }

  // Look up an existing user with this email (paginated list — small demo project)
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  let userId = list.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL)?.id;

  if (!userId) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "DMGF Admin" },
    });
    if (createErr) throw new Error(createErr.message);
    userId = created.user?.id;
  }
  if (!userId) throw new Error("Failed to provision demo admin user");

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  return { status: "created" as const, email: DEMO_EMAIL };
});

/** Returns the current signed-in user's admin status. */
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

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor"]).default("editor"),
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

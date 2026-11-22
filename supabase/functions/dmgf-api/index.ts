import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};
const OWNER_EMAIL = "info24dmgf@gmail.com";
const OWNER_ROLES = ["admin", "ceo", "global_director", "communication_director", "program_director", "financial_director", "brand_ambassador"];
const DEMO_EMAILS = ["admin@dmgf.org", "ceo@dmgf.org", "global@dmgf.org", "comms@dmgf.org", "programs@dmgf.org", "finance@dmgf.org", "ambassador@dmgf.org"];
const STAFF_ROLES = ["admin", "editor", "ceo", "global_director", "communication_director", "program_director", "financial_director", "brand_ambassador", "volunteer"] as const;
const MESSAGING_ROLES = STAFF_ROLES.filter((role) => role !== "volunteer");
const env = (name: string) => Deno.env.get(name) ?? "";
const supabaseUrl = env("SUPABASE_URL");
const anonKey = env("SUPABASE_ANON_KEY") || env("SUPABASE_PUBLISHABLE_KEY");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !anonKey || !serviceKey) throw new Error("Supabase Edge Function secrets are not configured.");
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

class ApiError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}
const objectSchema = z.record(z.string(), z.unknown());
const idSchema = z.string().uuid();
const throwIfError = (error: { message: string } | null) => { if (error) throw new ApiError(error.message); };
const record = (value: unknown) => objectSchema.parse(value ?? {});
const requireText = (value: unknown, name: string, max = 5000) => {
  if (typeof value !== "string" || value.length > max) throw new ApiError(`Invalid ${name}.`);
  return value;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const body = await request.json();
    const action = requireText(body?.action, "action", 100);
    const data = record(body?.data);
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData } = token ? await caller.auth.getUser(token) : { data: { user: null } };
    const user = userData?.user ?? null;
    const requireUser = () => {
      if (!user) throw new ApiError("Unauthorized.", 401);
      return user;
    };
    const rolesFor = async (userId = requireUser().id): Promise<string[]> => {
      const { data: rows, error } = await caller.from("user_roles").select("role").eq("user_id", userId);
      throwIfError(error);
      return (rows ?? []).map((row) => row.role as string);
    };
    const requireAny = async (allowed: readonly string[]) => {
      const roles = await rolesFor();
      if (!roles.includes("admin") && !roles.some((role) => allowed.includes(role))) throw new ApiError("Forbidden: insufficient role.", 403);
      return roles;
    };
    const requireAdmin = () => requireAny(["admin"]);
    let result: unknown;

    switch (action) {
      case "fetchHeroBanners": result = await publicList(caller, "hero_banners", "sort_order"); break;
      case "fetchGalleryItems": result = await publicList(caller, "gallery_items", "sort_order"); break;
      case "fetchEvents": result = await publicList(caller, "events", "sort_order"); break;
      case "fetchNews": result = await publicList(caller, "news_posts", "published_at", false); break;
      case "fetchPrograms": result = await publicList(caller, "programs", "sort_order"); break;
      case "fetchTeam": result = await publicList(caller, "team_members", "sort_order"); break;
      case "fetchContentBlocks": {
        const page = requireText(data.page, "page", 100);
        const { data: rows, error } = await caller.from("content_blocks").select("block_key,value,kind").eq("page", page);
        throwIfError(error);
        result = Object.fromEntries((rows ?? []).map((row) => [row.block_key, row.value ?? ""]));
        break;
      }
      case "fetchSiteSettings": {
        const { data: row, error } = await caller.from("site_settings").select("*").eq("id", 1).maybeSingle();
        throwIfError(error); result = row; break;
      }
      case "submitForm": {
        const kind = z.enum(["contact", "volunteer", "newsletter"]).parse(data.kind);
        const { error } = await caller.from("form_submissions").insert({
          kind,
          name: optionalText(data.name, 200),
          email: optionalEmail(data.email),
          phone: optionalText(data.phone, 50),
          subject: optionalText(data.subject, 300),
          message: optionalText(data.message, 5000),
        });
        throwIfError(error); result = { ok: true }; break;
      }
      case "getMyAdminStatus": {
        const current = requireUser(); const roles = await rolesFor(current.id);
        result = { isAdmin: roles.includes("admin"), roles, userId: current.id }; break;
      }
      case "getMyStaffProfile": {
        const current = requireUser(); const roles = await rolesFor(current.id);
        const { data: profile } = await caller.from("profiles").select("display_name,avatar_url,bio,phone,department,location").eq("id", current.id).maybeSingle();
        result = { userId: current.id, roles, isStaff: roles.some((role) => STAFF_ROLES.includes(role as typeof STAFF_ROLES[number])), isAdmin: roles.includes("admin"), displayName: profile?.display_name ?? null, avatarUrl: profile?.avatar_url ?? null, bio: profile?.bio ?? null, phone: profile?.phone ?? null, department: profile?.department ?? null, location: profile?.location ?? null };
        break;
      }
      case "updateMyStaffProfile": {
        const current = requireUser(); await requireAny(STAFF_ROLES);
        const payload = z.object({ display_name: z.string().trim().min(1).max(200), avatar_url: z.string().max(2000).nullable().optional(), bio: z.string().max(5000).nullable().optional(), phone: z.string().max(50).nullable().optional(), department: z.string().max(200).nullable().optional(), location: z.string().max(200).nullable().optional() }).parse(data);
        const { error } = await caller.from("profiles").upsert({ id: current.id, ...payload }, { onConflict: "id" });
        throwIfError(error); result = { ok: true }; break;
      }
      case "ensureDemoStaff": result = { ok: true, provisioned: 0, disabled: true }; break;
      case "listDemoStaff": result = []; break;
      case "staffListDonations": {
        await requireAny(["financial_director", "ceo"]);
        const { data: rows, error } = await caller.from("donations").select("*").order("received_at", { ascending: false });
        throwIfError(error); result = rows ?? []; break;
      }
      case "staffUpsertDonation": {
        await requireAny(["financial_director"]);
        const payload = z.object({ id: idSchema.optional(), donor_name: z.string().trim().min(1).max(200), donor_email: z.string().email().max(255).nullable().optional(), amount_usd: z.number().nonnegative().max(10_000_000), method: z.string().trim().max(60).nullable().optional(), status: z.enum(["received", "pending", "refunded"]).default("received"), note: z.string().trim().max(2000).nullable().optional(), received_at: z.string().optional() }).parse(data);
        const { error } = await caller.from("donations").upsert(payload); throwIfError(error); result = { ok: true }; break;
      }
      case "staffDeleteDonation": {
        await requireAny(["financial_director"]); const id = idSchema.parse(data.id);
        const { error } = await caller.from("donations").delete().eq("id", id); throwIfError(error); result = { ok: true }; break;
      }
      case "staffListSubmissions": {
        const roles = await requireAny(["communication_director", "ceo", "brand_ambassador"]);
        let query = caller.from("form_submissions").select("*").order("created_at", { ascending: false });
        if (!roles.some((role) => ["admin", "communication_director", "ceo"].includes(role))) query = query.eq("kind", "volunteer");
        const { data: rows, error } = await query; throwIfError(error); result = rows ?? []; break;
      }
      case "listStaffRecipients": {
        await requireAny(MESSAGING_ROLES); const { data: rows, error } = await caller.rpc("get_messaging_recipients");
        throwIfError(error); result = (rows ?? []).filter((row) => row.id !== user!.id); break;
      }
      case "listStaffMessages": {
        await requireAny(MESSAGING_ROLES); const uid = user!.id;
        const { data: rows, error } = await caller.from("staff_messages").select("*").or(`sender_id.eq.${uid},recipient_id.eq.${uid}`).order("created_at", { ascending: true });
        throwIfError(error); result = rows ?? []; break;
      }
      case "sendStaffMessage": {
        await requireAny(MESSAGING_ROLES);
        const payload = z.object({ recipient_id: idSchema, body: z.string().trim().min(1).max(5000) }).parse(data);
        const { error } = await caller.from("staff_messages").insert({ sender_id: user!.id, ...payload });
        throwIfError(error); result = { ok: true }; break;
      }
      case "markStaffMessageRead": {
        const id = idSchema.parse(data.id);
        const { error } = await caller.from("staff_messages").update({ read_at: new Date().toISOString() }).eq("id", id).eq("recipient_id", requireUser().id);
        throwIfError(error); result = { ok: true }; break;
      }
      case "staffExportPrograms": {
        await requireAny(["program_director", "ceo"]); const { data: rows, error } = await caller.from("programs").select("*").order("sort_order");
        throwIfError(error); result = rows ?? []; break;
      }
      case "staffImportPrograms": {
        await requireAny(["program_director"]);
        const rows = z.array(z.object({ title: z.string().min(1).max(300), tag: z.string().max(100).nullable().optional(), summary: z.string().max(2000).nullable().optional(), body: z.string().max(20000).nullable().optional(), image_url: z.string().max(2000).nullable().optional(), date_text: z.string().max(200).nullable().optional(), location: z.string().max(300).nullable().optional(), is_highlight: z.boolean().optional(), sort_order: z.number().int().optional(), is_active: z.boolean().optional() })).max(1000).parse(data.rows);
        const payload = rows.map((row) => ({ ...row, is_highlight: row.is_highlight ?? false, sort_order: row.sort_order ?? 0, is_active: row.is_active ?? true }));
        const { error } = await caller.from("programs").insert(payload); throwIfError(error); result = { ok: true, inserted: payload.length }; break;
      }
      case "staffUpdatePassword": {
        const current = requireUser(); const { newPassword } = z.object({ newPassword: z.string().min(8).max(72) }).parse(data);
        const { error } = await caller.auth.updateUser({ password: newPassword }); throwIfError(error); result = { ok: true, userId: current.id }; break;
      }
      case "ensureOwnerAdmin": result = await ensureOwner(); break;
      case "ensureProductionSettings": result = await ensureSettings(); break;
      case "grantSelfFullAccess": {
        const current = requireUser();
        const email = (current.email ?? "").toLowerCase().trim();
        if (email !== OWNER_EMAIL) throw new ApiError("Forbidden: only the system owner can repair owner access.", 403);
        await assignRoles(current.id, OWNER_ROLES); result = { ok: true, email }; break;
      }
      case "removeDemoAccounts": {
        await requireAdmin();
        const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 }); throwIfError(error);
        const targets = list.users.filter((item) => DEMO_EMAILS.includes((item.email ?? "").toLowerCase())); let removed = 0;
        for (const target of targets) { await admin.from("user_roles").delete().eq("user_id", target.id); const { error: deleteError } = await admin.auth.admin.deleteUser(target.id); if (!deleteError) removed++; }
        result = { ok: true, removed }; break;
      }
      case "adminListStaffUsers": {
        await requireAdmin(); const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 }); throwIfError(error);
        const ids = list.users.map((item) => item.id);
        const [{ data: roles }, { data: profiles }] = await Promise.all([
          admin.from("user_roles").select("user_id,role").in("user_id", ids),
          admin.from("profiles").select("id,display_name,avatar_url").in("id", ids),
        ]);
        const roleMap: Record<string, string[]> = {}; for (const row of roles ?? []) (roleMap[row.user_id] ||= []).push(row.role);
        const profileMap = Object.fromEntries((profiles ?? []).map((item) => [item.id, item]));
        result = list.users.map((item) => ({ id: item.id, email: item.email ?? "", created_at: item.created_at, email_confirmed_at: item.email_confirmed_at, roles: roleMap[item.id] ?? [], display_name: profileMap[item.id]?.display_name ?? null, avatar_url: profileMap[item.id]?.avatar_url ?? null })); break;
      }
      case "adminAssignRole": case "adminRemoveRole": {
        await requireAdmin(); const payload = z.object({ userId: idSchema, role: z.enum(STAFF_ROLES) }).parse(data);
        const query = action === "adminAssignRole"
          ? caller.from("user_roles").upsert({ user_id: payload.userId, role: payload.role }, { onConflict: "user_id,role" })
          : caller.from("user_roles").delete().eq("user_id", payload.userId).eq("role", payload.role);
        const { error } = await query; throwIfError(error); result = { ok: true }; break;
      }
      case "inviteStaff": {
        await requireAdmin(); const payload = z.object({ email: z.string().email(), role: z.enum(STAFF_ROLES).default("editor") }).parse(data);
        const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(payload.email); throwIfError(error);
        if (invited.user) throwIfError((await admin.from("user_roles").upsert({ user_id: invited.user.id, role: payload.role }, { onConflict: "user_id,role" })).error);
        result = { ok: true }; break;
      }
      case "adminListBanners": await requireAny(["communication_director"]); result = await adminList(caller, "hero_banners"); break;
      case "adminUpsertBanner": {
        await requireAny(["communication_director"]);
        const payload = z.object({ id: idSchema.optional(), image_url: z.string().min(1).max(2000), eyebrow: z.string().min(1).max(200), title: z.string().min(1).max(300), body: z.string().min(1).max(2000), date_text: z.string().max(200).nullable().optional(), location: z.string().max(300).nullable().optional(), cta_label: z.string().min(1).max(60), cta_to: z.string().min(1).max(500), focus_class: z.string().max(100).nullable().optional(), sort_order: z.number().int().default(0), is_active: z.boolean().default(true) }).parse(data);
        throwIfError((await caller.from("hero_banners").upsert(payload)).error); result = { ok: true }; break;
      }
      case "adminDeleteBanner": await requireAny(["communication_director"]); result = await deleteRow(caller, "hero_banners", data); break;
      case "adminListContent": await requireAny(["communication_director"]); result = await adminList(caller, "content_blocks", "page", "sort_order"); break;
      case "adminUpdateContentValue": {
        await requireAny(["communication_director"]); const payload = z.object({ id: idSchema, value: z.string().max(10000) }).parse(data);
        throwIfError((await caller.from("content_blocks").update({ value: payload.value }).eq("id", payload.id)).error); result = { ok: true }; break;
      }
      case "adminUpsertContentBlock": {
        await requireAny(["communication_director"]); const payload = z.object({ id: idSchema.optional(), page: z.string().min(1).max(100), block_key: z.string().min(1).max(100), label: z.string().min(1).max(200), kind: z.enum(["text", "richtext", "heading", "cta", "image_url"]).default("text"), value: z.string().max(10000).nullable().optional(), sort_order: z.number().int().default(0) }).parse(data);
        throwIfError((await caller.from("content_blocks").upsert(payload)).error); result = { ok: true }; break;
      }
      case "adminDeleteContentBlock": await requireAny(["communication_director"]); result = await deleteRow(caller, "content_blocks", data); break;
      case "adminListTeam": await requireAny(["ceo"]); result = await adminList(caller, "team_members", "sort_order"); break;
      case "adminUpsertTeam": {
        await requireAny(["ceo"]); const payload = z.object({ id: idSchema.optional(), name: z.string().min(1).max(200), role_title: z.string().min(1).max(200), photo_url: z.string().max(2000).nullable().optional(), bio: z.string().max(5000).nullable().optional(), email: z.string().email().max(320).nullable().optional().or(z.literal("")), sort_order: z.number().int().default(0), is_active: z.boolean().default(true) }).parse(data);
        throwIfError((await caller.from("team_members").upsert({ ...payload, email: payload.email || null })).error); result = { ok: true }; break;
      }
      case "adminDeleteTeam": await requireAny(["ceo"]); result = await deleteRow(caller, "team_members", data); break;
      case "adminListSubmissions": await requireAdmin(); result = await adminList(caller, "form_submissions", "created_at", undefined, false); break;
      case "adminMarkSubmission": {
        await requireAdmin(); const payload = z.object({ id: idSchema, is_read: z.boolean() }).parse(data);
        throwIfError((await caller.from("form_submissions").update({ is_read: payload.is_read }).eq("id", payload.id)).error); result = { ok: true }; break;
      }
      case "adminDeleteSubmission": await requireAdmin(); result = await deleteRow(caller, "form_submissions", data); break;
      case "adminListMedia": await requireAny(["communication_director"]); result = await adminList(caller, "media_assets", "created_at", undefined, false); break;
      case "adminRegisterMedia": {
        await requireAny(["communication_director"]); const payload = z.object({ storage_path: z.string().min(1).max(500), public_url: z.string().min(1).max(2000), filename: z.string().min(1).max(300), content_type: z.string().max(100).nullable().optional(), size_bytes: z.number().int().nullable().optional(), alt_text: z.string().max(500).nullable().optional() }).parse(data);
        throwIfError((await caller.from("media_assets").upsert({ ...payload, uploaded_by: user!.id })).error); result = { ok: true }; break;
      }
      case "adminDeleteMedia": await requireAny(["communication_director"]); result = await deleteRow(caller, "media_assets", data); break;
      case "adminUpdateSettings": {
        await requireAny(["communication_director"]);
        const payload = z.object({ site_name: z.string().min(1).max(200), short_name: z.string().min(1).max(50), tagline: z.string().min(1).max(500), address: z.string().max(500).nullable().optional(), hours: z.string().max(200).nullable().optional(), email: z.string().email().max(320).nullable().optional().or(z.literal("")), phone_primary: z.string().max(50).nullable().optional(), phone_secondary: z.string().max(50).nullable().optional(), phone_whatsapp: z.string().max(50).nullable().optional(), payment_orange_money: z.string().max(50).nullable().optional(), payment_mtn_momo: z.string().max(50).nullable().optional(), social_facebook: z.string().max(500).nullable().optional(), social_instagram: z.string().max(500).nullable().optional(), social_twitter: z.string().max(500).nullable().optional(), social_youtube: z.string().max(500).nullable().optional(), logo_url: z.string().max(2000).nullable().optional() }).parse(data);
        throwIfError((await caller.from("site_settings").update({ ...payload, email: payload.email || null }).eq("id", 1)).error); result = { ok: true }; break;
      }
      case "adminExportContent": {
        await requireAny(["communication_director"]); const format = z.enum(["json", "csv"]).parse(data.format);
        const { data: rows, error } = await caller.from("content_blocks").select("page,block_key,label,kind,value,sort_order").order("page").order("sort_order"); throwIfError(error);
        result = format === "json" ? { format, content: JSON.stringify(rows ?? [], null, 2) } : { format, content: csv(rows ?? []) }; break;
      }
      case "adminImportContent": {
        await requireAny(["communication_director"]); const payload = z.object({ format: z.enum(["json", "csv"]), payload: z.string().min(1).max(5_000_000) }).parse(data);
        const parsed = payload.format === "json" ? JSON.parse(payload.payload) : parseCsv(payload.payload);
        const rows = z.array(z.object({ page: z.string().min(1).max(100), block_key: z.string().min(1).max(100), label: z.string().min(1).max(200), kind: z.string().max(50), value: z.string().nullable().optional(), sort_order: z.number().int().optional() })).max(5000).parse(Array.isArray(parsed) ? parsed : parsed?.rows ?? parsed?.data ?? []);
        let count = 0;
        for (const row of rows) { const { data: existing } = await caller.from("content_blocks").select("id").eq("page", row.page).eq("block_key", row.block_key).maybeSingle();
          const mutation = existing?.id ? caller.from("content_blocks").update({ label: row.label, kind: row.kind, value: row.value ?? null, sort_order: row.sort_order ?? 0 }).eq("id", existing.id) : caller.from("content_blocks").insert({ ...row, value: row.value ?? null, sort_order: row.sort_order ?? 0 });
          throwIfError((await mutation).error); count++;
        }
        result = { ok: true, count }; break;
      }
      default: throw new ApiError("Unknown API operation.", 404);
    }
    return json(result);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    if (status === 500) console.error("dmgf-api error", error);
    return json({ error: status === 500 ? "The request could not be completed." : message }, status);
  }
});

function json(value: unknown, status = 200) { return new Response(JSON.stringify(value), { status, headers: corsHeaders }); }
function optionalText(value: unknown, max: number) { return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null; }
function optionalEmail(value: unknown) { const email = optionalText(value, 320); if (email && !z.string().email().safeParse(email).success) throw new ApiError("Invalid email address."); return email; }
async function publicList(client: any, table: string, order: string, ascending = true) { const { data, error } = await client.from(table).select("*").eq("is_active", true).order(order, { ascending }); throwIfError(error); return data ?? []; }
async function adminList(client: any, table: string, first?: string, second?: string, ascending = true) { let q = client.from(table).select("*"); if (first) q = q.order(first, { ascending }); if (second) q = q.order(second, { ascending }); const { data, error } = await q; throwIfError(error); return data ?? []; }
async function deleteRow(client: any, table: string, data: Record<string, unknown>) { const id = idSchema.parse(data.id); const { error } = await client.from(table).delete().eq("id", id); throwIfError(error); return { ok: true }; }
async function assignRoles(userId: string, roles: string[]) { for (const role of roles) throwIfError((await admin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" })).error); }
async function ensureOwner() {
  const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 }); throwIfError(error);
  const existing = list.users.find((item) => (item.email ?? "").toLowerCase() === OWNER_EMAIL);
  let userId = existing?.id;
  if (!userId) {
    const password = env("OWNER_INITIAL_PASSWORD");
    if (!password || password.length < 12) throw new ApiError("Owner bootstrap is not configured. Set OWNER_INITIAL_PASSWORD as a Supabase Edge Function secret.", 503);
    const { data, error: createError } = await admin.auth.admin.createUser({ email: OWNER_EMAIL, password, email_confirm: true, user_metadata: { display_name: "DMGF App Owner" } }); throwIfError(createError); userId = data.user?.id;
  } else if (!existing?.email_confirmed_at) throwIfError((await admin.auth.admin.updateUserById(userId, { email_confirm: true, user_metadata: { display_name: "DMGF App Owner" } })).error);
  if (!userId) throw new ApiError("Unable to provision owner account.", 500);
  await assignRoles(userId, OWNER_ROLES); return { status: "ready", email: OWNER_EMAIL };
}
async function ensureSettings() {
  const { data: existing, error } = await admin.from("site_settings").select("id").eq("id", 1).maybeSingle(); throwIfError(error);
  if (existing) return { status: "exists" };
  const { error: insertError } = await admin.from("site_settings").insert({ id: 1, site_name: "Deesire Moore Grace Foundation", short_name: "DMGF", tagline: "Grace in action — serving communities with love.", address: "Monrovia, Liberia", hours: "Mon–Fri, 9:00–17:00", email: OWNER_EMAIL, phone_primary: null, phone_secondary: null, phone_whatsapp: null, payment_orange_money: null, payment_mtn_momo: null, social_facebook: null, social_instagram: null, social_twitter: null, social_youtube: null, logo_url: null });
  throwIfError(insertError); return { status: "created" };
}
function csv(rows: Record<string, unknown>[]) { const columns = ["page", "block_key", "label", "kind", "value", "sort_order"]; const escape = (value: unknown) => { const text = value == null ? "" : String(value); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }; return [columns.join(","), ...rows.map((row) => columns.map((key) => escape(row[key])).join(","))].join("\n"); }
function parseCsv(text: string) { const lines = text.split(/\r?\n/).filter((line) => line.trim()); if (!lines.length) return []; const split = (line: string) => { const fields: string[] = []; let value = "", quoted = false; for (let i = 0; i < line.length; i++) { const char = line[i]; if (quoted && char === '"' && line[i + 1] === '"') { value += '"'; i++; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { fields.push(value); value = ""; } else value += char; } fields.push(value); return fields; }; const headers = split(lines[0]); return lines.slice(1).map((line) => { const fields = split(line); const get = (key: string) => fields[headers.indexOf(key)] ?? ""; return { page: get("page") || "home", block_key: get("block_key"), label: get("label") || get("block_key"), kind: get("kind") || "text", value: get("value"), sort_order: Number.parseInt(get("sort_order") || "0", 10) || 0 }; }); }

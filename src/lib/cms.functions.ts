// Admin CRUD server functions. All require admin role.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { supabase: any; userId: string }, extra: string[] = []) {
  const { data } = await ctx.supabase.rpc("has_any_role", { _user_id: ctx.userId, _roles: ["admin", ...extra] });
  if (!data) throw new Error("Forbidden: insufficient role");
}

// ============== HERO BANNERS ==============
export const adminListBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { data, error } = await context.supabase
      .from("hero_banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().min(1).max(2000),
  eyebrow: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(2000),
  date_text: z.string().max(200).nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  cta_label: z.string().min(1).max(60),
  cta_to: z.string().min(1).max(500),
  focus_class: z.string().max(100).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminUpsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => bannerSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { error } = await context.supabase.from("hero_banners").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { error } = await context.supabase.from("hero_banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== CONTENT BLOCKS ==============
export const adminListContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { data, error } = await context.supabase
      .from("content_blocks")
      .select("*")
      .order("page")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateContentValue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({ id: z.string().uuid(), value: z.string().max(10000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { error } = await context.supabase
      .from("content_blocks")
      .update({ value: data.value })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const contentBlockSchema = z.object({
  id: z.string().uuid().optional(),
  page: z.string().min(1).max(100),
  block_key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  kind: z.enum(["text", "richtext", "heading", "cta", "image_url"]).default("text"),
  value: z.string().max(10000).nullable().optional(),
  sort_order: z.number().int().default(0),
});

export const adminUpsertContentBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => contentBlockSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { error } = await context.supabase.from("content_blocks").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteContentBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const { error } = await context.supabase.from("content_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== TEAM ==============
export const adminListTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, ["ceo"]);
    const { data, error } = await context.supabase
      .from("team_members")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const teamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  role_title: z.string().min(1).max(200),
  photo_url: z.string().max(2000).nullable().optional(),
  bio: z.string().max(5000).nullable().optional(),
  email: z.string().email().max(320).nullable().optional().or(z.literal("")),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminUpsertTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => teamSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["ceo"]);
    const payload = { ...data, email: data.email || null };
    const { error } = await context.supabase.from("team_members").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["ceo"]);
    const { error } = await context.supabase.from("team_members").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== FORM SUBMISSIONS ==============
export const adminListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminMarkSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid(), is_read: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("form_submissions")
      .update({ is_read: data.is_read })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("form_submissions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== SITE SETTINGS ==============
const settingsSchema = z.object({
  site_name: z.string().min(1).max(200),
  short_name: z.string().min(1).max(50),
  tagline: z.string().min(1).max(500),
  address: z.string().max(500).nullable().optional(),
  hours: z.string().max(200).nullable().optional(),
  email: z.string().email().max(320).nullable().optional().or(z.literal("")),
  phone_primary: z.string().max(50).nullable().optional(),
  phone_secondary: z.string().max(50).nullable().optional(),
  phone_whatsapp: z.string().max(50).nullable().optional(),
  payment_orange_money: z.string().max(50).nullable().optional(),
  payment_mtn_momo: z.string().max(50).nullable().optional(),
  social_facebook: z.string().max(500).nullable().optional(),
  social_instagram: z.string().max(500).nullable().optional(),
  social_twitter: z.string().max(500).nullable().optional(),
  social_youtube: z.string().max(500).nullable().optional(),
  logo_url: z.string().max(2000).nullable().optional(),
});

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, ["communication_director"]);
    const payload = { ...data, email: data.email || null };
    const { error } = await context.supabase
      .from("site_settings")
      .update(payload)
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== SUBMIT CONTACT (public) ==============
const submitSchema = z.object({
  kind: z.enum(["contact", "volunteer", "newsletter"]),
  name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(320).optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().max(300).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
});

export const submitForm = createServerFn({ method: "POST" })
  .validator((d) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = (await import("@/integrations/supabase/server-public")).getSupabasePublicServer();
    const { error } = await sb.from("form_submissions").insert({
      kind: data.kind,
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

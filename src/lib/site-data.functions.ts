import { createServerFn } from "@tanstack/react-start";
import { getSupabasePublicServer } from "@/integrations/supabase/server-public";

export const fetchHeroBanners = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchContentBlocks = createServerFn({ method: "GET" })
  .validator((input: { page: string }) => input)
  .handler(async ({ data }) => {
    const sb = getSupabasePublicServer();
    const { data: rows, error } = await sb
      .from("content_blocks")
      .select("block_key,value,kind")
      .eq("page", data.page);
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {};
    for (const r of rows ?? []) map[r.block_key] = r.value ?? "";
    return map;
  });

export const fetchGalleryItems = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("gallery_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchNews = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("news_posts")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchPrograms = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchTeam = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const fetchSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getSupabasePublicServer();
  const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

-- Remove the legacy permissive policies that silently widen the scoped
-- policies added by 20260625023945 and 20260628225856.
--
-- 20250710000000 created public-read policies with USING (true) and a
-- submission policy with WITH CHECK (true). Postgres ORs permissive policies
-- that apply to the same command, so those older policies defeated the newer
-- intent:
--
--   * "Anyone can submit forms" (WITH CHECK true) made the length- and
--     content-checked policy from 20260625024006 a no-op — any body length
--     and even a fully empty submission were still accepted.
--   * "Anyone can read active banners", "Anyone can read programs",
--     "Anyone can read gallery" and "Anyone can read team" all used
--     USING (true), so rows with is_active = false stayed publicly readable
--     even though the newer policies filter on is_active.
--
-- Each replacement already exists and is equal or wider for every legitimate
-- role, so dropping these lowers no one's access:
--   hero_banners   -> "Anyone can read active hero banners"
--   programs       -> "Anyone can read active programs"
--   gallery_items  -> "Anyone can read active gallery items"
--   team_members   -> "Anyone can read active team members"
--   form_submissions -> "Anyone can submit a form" (checked)
--
-- It also drops the production-only "Staff can manage media", which is fully
-- covered by "Admins can manage media registry" (admin) and
-- "media_assets_staff_all" (the six director roles), and exists in no
-- migration file.
--
-- Idempotent: safe to re-run, and a no-op on a database that never had them.

DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can read active banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Anyone can read programs" ON public.programs;
DROP POLICY IF EXISTS "Anyone can read gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can read team" ON public.team_members;
DROP POLICY IF EXISTS "Staff can manage media" ON public.media_assets;

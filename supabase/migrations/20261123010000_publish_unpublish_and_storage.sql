-- Publish / unpublish controls, public read policies and storage for DMGF.
--
-- WHAT THIS DOES
--   1. Guarantees every publishable content table has the publication flag
--      `is_active` (true = published, false = draft/unpublished).
--   2. Re-creates the public read policies so anon visitors can only ever read
--      *published* rows, for all six collections the admin/staff editors manage:
--      hero_banners, programs, gallery_items, events, news_posts, team_members.
--      These are the policies the public pages depend on; the previous
--      definitions were in some cases `USING (true)` (every row, published or
--      not) or missing entirely.
--   3. Adds the (is_active, sort_order) index used by every public list query.
--   4. Ensures the public `site-media` storage bucket and its object policies
--      exist (public read, authenticated upload/update/delete), which the
--      image editors in the admin and staff panels need.
--
-- The app writes publication state through the `adminSetPublished` edge action
-- (is_active = published), and the public pages filter on is_active = true.
-- No table or column is dropped, and no data is modified: safe to re-run.
--
-- HOW TO DEPLOY (no credentials are available to the agent; run this yourself)
--   supabase link --project-ref npsxzfyuqfynaobilqdp
--   supabase db push                      # applies every pending migration
--   supabase functions deploy dmgf-api --project-ref npsxzfyuqfynaobilqdp
--   -- or paste this file into Supabase Dashboard → SQL Editor → Run
--
-- VERIFY AFTER APPLYING
--   -- must return 0 rows: no anon/public policy may call has_role helpers
--   SELECT schemaname, tablename, policyname
--     FROM pg_policies
--    WHERE 'anon' = ANY(roles) AND (qual LIKE '%has_any_role%' OR qual LIKE '%has_role%');
--
--   -- each of the six tables should report column is_active
--   SELECT table_name, column_name, column_default, is_nullable
--     FROM information_schema.columns
--    WHERE table_schema = 'public' AND column_name = 'is_active'
--      AND table_name IN ('hero_banners','programs','gallery_items','events','news_posts','team_members');
--
--   -- published rows only, as anon
--   curl 'https://npsxzfyuqfynaobilqdp.supabase.co/rest/v1/team_members?select=name,is_active' \
--        -H 'apikey: <publishable key>'

-- ============================================================
-- 1. Publication flag on every content table
-- ============================================================
ALTER TABLE public.hero_banners  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.programs      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.events        ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.news_posts    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.team_members  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ============================================================
-- 2. Public read policies: published rows only
--    Scoped `TO anon, authenticated` so a policy expression can never be
--    evaluated for a role that lacks EXECUTE on the has_role helpers.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read active hero banners" ON public.hero_banners;
CREATE POLICY "Anyone can read active hero banners" ON public.hero_banners
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active programs" ON public.programs;
CREATE POLICY "Anyone can read active programs" ON public.programs
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active gallery items" ON public.gallery_items;
CREATE POLICY "Anyone can read active gallery items" ON public.gallery_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active events" ON public.events;
CREATE POLICY "Anyone can read active events" ON public.events
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active news" ON public.news_posts;
CREATE POLICY "Anyone can read active news" ON public.news_posts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active team members" ON public.team_members;
CREATE POLICY "Anyone can read active team members" ON public.team_members
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Any legacy permissive policy still sitting on these tables would be OR-ed
-- with the policies above and leak drafts again.
DROP POLICY IF EXISTS "Anyone can read banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Anyone can read programs" ON public.programs;
DROP POLICY IF EXISTS "Anyone can read gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
DROP POLICY IF EXISTS "Anyone can read news" ON public.news_posts;
DROP POLICY IF EXISTS "Anyone can read team" ON public.team_members;

-- ============================================================
-- 3. Indexes backing the public list queries
-- ============================================================
CREATE INDEX IF NOT EXISTS hero_banners_publish_idx  ON public.hero_banners  (is_active, sort_order);
CREATE INDEX IF NOT EXISTS programs_publish_idx      ON public.programs      (is_active, sort_order);
CREATE INDEX IF NOT EXISTS gallery_items_publish_idx ON public.gallery_items (is_active, sort_order);
CREATE INDEX IF NOT EXISTS events_publish_idx        ON public.events        (is_active, sort_order);
CREATE INDEX IF NOT EXISTS news_posts_publish_idx    ON public.news_posts    (is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS team_members_publish_idx  ON public.team_members  (is_active, sort_order);

-- ============================================================
-- 4. Storage: public site-media bucket + object policies
--    Used by ImageUpload for banners, team headshots, program/gallery/event
--    images, the logo and the auth background.
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read site-media" ON storage.objects;
CREATE POLICY "Public can read site-media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Authenticated can upload to site-media" ON storage.objects;
CREATE POLICY "Authenticated can upload to site-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can update own site-media" ON storage.objects;
CREATE POLICY "Authenticated can update own site-media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can delete own site-media" ON storage.objects;
CREATE POLICY "Authenticated can delete own site-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

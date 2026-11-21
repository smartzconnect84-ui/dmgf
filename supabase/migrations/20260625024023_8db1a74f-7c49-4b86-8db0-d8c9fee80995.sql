-- Storage access policies for the public `site-media` bucket, used by the
-- admin/staff image uploader (src/components/admin/ImageUpload.tsx).
--
-- This file previously broke a fresh migration run in two ways:
--
--   1. It created a second "Public can read site-media" policy without
--      dropping the one from 20250710000000, so `CREATE POLICY` aborted with
--      "policy already exists" and nothing after it ever ran.
--   2. It gated uploads on has_role(auth.uid(), 'admin') — that overload does
--      not exist (the function is has_role(_role app_role, _user_id uuid)) and
--      admin-only uploads would also block the non-admin staff roles that use
--      the same uploader (program_director, communication_director, ceo).
--
-- It is replaced with the idempotent canonical set that matches the live
-- project exactly, so a fresh environment ends up with identical policies and
-- re-runs are safe.

DROP POLICY IF EXISTS "Public can read site-media" ON storage.objects;
CREATE POLICY "Public can read site-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Authenticated can upload to site-media" ON storage.objects;
CREATE POLICY "Authenticated can upload to site-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can update own site-media" ON storage.objects;
CREATE POLICY "Authenticated can update own site-media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can delete own site-media" ON storage.objects;
CREATE POLICY "Authenticated can delete own site-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

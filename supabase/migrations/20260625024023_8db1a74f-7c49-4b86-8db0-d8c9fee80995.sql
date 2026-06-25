
-- Anyone can read files in site-media (the bucket is public; this allows the storage API)
CREATE POLICY "Public can read site-media"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');

CREATE POLICY "Admins can upload to site-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site-media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete from site-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

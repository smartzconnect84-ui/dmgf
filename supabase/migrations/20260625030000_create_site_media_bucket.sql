-- Ensure the public site-media bucket exists for admin/staff image uploads.
-- Matches the live project: public bucket, 8 MB limit, image MIME types only.
-- Re-runnable: an existing bucket is updated in place rather than skipped, so
-- a bucket created without limits (or with the wrong allowlist) is repaired.
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

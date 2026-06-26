-- Ensure the public site-media bucket exists for admin image uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

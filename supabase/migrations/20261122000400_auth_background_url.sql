ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS auth_background_url text;

-- Ensure the single settings row exists (idempotent).
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

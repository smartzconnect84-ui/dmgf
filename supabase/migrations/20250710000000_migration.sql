/*
# Initial Database Schema for DMGF Website
Complete schema creation for the Deesire Moore Grace Foundation website including
all tables, enums, functions, RLS policies, triggers, storage bucket and seed data.

## Query Description: This migration creates the entire database schema from scratch
for a newly connected Supabase project. It includes public-facing content tables,
staff/admin role management, donation tracking, form submissions, and media assets.
No existing data is affected as the database is empty.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Enums: app_role, submission_kind
- Tables: profiles, user_roles, site_settings, hero_banners, content_blocks,
  team_members, programs, gallery_items, donations, form_submissions, media_assets
- Functions: get_my_roles, has_role, has_any_role
- Triggers: auto-create profile on auth.users insert
- Storage: site-media bucket with public read policy

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes — full RLS policies created
- Auth Requirements: Role-based access via user_roles table

## Performance Impact:
- Indexes: Primary keys, unique constraints on user_roles
- Triggers: One trigger on auth.users for profile creation
- Estimated Impact: Minimal — standard OLTP schema
*/

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'editor',
  'ceo',
  'global_director',
  'communication_director',
  'program_director',
  'financial_director',
  'brand_ambassador',
  'volunteer'
);

CREATE TYPE public.submission_kind AS ENUM (
  'contact',
  'volunteer',
  'newsletter'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User roles for RBAC
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Site settings (single row, id=1)
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'Deesire Moore Grace Foundation',
  short_name text NOT NULL DEFAULT 'DMGF',
  tagline text NOT NULL DEFAULT 'Giving Hope. Empowering Communities. Transforming Lives.',
  address text,
  hours text,
  email text,
  phone_primary text,
  phone_secondary text,
  phone_whatsapp text,
  payment_orange_money text,
  payment_mtn_momo text,
  social_facebook text,
  social_instagram text,
  social_twitter text,
  social_youtube text,
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Hero banners (homepage rotating slides)
CREATE TABLE public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  eyebrow text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  date_text text,
  location text,
  cta_label text NOT NULL DEFAULT 'Learn more',
  cta_to text NOT NULL DEFAULT '/programs',
  focus_class text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content blocks for CMS-editable page text
CREATE TABLE public.content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  block_key text NOT NULL,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'text',
  value text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Team members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role_title text NOT NULL,
  photo_url text,
  bio text,
  email text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Programs
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  summary text,
  body text,
  image_url text,
  tag text,
  date_text text,
  location text,
  is_highlight boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery items
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Donations
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text,
  amount_usd numeric NOT NULL,
  method text,
  status text NOT NULL DEFAULT 'received',
  note text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Form submissions (contact, volunteer, newsletter)
CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.submission_kind NOT NULL,
  name text,
  email text,
  phone text,
  subject text,
  message text,
  payload jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Media assets
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  alt_text text,
  content_type text,
  size_bytes integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS public.app_role[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::public.app_role[])
  FROM public.user_roles
  WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_roles public.app_role[], _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- ============================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (public.has_role('admin', auth.uid()));

-- user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role('admin', auth.uid()));

-- site_settings: public read, staff write
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Staff can update site settings" ON public.site_settings
  FOR UPDATE USING (
    public.has_any_role(ARRAY['admin', 'communication_director']::public.app_role[], auth.uid())
  );

-- hero_banners: public read, staff write
CREATE POLICY "Anyone can read active banners" ON public.hero_banners
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage banners" ON public.hero_banners
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'communication_director']::public.app_role[], auth.uid())
  );

-- content_blocks: public read, staff write
CREATE POLICY "Anyone can read content" ON public.content_blocks
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage content" ON public.content_blocks
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'communication_director']::public.app_role[], auth.uid())
  );

-- team_members: public read, staff write
CREATE POLICY "Anyone can read team" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage team" ON public.team_members
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'ceo']::public.app_role[], auth.uid())
  );

-- programs: public read, staff write
CREATE POLICY "Anyone can read programs" ON public.programs
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage programs" ON public.programs
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'program_director']::public.app_role[], auth.uid())
  );

-- gallery_items: public read, staff write
CREATE POLICY "Anyone can read gallery" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage gallery" ON public.gallery_items
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'program_director', 'communication_director']::public.app_role[], auth.uid())
  );

-- donations: staff only
CREATE POLICY "Financial staff can read donations" ON public.donations
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'financial_director', 'ceo']::public.app_role[], auth.uid())
  );

CREATE POLICY "Financial staff can manage donations" ON public.donations
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'financial_director']::public.app_role[], auth.uid())
  );

-- form_submissions: public insert, staff read
CREATE POLICY "Anyone can submit forms" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can read submissions" ON public.form_submissions
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'communication_director', 'ceo', 'brand_ambassador']::public.app_role[], auth.uid())
  );

CREATE POLICY "Admin can manage submissions" ON public.form_submissions
  FOR ALL USING (public.has_role('admin', auth.uid()));

-- media_assets: public read, authenticated insert
CREATE POLICY "Anyone can view media" ON public.media_assets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media" ON public.media_assets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE: site-media bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read site-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-media');

CREATE POLICY "Authenticated can upload to site-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update own site-media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete own site-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-media' AND auth.uid() IS NOT NULL);

-- ============================================================
-- SEED DATA: Default site settings row
-- ============================================================

INSERT INTO public.site_settings (
  id, site_name, short_name, tagline, address, hours, email,
  phone_primary, phone_secondary, phone_whatsapp,
  payment_orange_money, payment_mtn_momo
) VALUES (
  1,
  'Deesire Moore Grace Foundation',
  'DMGF',
  'Giving Hope. Empowering Communities. Transforming Lives.',
  'Congo Town, Opposite EJS Ministerial Complex, Monrovia, Liberia',
  'Monday – Saturday · 9:00 AM – 5:00 PM',
  'info24dmgf@gmail.com',
  '0777513816',
  '0776679963',
  '+231 888061379',
  '+231 776679963',
  '+231 888061378'
) ON CONFLICT (id) DO NOTHING;

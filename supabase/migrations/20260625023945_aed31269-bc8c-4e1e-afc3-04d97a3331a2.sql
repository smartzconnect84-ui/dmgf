-- =========================================================================
-- 1. ROLES (privilege-escalation safe: roles live in their own table)
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================================================
-- 2. updated_at trigger helper
-- =========================================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- 3. PROFILES (display name for admin panel header)
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 4. SITE SETTINGS (singleton row)
-- =========================================================================
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Deesire Moore Grace Foundation',
  short_name TEXT NOT NULL DEFAULT 'DMGF',
  tagline TEXT NOT NULL DEFAULT 'Giving Hope. Empowering Communities. Transforming Lives.',
  address TEXT,
  hours TEXT,
  email TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  phone_whatsapp TEXT,
  payment_orange_money TEXT,
  payment_mtn_momo TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (id, address, hours, email, phone_primary, phone_secondary, phone_whatsapp, payment_orange_money, payment_mtn_momo)
VALUES (1,
  'Congo Town, Opposite EJS Ministerial Complex, Monrovia, Liberia',
  'Monday – Saturday · 9:00 AM – 5:00 PM',
  'info24dmgf@gmail.com',
  '0777513816',
  '0776679963',
  '+231 888061379',
  '+231 776679963',
  '+231 888061378'
);

-- =========================================================================
-- 5. CONTENT BLOCKS (editable text per page)
-- =========================================================================
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  block_key TEXT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'richtext', 'heading', 'cta', 'image_url')),
  value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, block_key)
);

GRANT SELECT ON public.content_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_blocks TO authenticated;
GRANT ALL ON public.content_blocks TO service_role;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content blocks"
  ON public.content_blocks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage content blocks"
  ON public.content_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed key page blocks
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order) VALUES
  ('home', 'promise_text', 'Promise strip text', 'richtext', 'Every child deserves a future. Every woman deserves an opportunity. Every youth deserves hope. Together, we transform lives.', 10),
  ('home', 'impact_eyebrow', 'Impact section eyebrow', 'text', 'Measured Impact', 20),
  ('home', 'impact_heading', 'Impact section heading', 'heading', 'A foundation built on results.', 21),
  ('home', 'programs_eyebrow', 'Programs section eyebrow', 'text', 'What We Do', 30),
  ('home', 'programs_heading', 'Programs section heading', 'heading', 'Programs that restore dignity and unlock potential.', 31),
  ('home', 'stories_eyebrow', 'Stories section eyebrow', 'text', 'Success Stories', 40),
  ('home', 'stories_heading', 'Stories section heading', 'heading', 'Transformation, in their own words.', 41),
  ('home', 'cta_eyebrow', 'Donate CTA eyebrow', 'text', 'Your Gift, Their Future', 50),
  ('home', 'cta_heading', 'Donate CTA heading', 'heading', 'Be the reason someone hopes again.', 51),
  ('home', 'cta_body', 'Donate CTA body', 'text', '100% of donations go directly to programs. Every dollar feeds, teaches, heals and lifts another life in Liberia.', 52),
  ('about', 'hero_heading', 'About hero heading', 'heading', 'Born from love. Built for impact.', 10),
  ('about', 'mission', 'Mission statement', 'richtext', 'To empower and impact vulnerable and less-fortunate individuals and communities through comprehensive charity, rehabilitation, healthcare, psychosocial support, educational aid, and advocacy.', 20),
  ('ceo_message', 'heading', 'CEO message heading', 'heading', 'A note from our Founder & CEO', 10),
  ('ceo_message', 'body', 'CEO message body', 'richtext', 'We work with integrity, accountability and transparency because trust is sacred. Our books are open, our impact is real, and our heart is anchored in service.', 20),
  ('programs', 'intro_heading', 'Programs intro heading', 'heading', 'Programs in action', 10),
  ('programs', 'intro_body', 'Programs intro body', 'text', 'Field highlights from our community work across Liberia.', 20),
  ('contact', 'intro', 'Contact intro', 'text', 'We would love to hear from you. Reach out for partnerships, volunteering, or general inquiries.', 10),
  ('donate', 'intro_heading', 'Donate intro', 'heading', 'Your donation transforms lives.', 10),
  ('donate', 'intro_body', 'Donate intro body', 'text', '100% of donations go directly to programs.', 20),
  ('volunteer', 'intro_heading', 'Volunteer intro heading', 'heading', 'Volunteer with DMGF', 10),
  ('volunteer', 'intro_body', 'Volunteer intro body', 'text', 'Lend your time and talent to communities across Liberia.', 20);

-- =========================================================================
-- 6. HERO BANNERS
-- =========================================================================
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date_text TEXT,
  location TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Learn more',
  cta_to TEXT NOT NULL DEFAULT '/programs',
  focus_class TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT ALL ON public.hero_banners TO service_role;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active hero banners"
  ON public.hero_banners FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can view all hero banners"
  ON public.hero_banners FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hero banners"
  ON public.hero_banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_hero_banners_updated_at
  BEFORE UPDATE ON public.hero_banners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.hero_banners (image_url, eyebrow, title, body, date_text, location, cta_label, cta_to, focus_class, sort_order) VALUES
  ('/__l5e/assets-v1/heroes/mtn-hero-change.jpg', 'MTN Hero of Change 2026', 'Recognized on a national stage', 'Global Director Mr. Shedrick K. Nungehn and Brand Ambassador Ms. Sannah K. Ballah represent DMGF at the MTN Hero of Change 2026 — a proud moment for the foundation''s growing impact.', '2026', 'MTN Hero of Change · Liberia', 'Meet the team', '/team', 'object-[50%_30%]', 1),
  ('/__l5e/assets-v1/heroes/ceo-dinner.jpg', 'CEO''s Birthday Dinner & Honoring', 'Honoring service, fueling the mission', 'A gold-and-black evening uniting volunteers, partners and special guests — honoring our staff, presenting acceptance letters, fundraising and networking for the year ahead.', 'March 22, 2025', '360 Bar & Restaurant · Rehab Junction, Paynesville', 'View programs', '/programs', NULL, 2),
  ('/__l5e/assets-v1/heroes/back-to-school-kids.jpg', 'Back to School · Supplies Drive', 'Every child ready to learn', 'Backpacks and essential school supplies handed directly to children in the ELWA community — a joyful start to the academic year with live music, dance, drama and food.', 'September 19, 2025', 'ELWA Community, Paynesville City, Monrovia', 'Sponsor a child', '/donate', NULL, 3),
  ('/__l5e/assets-v1/heroes/care-week-prison.jpg', '3rd Annual Care Week', 'Care that reaches behind every wall', 'DMGF volunteers at Monrovia Central Prison during Care Week — extending dignity, hope and tangible support to those most often forgotten by society.', 'May 11 – 15, 2026', 'Monrovia Central Prison · Greater Liberia', 'Join Care Week', '/volunteer', 'object-[50%_35%]', 4),
  ('/__l5e/assets-v1/heroes/breast-cancer-school.jpg', 'Breast Cancer Campaign 2025', 'Every story is unique. Every journey matters.', 'Taking awareness directly into schools — equipping young women and men with the knowledge to detect early, support survivors and break the silence around breast cancer.', 'October 30 – 31, 2025', 'Montserrado & Grand Bassa Counties', 'Read the campaign', '/programs', NULL, 5),
  ('/__l5e/assets-v1/heroes/pregnancy-prevention.jpg', 'Early-Unwanted Pregnancy Prevention', 'Protecting the futures of our girls', 'A community awareness drive across Duazohn, Boystown, Bens'' Town and Schiefflin Town — empowering young people with information, choice and life-changing support.', 'August 22, 2025 · 11AM – 3PM', 'Margibi County, Liberia', 'Support advocacy', '/donate', NULL, 6);

-- =========================================================================
-- 7. PROGRAMS
-- =========================================================================
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  tag TEXT,
  date_text TEXT,
  location TEXT,
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active programs"
  ON public.programs FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can view all programs"
  ON public.programs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- 8. GALLERY
-- =========================================================================
CREATE TABLE public.gallery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active gallery items"
  ON public.gallery_items FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_gallery_items_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- 9. TEAM
-- =========================================================================
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  email TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active team members"
  ON public.team_members FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can manage team"
  ON public.team_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.team_members (name, role_title, photo_url, sort_order) VALUES
  ('Ms. Deesire Moore', 'Founder & CEO', '/__l5e/assets-v1/ceo-deesire-moore.jpg', 1),
  ('Mr. Shedrick K. Nungehn', 'Global Director', NULL, 2),
  ('Communication Director', 'Communication Director', NULL, 3),
  ('Program Director', 'Program Director', NULL, 4),
  ('Financial Director', 'Financial Director', NULL, 5),
  ('Ms. Sannah K. Ballah', 'Brand Ambassador', NULL, 6);

-- =========================================================================
-- 10. FORM SUBMISSIONS
-- =========================================================================
CREATE TYPE public.submission_kind AS ENUM ('contact', 'volunteer', 'newsletter');

CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind public.submission_kind NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  payload JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.form_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a form"
  ON public.form_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
  ON public.form_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.form_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
  ON public.form_submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX form_submissions_kind_created_idx ON public.form_submissions (kind, created_at DESC);

-- =========================================================================
-- 11. MEDIA ASSETS REGISTRY
-- =========================================================================
CREATE TABLE public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media registry"
  ON public.media_assets FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage media registry"
  ON public.media_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

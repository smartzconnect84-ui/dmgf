-- Scoped staff-role policies, the donations table and the role helpers.
--
-- Rewritten for two reasons.
--
-- 1. Wrong has_any_role signature. This file used to run
--      CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
--    which does not replace the established
--      has_any_role(_roles app_role[], _user_id uuid)
--    because the argument types are in a different order, so Postgres created
--    a SECOND overload instead. PostgREST cannot choose between two functions
--    whose arguments share the same names: every
--    rpc('has_any_role', { _user_id, _roles }) call (assertAdmin in
--    src/lib/cms.functions.ts, which guards all admin CRUD) would fail with
--    PGRST203 / HTTP 300 — while this migration itself reported success.
--    The helper now uses the established order and all eleven policy bodies
--    call it that way. Any stray reversed overload left behind by an earlier
--    run of this file is dropped.
--
-- 2. Not re-runnable. Every CREATE POLICY is now preceded by DROP POLICY IF
--    EXISTS and the trigger by DROP TRIGGER IF EXISTS, so a second run is
--    stable. The policies are dropped before the helper function is dropped,
--    because a policy created against the reversed overload would block it.

-- ====== Donations table ======
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text,
  amount_usd numeric(12,2) NOT NULL,
  method text,
  status text NOT NULL DEFAULT 'received',
  note text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- ====== Drop this file's policies first (see note 2 above) ======
DROP POLICY IF EXISTS "donations_finance_select" ON public.donations;
DROP POLICY IF EXISTS "donations_finance_write" ON public.donations;
DROP POLICY IF EXISTS "hero_banners_comm_write" ON public.hero_banners;
DROP POLICY IF EXISTS "content_blocks_comm_write" ON public.content_blocks;
DROP POLICY IF EXISTS "site_settings_comm_write" ON public.site_settings;
DROP POLICY IF EXISTS "team_members_ceo_write" ON public.team_members;
DROP POLICY IF EXISTS "programs_pm_write" ON public.programs;
DROP POLICY IF EXISTS "gallery_pm_write" ON public.gallery_items;
DROP POLICY IF EXISTS "form_submissions_staff_read" ON public.form_submissions;
DROP POLICY IF EXISTS "form_submissions_comm_write" ON public.form_submissions;
DROP POLICY IF EXISTS "media_assets_staff_all" ON public.media_assets;

-- ====== Role helpers ======
-- Remove the reversed overload this file used to create, if it is still there.
DROP FUNCTION IF EXISTS public.has_any_role(uuid, public.app_role[]);

CREATE OR REPLACE FUNCTION public.has_any_role(_roles public.app_role[], _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;
REVOKE EXECUTE ON FUNCTION public.has_any_role(public.app_role[], uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(public.app_role[], uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS public.app_role[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::public.app_role[]) FROM public.user_roles WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated, service_role;

-- ====== Donations policies ======
CREATE POLICY "donations_finance_select" ON public.donations FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin','financial_director','ceo']::public.app_role[], auth.uid()));

CREATE POLICY "donations_finance_write" ON public.donations FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin','financial_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['admin','financial_director']::public.app_role[], auth.uid()));

DROP TRIGGER IF EXISTS donations_touch_updated_at ON public.donations;
CREATE TRIGGER donations_touch_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ====== Extend RLS on existing CMS tables: allow scoped roles in addition ======
-- to admin (the existing admin policies remain; these add staff-role policies).

CREATE POLICY "hero_banners_comm_write" ON public.hero_banners FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()));

CREATE POLICY "content_blocks_comm_write" ON public.content_blocks FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()));

CREATE POLICY "site_settings_comm_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()));

CREATE POLICY "team_members_ceo_write" ON public.team_members FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['ceo']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['ceo']::public.app_role[], auth.uid()));

CREATE POLICY "programs_pm_write" ON public.programs FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['program_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['program_director']::public.app_role[], auth.uid()));

CREATE POLICY "gallery_pm_write" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['program_director','communication_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['program_director','communication_director']::public.app_role[], auth.uid()));

CREATE POLICY "form_submissions_staff_read" ON public.form_submissions FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['communication_director','ceo','brand_ambassador']::public.app_role[], auth.uid()));

CREATE POLICY "form_submissions_comm_write" ON public.form_submissions FOR UPDATE TO authenticated
  USING (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['communication_director']::public.app_role[], auth.uid()));

CREATE POLICY "media_assets_staff_all" ON public.media_assets FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['ceo','global_director','communication_director','program_director','financial_director','brand_ambassador']::public.app_role[], auth.uid()))
  WITH CHECK (public.has_any_role(ARRAY['ceo','global_director','communication_director','program_director','financial_director','brand_ambassador']::public.app_role[], auth.uid()));

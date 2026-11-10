-- has_any_role helper
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS app_role[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::app_role[]) FROM public.user_roles WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated, service_role;

-- Donations table
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

CREATE POLICY "donations_finance_select" ON public.donations FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','financial_director','ceo']::app_role[]));
CREATE POLICY "donations_finance_write" ON public.donations FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','financial_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','financial_director']::app_role[]));

CREATE TRIGGER donations_touch_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Extend RLS on existing CMS tables: allow scoped roles in addition to admin
-- (Existing admin policies remain; these add staff-role policies.)

CREATE POLICY "hero_banners_comm_write" ON public.hero_banners FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]));

CREATE POLICY "content_blocks_comm_write" ON public.content_blocks FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]));

CREATE POLICY "site_settings_comm_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]));

CREATE POLICY "team_members_ceo_write" ON public.team_members FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['ceo']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['ceo']::app_role[]));

CREATE POLICY "programs_pm_write" ON public.programs FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['program_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['program_director']::app_role[]));

CREATE POLICY "gallery_pm_write" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['program_director','communication_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['program_director','communication_director']::app_role[]));

CREATE POLICY "form_submissions_staff_read" ON public.form_submissions FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['communication_director','ceo','brand_ambassador']::app_role[]));
CREATE POLICY "form_submissions_comm_write" ON public.form_submissions FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['communication_director']::app_role[]));

CREATE POLICY "media_assets_staff_all" ON public.media_assets FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['ceo','global_director','communication_director','program_director','financial_director','brand_ambassador']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['ceo','global_director','communication_director','program_director','financial_director','brand_ambassador']::app_role[]));

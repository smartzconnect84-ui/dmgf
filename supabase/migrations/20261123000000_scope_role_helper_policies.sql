-- Public reads were failing with 42501 "permission denied for function
-- has_any_role" / "has_role" on team_members, programs, gallery_items,
-- hero_banners and profiles.
--
-- Cause: 20250710000000 created every policy without a TO clause, so those
-- policies apply to PUBLIC (including anon). They call public.has_role() and
-- public.has_any_role() in USING/WITH CHECK, but 20260628225856 revoked EXECUTE
-- on both helpers from PUBLIC and anon and granted it only to authenticated and
-- service_role. Postgres cannot short-circuit around the failing policy, so the
-- whole statement aborts before the public "Anyone can read active ..." policy
-- is considered. The same 42501 surfaced through the dmgf-api edge function
-- (fetchTeam, fetchPrograms, fetchGalleryItems, fetchHeroBanners all returned
-- `permission denied for function has_any_role`), so every public page silently
-- fell back to its hard-coded content and staff edits never appeared on the
-- site.
--
-- Fix: scope those policies to authenticated, which is the only role that can
-- legitimately manage those rows. Anonymous visitors are then evaluated only
-- against the public read policies, which do not call the helpers.
--
-- This is done generically over pg_policies (rather than a fixed list) so that
-- policies created outside the migration history are covered too. Idempotent:
-- after the first run no anon/PUBLIC policy references a helper, so a re-run is
-- a no-op.

DO $do$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND roles && ARRAY['public', 'anon']::name[]
      AND (
        coalesce(qual, '') ~ 'has_(any_)?role'
        OR coalesce(with_check, '') ~ 'has_(any_)?role'
      )
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  END LOOP;
END
$do$;

-- Public read policies relied on by the site. Recreated defensively so an
-- environment that had them dropped still serves anonymous reads.
DROP POLICY IF EXISTS "Anyone can read active team members" ON public.team_members;
CREATE POLICY "Anyone can read active team members" ON public.team_members
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active programs" ON public.programs;
CREATE POLICY "Anyone can read active programs" ON public.programs
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active gallery items" ON public.gallery_items;
CREATE POLICY "Anyone can read active gallery items" ON public.gallery_items
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active hero banners" ON public.hero_banners;
CREATE POLICY "Anyone can read active hero banners" ON public.hero_banners
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Staff profiles are upserted by updateMyStaffProfile. RLS only had SELECT and
-- UPDATE policies, so the upsert failed for any account without an existing
-- profile row ("new row violates row-level security policy").
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

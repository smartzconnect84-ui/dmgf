-- Provide a staff-messaging recipient list that works for non-admin staff.
--
-- listStaffRecipients in src/lib/staff.functions.ts previously read the
-- profiles table with the caller's client. RLS only exposes a profile to its
-- owner or to an admin, so every non-admin staff member got an empty list and
-- could not message anyone. This function runs as its owner (bypassing RLS) but
-- gates the result on STAFF_MESSAGING_ROLES, returning only the three columns
-- the UI needs.
--
-- Also backfills a profile row for the owner account, which predates the
-- on_auth_user_created trigger and therefore had none, so the owner shows up in
-- the recipient list.
--
-- Idempotent.

CREATE OR REPLACE FUNCTION public.get_messaging_recipients()
RETURNS TABLE (id uuid, display_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE public.has_any_role(
    ARRAY[
      'admin', 'editor', 'ceo', 'global_director',
      'communication_director', 'program_director',
      'financial_director', 'brand_ambassador'
    ]::public.app_role[],
    auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.get_messaging_recipients() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_messaging_recipients() TO authenticated;

INSERT INTO public.profiles (id, display_name)
VALUES ('7c4b846d-7716-4810-bf66-3f6851d7b03a', 'info24dmgf')
ON CONFLICT (id) DO NOTHING;

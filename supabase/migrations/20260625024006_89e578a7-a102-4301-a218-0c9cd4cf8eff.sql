-- Lock down trigger-only helpers
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- has_role must remain callable from RLS policies for authenticated users.
--
-- Retargeted to the established signature has_role(_role app_role,
-- _user_id uuid) created by 20250710000000. The previous
-- has_role(uuid, app_role) form never existed in the live project, so these
-- two statements aborted the migration with 42883 "function
-- public.has_role(uuid, app_role) does not exist".
REVOKE EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) TO authenticated;

-- Tighten public form-submission insert: must have at least one identifying field, message bounded
DROP POLICY IF EXISTS "Anyone can submit a form" ON public.form_submissions;
CREATE POLICY "Anyone can submit a form"
  ON public.form_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    coalesce(length(message), 0) <= 5000
    AND coalesce(length(name), 0) <= 200
    AND coalesce(length(email), 0) <= 320
    AND (
      coalesce(email, '') <> ''
      OR coalesce(phone, '') <> ''
      OR coalesce(message, '') <> ''
    )
  );

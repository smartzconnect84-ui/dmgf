-- Lock down trigger-only helpers
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- has_role must remain callable from RLS policies for authenticated users
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

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

-- Gate staff direct messages on staff role at the database level.
--
-- 20261121000000 created this table with policies that only checked
-- `sender_id = auth.uid()` / `recipient_id = auth.uid()`, which every
-- authenticated user satisfies. The application already restricts messaging to
-- STAFF_MESSAGING_ROLES (every staff role except `volunteer`) in
-- src/lib/staff.functions.ts, but RLS did not, so a volunteer — who reaches the
-- portal through ALL_STAFF_ROLES — could still insert and read their own
-- message rows straight through PostgREST.
--
-- These policies mirror STAFF_MESSAGING_ROLES exactly: all eight staff roles
-- except `volunteer`. Keep the array in sync with that constant.
--
-- Idempotent.

DROP POLICY IF EXISTS "Users can read own messages" ON public.staff_messages;
CREATE POLICY "Users can read own messages" ON public.staff_messages
  FOR SELECT TO authenticated
  USING (
    (sender_id = auth.uid() OR recipient_id = auth.uid())
    AND public.has_any_role(
      ARRAY[
        'admin', 'editor', 'ceo', 'global_director',
        'communication_director', 'program_director',
        'financial_director', 'brand_ambassador'
      ]::public.app_role[],
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.staff_messages;
CREATE POLICY "Users can send messages" ON public.staff_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.has_any_role(
      ARRAY[
        'admin', 'editor', 'ceo', 'global_director',
        'communication_director', 'program_director',
        'financial_director', 'brand_ambassador'
      ]::public.app_role[],
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Recipients can mark read" ON public.staff_messages;
CREATE POLICY "Recipients can mark read" ON public.staff_messages
  FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid()
    AND public.has_any_role(
      ARRAY[
        'admin', 'editor', 'ceo', 'global_director',
        'communication_director', 'program_director',
        'financial_director', 'brand_ambassador'
      ]::public.app_role[],
      auth.uid()
    )
  )
  WITH CHECK (
    recipient_id = auth.uid()
    AND public.has_any_role(
      ARRAY[
        'admin', 'editor', 'ceo', 'global_director',
        'communication_director', 'program_director',
        'financial_director', 'brand_ambassador'
      ]::public.app_role[],
      auth.uid()
    )
  );

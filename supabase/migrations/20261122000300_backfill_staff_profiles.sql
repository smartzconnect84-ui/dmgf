-- Backfill profile rows for staff accounts that predate the on_auth_user_created
-- trigger (or were created without one). handle_new_user only fires on INSERT into
-- auth.users, so any account that existed before the trigger — or that was added
-- out of band — has no profile row and is invisible to get_messaging_recipients().
--
-- display_name follows the same rule as handle_new_user: the local part of the
-- email address. Only accounts that hold at least one app_role are considered
-- staff. Idempotent: existing profile rows are left untouched.

INSERT INTO public.profiles (id, display_name)
SELECT u.id, split_part(u.email, '@', 1)
FROM auth.users u
WHERE u.email IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

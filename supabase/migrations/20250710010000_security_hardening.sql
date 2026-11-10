/*
# Security Hardening — Fix Function Search Paths

Addresses WARN-level security advisories by pinning `search_path`
on all public functions, preventing potential search-path hijacking.

## Query Description:
This is a non-destructive security improvement. It pins the
search_path on four database functions so they always resolve
schema references explicitly. No data is changed.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Functions affected: get_my_roles, has_role, has_any_role, handle_new_user

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible
*/

-- Pin search_path on all public functions to prevent search-path hijacking
ALTER FUNCTION public.get_my_roles() SET search_path = public;
ALTER FUNCTION public.has_role(public.app_role, uuid) SET search_path = public;
ALTER FUNCTION public.has_any_role(public.app_role[], uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;


-- 1) Extend app_role enum with team roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ceo';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'global_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'communication_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'program_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financial_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'brand_ambassador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'volunteer';

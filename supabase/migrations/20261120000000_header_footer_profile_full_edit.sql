-- Header/footer content blocks for CMS editing
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'header','header_brand_name','Header brand name','text','Deesire Moore Grace Foundation',1
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='header' AND block_key='header_brand_name');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'header','header_brand_sub','Header brand subtitle','text','Foundation · Liberia',2
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='header' AND block_key='header_brand_sub');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'header','header_cta_volunteer','Header volunteer CTA','text','Volunteer',3
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='header' AND block_key='header_cta_volunteer');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'header','header_cta_donate','Header donate CTA','text','Donate',4
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='header' AND block_key='header_cta_donate');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'header','header_staff_login','Header staff login label','text','Staff Login',5
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='header' AND block_key='header_staff_login');

INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_blurb','Footer blurb','richtext','A legally registered, self-supported nonprofit empowering women, youth and children across Liberia and beyond.',1
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_blurb');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_explore_heading','Footer explore heading','text','Explore',2
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_explore_heading');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_involved_heading','Footer involved heading','text','Get Involved',3
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_involved_heading');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_contact_heading','Footer contact heading','text','Visit · Contact',4
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_contact_heading');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_copyright','Footer copyright','text','© {year} Deesire Moore Grace Foundation. All rights reserved.',5
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_copyright');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_built','Footer built line','text','Built with hope from Monrovia, Liberia.',6
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_built');
INSERT INTO public.content_blocks (page, block_key, label, kind, value, sort_order)
SELECT 'footer','footer_admin','Footer admin link','text','Admin',7
WHERE NOT EXISTS (SELECT 1 FROM public.content_blocks WHERE page='footer' AND block_key='footer_admin');

-- Full staff profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
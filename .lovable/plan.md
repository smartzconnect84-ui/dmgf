## What you'll get

A clean banners-only hero on the homepage, the Impact page fully removed, and a real Supabase-backed admin panel at `/admin` where you sign in with seeded demo credentials and edit the site live. No fake/local-only admin — every change writes to the database and the public site reads from it.

**Demo admin credentials (seeded via migration):**
- Email: `admin@dmgf.org`
- Password: `DemoAdmin2026!`
- (You can change this after first login; we'll show how.)

---

## Phase 1 — Hero & Impact cleanup (ship first, immediately usable)

1. Replace the homepage hero with the rotating banners component, full-screen (`min-h-[100svh]`), with each of the 6 banners showing only its own eyebrow / title / body / date / location / CTA. The big "Giving Hope. Empowering Communities." tagline moves down into a smaller "Our Promise" strip so it isn't lost.
2. Delete the secondary `<HeroBanners />` block that currently sits below the main hero.
3. Delete `src/routes/impact.tsx` and remove every reference: header nav, footer links, sitemap, internal `<Link to="/impact">`, and routeTree regeneration.
4. Ensure the existing logo asset (`src/assets/dmgf-logo.png.asset.json`) is used in the header, footer, favicon `<link>`, and OG image fallback. No new logo generated.

You can use the site right after Phase 1 — no admin dependency.

## Phase 2 — Backend foundation (Supabase / Lovable Cloud)

Enable Lovable Cloud, then create the schema in a single migration:

- `app_role` enum (`admin`, `editor`) + `user_roles` table + `has_role()` security-definer function (per platform security rules — roles are NEVER on profiles).
- `site_settings` (singleton row): site name, tagline, primary/secondary contact, social links, donation copy. Public read, admin write.
- `content_blocks` (`page`, `key`, `value_json`): every editable text/CTA on every page. Public read, admin write. Seeded with current copy so the site looks identical day-one.
- `hero_banners` (image_path, eyebrow, title, body, date_text, location, cta_label, cta_to, focus_class, sort_order, is_active). Seeded with the 6 current banners.
- `programs`, `gallery_items`, `team_members` (CRUD tables, sort_order, is_active). Seeded with current data.
- `form_submissions` (kind: contact | volunteer | newsletter, payload jsonb, created_at, status). Public insert via RLS, admin read.
- `media_assets` registry for Supabase Storage uploads.
- One Storage bucket `site-media` (public read, admin write) for banner/logo/program/team images.
- Demo admin seeded: create user via migration helper, insert `('admin', <uuid>)` into `user_roles`.

Every public-facing table gets the required `GRANT` block and RLS policies (`SELECT TO anon` for public content, `ALL` gated by `has_role(auth.uid(), 'admin')` for writes).

## Phase 3 — Public site reads from the DB

Refactor home, programs, team, gallery, contact, CEO message, about, donate to fetch from Supabase via TanStack Query loaders (server functions for SSR-safe reads with the publishable key). Static fallbacks remain so SSR never blanks if a fetch fails.

## Phase 4 — Admin panel at `/admin`

Protected under `_authenticated/admin/` (auth gate redirects to `/auth`). Then a role check redirects non-admins to `/`. Sidebar shell with these sections:

- **Dashboard** — counts (programs, banners, submissions this week)
- **Hero banners** — drag-reorder, edit fields, upload/replace image, toggle active
- **Pages & content** — grouped editor for every `content_blocks` key per page (Home, About, CEO Message, Programs intro, Team intro, Contact, Donate, Volunteer)
- **Programs / Gallery / Team** — table + edit drawer, image upload, sort, active toggle
- **Media library** — upload, preview, copy URL, delete
- **Site settings** — site name, tagline default, socials, contact info, donation tiers/copy
- **Form submissions** — inbox view (contact, volunteer, newsletter), mark read, CSV export
- **Account** — change password

Image uploads go to Supabase Storage `site-media` bucket; the URL is written into the relevant table.

## Phase 5 — Auth pages

- `/auth` — email/password sign-in (and password reset link). No public sign-up; admin creates editor accounts from the panel via Supabase Auth Admin API in a `requireSupabaseAuth` + admin-role-gated server function.
- `/reset-password` — required companion page so password reset actually works.

## What's intentionally NOT in v1

- **Live theme/color editor** — brittle, would require shipping CSS variables from the DB on every request and breaks SSR caching. Out of scope; colors stay in `styles.css`.
- **Stripe / live donations** — you chose "static donate page, no processor yet." Admin can still edit donation tier copy. We can wire Stripe in a follow-up turn.
- **Visual page builder / drag-drop layout** — too brittle. Editing is field-based (which is what real CMSs like Sanity/Strapi do too).

---

## Deployment readiness

Already Vite + React + TanStack Start. Works on Vercel, Cloudflare Pages/Workers, or Lovable's hosting. Supabase is the single backend across all of them. After Phase 2 you'll have `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only) wired automatically by Lovable Cloud.

## Technical notes

- Roles in `user_roles` + `has_role()` security-definer (never on profiles — privilege-escalation safe).
- Every new `public.*` table gets explicit `GRANT` to `authenticated` and `service_role`, plus `anon SELECT` only for public-readable tables.
- Public-route loaders use a publishable-key server client (no `requireSupabaseAuth`) so SSR/prerender doesn't 401.
- Admin server functions use `requireSupabaseAuth` + `has_role` check; `supabaseAdmin` imported only inside handlers via `await import(...)`.
- Storage bucket `site-media` created via the storage tool (not SQL); RLS on `storage.objects` restricts writes to admins.
- TanStack Query + `ensureQueryData` / `useSuspenseQuery` for all reads.
- All form inputs validated with Zod, client and server.

## Scope honesty

Phase 1 ships fast. Phases 2–5 are a substantial build — multiple migrations, ~15 admin screens, ~8 public-route refactors. I'll execute them in order and check in between phases so you can review. If at any point you want to stop and ship what's done, say so.

**Ready to start with Phase 1 immediately on approval. Confirm and I'll proceed.**
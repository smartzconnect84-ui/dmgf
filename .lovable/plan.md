## Staff Login & Role-Based Dashboard

Add a **Staff Login** entry to the header and build a role-aware staff portal so every team member (CEO, Global Director, Communication Director, Program Director, Financial Director, Brand Ambassador) signs in to a dashboard scoped to what they can manage. Admin (existing) keeps full control.

### 1. Backend — roles & access

Extend the existing `app_role` enum with team roles:
```
admin, ceo, global_director, communication_director,
program_director, financial_director, brand_ambassador, volunteer
```

Add helper functions (security-definer):
- `has_any_role(_user_id, _roles app_role[])`
- `get_my_roles()` → returns roles for current user

Tighten/extend RLS on existing tables so each role only touches its area:

| Module | Tables | Roles with write |
|---|---|---|
| Hero Banners, Pages & Settings | `hero_banners`, `content_blocks`, `site_settings` | admin, communication_director |
| Team | `team_members` | admin, ceo |
| Programs / Gallery | `programs`, `gallery_items` | admin, program_director |
| Form Inbox (volunteer/contact) | `form_submissions` | admin, communication_director, ceo (read), brand_ambassador (read volunteer-only) |
| Donations (new) | `donations` | admin, financial_director |
| Media library | `media_assets` | all staff (own uploads); admin full |

New table `donations` (amount, donor_name, email, method, status, note) with grants + RLS.

Seed initial staff users via an admin-only server function `inviteStaff` (already exists — extend to allow any role) + a one-time migration seeding email placeholders. Demo credentials are surfaced on the staff login page (see §3).

### 2. Server functions (`src/lib/staff.functions.ts`)
- `getMyStaffProfile` — roles + display name + allowed modules
- `staffListDonations` / `staffUpsertDonation` / `staffDeleteDonation` (financial_director, admin)
- `staffListSubmissions` (role-filtered)
- Reuse existing `cms.functions.ts` for banners/content/team but add role guards inside handlers (admin OR specific role).

A shared `requireAnyRole([...])` middleware factory wraps `requireSupabaseAuth` + role check.

### 3. Frontend

**Header** (`src/components/Header.tsx`)
- Add animated **Staff Login** pill button (gold outline → fill on hover, key-icon) next to Donate on desktop; inside mobile drawer as a primary action. Hidden when already on `/staff` or `/admin`.

**Auth page** (`src/routes/auth.tsx`)
- Already exists. Add a collapsible "Demo staff accounts" panel listing one demo credential per role (e.g. `ceo@dmgf.org / CeoDemo2026!`). A new server fn `ensureDemoStaff` idempotently provisions them on first load.

**Staff portal** (`src/routes/_authenticated/staff.*`)
- `staff.tsx` — layout: sidebar shows only modules permitted by the user's roles, gold/ink theme matching admin.
- `staff.index.tsx` — welcome + role chips + quick stats.
- `staff.banners.tsx`, `staff.content.tsx`, `staff.team.tsx`, `staff.submissions.tsx`, `staff.programs.tsx`, `staff.gallery.tsx`, `staff.donations.tsx`, `staff.settings.tsx` — reuse the existing admin editors as shared components; render based on role.

Admins land on `/admin` (full), staff on `/staff` (scoped). Login redirect picks destination based on roles.

### 4. UX polish & responsiveness
- Convert all primary CTAs (Donate, Staff Login, hero banner buttons, form submits) to a shared `<AnimatedButton>` with: scale-press, gold shimmer sweep on hover, focus ring.
- Audit pages for mobile: ensure no horizontal scroll at 360px, tap targets ≥44px, sidebar drawers on tablet (`lg:` → `md:` breakpoints where appropriate), responsive image `sizes` attrs on hero/gallery.
- Add `prefers-reduced-motion` guards on Ken Burns + shimmer.

### 5. Scan & fix
- `tsgo` typecheck, fix any unused imports / `any` leaks introduced.
- Verify `_authenticated` gate still works for `/staff`.
- Confirm new RLS policies via `supabase--linter`.

### Technical details
- DB migration adds enum values, `donations` table, expanded RLS policies, and updates `has_role` callers — kept in a single migration with required GRANTs.
- Demo credentials are deliberately weak (suffix `Demo2026!`) and surfaced only in the staff login UI; production deployments should rotate via `inviteStaff`.
- No existing admin functionality is removed; admin remains the superset.

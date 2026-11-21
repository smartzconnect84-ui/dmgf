-- Events, news and staff messaging.
--
-- These three tables were created directly in the hosted project and were
-- missing from the migration history, which meant a fresh environment (or a
-- restore from migrations) came up without them: the public /events and /news
-- pages, the staff events/news editors and the staff messaging inbox all
-- queried relations that did not exist. This migration recreates the exact
-- production definitions and is safe to re-run.

-- ====== Events ======
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  date_text text,
  location text,
  tag text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active events" ON public.events;
CREATE POLICY "Anyone can read active events" ON public.events
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Staff can view all events" ON public.events;
CREATE POLICY "Staff can view all events" ON public.events
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'program_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can manage events" ON public.events;
CREATE POLICY "Staff can manage events" ON public.events
  FOR ALL TO authenticated
  USING (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'program_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  )
  WITH CHECK (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'program_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  );

-- Named touch_<table>_updated_at, matching the live project and the rest of
-- this repo. The older events_touch_updated_at form is dropped too, so an
-- environment that already ran a previous version of this file does not end
-- up with two BEFORE UPDATE triggers on the same table.
DROP TRIGGER IF EXISTS events_touch_updated_at ON public.events;
DROP TRIGGER IF EXISTS touch_events_updated_at ON public.events;
CREATE TRIGGER touch_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS events_active_sort_idx ON public.events (is_active, sort_order);

-- ====== News posts ======
CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  body text,
  image_url text,
  category text,
  published_at timestamptz NOT NULL DEFAULT now(),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active news" ON public.news_posts;
CREATE POLICY "Anyone can read active news" ON public.news_posts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Staff can view all news" ON public.news_posts;
CREATE POLICY "Staff can view all news" ON public.news_posts
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can manage news" ON public.news_posts;
CREATE POLICY "Staff can manage news" ON public.news_posts
  FOR ALL TO authenticated
  USING (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  )
  WITH CHECK (
    public.has_any_role(
      ARRAY['admin', 'communication_director', 'ceo']::public.app_role[],
      auth.uid()
    )
  );

DROP TRIGGER IF EXISTS news_posts_touch_updated_at ON public.news_posts;
DROP TRIGGER IF EXISTS touch_news_posts_updated_at ON public.news_posts;
CREATE TRIGGER touch_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS news_posts_active_published_idx
  ON public.news_posts (is_active, published_at DESC);

-- ====== Staff direct messages ======
CREATE TABLE IF NOT EXISTS public.staff_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own messages" ON public.staff_messages;
CREATE POLICY "Users can read own messages" ON public.staff_messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON public.staff_messages;
CREATE POLICY "Users can send messages" ON public.staff_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Recipients can mark read" ON public.staff_messages;
CREATE POLICY "Recipients can mark read" ON public.staff_messages
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

CREATE INDEX IF NOT EXISTS staff_messages_recipient_idx
  ON public.staff_messages (recipient_id, created_at);
CREATE INDEX IF NOT EXISTS staff_messages_sender_idx
  ON public.staff_messages (sender_id, created_at);

-- ====== Realtime ======
-- The live project has events and news_posts in the supabase_realtime
-- publication (production-only migration 20261120221958), which is how the
-- staff editors see live updates. A fresh environment built from migrations
-- did not, so reproduce it — guarded on the publication existing so this
-- stays runnable on a plain Postgres that has no Supabase publication.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.events';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'news_posts'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.news_posts';
    END IF;
  END IF;
END
$do$;

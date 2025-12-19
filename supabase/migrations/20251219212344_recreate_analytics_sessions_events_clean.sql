/*
  # إعادة إنشاء نظام Analytics بشكل نظيف
  
  1. Tables
    - analytics_sessions (جلسات)
    - analytics_events (أحداث)
  
  2. Security
    - Service role only للكتابة
    - Authenticated للقراءة
*/

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- حذف الجداول القديمة إذا موجودة
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣ جدول الجلسات
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  session_id text NOT NULL UNIQUE,
  
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  
  device_type text,
  os text,
  browser text,
  user_agent text,
  
  ip_address text,
  country text,
  city text,
  
  page_views integer DEFAULT 0,
  events_count integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  
  is_active boolean DEFAULT true,
  ended_at timestamptz
);

CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_created_at ON analytics_sessions(created_at DESC);
CREATE INDEX idx_sessions_utm_source ON analytics_sessions(utm_source);
CREATE INDEX idx_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX idx_sessions_is_active ON analytics_sessions(is_active);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣ جدول الأحداث
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  session_id text NOT NULL,
  
  event_type text NOT NULL CHECK (event_type IN (
    'page_view',
    'home_view',
    'farm_view',
    'farm_detail_view',
    'booking_start',
    'booking_submit',
    'booking_complete',
    'whatsapp_click',
    'payment_upload',
    'certificate_view',
    'share_click',
    'filter_used',
    'search_performed',
    'concept_view',
    'owner_login',
    'investor_login'
  )),
  
  event_name text,
  
  page_path text,
  page_title text,
  
  event_data jsonb,
  
  load_time_ms integer
);

CREATE INDEX idx_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_events_page_path ON analytics_events(page_path);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣ RLS Policies
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Sessions
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access sessions"
  ON analytics_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated read sessions"
  ON analytics_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access events"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated read events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣ Functions
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- تحديث page_views تلقائياً عند إضافة page_view event
CREATE OR REPLACE FUNCTION auto_update_session_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE analytics_sessions
  SET 
    events_count = events_count + 1,
    page_views = CASE 
      WHEN NEW.event_type = 'page_view' THEN page_views + 1
      ELSE page_views
    END,
    updated_at = now()
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_update_session_stats
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_session_stats();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣ Comments
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMENT ON TABLE analytics_sessions IS 'User sessions - service role writes, authenticated reads';
COMMENT ON TABLE analytics_events IS 'User events - service role writes, authenticated reads';
COMMENT ON FUNCTION auto_update_session_stats IS 'Auto-increment session counters on event insert';

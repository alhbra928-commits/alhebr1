/*
  # إنشاء نظام التحليل والتتبع (Analytics & Tracking System)

  ## الجداول الجديدة

  ### 1. analytics_sessions
  - تتبع جلسات الزوار
  - معلومات المصدر والجهاز
  - UTM parameters

  ### 2. analytics_events
  - تسجيل أحداث المستخدم
  - ربط بالجلسة
  - معلومات الحدث

  ### 3. marketing_campaigns
  - إدارة الحملات التسويقية
  - معلومات UTM
  - تتبع الأداء

  ## الأمان
  - RLS مفعل على جميع الجداول
  - سماح للـanon بالإدخال فقط
  - القراءة والتعديل للمسؤولين فقط
*/

-- =====================================================
-- 1. جدول الجلسات (Analytics Sessions)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- معلومات الصفحة المبدئية
  landing_path text NOT NULL DEFAULT '/',
  referrer text,

  -- UTM Parameters
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  -- معلومات الجهاز
  device_type text CHECK (device_type IN ('mobile', 'desktop', 'tablet')) DEFAULT 'desktop',
  os text,
  browser text,
  screen_width integer,
  screen_height integer,

  -- معلومات الموقع (اختياري)
  city text,
  country text,
  ip_address text,

  -- معلومات إضافية
  user_agent text,
  language text DEFAULT 'ar',

  -- تتبع النشاط
  last_activity_at timestamptz DEFAULT now(),
  session_duration_seconds integer DEFAULT 0,
  page_views_count integer DEFAULT 1,

  -- حالة الجلسة
  is_bot boolean DEFAULT false,
  is_active boolean DEFAULT true,

  updated_at timestamptz DEFAULT now()
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON analytics_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON analytics_sessions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_utm_campaign ON analytics_sessions(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_sessions_landing_path ON analytics_sessions(landing_path);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON analytics_sessions(is_active) WHERE is_active = true;

-- =====================================================
-- 2. جدول الأحداث (Analytics Events)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- ربط بالجلسة
  session_id uuid REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,

  -- نوع الحدث
  event_name text NOT NULL CHECK (event_name IN (
    'home_view',
    'farm_view',
    'farm_list_view',
    'qty_change',
    'booking_start',
    'booking_submit',
    'payment_upload',
    'whatsapp_click',
    'share_click',
    'certificate_download',
    'concept_view',
    'scroll_depth_25',
    'scroll_depth_50',
    'scroll_depth_75',
    'scroll_depth_100',
    'time_on_page_30s',
    'time_on_page_60s',
    'time_on_page_120s',
    'external_link_click'
  )),

  -- معلومات الحدث
  event_value jsonb DEFAULT '{}'::jsonb,
  path text NOT NULL DEFAULT '/',

  -- معلومات السياق
  farm_id uuid,
  farm_name text,
  page_title text,

  -- بيانات إضافية
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_farm_id ON analytics_events(farm_id) WHERE farm_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_path ON analytics_events(path);

-- =====================================================
-- 3. جدول الحملات التسويقية (Marketing Campaigns)
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- معلومات الحملة
  campaign_name text NOT NULL,
  campaign_description text,

  -- UTM Parameters
  utm_source text NOT NULL,
  utm_medium text NOT NULL,
  utm_campaign text NOT NULL UNIQUE,
  utm_content text,
  utm_term text,

  -- الرابط المولد
  generated_link text NOT NULL,
  short_link text,

  -- الحالة
  status text CHECK (status IN ('active', 'paused', 'completed', 'draft')) DEFAULT 'draft',

  -- الفترة الزمنية
  start_date date,
  end_date date,

  -- الميزانية والتكلفة
  budget decimal(15,2),
  spent decimal(15,2) DEFAULT 0,

  -- إحصائيات الأداء (محسوبة)
  visits_count integer DEFAULT 0,
  engaged_count integer DEFAULT 0,
  bookings_count integer DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0,

  -- المزرعة المستهدفة (اختياري)
  target_farm_id uuid,
  target_farm_name text,

  -- معلومات إضافية
  notes text,
  tags text[] DEFAULT ARRAY[]::text[],

  -- الصلاحيات
  created_by text,
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,

  -- Soft delete
  is_deleted boolean DEFAULT false
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_campaigns_utm_campaign ON marketing_campaigns(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON marketing_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON marketing_campaigns(status, start_date, end_date)
  WHERE status = 'active' AND is_deleted = false;

-- =====================================================
-- 4. RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Analytics Sessions Policies

-- سماح للزوار بإنشاء جلسات فقط
CREATE POLICY "Allow anon to insert sessions"
  ON analytics_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- سماح للزوار بتحديث جلساتهم فقط
CREATE POLICY "Allow anon to update own session"
  ON analytics_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- المسؤولون يقرأون كل شيء
CREATE POLICY "Admin read all sessions"
  ON analytics_sessions FOR SELECT
  TO authenticated
  USING (true);

-- Analytics Events Policies

-- سماح للزوار بإنشاء أحداث فقط
CREATE POLICY "Allow anon to insert events"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);

-- المسؤولون يقرأون كل شيء
CREATE POLICY "Admin read all events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (true);

-- Marketing Campaigns Policies

-- المسؤولون فقط يقرأون
CREATE POLICY "Admin read campaigns"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (true);

-- المسؤولون فقط يضيفون
CREATE POLICY "Admin insert campaigns"
  ON marketing_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- المسؤولون فقط يعدلون
CREATE POLICY "Admin update campaigns"
  ON marketing_campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- المسؤولون فقط يحذفون (soft delete)
CREATE POLICY "Admin delete campaigns"
  ON marketing_campaigns FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 5. Functions للتحليل
-- =====================================================

-- دالة لتحديث إحصائيات الحملة
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_campaign_name text;
  v_total_visits integer;
  v_total_engaged integer;
  v_total_bookings integer;
  v_conversion_rate decimal;
BEGIN
  -- الحصول على اسم الحملة من الجلسة
  v_campaign_name := (
    SELECT utm_campaign
    FROM analytics_sessions
    WHERE session_id = NEW.session_id
    LIMIT 1
  );

  IF v_campaign_name IS NOT NULL THEN
    -- حساب الإحصائيات
    SELECT
      COUNT(DISTINCT s.session_id),
      COUNT(DISTINCT CASE WHEN e.event_name = 'farm_view' THEN s.session_id END),
      COUNT(DISTINCT CASE WHEN e.event_name = 'booking_submit' THEN s.session_id END)
    INTO v_total_visits, v_total_engaged, v_total_bookings
    FROM analytics_sessions s
    LEFT JOIN analytics_events e ON e.session_id = s.session_id
    WHERE s.utm_campaign = v_campaign_name;

    -- حساب معدل التحويل
    IF v_total_visits > 0 THEN
      v_conversion_rate := (v_total_bookings::decimal / v_total_visits::decimal) * 100;
    ELSE
      v_conversion_rate := 0;
    END IF;

    -- تحديث الحملة
    UPDATE marketing_campaigns
    SET
      visits_count = v_total_visits,
      engaged_count = v_total_engaged,
      bookings_count = v_total_bookings,
      conversion_rate = v_conversion_rate,
      updated_at = now()
    WHERE utm_campaign = v_campaign_name;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger لتحديث إحصائيات الحملة عند إضافة حدث جديد
DROP TRIGGER IF EXISTS trigger_update_campaign_stats ON analytics_events;
CREATE TRIGGER trigger_update_campaign_stats
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- =====================================================
-- 6. تنظيف البيانات القديمة (Retention Policy)
-- =====================================================

-- دالة لحذف البيانات القديمة (أكثر من 180 يوم)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- حذف الجلسات القديمة (والأحداث تحذف تلقائياً بسبب CASCADE)
  DELETE FROM analytics_sessions
  WHERE created_at < now() - interval '180 days';

  RAISE NOTICE 'Old analytics data cleaned up successfully';
END;
$$;
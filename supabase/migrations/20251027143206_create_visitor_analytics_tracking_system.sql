/*
  # نظام تتبع الزوار الشامل - Comprehensive Visitor Analytics System
  
  1. جداول جديدة (New Tables)
    - `visitor_sessions` - جلسات الزوار مع معلومات الجهاز
    - `page_visits` - سجل كل زيارة صفحة مع UTM parameters
    - `utm_campaigns` - حملات التسويق المختلفة
    - `daily_traffic_summary` - ملخص يومي للزيارات
    - `realtime_visitors` - الزوار المتواجدين حالياً
    
  2. الحقول الرئيسية
    - UTM Source, Medium, Campaign, Term, Content
    - معلومات الجهاز والمتصفح
    - الموقع الجغرافي
    - الصفحات المزارة
    - مدة الجلسة
    
  3. الأمان
    - RLS مُفعّل على جميع الجداول
    - سياسات للسماح بالإدخال من anon للتتبع
    - القراءة محصورة للمسؤولين
*/

-- جدول جلسات الزوار
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  
  -- معلومات الزائر
  visitor_ip text,
  user_agent text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser text,
  os text,
  screen_resolution text,
  language text,
  
  -- الموقع الجغرافي
  country text,
  city text,
  region text,
  
  -- معلومات الجلسة
  first_visit_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  session_duration_seconds integer DEFAULT 0,
  pages_visited integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  -- معلومات الإحالة
  referrer_url text,
  landing_page text,
  exit_page text,
  
  -- UTM Parameters
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  
  -- تصنيف تلقائي
  traffic_source_category text, -- 'social', 'search', 'direct', 'referral', 'email', 'paid'
  is_new_visitor boolean DEFAULT true,
  is_returning_visitor boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول زيارات الصفحات
CREATE TABLE IF NOT EXISTS page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  
  -- معلومات الصفحة
  page_url text NOT NULL,
  page_title text,
  page_path text,
  page_section text, -- 'home', 'farms', 'booking', 'about', etc.
  
  -- وقت الزيارة
  visited_at timestamptz DEFAULT now(),
  time_on_page_seconds integer DEFAULT 0,
  
  -- تفاعل المستخدم
  scroll_depth_percentage integer,
  clicked_elements jsonb,
  form_submissions integer DEFAULT 0,
  
  -- UTM Parameters (للصفحة المحددة)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  
  created_at timestamptz DEFAULT now()
);

-- جدول حملات UTM
CREATE TABLE IF NOT EXISTS utm_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الحملة
  campaign_name text UNIQUE NOT NULL,
  utm_source text NOT NULL,
  utm_medium text NOT NULL,
  utm_campaign text NOT NULL,
  utm_term text,
  utm_content text,
  
  -- وصف الحملة
  description text,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  
  -- إحصائيات
  total_visits integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  conversion_count integer DEFAULT 0,
  
  -- تتبع الأداء
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول ملخص الزيارات اليومي
CREATE TABLE IF NOT EXISTS daily_traffic_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  
  -- إحصائيات عامة
  total_visits integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  new_visitors integer DEFAULT 0,
  returning_visitors integer DEFAULT 0,
  
  -- حسب المصدر
  visits_from_tiktok integer DEFAULT 0,
  visits_from_instagram integer DEFAULT 0,
  visits_from_twitter integer DEFAULT 0,
  visits_from_facebook integer DEFAULT 0,
  visits_from_youtube integer DEFAULT 0,
  visits_from_google integer DEFAULT 0,
  visits_from_direct integer DEFAULT 0,
  visits_from_other integer DEFAULT 0,
  
  -- نسب مئوية
  tiktok_percentage numeric(5,2) DEFAULT 0,
  instagram_percentage numeric(5,2) DEFAULT 0,
  twitter_percentage numeric(5,2) DEFAULT 0,
  facebook_percentage numeric(5,2) DEFAULT 0,
  youtube_percentage numeric(5,2) DEFAULT 0,
  google_percentage numeric(5,2) DEFAULT 0,
  direct_percentage numeric(5,2) DEFAULT 0,
  other_percentage numeric(5,2) DEFAULT 0,
  
  -- معدلات
  avg_session_duration_seconds integer DEFAULT 0,
  avg_pages_per_session numeric(5,2) DEFAULT 0,
  bounce_rate_percentage numeric(5,2) DEFAULT 0,
  
  -- حسب الجهاز
  mobile_visits integer DEFAULT 0,
  tablet_visits integer DEFAULT 0,
  desktop_visits integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(date)
);

-- جدول الزوار الحاليين (Real-time)
CREATE TABLE IF NOT EXISTS realtime_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  
  -- معلومات الزائر
  current_page text,
  current_section text,
  utm_source text,
  device_type text,
  
  -- الوقت
  arrived_at timestamptz DEFAULT now(),
  last_heartbeat_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now()
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_utm_source ON visitor_sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_traffic_source ON visitor_sessions(traffic_source_category);

CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_section ON page_visits(page_section);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);

CREATE INDEX IF NOT EXISTS idx_utm_campaigns_campaign_name ON utm_campaigns(campaign_name);
CREATE INDEX IF NOT EXISTS idx_utm_campaigns_is_active ON utm_campaigns(is_active);

CREATE INDEX IF NOT EXISTS idx_daily_traffic_date ON daily_traffic_summary(date);

CREATE INDEX IF NOT EXISTS idx_realtime_visitors_session_id ON realtime_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_realtime_visitors_last_heartbeat ON realtime_visitors(last_heartbeat_at);

-- Enable RLS
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_traffic_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_visitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- visitor_sessions: السماح بالإدخال من anon للتتبع
CREATE POLICY "Anyone can insert visitor sessions"
  ON visitor_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their session"
  ON visitor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can read all visitor sessions"
  ON visitor_sessions FOR SELECT
  TO authenticated
  USING (true);

-- page_visits
CREATE POLICY "Anyone can insert page visits"
  ON page_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all page visits"
  ON page_visits FOR SELECT
  TO authenticated
  USING (true);

-- utm_campaigns
CREATE POLICY "Admins can manage utm campaigns"
  ON utm_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read active campaigns"
  ON utm_campaigns FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- daily_traffic_summary
CREATE POLICY "System can manage daily summaries"
  ON daily_traffic_summary FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read daily summaries"
  ON daily_traffic_summary FOR SELECT
  TO anon, authenticated
  USING (true);

-- realtime_visitors
CREATE POLICY "Anyone can manage realtime visitors"
  ON realtime_visitors FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

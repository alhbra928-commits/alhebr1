/*
  # نظام التحليل والربط التسويقي

  ## الجداول الجديدة:

  ### 1. marketing_platform_connections
  - إعدادات الربط مع منصات التواصل الاجتماعي
  - تخزين API tokens و IDs للمنصات المختلفة
  - حالة الاتصال وآخر فحص

  ### 2. visitor_analytics
  - تتبع الزوار بشكل تفصيلي
  - المصدر والصفحة والوقت
  - معلومات الجهاز والموقع

  ### 3. traffic_sources
  - مصادر الزيارات اليومية
  - إحصائيات مجمعة لكل منصة

  ### 4. page_analytics
  - تحليل الزيارات لكل صفحة
  - عدد الزيارات والمدة والتفاعل

  ### 5. connection_health_log
  - سجل حالة الاتصال بالمنصات
  - متى تم الفحص وما النتيجة

  ## الأمان:
  - RLS مفعّل على جميع الجداول
  - فقط admins يمكنهم القراءة/الكتابة
  - anon يمكنه فقط كتابة visitor_analytics للتتبع
*/

-- جدول إعدادات الربط مع المنصات
CREATE TABLE IF NOT EXISTS marketing_platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN (
    'google_analytics',
    'tiktok_pixel',
    'meta_pixel',
    'twitter_pixel',
    'youtube_analytics'
  )),
  is_active boolean DEFAULT false NOT NULL,
  
  -- معلومات الربط
  api_key text,
  pixel_id text,
  property_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  
  -- حالة الاتصال
  connection_status text DEFAULT 'disconnected' CHECK (connection_status IN (
    'connected',
    'disconnected',
    'error',
    'pending'
  )),
  last_checked_at timestamptz,
  last_error text,
  
  -- إعدادات إضافية
  settings jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES admin_users(id),
  
  UNIQUE(platform)
);

-- جدول تحليل الزوار التفصيلي
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الزيارة
  session_id text NOT NULL,
  visitor_id text, -- يمكن ربطه بـ cookie أو fingerprint
  
  -- الصفحة والمصدر
  page_url text NOT NULL,
  page_title text,
  referrer_url text,
  traffic_source text CHECK (traffic_source IN (
    'tiktok',
    'instagram',
    'facebook',
    'twitter',
    'youtube',
    'google',
    'direct',
    'other'
  )),
  
  -- معلومات UTM
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  
  -- معلومات الجهاز والموقع
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser text,
  os text,
  ip_address text,
  country text,
  city text,
  
  -- التفاعل
  time_on_page integer, -- بالثواني
  scroll_depth integer, -- نسبة مئوية
  clicks_count integer DEFAULT 0,
  
  visited_at timestamptz DEFAULT now() NOT NULL,
  
  -- فهارس للأداء
  created_at timestamptz DEFAULT now() NOT NULL
);

-- جدول مصادر الزيارات المجمعة (يومي)
CREATE TABLE IF NOT EXISTS traffic_sources_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  traffic_source text NOT NULL,
  
  -- الإحصائيات
  total_visits integer DEFAULT 0 NOT NULL,
  unique_visitors integer DEFAULT 0 NOT NULL,
  total_page_views integer DEFAULT 0 NOT NULL,
  avg_time_on_site integer, -- بالثواني
  bounce_rate decimal(5,2), -- نسبة مئوية
  
  -- معلومات إضافية
  top_pages jsonb DEFAULT '[]'::jsonb,
  devices_breakdown jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(date, traffic_source)
);

-- جدول تحليل الصفحات
CREATE TABLE IF NOT EXISTS page_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  page_url text NOT NULL,
  page_title text,
  
  -- الإحصائيات
  total_views integer DEFAULT 0 NOT NULL,
  unique_visitors integer DEFAULT 0 NOT NULL,
  avg_time_on_page integer, -- بالثواني
  avg_scroll_depth integer, -- نسبة مئوية
  total_clicks integer DEFAULT 0,
  
  -- مصادر الزيارات لهذه الصفحة
  sources_breakdown jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(date, page_url)
);

-- سجل حالة الاتصال
CREATE TABLE IF NOT EXISTS connection_health_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  
  -- نتيجة الفحص
  status text NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
  response_time integer, -- بالميلي ثانية
  error_message text,
  error_details jsonb,
  
  checked_at timestamptz DEFAULT now() NOT NULL,
  checked_by uuid REFERENCES admin_users(id)
);

-- الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session ON visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_source ON visitor_analytics(traffic_source);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_date ON visitor_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_date ON traffic_sources_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_page_analytics_date ON page_analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_connection_health_platform ON connection_health_log(platform, checked_at DESC);

-- تفعيل RLS
ALTER TABLE marketing_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_health_log ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان: admins فقط للقراءة والكتابة
CREATE POLICY "Admins full access marketing_platform_connections"
  ON marketing_platform_connections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  );

-- anon يمكنه كتابة بيانات الزوار فقط (للتتبع)
CREATE POLICY "Anyone can insert visitor analytics"
  ON visitor_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can read visitor analytics"
  ON visitor_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  );

-- traffic_sources_daily
CREATE POLICY "Admins full access traffic_sources_daily"
  ON traffic_sources_daily FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  );

-- page_analytics_daily
CREATE POLICY "Admins full access page_analytics_daily"
  ON page_analytics_daily FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  );

-- connection_health_log
CREATE POLICY "Admins full access connection_health_log"
  ON connection_health_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
    )
  );

-- Triggers لتحديث updated_at تلقائياً
CREATE TRIGGER update_marketing_platform_connections_updated_at
  BEFORE UPDATE ON marketing_platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traffic_sources_daily_updated_at
  BEFORE UPDATE ON traffic_sources_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_analytics_daily_updated_at
  BEFORE UPDATE ON page_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

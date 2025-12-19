/*
  # نظام إدارة شاشة التحميل المتطور

  1. الجداول الجديدة
    - `platform_loader_settings` - إعدادات شاشة التحميل الرئيسية
    - `loader_themes` - ثيمات جاهزة للشاشة
    - `loader_animations` - تخصيص الانيميشنز
    - `loader_content_phases` - مراحل التحميل الديناميكية
    - `loader_background_elements` - العناصر العائمة في الخلفية
    - `loader_analytics` - تحليلات عرض الشاشة

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - صلاحيات القراءة للجميع
    - صلاحيات الكتابة للمدراء فقط
*/

-- ============================================
-- 1. جدول الإعدادات الرئيسية
-- ============================================
CREATE TABLE IF NOT EXISTS platform_loader_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- التحكم العام
  enabled boolean DEFAULT true,
  show_always boolean DEFAULT true,
  min_display_time integer DEFAULT 2500, -- milliseconds
  fade_duration integer DEFAULT 800,
  
  -- الشعار
  logo_type text DEFAULT 'emoji' CHECK (logo_type IN ('emoji', 'image', 'text', 'none')),
  logo_emoji text DEFAULT '🌾',
  logo_image_url text,
  logo_text text DEFAULT 'مزادات',
  logo_animation text DEFAULT 'rotate3d' CHECK (logo_animation IN ('none', 'bounce', 'spin', 'pulse', 'float', 'rotate3d', 'scale')),
  logo_size text DEFAULT 'large' CHECK (logo_size IN ('small', 'medium', 'large', 'xlarge')),
  
  -- النصوص
  main_title text DEFAULT 'مزادات',
  main_title_size text DEFAULT 'large' CHECK (main_title_size IN ('small', 'medium', 'large', 'xlarge')),
  subtitle text DEFAULT 'منصة الاستثمار الزراعي الذكية',
  subtitle_size text DEFAULT 'medium' CHECK (subtitle_size IN ('small', 'medium', 'large')),
  show_percentage boolean DEFAULT true,
  show_phase_text boolean DEFAULT true,
  
  -- شريط التقدم
  show_progress_bar boolean DEFAULT true,
  progress_bar_style text DEFAULT 'gradient' CHECK (progress_bar_style IN ('solid', 'gradient', 'animated', 'pulse')),
  progress_bar_height text DEFAULT 'medium' CHECK (progress_bar_height IN ('thin', 'medium', 'thick')),
  progress_bar_rounded boolean DEFAULT true,
  show_progress_glow boolean DEFAULT true,
  
  -- الخلفية
  background_type text DEFAULT 'gradient' CHECK (background_type IN ('solid', 'gradient', 'animated', 'pattern')),
  background_color_from text DEFAULT '#064e3b',
  background_color_to text DEFAULT '#059669',
  background_animation text DEFAULT 'none' CHECK (background_animation IN ('none', 'wave', 'pulse', 'shift')),
  
  -- العناصر المتحركة
  show_floating_elements boolean DEFAULT true,
  floating_elements_count integer DEFAULT 30,
  floating_elements_speed text DEFAULT 'normal' CHECK (floating_elements_speed IN ('slow', 'normal', 'fast')),
  
  -- التأثيرات
  show_shimmer_effect boolean DEFAULT true,
  show_sparkles boolean DEFAULT true,
  blur_background boolean DEFAULT false,
  
  -- الألوان
  text_color text DEFAULT '#ffffff',
  accent_color text DEFAULT '#10b981',
  secondary_color text DEFAULT '#34d399',
  
  -- متقدم
  custom_css text,
  preload_images boolean DEFAULT true,
  gpu_acceleration boolean DEFAULT true,
  
  -- التتبع
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id)
);

-- ============================================
-- 2. جدول الثيمات الجاهزة
-- ============================================
CREATE TABLE IF NOT EXISTS loader_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  description text,
  preview_image_url text,
  
  -- إعدادات الثيم (JSON)
  settings jsonb NOT NULL,
  
  -- التصنيف
  category text DEFAULT 'general' CHECK (category IN ('general', 'seasonal', 'special', 'minimal', 'luxury')),
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. جدول تخصيص الانيميشنز
-- ============================================
CREATE TABLE IF NOT EXISTS loader_animations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name text NOT NULL,
  name_ar text NOT NULL,
  animation_type text NOT NULL CHECK (animation_type IN ('logo', 'background', 'progress', 'text', 'elements')),
  
  -- كود CSS للانيميشن
  css_keyframes text NOT NULL,
  duration integer DEFAULT 1000, -- milliseconds
  timing_function text DEFAULT 'ease-in-out',
  iteration_count text DEFAULT '1', -- '1', '2', 'infinite'
  
  -- معاينة
  preview_description text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. جدول مراحل التحميل
-- ============================================
CREATE TABLE IF NOT EXISTS loader_content_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  phase_number integer NOT NULL,
  phase_text text NOT NULL,
  phase_icon text DEFAULT '🌾',
  phase_color text DEFAULT '#10b981',
  
  -- متى تظهر (نسبة من التقدم)
  start_percentage integer DEFAULT 0 CHECK (start_percentage >= 0 AND start_percentage <= 100),
  end_percentage integer DEFAULT 25 CHECK (end_percentage >= 0 AND end_percentage <= 100),
  
  -- تأثيرات خاصة
  animation_type text DEFAULT 'fade' CHECK (animation_type IN ('fade', 'slide', 'scale', 'bounce')),
  duration integer DEFAULT 500,
  
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 5. جدول العناصر العائمة
-- ============================================
CREATE TABLE IF NOT EXISTS loader_background_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  element_type text NOT NULL CHECK (element_type IN ('icon', 'emoji', 'svg', 'image')),
  element_value text NOT NULL, -- emoji or icon name or URL
  
  -- الحجم
  size_min integer DEFAULT 20,
  size_max integer DEFAULT 40,
  
  -- الحركة
  animation_type text DEFAULT 'float' CHECK (animation_type IN ('float', 'spin', 'pulse', 'drift')),
  animation_duration_min integer DEFAULT 2000,
  animation_duration_max integer DEFAULT 5000,
  
  -- المظهر
  opacity_min real DEFAULT 0.1,
  opacity_max real DEFAULT 0.3,
  color text,
  
  -- التحكم
  is_active boolean DEFAULT true,
  weight integer DEFAULT 1, -- احتمالية الظهور
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 6. جدول التحليلات
-- ============================================
CREATE TABLE IF NOT EXISTS loader_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الجلسة
  session_id text,
  user_agent text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser text,
  
  -- التوقيت
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer,
  
  -- التفاعل
  skipped boolean DEFAULT false,
  completed_naturally boolean DEFAULT true,
  
  -- السياق
  entry_page text,
  referrer text,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. إدخال البيانات الافتراضية
-- ============================================

-- الإعدادات الافتراضية
INSERT INTO platform_loader_settings (
  enabled,
  show_always,
  main_title,
  subtitle,
  logo_emoji,
  background_color_from,
  background_color_to
) VALUES (
  true,
  true,
  'مزادات',
  'منصة الاستثمار الزراعي الذكية',
  '🌾',
  '#064e3b',
  '#059669'
) ON CONFLICT DO NOTHING;

-- مراحل التحميل الافتراضية
INSERT INTO loader_content_phases (phase_number, phase_text, phase_icon, phase_color, start_percentage, end_percentage, display_order) VALUES
  (1, 'جاري تحميل المنصة...', '🌾', '#10b981', 0, 25, 1),
  (2, 'تحميل المزارع المتاحة...', '🌴', '#34d399', 25, 50, 2),
  (3, 'تجهيز بيانات الاستثمار...', '💰', '#6ee7b7', 50, 75, 3),
  (4, 'تقريباً جاهز...', '✨', '#a7f3d0', 75, 100, 4)
ON CONFLICT DO NOTHING;

-- العناصر العائمة الافتراضية
INSERT INTO loader_background_elements (element_type, element_value, animation_type, weight) VALUES
  ('emoji', '🌾', 'float', 3),
  ('emoji', '🌴', 'float', 3),
  ('emoji', '🫒', 'float', 2),
  ('emoji', '🌱', 'float', 2),
  ('emoji', '✨', 'pulse', 2),
  ('emoji', '💚', 'float', 1),
  ('emoji', '🍃', 'drift', 2)
ON CONFLICT DO NOTHING;

-- ثيمات جاهزة
INSERT INTO loader_themes (name, name_ar, description, category, settings) VALUES
  (
    'Agricultural Green',
    'الأخضر الزراعي',
    'الثيم الافتراضي بألوان خضراء زراعية',
    'general',
    '{"background_color_from": "#064e3b", "background_color_to": "#059669", "accent_color": "#10b981"}'::jsonb
  ),
  (
    'Gold Luxury',
    'الذهبي الفاخر',
    'ثيم فاخر بألوان ذهبية',
    'luxury',
    '{"background_color_from": "#78350f", "background_color_to": "#b45309", "accent_color": "#f59e0b"}'::jsonb
  ),
  (
    'Ocean Blue',
    'الأزرق المحيطي',
    'ثيم هادئ بألوان زرقاء',
    'general',
    '{"background_color_from": "#0c4a6e", "background_color_to": "#0284c7", "accent_color": "#38bdf8"}'::jsonb
  ),
  (
    'Minimal Dark',
    'الداكن البسيط',
    'ثيم بسيط وأنيق',
    'minimal',
    '{"background_color_from": "#1f2937", "background_color_to": "#374151", "accent_color": "#9ca3af"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. تفعيل RLS
-- ============================================

ALTER TABLE platform_loader_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_content_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_background_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. سياسات الأمان
-- ============================================

-- القراءة للجميع (anon + authenticated)
CREATE POLICY "Anyone can read loader settings"
  ON platform_loader_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read loader themes"
  ON loader_themes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read loader animations"
  ON loader_animations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read loader phases"
  ON loader_content_phases FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read loader elements"
  ON loader_background_elements FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- الكتابة للمدراء فقط
CREATE POLICY "Admins can update loader settings"
  ON platform_loader_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_sessions ads ON au.id = ads.admin_id
      WHERE ads.session_status = 'active'
      AND ads.session_token = current_setting('request.headers', true)::json->>'authorization'
    )
  );

CREATE POLICY "Admins can manage themes"
  ON loader_themes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_sessions ads ON au.id = ads.admin_id
      WHERE ads.session_status = 'active'
    )
  );

CREATE POLICY "Admins can manage phases"
  ON loader_content_phases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_sessions ads ON au.id = ads.admin_id
      WHERE ads.session_status = 'active'
    )
  );

CREATE POLICY "Admins can manage elements"
  ON loader_background_elements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_sessions ads ON au.id = ads.admin_id
      WHERE ads.session_status = 'active'
    )
  );

-- التحليلات - الكتابة للجميع (anon)
CREATE POLICY "Anyone can insert analytics"
  ON loader_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics"
  ON loader_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_sessions ads ON au.id = ads.admin_id
      WHERE ads.session_status = 'active'
    )
  );

-- ============================================
-- 10. الفهارس للأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_loader_phases_order ON loader_content_phases(display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_loader_elements_active ON loader_background_elements(is_active, weight);
CREATE INDEX IF NOT EXISTS idx_loader_analytics_date ON loader_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loader_themes_category ON loader_themes(category) WHERE is_active = true;

-- ============================================
-- 11. Triggers
-- ============================================

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_loader_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loader_settings_updated_at
  BEFORE UPDATE ON platform_loader_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_loader_settings_updated_at();

CREATE TRIGGER trigger_update_loader_phases_updated_at
  BEFORE UPDATE ON loader_content_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_loader_settings_updated_at();

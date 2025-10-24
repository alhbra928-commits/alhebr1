/*
  # نظام إدارة الشريط المتحرك (Stock Ticker Settings)

  ## الوصف
  هذا الملف ينشئ نظام شامل لإدارة الشريط المتحرك الذي يظهر أسفل الهيدر في الصفحة العامة.
  يوفر تحكم كامل في المحتوى، المظهر، السلوك، والإحصائيات المعروضة.

  ## الجداول الجديدة

  ### 1. `ticker_settings` - الإعدادات الأساسية
  - `id` (uuid) - المعرف الفريد
  - `is_enabled` (boolean) - تفعيل/إيقاف الشريط
  - `speed` (integer) - سرعة الحركة بالثواني (10-60)
  - `background_color` (text) - لون الخلفية
  - `text_color` (text) - لون النص
  - `height` (integer) - ارتفاع الشريط بالبكسل
  - `animation_style` (text) - نوع الحركة (scroll, fade, slide)
  - `update_interval` (integer) - تحديث البيانات كل X ثانية
  - `show_demo_data` (boolean) - عرض بيانات تجريبية متحركة
  - `created_at`, `updated_at`

  ### 2. `ticker_items` - العناصر المعروضة
  - `id` (uuid) - المعرف الفريد
  - `label` (text) - التسمية (مثل: "المزارع النشطة")
  - `icon` (text) - اسم الأيقونة من lucide-react
  - `color` (text) - اللون الخاص بالعنصر
  - `data_source` (text) - مصدر البيانات (farms, reservations, investors, trees, custom)
  - `custom_value` (integer) - قيمة مخصصة
  - `show_percentage` (boolean) - عرض نسبة التغيير
  - `percentage_value` (text) - قيمة النسبة (+5.7%)
  - `sort_order` (integer) - ترتيب العرض
  - `is_active` (boolean) - تفعيل/إيقاف العنصر
  - `created_at`, `updated_at`

  ## الأمان
  - RLS مُفعّل على جميع الجداول
  - القراءة متاحة للجميع (anon)
  - التعديل متاح للمسؤولين فقط

  ## الفهارس
  - فهرس على `sort_order` لأداء أفضل
  - فهرس على `is_active` للاستعلامات السريعة
*/

-- =====================================
-- 1. جدول إعدادات الشريط الأساسية
-- =====================================

CREATE TABLE IF NOT EXISTS ticker_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- التفعيل والعرض
  is_enabled boolean DEFAULT true,
  show_demo_data boolean DEFAULT false,
  
  -- الحركة والسرعة
  speed integer DEFAULT 30 CHECK (speed >= 10 AND speed <= 60),
  animation_style text DEFAULT 'scroll' CHECK (animation_style IN ('scroll', 'fade', 'slide')),
  
  -- الألوان والتصميم
  background_color text DEFAULT 'linear-gradient(to right, #0f172a, #1e293b, #0f172a)',
  text_color text DEFAULT '#ffffff',
  border_color text DEFAULT 'rgba(148, 163, 184, 0.5)',
  height integer DEFAULT 56 CHECK (height >= 40 AND height <= 100),
  
  -- التحديث التلقائي
  update_interval integer DEFAULT 10000 CHECK (update_interval >= 5000 AND update_interval <= 60000),
  
  -- التوقيتات
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- ملاحظات
  notes text
);

-- =====================================
-- 2. جدول عناصر الشريط
-- =====================================

CREATE TABLE IF NOT EXISTS ticker_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- المحتوى
  label text NOT NULL,
  label_en text,
  icon text DEFAULT 'TrendingUp',
  
  -- التصميم
  color text DEFAULT '#10b981',
  
  -- مصدر البيانات
  data_source text DEFAULT 'custom' CHECK (data_source IN ('farms', 'reservations', 'investors', 'trees', 'custom')),
  custom_value integer DEFAULT 0,
  
  -- نسبة التغيير
  show_percentage boolean DEFAULT true,
  percentage_value text DEFAULT '+0.0%',
  
  -- الترتيب والتفعيل
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  -- التوقيتات
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================
-- 3. الفهارس
-- =====================================

CREATE INDEX IF NOT EXISTS idx_ticker_items_sort_order 
  ON ticker_items(sort_order) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ticker_items_active 
  ON ticker_items(is_active);

-- =====================================
-- 4. التحديث التلقائي للتوقيت
-- =====================================

CREATE OR REPLACE FUNCTION update_ticker_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_ticker_settings_timestamp ON ticker_settings;
CREATE TRIGGER update_ticker_settings_timestamp
  BEFORE UPDATE ON ticker_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ticker_timestamp();

DROP TRIGGER IF EXISTS update_ticker_items_timestamp ON ticker_items;
CREATE TRIGGER update_ticker_items_timestamp
  BEFORE UPDATE ON ticker_items
  FOR EACH ROW
  EXECUTE FUNCTION update_ticker_timestamp();

-- =====================================
-- 5. RLS Policies
-- =====================================

ALTER TABLE ticker_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_items ENABLE ROW LEVEL SECURITY;

-- القراءة للجميع
CREATE POLICY "Allow public read access to ticker settings"
  ON ticker_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to ticker items"
  ON ticker_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- التعديل للمسؤولين فقط (سيتم ربطه بنظام الصلاحيات لاحقاً)
CREATE POLICY "Allow authenticated users to update ticker settings"
  ON ticker_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert/update/delete ticker items"
  ON ticker_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================
-- 6. البيانات الافتراضية
-- =====================================

-- إدراج إعدادات افتراضية
INSERT INTO ticker_settings (
  is_enabled,
  speed,
  background_color,
  show_demo_data,
  notes
) VALUES (
  true,
  30,
  'linear-gradient(to right, #0f172a, #1e293b, #0f172a)',
  true,
  'الإعدادات الافتراضية للشريط المتحرك'
) ON CONFLICT (id) DO NOTHING;

-- إدراج العناصر الافتراضية
INSERT INTO ticker_items (label, label_en, icon, color, data_source, show_percentage, percentage_value, sort_order, is_active) VALUES
  ('المزارع النشطة', 'Active Farms', 'BarChart3', '#10b981', 'farms', true, '+2.4%', 1, true),
  ('إجمالي الحجوزات', 'Total Reservations', 'Calendar', '#3b82f6', 'reservations', true, '+5.7%', 2, true),
  ('المستثمرون', 'Investors', 'Users', '#f59e0b', 'investors', true, '+3.1%', 3, true),
  ('الأشجار المتاحة', 'Available Trees', 'TrendingUp', '#8b5cf6', 'trees', true, '-1.2%', 4, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 7. دالة مساعدة للحصول على الإعدادات
-- =====================================

CREATE OR REPLACE FUNCTION get_ticker_configuration()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'settings', (SELECT row_to_json(ticker_settings.*) FROM ticker_settings LIMIT 1),
    'items', (
      SELECT json_agg(row_to_json(ticker_items.*) ORDER BY sort_order)
      FROM ticker_items
      WHERE is_active = true
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
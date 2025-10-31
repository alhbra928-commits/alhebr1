/*
  # إنشاء نظام الشريط المتحرك ثلاثي الأبعاد

  ## الجداول الجديدة:

  ### `ticker_messages_3d`
  - `id` (uuid, primary key)
  - `text_ar` (text) - النص بالعربية
  - `icon_name` (text) - اسم الأيقونة
  - `color` (text) - لون الأيقونة والنص
  - `is_active` (boolean) - حالة التفعيل
  - `order_index` (integer) - ترتيب العرض
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `ticker_settings_3d`
  - `id` (text, primary key) - دائماً '1'
  - `enabled` (boolean) - تفعيل/إيقاف الشريط
  - `speed` (integer) - سرعة الحركة بالثواني
  - `height` (text) - ارتفاع الشريط
  - `updated_at` (timestamptz)

  ## الأمان:
  - تفعيل RLS على جميع الجداول
  - سياسات قراءة عامة للزوار
  - سياسات الكتابة للإداريين فقط
*/

-- جدول رسائل الشريط المتحرك
CREATE TABLE IF NOT EXISTS ticker_messages_3d (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_ar text NOT NULL,
  icon_name text NOT NULL DEFAULT 'star',
  color text NOT NULL DEFAULT '#10b981',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول إعدادات الشريط المتحرك
CREATE TABLE IF NOT EXISTS ticker_settings_3d (
  id text PRIMARY KEY DEFAULT '1',
  enabled boolean NOT NULL DEFAULT true,
  speed integer NOT NULL DEFAULT 40,
  height text NOT NULL DEFAULT '80px',
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE ticker_messages_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_settings_3d ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة للجميع (anon + authenticated)
CREATE POLICY "Anyone can read ticker messages"
  ON ticker_messages_3d
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read ticker settings"
  ON ticker_settings_3d
  FOR SELECT
  USING (true);

-- سياسات الكتابة للإداريين فقط (authenticated)
CREATE POLICY "Authenticated users can insert ticker messages"
  ON ticker_messages_3d
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ticker messages"
  ON ticker_messages_3d
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ticker messages"
  ON ticker_messages_3d
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update ticker settings"
  ON ticker_settings_3d
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert ticker settings"
  ON ticker_settings_3d
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- إدراج الرسائل الافتراضية
INSERT INTO ticker_messages_3d (text_ar, icon_name, color, is_active, order_index)
VALUES
  ('استثمر في مستقبل أخضر مستدام', 'tree', '#10b981', true, 1),
  ('عوائد سنوية مضمونة من أشجارك', 'trending', '#059669', true, 2),
  ('ملكية موثقة ومضمونة قانونياً', 'shield', '#047857', true, 3),
  ('تملك أشجار النخيل والزيتون الآن', 'award', '#065f46', true, 4)
ON CONFLICT (id) DO NOTHING;

-- إدراج الإعدادات الافتراضية
INSERT INTO ticker_settings_3d (id, enabled, speed, height)
VALUES ('1', true, 40, '80px')
ON CONFLICT (id) DO NOTHING;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_ticker_messages_3d_active
  ON ticker_messages_3d(is_active, order_index);

CREATE INDEX IF NOT EXISTS idx_ticker_messages_3d_order
  ON ticker_messages_3d(order_index);

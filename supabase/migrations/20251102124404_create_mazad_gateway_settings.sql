/*
  # بوابة مزاد - إعدادات البوابة الخفيفة

  1. جدول جديد
    - `mazad_gateway_settings`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - تفعيل/تعطيل البوابة
      - `auto_enter_enabled` (boolean) - الدخول التلقائي
      - `auto_enter_delay` (integer) - مدة الانتظار بالثواني
      - `show_logo` (boolean) - عرض شعار التاج
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تمكين RLS
    - القراءة للجميع (anon)
    - التحديث للإداريين فقط (authenticated)

  3. البيانات الافتراضية
    - إنشاء سجل واحد بالإعدادات الافتراضية
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS mazad_gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT true,
  auto_enter_enabled boolean DEFAULT true,
  auto_enter_delay integer DEFAULT 3,
  show_logo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تمكين RLS
ALTER TABLE mazad_gateway_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - القراءة للجميع
CREATE POLICY "Anyone can read mazad gateway settings"
  ON mazad_gateway_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- التحديث للإداريين فقط
CREATE POLICY "Authenticated users can update mazad gateway settings"
  ON mazad_gateway_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إدراج للإداريين
CREATE POLICY "Authenticated users can insert mazad gateway settings"
  ON mazad_gateway_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- إنشاء السجل الافتراضي
INSERT INTO mazad_gateway_settings (
  enabled,
  auto_enter_enabled,
  auto_enter_delay,
  show_logo
) VALUES (
  true,
  true,
  3,
  true
)
ON CONFLICT DO NOTHING;

-- تحديث timestamp تلقائياً
CREATE OR REPLACE FUNCTION update_mazad_gateway_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mazad_gateway_settings_updated_at
  BEFORE UPDATE ON mazad_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_mazad_gateway_settings_updated_at();

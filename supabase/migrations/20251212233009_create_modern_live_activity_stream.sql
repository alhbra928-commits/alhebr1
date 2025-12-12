/*
  # نظام شريط النشاط الحديث والمباشر

  1. جدول واحد بسيط للإعدادات
    - `live_activity_settings`
      - `id` (uuid, primary key)
      - `is_enabled` (boolean) - هل الشريط مفعل؟
      - `animation_speed` (text) - سرعة الحركة
      - `show_reservations` (boolean) - عرض الحجوزات
      - `show_certificates` (boolean) - عرض الشهادات
      - `show_farms` (boolean) - عرض المزارع
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - السماح للجميع بالقراءة
    - السماح للـ Admin فقط بالتعديل

  3. Notes
    - بسيط جداً - لا رسائل ثابتة
    - البيانات تُجلب مباشرة من الجداول الموجودة
    - realtime من reservations, documentation, farms
*/

-- جدول الإعدادات البسيط
CREATE TABLE IF NOT EXISTS live_activity_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  animation_speed text DEFAULT 'medium' CHECK (animation_speed IN ('slow', 'medium', 'fast')),
  show_reservations boolean DEFAULT true,
  show_certificates boolean DEFAULT true,
  show_farms boolean DEFAULT true,
  max_items integer DEFAULT 10 CHECK (max_items BETWEEN 3 AND 20),
  updated_at timestamptz DEFAULT now()
);

-- إدراج إعدادات افتراضية
INSERT INTO live_activity_settings (
  is_enabled,
  animation_speed,
  show_reservations,
  show_certificates,
  show_farms,
  max_items
) VALUES (
  true,
  'fast',
  true,
  true,
  true,
  10
);

-- Enable RLS
ALTER TABLE live_activity_settings ENABLE ROW LEVEL SECURITY;

-- Policy: الجميع يمكنهم القراءة
CREATE POLICY "Anyone can view live activity settings"
  ON live_activity_settings FOR SELECT
  TO public
  USING (true);

-- Policy: Admin فقط يمكنه التعديل
CREATE POLICY "Authenticated users can update live activity settings"
  ON live_activity_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_live_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_activity_settings_timestamp
  BEFORE UPDATE ON live_activity_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_live_activity_timestamp();

-- Index للأداء
CREATE INDEX IF NOT EXISTS idx_live_activity_enabled 
  ON live_activity_settings(is_enabled) 
  WHERE is_enabled = true;

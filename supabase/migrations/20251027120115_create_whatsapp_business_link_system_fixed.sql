/*
  # إنشاء نظام ربط واتساب الأعمال في الردود الجاهزة
  
  1. الجداول الجديدة:
    - `system_settings` - إعدادات النظام العامة
  
  2. التعديلات على الجداول الموجودة:
    - إضافة `whatsapp_business_link` إلى `whatsapp_auto_responses`
  
  3. الأمان:
    - RLS policies للسماح بالقراءة والكتابة
*/

-- إنشاء جدول system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'url', 'json')),
  description_ar text,
  description_en text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إضافة فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- إدراج إعداد رابط واتساب الأعمال الافتراضي
INSERT INTO system_settings (setting_key, setting_value, setting_type, description_ar, description_en, is_public)
VALUES (
  'business_whatsapp_link',
  'https://wa.me/message/',
  'url',
  'رابط واتساب الأعمال الرسمي للمنصة - يُستخدم في الردود الجاهزة والرد الاحتياطي',
  'Official Business WhatsApp Link - Used in auto-responses and fallback replies',
  true
)
ON CONFLICT (setting_key) DO NOTHING;

-- إضافة حقل whatsapp_business_link إلى جدول whatsapp_auto_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_auto_responses' AND column_name = 'whatsapp_business_link'
  ) THEN
    ALTER TABLE whatsapp_auto_responses 
    ADD COLUMN whatsapp_business_link text;
  END IF;
END $$;

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- سياسات RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- السماح للـ public بقراءة جميع الإعدادات
DROP POLICY IF EXISTS "Public can read all settings" ON system_settings;
CREATE POLICY "Public can read all settings"
ON system_settings
FOR SELECT
TO public
USING (true);

-- السماح للـ public بتحديث الإعدادات
DROP POLICY IF EXISTS "Public can update settings" ON system_settings;
CREATE POLICY "Public can update settings"
ON system_settings
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- السماح للـ public بإدراج إعدادات جديدة
DROP POLICY IF EXISTS "Public can insert settings" ON system_settings;
CREATE POLICY "Public can insert settings"
ON system_settings
FOR INSERT
TO public
WITH CHECK (true);

-- إضافة تعليقات على الجداول والأعمدة
COMMENT ON TABLE system_settings IS 'إعدادات النظام العامة - يحتوي على جميع إعدادات المنصة القابلة للتخصيص';
COMMENT ON COLUMN system_settings.setting_key IS 'المفتاح الفريد للإعداد - يُستخدم للبحث والوصول';
COMMENT ON COLUMN system_settings.setting_value IS 'قيمة الإعداد - يمكن أن تكون نص، رقم، أو JSON';

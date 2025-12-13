/*
  # إنشاء نظام الفوتر الاحترافي

  1. الجداول الجديدة
    - `footer_info`
      - معلومات المؤسسة (اسم، سجل تجاري)
      - معلومات التواصل (بريد، هاتف، واتساب)
      - الموقع الجغرافي (مدينة، دولة)
      - عبارة الثقة والتوثيق
      - روابط قانونية (خصوصية، شروط)
      - تخصيص المظهر
      - إعدادات العرض

  2. الأمان
    - Enable RLS على جدول footer_info
    - السماح بالقراءة للجميع (anon)
    - السماح بالتعديل للمسؤولين فقط
*/

-- إنشاء جدول معلومات الفوتر
CREATE TABLE IF NOT EXISTS footer_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- معلومات المؤسسة
  organization_name_ar text NOT NULL DEFAULT 'منصة ريفي للاستثمار الزراعي',
  organization_name_en text DEFAULT 'Rifi Agricultural Investment Platform',

  -- معلومات قانونية
  commercial_registration text DEFAULT '',

  -- معلومات التواصل
  email text DEFAULT 'info@rifi.sa',
  phone text DEFAULT '+966 XX XXX XXXX',
  whatsapp text DEFAULT '+966 XX XXX XXXX',

  -- الموقع الجغرافي
  city_ar text DEFAULT 'الرياض',
  city_en text DEFAULT 'Riyadh',
  country_ar text DEFAULT 'المملكة العربية السعودية',
  country_en text DEFAULT 'Saudi Arabia',

  -- عبارة الثقة
  trust_statement_ar text DEFAULT 'منصة مسجلة وتعمل وفق الأنظمة المعتمدة داخل المملكة',
  trust_statement_en text DEFAULT 'A registered platform operating in accordance with approved regulations in the Kingdom',

  -- روابط قانونية
  show_privacy_policy boolean DEFAULT true,
  show_terms_conditions boolean DEFAULT true,
  privacy_policy_url text DEFAULT '/privacy-policy',
  terms_conditions_url text DEFAULT '/terms-conditions',

  -- تخصيص المظهر
  footer_bg_color text DEFAULT '#1A472A',
  footer_text_color text DEFAULT '#F5F5DC',

  -- إعدادات العرض
  show_in_mobile boolean DEFAULT true,
  mobile_collapsed boolean DEFAULT true,
  is_active boolean DEFAULT true,

  -- تتبع الوقت
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_footer_info_active ON footer_info(is_active);

-- تفعيل RLS
ALTER TABLE footer_info ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع (anon + authenticated)
CREATE POLICY "allow_all_read_active_footer_info"
  ON footer_info
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- سياسة التحديث للمسؤولين
CREATE POLICY "allow_admins_update_footer_info"
  ON footer_info
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- سياسة الإضافة للمسؤولين
CREATE POLICY "allow_admins_insert_footer_info"
  ON footer_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_footer_info_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_footer_info_timestamp
  BEFORE UPDATE ON footer_info
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_info_timestamp();

-- إدخال بيانات افتراضية
INSERT INTO footer_info (
  organization_name_ar,
  organization_name_en,
  commercial_registration,
  email,
  phone,
  whatsapp,
  city_ar,
  city_en,
  country_ar,
  country_en,
  trust_statement_ar,
  trust_statement_en,
  show_privacy_policy,
  show_terms_conditions,
  is_active
) VALUES (
  'منصة ريفي للاستثمار الزراعي',
  'Rifi Agricultural Investment Platform',
  '1234567890',
  'info@rifi.sa',
  '+966 50 123 4567',
  '+966 50 123 4567',
  'الرياض',
  'Riyadh',
  'المملكة العربية السعودية',
  'Saudi Arabia',
  'منصة مسجلة وتعمل وفق الأنظمة المعتمدة داخل المملكة',
  'A registered platform operating in accordance with approved regulations in the Kingdom',
  true,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Comment
COMMENT ON TABLE footer_info IS 'جدول معلومات الفوتر الاحترافي للمنصة';
COMMENT ON COLUMN footer_info.organization_name_ar IS 'اسم المؤسسة الرسمي بالعربي';
COMMENT ON COLUMN footer_info.commercial_registration IS 'رقم السجل التجاري';
COMMENT ON COLUMN footer_info.trust_statement_ar IS 'عبارة الثقة والتوثيق';
COMMENT ON COLUMN footer_info.mobile_collapsed IS 'هل يظهر الفوتر مضغوطاً في الجوال';
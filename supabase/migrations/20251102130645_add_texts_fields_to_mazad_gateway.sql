/*
  # إضافة حقول النصوص لبوابة مزاد

  1. أعمدة جديدة للنصوص
    - `title_line1` (text) - السطر الأول من العنوان
    - `title_line2` (text) - السطر الثاني من العنوان
    - `subtitle` (text) - النص الفرعي
    - `button_text` (text) - نص الزر
    - `show_title` (boolean) - عرض العنوان
    - `show_subtitle` (boolean) - عرض النص الفرعي

  2. تحديث السجل الموجود بالقيم الافتراضية
*/

-- إضافة حقول النصوص
ALTER TABLE mazad_gateway_settings
ADD COLUMN IF NOT EXISTS title_line1 text DEFAULT 'بوابة',
ADD COLUMN IF NOT EXISTS title_line2 text DEFAULT 'مزاد',
ADD COLUMN IF NOT EXISTS subtitle text DEFAULT 'منصة استثمار زراعي متطورة',
ADD COLUMN IF NOT EXISTS button_text text DEFAULT 'ادخل إلى المنصة',
ADD COLUMN IF NOT EXISTS show_title boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_subtitle boolean DEFAULT true;

-- تحديث السجل الموجود
UPDATE mazad_gateway_settings
SET
  title_line1 = 'بوابة',
  title_line2 = 'مزاد',
  subtitle = 'منصة استثمار زراعي متطورة',
  button_text = 'ادخل إلى المنصة',
  show_title = true,
  show_subtitle = true
WHERE title_line1 IS NULL;

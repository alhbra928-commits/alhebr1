/*
  # إضافة نص شعار المنصة (مزادات) إلى إدارة النصوص

  1. نص جديد
    - إضافة نص "مزادات" الموجود في Header
    - قسم: header
    - قابل للتعديل
  
  2. الهدف
    - نقل النص من hardcoded إلى قاعدة البيانات
    - إمكانية تعديله من لوحة التحكم
*/

-- إضافة نص شعار المنصة
INSERT INTO platform_texts (
  section,
  key,
  text_ar,
  text_en,
  description,
  editable,
  display_order
) VALUES (
  'header',
  'logo_text',
  'مزادات',
  'Mazadat',
  'نص الشعار الرئيسي في الـ Header',
  true,
  1
) ON CONFLICT (section, key) DO UPDATE SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  updated_at = now();

-- إضافة نص الأيقونة
INSERT INTO platform_texts (
  section,
  key,
  text_ar,
  text_en,
  description,
  editable,
  display_order
) VALUES (
  'header',
  'logo_icon',
  '🌿',
  '🌿',
  'أيقونة الشعار في الـ Header',
  true,
  2
) ON CONFLICT (section, key) DO UPDATE SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  updated_at = now();

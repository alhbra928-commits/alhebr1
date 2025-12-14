/*
  # إضافة عنوان ووصف المنصة للهيدر

  1. النصوص الجديدة
    - platform_title: عنوان المنصة الرئيسي
    - platform_subtitle: الوصف التحتاني للمنصة

  2. الأمان
    - يستخدم RLS الموجود مسبقاً
*/

-- إضافة عنوان ووصف المنصة
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order, editable) VALUES
  ('header', 'platform_title', 'منصة الاستثمار الزراعي الملكية', 'Royal Agricultural Investment Platform', 'عنوان المنصة الرئيسي', 1, true),
  ('header', 'platform_subtitle', 'استثمار فاخر في عالم النخيل والزيتون', 'Luxury Investment in Palm and Olive World', 'الوصف التحتاني للمنصة', 2, true)
ON CONFLICT (section, key)
DO UPDATE SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = now();

/*
  # إضافة رقم واتساب المدير العام لإعدادات الشريط الجانبي

  1. إضافة:
    - رقم واتساب المدير العام في إعدادات الشريط الجانبي

  2. الأمان:
    - صلاحيات القراءة متاحة للجميع
    - صلاحيات التعديل للإداريين فقط
*/

-- إضافة رقم واتساب المدير العام
INSERT INTO platform_texts (section, key, text_ar, text_en, description, category, display_order)
VALUES
  ('side_dock', 'manager_whatsapp', '966569335257', '966569335257', 'رقم واتساب المدير العام للتواصل المباشر', 'contact', 1)
ON CONFLICT (section, key) 
DO UPDATE SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  updated_at = now();

-- تحديث tooltip للزر الأول
INSERT INTO platform_texts (section, key, text_ar, text_en, description, category, display_order)
VALUES
  ('side_dock', 'home_tooltip', 'تحدث مع المدير العام على واتساب', 'Chat with General Manager on WhatsApp', 'نص tooltip لزر واتساب المدير العام', 'ui', 10)
ON CONFLICT (section, key) 
DO UPDATE SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  updated_at = now();

/*
  # إضافة قسم شريط التواصل السفلي
  
  1. التغييرات
    - إضافة قسم contact_bar للنصوص
    - إدراج النصوص الافتراضية للشريط السفلي
*/

-- تحديث constraint لإضافة contact_bar
ALTER TABLE platform_texts DROP CONSTRAINT IF EXISTS platform_texts_section_check;

ALTER TABLE platform_texts ADD CONSTRAINT platform_texts_section_check
CHECK (section IN (
  'header',
  'footer', 
  'home',
  'about',
  'contact',
  'features',
  'hero',
  'stats',
  'cta',
  'contact_bar'
));

-- إضافة نصوص الشريط السفلي
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('contact_bar', 'call_us_label', 'اتصل بنا', 'Call Us', 'عنوان قسم الاتصال', 1),
  ('contact_bar', 'phone_number', '920000000', '920000000', 'رقم الهاتف', 2),
  ('contact_bar', 'email_label', 'راسلنا', 'Email Us', 'عنوان البريد', 3),
  ('contact_bar', 'email_address', 'info@palmolive.sa', 'info@palmolive.sa', 'البريد الإلكتروني', 4),
  ('contact_bar', 'location_label', 'الموقع', 'Location', 'عنوان الموقع', 5),
  ('contact_bar', 'location_text', 'الرياض، السعودية', 'Riyadh, Saudi Arabia', 'نص الموقع', 6),
  ('contact_bar', 'hours_label', 'ساعات العمل', 'Working Hours', 'عنوان ساعات العمل', 7),
  ('contact_bar', 'hours_text', '8 صباحاً - 8 مساءً', '8 AM - 8 PM', 'نص ساعات العمل', 8),
  ('contact_bar', 'cta_message', '🌴 استثمر في مستقبل مستدام 🫒', '🌴 Invest in a Sustainable Future 🫒', 'رسالة تحفيزية', 9)
ON CONFLICT (section, key) DO NOTHING;

COMMENT ON CONSTRAINT platform_texts_section_check ON platform_texts IS 'الأقسام المتاحة للنصوص بما فيها شريط التواصل السفلي';

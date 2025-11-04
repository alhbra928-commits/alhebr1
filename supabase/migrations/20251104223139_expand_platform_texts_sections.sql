/*
  # توسيع أقسام نصوص المنصة

  1. التغييرات:
    - إزالة constraint القديم
    - إضافة constraint جديد بأقسام شاملة
    - الحفاظ على الأقسام الموجودة
*/

-- إزالة constraint القديم
ALTER TABLE platform_texts DROP CONSTRAINT IF EXISTS platform_texts_section_check;

-- إضافة constraint جديد مع جميع الأقسام
ALTER TABLE platform_texts ADD CONSTRAINT platform_texts_section_check 
CHECK (section IN (
  -- الأقسام القديمة
  'header', 'footer', 'home', 'about', 'contact', 'features', 'hero', 'stats', 
  'cta', 'buttons', 'farm_cards', 'navigation', 'steps', 'benefits', 'messages',
  'contact_bar', 'side_dock', 'loader',
  -- الأقسام الجديدة
  'booking', 'forms', 'modals', 'notifications', 'errors', 'success', 
  'filters', 'search', 'profile', 'settings', 'help', 'legal', 'seo',
  'farm_details', 'certificate', 'payment', 'dashboard', 'auth'
));

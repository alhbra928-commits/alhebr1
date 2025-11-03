/*
  # إضافة إعدادات الشريط الجانبي لنظام إدارة النصوص

  1. التحديثات
    - إضافة قسم 'side_dock' للأقسام المتاحة
    - إضافة النصوص الافتراضية للشريط الجانبي
    - إضافة إعدادات التحكم في عرض الشريط

  2. الأمان
    - يستخدم نفس سياسات RLS الموجودة
*/

-- تحديث قيد الأقسام لإضافة side_dock
DO $$ BEGIN
  ALTER TABLE platform_texts DROP CONSTRAINT IF EXISTS platform_texts_section_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE platform_texts 
ADD CONSTRAINT platform_texts_section_check 
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
  'buttons',
  'farm_cards',
  'navigation',
  'steps',
  'benefits',
  'messages',
  'contact_bar',
  'side_dock'
));

-- إضافة النصوص الافتراضية للشريط الجانبي
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order, metadata)
VALUES
  -- إعدادات عامة
  (
    'side_dock',
    'title',
    'الشريط الجانبي',
    'Side Dock',
    'عنوان الشريط الجانبي',
    true,
    1,
    '{"type": "title"}'::jsonb
  ),
  (
    'side_dock',
    'description',
    'أدوات التنقل السريع',
    'Quick Navigation Tools',
    'وصف الشريط الجانبي',
    true,
    2,
    '{"type": "description"}'::jsonb
  ),
  
  -- أزرار التنقل
  (
    'side_dock',
    'home_button',
    'الرئيسية',
    'Home',
    'زر الصفحة الرئيسية',
    true,
    10,
    '{"type": "button", "icon": "home"}'::jsonb
  ),
  (
    'side_dock',
    'account_button',
    'الحساب',
    'Account',
    'زر صفحة الحساب',
    true,
    11,
    '{"type": "button", "icon": "user"}'::jsonb
  ),
  (
    'side_dock',
    'phone_button',
    'اتصل بنا',
    'Call Us',
    'زر الاتصال',
    true,
    12,
    '{"type": "button", "icon": "phone"}'::jsonb
  ),
  (
    'side_dock',
    'smart_button',
    'المساعد الذكي',
    'Smart Assistant',
    'زر المساعد الذكي',
    true,
    13,
    '{"type": "button", "icon": "brain"}'::jsonb
  ),
  
  -- رسائل التلميح
  (
    'side_dock',
    'show_tooltip',
    'إظهار الشريط',
    'Show Dock',
    'تلميح زر إظهار الشريط',
    true,
    20,
    '{"type": "tooltip"}'::jsonb
  ),
  (
    'side_dock',
    'hide_tooltip',
    'إخفاء الشريط',
    'Hide Dock',
    'تلميح زر إخفاء الشريط',
    true,
    21,
    '{"type": "tooltip"}'::jsonb
  ),
  (
    'side_dock',
    'home_tooltip',
    'الانتقال للصفحة الرئيسية',
    'Go to Home',
    'تلميح زر الرئيسية',
    true,
    22,
    '{"type": "tooltip"}'::jsonb
  ),
  (
    'side_dock',
    'account_tooltip',
    'صفحة الحساب',
    'Account Page',
    'تلميح زر الحساب',
    true,
    23,
    '{"type": "tooltip"}'::jsonb
  ),
  (
    'side_dock',
    'phone_tooltip',
    'اتصل بنا الآن',
    'Call Us Now',
    'تلميح زر الاتصال',
    true,
    24,
    '{"type": "tooltip"}'::jsonb
  ),
  (
    'side_dock',
    'smart_tooltip',
    'افتح المساعد الذكي',
    'Open Smart Assistant',
    'تلميح زر المساعد الذكي',
    true,
    25,
    '{"type": "tooltip"}'::jsonb
  ),
  
  -- إعدادات العرض
  (
    'side_dock',
    'position_mobile',
    'أعلى',
    'top',
    'موضع الشريط في الجوال (أعلى/وسط)',
    true,
    30,
    '{"type": "setting", "options": ["top", "center"]}'::jsonb
  ),
  (
    'side_dock',
    'position_desktop',
    'وسط',
    'center',
    'موضع الشريط في الكمبيوتر (أعلى/وسط)',
    true,
    31,
    '{"type": "setting", "options": ["top", "center"]}'::jsonb
  ),
  (
    'side_dock',
    'default_state',
    'مرئي',
    'visible',
    'الحالة الافتراضية للشريط (مرئي/مخفي)',
    true,
    32,
    '{"type": "setting", "options": ["visible", "hidden"]}'::jsonb
  ),
  (
    'side_dock',
    'phone_number',
    '966569335257',
    '966569335257',
    'رقم الهاتف للاتصال',
    true,
    33,
    '{"type": "setting"}'::jsonb
  )
ON CONFLICT (section, key) DO UPDATE
SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = now();

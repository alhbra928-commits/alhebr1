/*
  # إضافة نصوص شاشة التحميل لنظام إدارة النصوص

  1. التحديثات
    - إضافة قسم 'loader' للأقسام المتاحة
    - إضافة النصوص الافتراضية لشاشة التحميل
    - نص العنوان الرئيسي "مزادات"
    - نصوص رسائل التحميل المختلفة

  2. الأمان
    - يستخدم نفس سياسات RLS الموجودة
*/

-- تحديث قيد الأقسام لإضافة loader
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
  'side_dock',
  'loader'
));

-- إضافة النصوص الافتراضية لشاشة التحميل
INSERT INTO platform_texts (section, key, text_ar, text_en, description, editable, display_order, metadata)
VALUES
  -- العنوان الرئيسي
  (
    'loader',
    'main_title',
    'مزادات',
    'Mazadat',
    'العنوان الرئيسي الذي يظهر في شاشة التحميل',
    true,
    1,
    '{"type": "title", "size": "large"}'::jsonb
  ),
  
  -- رسائل التحميل
  (
    'loader',
    'default_message',
    'جاري التحميل...',
    'Loading...',
    'رسالة التحميل الافتراضية',
    true,
    10,
    '{"type": "message"}'::jsonb
  ),
  (
    'loader',
    'farm_details_message',
    'جاري تحميل تفاصيل المزرعة...',
    'Loading farm details...',
    'رسالة عند تحميل تفاصيل المزرعة',
    true,
    11,
    '{"type": "message", "context": "farm_details"}'::jsonb
  ),
  (
    'loader',
    'varieties_message',
    'جاري تحميل الأصناف...',
    'Loading varieties...',
    'رسالة عند تحميل أصناف الأشجار',
    true,
    12,
    '{"type": "message", "context": "varieties"}'::jsonb
  ),
  (
    'loader',
    'palm_varieties_message',
    'جاري تحميل أصناف النخيل...',
    'Loading palm varieties...',
    'رسالة عند تحميل أصناف النخيل',
    true,
    13,
    '{"type": "message", "context": "palm"}'::jsonb
  ),
  (
    'loader',
    'olive_varieties_message',
    'جاري تحميل أصناف الزيتون...',
    'Loading olive varieties...',
    'رسالة عند تحميل أصناف الزيتون',
    true,
    14,
    '{"type": "message", "context": "olive"}'::jsonb
  ),
  (
    'loader',
    'data_loading_message',
    'جاري تحميل البيانات...',
    'Loading data...',
    'رسالة عامة عند تحميل البيانات',
    true,
    15,
    '{"type": "message", "context": "data"}'::jsonb
  ),
  (
    'loader',
    'processing_message',
    'جاري المعالجة...',
    'Processing...',
    'رسالة عند معالجة العمليات',
    true,
    16,
    '{"type": "message", "context": "processing"}'::jsonb
  ),
  (
    'loader',
    'submitting_message',
    'جاري الإرسال...',
    'Submitting...',
    'رسالة عند إرسال البيانات',
    true,
    17,
    '{"type": "message", "context": "submit"}'::jsonb
  ),
  (
    'loader',
    'saving_message',
    'جاري الحفظ...',
    'Saving...',
    'رسالة عند حفظ البيانات',
    true,
    18,
    '{"type": "message", "context": "save"}'::jsonb
  ),
  (
    'loader',
    'wait_message',
    'الرجاء الانتظار',
    'Please wait',
    'رسالة طلب الانتظار',
    true,
    20,
    '{"type": "message", "context": "wait"}'::jsonb
  ),
  (
    'loader',
    'subtitle_message',
    'استعد لتجربة استثمارية فريدة',
    'Get ready for a unique investment experience',
    'رسالة فرعية تظهر تحت العنوان',
    true,
    21,
    '{"type": "subtitle"}'::jsonb
  ),
  (
    'loader',
    'bottom_message',
    'لحظات قليلة وسنكون جاهزين',
    'We will be ready in a few moments',
    'رسالة سفلية تظهر أسفل الشاشة',
    true,
    22,
    '{"type": "footer"}'::jsonb
  )
ON CONFLICT (section, key) DO UPDATE
SET
  text_ar = EXCLUDED.text_ar,
  text_en = EXCLUDED.text_en,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = now();

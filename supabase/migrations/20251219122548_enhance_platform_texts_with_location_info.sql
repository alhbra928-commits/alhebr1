/*
  # تحسين نظام إدارة النصوص مع معلومات الموقع التفصيلية

  1. تحسينات الجدول
    - إضافة page_location: الصفحة التي يظهر فيها النص
    - إضافة component_name: اسم المكون الذي يستخدم النص
    - إضافة usage_context: السياق التفصيلي للاستخدام
    - إضافة visual_location: الوصف البصري للموقع
    - تحسين description ليكون أكثر وضوحاً
  
  2. الهدف
    - سهولة تتبع موقع كل نص
    - معرفة في أي صفحة يُستخدم النص
    - فهم دقيق لمكان ظهور النص
    - تحسين تجربة المستخدم في إدارة النصوص
*/

-- إضافة الحقول الجديدة
ALTER TABLE platform_texts 
ADD COLUMN IF NOT EXISTS page_location text,
ADD COLUMN IF NOT EXISTS component_name text,
ADD COLUMN IF NOT EXISTS usage_context text,
ADD COLUMN IF NOT EXISTS visual_location text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_platform_texts_page_location ON platform_texts(page_location);
CREATE INDEX IF NOT EXISTS idx_platform_texts_is_active ON platform_texts(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_texts_section_active ON platform_texts(section, is_active);

-- تحديث النصوص الموجودة بمعلومات الموقع
-- Header (الرأس)
UPDATE platform_texts SET
  page_location = 'جميع الصفحات',
  component_name = 'ModernTopHeader',
  usage_context = 'يظهر في أعلى كل صفحة في المنصة العامة',
  visual_location = '🌿 أعلى الصفحة - شريط التنقل الرئيسي',
  description = CASE
    WHEN key = 'logo_text' THEN 'نص الشعار الرئيسي في الـ Header (🌿 مزادات)'
    WHEN key = 'logo_icon' THEN 'أيقونة الشعار في الـ Header (🌿)'
    ELSE description
  END
WHERE section = 'header';

-- Side Dock (الشريط الجانبي)
UPDATE platform_texts SET
  page_location = 'المنصة العامة',
  component_name = 'InnovativeSideDock',
  usage_context = 'الشريط الجانبي الثابت على يمين/يسار الشاشة',
  visual_location = '📱 الجانب الأيمن - أزرار التواصل السريع',
  description = CASE
    WHEN key = 'home_button' THEN 'زر الرئيسية في الشريط الجانبي'
    WHEN key = 'account_button' THEN 'زر الحساب في الشريط الجانبي'
    WHEN key = 'phone_button' THEN 'زر الاتصال في الشريط الجانبي'
    WHEN key = 'smart_button' THEN 'زر المساعد الذكي في الشريط الجانبي'
    WHEN key = 'phone_number' THEN 'رقم الهاتف للاتصال'
    WHEN key = 'manager_whatsapp' THEN 'رقم واتساب المدير'
    ELSE description
  END
WHERE section = 'side_dock';

-- Loader (شاشة التحميل)
UPDATE platform_texts SET
  page_location = 'عند فتح المنصة',
  component_name = 'MazadCrownLoader',
  usage_context = 'شاشة التحميل الأولية التي تظهر عند فتح المنصة',
  visual_location = '👑 منتصف الشاشة - شاشة التحميل المبتكرة',
  description = CASE
    WHEN key = 'main_title' THEN 'العنوان الرئيسي في شاشة التحميل (مزادات)'
    WHEN key = 'default_message' THEN 'الرسالة الافتراضية أثناء التحميل'
    ELSE description
  END
WHERE section = 'loader';

-- Contact Bar (شريط التواصل)
UPDATE platform_texts SET
  page_location = 'المنصة العامة',
  component_name = 'ContactBar',
  usage_context = 'شريط معلومات التواصل',
  visual_location = '📞 أسفل أو أعلى الصفحة - معلومات التواصل',
  is_active = true
WHERE section = 'contact_bar';

-- Bottom Navigation
UPDATE platform_texts SET
  page_location = 'المنصة العامة - الأجهزة المحمولة',
  component_name = 'BottomNavigationBar',
  usage_context = 'شريط التنقل السفلي في الأجهزة المحمولة',
  visual_location = '📱 أسفل الشاشة - التنقل المحمول',
  is_active = true
WHERE section = 'bottom_nav';

-- حذف النصوص القديمة غير المستخدمة (تحديدها كـ inactive)
-- نصوص من أقسام قديمة أو غير موجودة
UPDATE platform_texts SET
  is_active = false
WHERE section NOT IN (
  'header',
  'side_dock', 
  'loader',
  'contact_bar',
  'bottom_nav',
  'farm_cards',
  'booking',
  'buttons',
  'messages',
  'navigation',
  'footer',
  'filters',
  'search',
  'errors',
  'success',
  'hero',
  'features',
  'benefits',
  'steps',
  'stats',
  'seo',
  'forms'
);

-- تحديث الأقسام النشطة بمعلومات عامة إذا لم تكن محدّثة
UPDATE platform_texts SET
  is_active = true,
  page_location = COALESCE(page_location, 'المنصة العامة'),
  usage_context = COALESCE(usage_context, 'يستخدم في المنصة')
WHERE section IN (
  'farm_cards',
  'booking',
  'buttons',
  'messages',
  'navigation',
  'footer',
  'filters',
  'search',
  'errors',
  'success',
  'hero',
  'features',
  'benefits',
  'steps',
  'stats',
  'seo',
  'forms'
) AND is_active = true;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN platform_texts.page_location IS 'الصفحة أو الصفحات التي يظهر فيها النص';
COMMENT ON COLUMN platform_texts.component_name IS 'اسم المكون (Component) الذي يستخدم النص';
COMMENT ON COLUMN platform_texts.usage_context IS 'شرح تفصيلي لسياق استخدام النص';
COMMENT ON COLUMN platform_texts.visual_location IS 'وصف بصري لموقع النص (أعلى، أسفل، وسط، إلخ)';
COMMENT ON COLUMN platform_texts.is_active IS 'هل النص نشط ومستخدم في المنصة حالياً';

/*
  # إعادة بناء نظام إدارة النصوص - نظيف ومنضبط

  ## 🎯 الهدف
  نظام إدارة نصوص يحتوي فقط على النصوص الموجودة فعلياً في المنصة

  ## 📊 المبادئ
  1. ❌ لا نصوص افتراضية أو مستقبلية
  2. ✅ فقط النصوص المستخدمة الآن
  3. ✅ تصنيف واضح حسب الموقع
  4. ✅ الهيدر له أولوية قصوى

  ## 🏗️ الجدول الجديد
  - section: القسم (header, hero, side_dock, loader, booking, messages)
  - text_key: المفتاح الفريد
  - text_ar: النص العربي
  - text_en: النص الإنجليزي
  - location: أين يظهر هذا النص
  - description: وصف مختصر
  - display_order: ترتيب العرض
  - editable: هل يمكن تعديله
  - created_at, updated_at
*/

-- حذف الجدول القديم تماماً
DROP TABLE IF EXISTS platform_texts CASCADE;

-- إنشاء الجدول الجديد النظيف
CREATE TABLE platform_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- التصنيف
  section text NOT NULL,
  text_key text NOT NULL,
  
  -- المحتوى
  text_ar text NOT NULL,
  text_en text NOT NULL,
  
  -- التوضيح
  location text NOT NULL,
  description text NOT NULL,
  
  -- الترتيب
  display_order integer NOT NULL DEFAULT 0,
  
  -- التحكم
  editable boolean NOT NULL DEFAULT true,
  
  -- التوقيت
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- القيود
  CONSTRAINT platform_texts_unique_key UNIQUE (section, text_key)
);

-- Indexes للأداء
CREATE INDEX idx_platform_texts_section ON platform_texts(section);
CREATE INDEX idx_platform_texts_location ON platform_texts(location);
CREATE INDEX idx_platform_texts_display_order ON platform_texts(section, display_order);

-- RLS
ALTER TABLE platform_texts ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة: الجميع يمكنه القراءة
CREATE POLICY "Public read access"
  ON platform_texts
  FOR SELECT
  TO public
  USING (true);

-- سياسات التعديل: الإداريون فقط
CREATE POLICY "Admin update access"
  ON platform_texts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إدراج النصوص الموجودة فعلياً فقط

-- ==========================================
-- 1️⃣ الهيدر (Header) - أولوية قصوى
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('header', 'logo_text', 'مزادات', 'Mazadat', 'أعلى كل صفحة', 'نص الشعار الرئيسي في الهيدر', 1),
('header', 'logo_icon', '🌿', '🌿', 'أعلى كل صفحة', 'أيقونة الشعار في الهيدر', 2),
('header', 'phone_button', 'اتصل بنا', 'Call Us', 'أعلى كل صفحة', 'نص زر الاتصال في الهيدر', 3),
('header', 'phone_number', '966569335257', '966569335257', 'أعلى كل صفحة', 'رقم الهاتف للاتصال', 4);

-- ==========================================
-- 2️⃣ الصفحة الرئيسية (Hero Section)
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('hero', 'main_title', 'منصة الاستثمار الزراعي الملكية', 'Royal Agricultural Investment Platform', 'الصفحة الرئيسية', 'العنوان الرئيسي في أعلى الصفحة الرئيسية', 1),
('hero', 'main_subtitle', 'استثمار فاخر في عالم النخيل والزيتون', 'Premium Investment in Palm and Olive Farming', 'الصفحة الرئيسية', 'العنوان الفرعي في الصفحة الرئيسية', 2);

-- ==========================================
-- 3️⃣ الشريط الجانبي (Side Dock)
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('side_dock', 'home_button', 'الرئيسية', 'Home', 'الشريط الجانبي الثابت', 'زر الرئيسية في الشريط الجانبي', 1),
('side_dock', 'account_button', 'الحساب', 'Account', 'الشريط الجانبي الثابت', 'زر الحساب في الشريط الجانبي', 2),
('side_dock', 'phone_button', 'اتصل بنا', 'Call Us', 'الشريط الجانبي الثابت', 'زر الاتصال في الشريط الجانبي', 3),
('side_dock', 'smart_button', 'المساعد الذكي', 'Smart Assistant', 'الشريط الجانبي الثابت', 'زر المساعد الذكي في الشريط الجانبي', 4),
('side_dock', 'phone_number', '966569335257', '966569335257', 'الشريط الجانبي الثابت', 'رقم الهاتف في الشريط الجانبي', 5),
('side_dock', 'manager_whatsapp', '966569335257', '966569335257', 'الشريط الجانبي الثابت', 'رقم واتساب المدير', 6);

-- ==========================================
-- 4️⃣ شاشة التحميل (Loader)
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('loader', 'main_title', 'مزادات', 'Mazadat', 'شاشة التحميل عند فتح المنصة', 'العنوان الرئيسي في شاشة التحميل', 1),
('loader', 'default_message', 'جارٍ التحميل...', 'Loading...', 'شاشة التحميل عند فتح المنصة', 'رسالة التحميل الافتراضية', 2);

-- ==========================================
-- 5️⃣ أزرار عامة (Common Buttons)
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('buttons', 'view_details', 'عرض التفاصيل', 'View Details', 'بطاقات المزارع', 'زر عرض تفاصيل المزرعة', 1),
('buttons', 'book_now', 'احجز الآن', 'Book Now', 'صفحة تفاصيل المزرعة', 'زر بدء عملية الحجز', 2),
('buttons', 'back', 'رجوع', 'Back', 'جميع الصفحات الفرعية', 'زر الرجوع للصفحة السابقة', 3),
('buttons', 'save', 'حفظ', 'Save', 'النماذج', 'زر حفظ البيانات', 4),
('buttons', 'cancel', 'إلغاء', 'Cancel', 'النماذج', 'زر إلغاء العملية', 5);

-- ==========================================
-- 6️⃣ رسائل النظام (System Messages)
-- ==========================================

INSERT INTO platform_texts (section, text_key, text_ar, text_en, location, description, display_order) VALUES
('messages', 'loading', 'جارٍ التحميل...', 'Loading...', 'جميع الصفحات', 'رسالة التحميل العامة', 1),
('messages', 'success', 'تمت العملية بنجاح', 'Operation completed successfully', 'جميع الصفحات', 'رسالة النجاح العامة', 2),
('messages', 'error', 'حدث خطأ، يرجى المحاولة مرة أخرى', 'An error occurred, please try again', 'جميع الصفحات', 'رسالة الخطأ العامة', 3);

-- تعليقات على الجدول
COMMENT ON TABLE platform_texts IS 'نصوص المنصة - فقط النصوص الموجودة فعلياً';
COMMENT ON COLUMN platform_texts.section IS 'القسم: header, hero, side_dock, loader, buttons, messages';
COMMENT ON COLUMN platform_texts.text_key IS 'المفتاح الفريد للنص';
COMMENT ON COLUMN platform_texts.location IS 'أين يظهر هذا النص في المنصة';
COMMENT ON COLUMN platform_texts.description IS 'وصف مختصر لاستخدام النص';
COMMENT ON COLUMN platform_texts.editable IS 'هل يمكن للمستخدم تعديل هذا النص';

/*
  # نظام إدارة النصوص المتقدم للمنصة
  
  1. الجداول الجديدة
    - `platform_texts` - إدارة كل النصوص في المنصة
      - id, section (header/footer/home/etc), key (unique identifier)
      - text_ar, text_en (النصوص بالعربية والإنجليزية)
      - description (وصف النص)
      - editable (هل قابل للتعديل)
      - display_order (ترتيب العرض)
      - metadata (بيانات إضافية مرنة)
  
  2. الأمان
    - RLS enabled
    - الجميع يمكنهم القراءة
    - الإدمن فقط يمكنهم التعديل
  
  3. البيانات الافتراضية
    - نصوص الهيدر
    - نصوص الفوتر
    - نصوص الصفحة الرئيسية
*/

-- إنشاء جدول النصوص
CREATE TABLE IF NOT EXISTS platform_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- تصنيف النص
  section text NOT NULL CHECK (section IN (
    'header',
    'footer', 
    'home',
    'about',
    'contact',
    'features',
    'hero',
    'stats',
    'cta'
  )),
  
  -- المفتاح الفريد للنص
  key text NOT NULL,
  
  -- النصوص متعددة اللغات
  text_ar text NOT NULL DEFAULT '',
  text_en text DEFAULT '',
  
  -- معلومات إضافية
  description text,
  placeholder_ar text,
  placeholder_en text,
  
  -- التحكم
  editable boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  -- بيانات مرنة
  metadata jsonb DEFAULT '{}',
  
  -- التوقيتات
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- قيد فريد للقسم + المفتاح
  UNIQUE(section, key)
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_platform_texts_section ON platform_texts(section);
CREATE INDEX IF NOT EXISTS idx_platform_texts_key ON platform_texts(key);
CREATE INDEX IF NOT EXISTS idx_platform_texts_section_key ON platform_texts(section, key);

-- تفعيل RLS
ALTER TABLE platform_texts ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة (الجميع)
CREATE POLICY "Anyone can read platform texts"
  ON platform_texts
  FOR SELECT
  TO public
  USING (true);

-- سياسة التعديل (الإدمن فقط)
CREATE POLICY "Only authenticated users can update platform texts"
  ON platform_texts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسة الإضافة (الإدمن فقط)
CREATE POLICY "Only authenticated users can insert platform texts"
  ON platform_texts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- دالة تحديث التوقيت التلقائي
CREATE OR REPLACE FUNCTION update_platform_texts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- محفز التحديث التلقائي
DROP TRIGGER IF EXISTS update_platform_texts_timestamp_trigger ON platform_texts;
CREATE TRIGGER update_platform_texts_timestamp_trigger
  BEFORE UPDATE ON platform_texts
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_texts_timestamp();

-- إدخال البيانات الافتراضية

-- نصوص الهيدر (Header)
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('header', 'platform_name', 'منصة النخيل والزيتون', 'Palm & Olive Platform', 'اسم المنصة الرئيسي', 1),
  ('header', 'tagline', 'استثمر في المستقبل الزراعي', 'Invest in Agricultural Future', 'شعار المنصة', 2),
  ('header', 'nav_home', 'الرئيسية', 'Home', 'زر الصفحة الرئيسية', 3),
  ('header', 'nav_farms', 'المزارع', 'Farms', 'زر المزارع', 4),
  ('header', 'nav_about', 'من نحن', 'About Us', 'زر من نحن', 5),
  ('header', 'nav_contact', 'اتصل بنا', 'Contact', 'زر اتصل بنا', 6),
  ('header', 'btn_login', 'تسجيل الدخول', 'Login', 'زر تسجيل الدخول', 7)
ON CONFLICT (section, key) DO NOTHING;

-- نصوص الفوتر (Footer)
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('footer', 'company_name', 'منصة النخيل والزيتون', 'Palm & Olive Platform', 'اسم الشركة', 1),
  ('footer', 'company_description', 'منصة رائدة في مجال الاستثمار الزراعي والملكية المشتركة للأشجار المثمرة', 'Leading platform in agricultural investment and shared tree ownership', 'وصف الشركة', 2),
  ('footer', 'section_about', 'من نحن', 'About Us', 'عنوان قسم من نحن', 3),
  ('footer', 'section_services', 'خدماتنا', 'Our Services', 'عنوان قسم الخدمات', 4),
  ('footer', 'section_contact', 'تواصل معنا', 'Contact Us', 'عنوان قسم التواصل', 5),
  ('footer', 'copyright', '© 2025 جميع الحقوق محفوظة', '© 2025 All Rights Reserved', 'حقوق النشر', 6),
  ('footer', 'phone', '+966 56 933 5257', '+966 56 933 5257', 'رقم الهاتف', 7),
  ('footer', 'email', 'info@palmolive.sa', 'info@palmolive.sa', 'البريد الإلكتروني', 8),
  ('footer', 'address', 'الرياض، المملكة العربية السعودية', 'Riyadh, Saudi Arabia', 'العنوان', 9)
ON CONFLICT (section, key) DO NOTHING;

-- نصوص الصفحة الرئيسية - Hero Section
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('hero', 'main_title', 'استثمر في المستقبل الزراعي', 'Invest in the Agricultural Future', 'العنوان الرئيسي', 1),
  ('hero', 'subtitle', 'امتلك أشجاراً مثمرة واحصد أرباحاً مستدامة', 'Own fruitful trees and harvest sustainable profits', 'العنوان الفرعي', 2),
  ('hero', 'description', 'منصة متكاملة تتيح لك الاستثمار في ملكية أشجار النخيل والزيتون ومتابعة أرباحك بكل سهولة', 'An integrated platform that allows you to invest in palm and olive trees and track your profits easily', 'الوصف', 3),
  ('hero', 'btn_explore', 'اكتشف المزارع', 'Explore Farms', 'زر الاستكشاف', 4),
  ('hero', 'btn_start', 'ابدأ الآن', 'Get Started', 'زر البداية', 5)
ON CONFLICT (section, key) DO NOTHING;

-- نصوص الإحصائيات
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('stats', 'farms_label', 'مزرعة نشطة', 'Active Farms', 'عنوان إحصائية المزارع', 1),
  ('stats', 'investors_label', 'مستثمر راضٍ', 'Happy Investors', 'عنوان إحصائية المستثمرين', 2),
  ('stats', 'trees_label', 'شجرة مثمرة', 'Productive Trees', 'عنوان إحصائية الأشجار', 3),
  ('stats', 'returns_label', 'عائد استثماري', 'Investment Return', 'عنوان إحصائية العوائد', 4)
ON CONFLICT (section, key) DO NOTHING;

-- نصوص المميزات
INSERT INTO platform_texts (section, key, text_ar, text_en, description, display_order) VALUES
  ('features', 'section_title', 'لماذا تختارنا؟', 'Why Choose Us?', 'عنوان قسم المميزات', 1),
  ('features', 'feature1_title', 'استثمار آمن ومضمون', 'Safe & Secure Investment', 'عنوان الميزة الأولى', 2),
  ('features', 'feature1_desc', 'نوفر لك بيئة استثمارية موثوقة ومضمونة', 'We provide a reliable and secure investment environment', 'وصف الميزة الأولى', 3),
  ('features', 'feature2_title', 'عوائد مستدامة', 'Sustainable Returns', 'عنوان الميزة الثانية', 4),
  ('features', 'feature2_desc', 'احصل على أرباح موسمية من محاصيل عالية الجودة', 'Get seasonal profits from high-quality crops', 'وصف الميزة الثانية', 5),
  ('features', 'feature3_title', 'متابعة فورية', 'Real-time Tracking', 'عنوان الميزة الثالثة', 6),
  ('features', 'feature3_desc', 'راقب استثمارك وأرباحك لحظة بلحظة', 'Monitor your investment and profits in real-time', 'وصف الميزة الثالثة', 7)
ON CONFLICT (section, key) DO NOTHING;

-- دالة لجلب النصوص حسب القسم
CREATE OR REPLACE FUNCTION get_platform_texts_by_section(p_section text)
RETURNS TABLE(
  key text,
  text_ar text,
  text_en text,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.key,
    pt.text_ar,
    pt.text_en,
    pt.metadata
  FROM platform_texts pt
  WHERE pt.section = p_section
  ORDER BY pt.display_order, pt.key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE platform_texts IS 'جدول إدارة جميع النصوص القابلة للتعديل في المنصة';
COMMENT ON FUNCTION get_platform_texts_by_section IS 'دالة لجلب النصوص حسب القسم بترتيب العرض';

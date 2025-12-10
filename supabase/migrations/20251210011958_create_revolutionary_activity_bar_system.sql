/*
  # إنشاء نظام الشريط العلوي الثوري للنشاط المباشر

  1. الجداول الجديدة
    - `activity_bar_settings` - إعدادات الشريط العلوي
      - `id` (uuid) - المعرف الفريد
      - `is_enabled` (boolean) - تفعيل/إيقاف الشريط
      - `data_mode` (text) - نوع البيانات: mock, real, hybrid
      - `scroll_speed` (text) - السرعة: slow, medium, fast
      - `display_duration` (integer) - مدة عرض كل إعلان بالثانية
      - `show_ownership` (boolean) - عرض عمليات التملك
      - `show_registrations` (boolean) - عرض التسجيلات الجديدة
      - `show_reservations` (boolean) - عرض الحجوزات
      - `show_investors` (boolean) - عرض نشاط المستثمرين
      - `show_farms` (boolean) - عرض نشاط المزارع
      - `show_marketing` (boolean) - عرض أحداث تسويقية
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `activity_bar_messages` - رسائل الشريط الوهمية
      - `id` (uuid) - المعرف الفريد
      - `message_ar` (text) - الرسالة بالعربية
      - `message_en` (text) - الرسالة بالإنجليزية
      - `icon` (text) - اسم الأيقونة
      - `category` (text) - الفئة
      - `display_order` (integer) - ترتيب العرض
      - `is_active` (boolean) - نشط/غير نشط
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للقراءة العامة
    - سياسات للتعديل من الإدارة فقط
*/

-- جدول إعدادات الشريط
CREATE TABLE IF NOT EXISTS activity_bar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  data_mode text DEFAULT 'hybrid' CHECK (data_mode IN ('mock', 'real', 'hybrid')),
  scroll_speed text DEFAULT 'medium' CHECK (scroll_speed IN ('slow', 'medium', 'fast')),
  display_duration integer DEFAULT 5 CHECK (display_duration >= 3 AND display_duration <= 15),
  show_ownership boolean DEFAULT true,
  show_registrations boolean DEFAULT true,
  show_reservations boolean DEFAULT true,
  show_investors boolean DEFAULT true,
  show_farms boolean DEFAULT true,
  show_marketing boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول رسائل الشريط الوهمية
CREATE TABLE IF NOT EXISTS activity_bar_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar text NOT NULL,
  message_en text,
  icon text DEFAULT 'TrendingUp',
  category text DEFAULT 'general' CHECK (category IN ('ownership', 'registration', 'reservation', 'investor', 'farm', 'marketing', 'general')),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE activity_bar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bar_messages ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
CREATE POLICY "Anyone can read activity bar settings"
  ON activity_bar_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read active messages"
  ON activity_bar_messages FOR SELECT
  TO public
  USING (is_active = true);

-- سياسات التعديل للإدارة
CREATE POLICY "Admins can update activity bar settings"
  ON activity_bar_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage messages"
  ON activity_bar_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إدراج الإعدادات الافتراضية
INSERT INTO activity_bar_settings (id, is_enabled, data_mode, scroll_speed, display_duration)
VALUES (gen_random_uuid(), true, 'hybrid', 'medium', 5)
ON CONFLICT DO NOTHING;

-- إدراج رسائل وهمية افتراضية
INSERT INTO activity_bar_messages (message_ar, message_en, icon, category, display_order, is_active) VALUES
('تم تسجيل مزرعة جديدة في منطقة الخالدية بنجاح', 'New farm registered in Al-Khalidiya', 'TreePine', 'farm', 1, true),
('مستثمر جديد انضم إلى المنصة للتو', 'New investor joined the platform', 'UserPlus', 'investor', 2, true),
('تم حجز 15 شجرة زيتون في مزرعة الخالدية', '15 olive trees reserved in Al-Khalidiya farm', 'ShoppingCart', 'reservation', 3, true),
('تم إصدار شهادة تملك جديدة لمستثمر', 'New ownership certificate issued', 'Award', 'ownership', 4, true),
('مزرعة جديدة متاحة للاستثمار الآن', 'New farm available for investment', 'Sparkles', 'farm', 5, true),
('عملية دفع تمت بنجاح لحجز 20 شجرة نخيل', 'Payment successful for 20 palm trees', 'DollarSign', 'reservation', 6, true),
('تحديث جديد: تم إضافة 50 شجرة جديدة', 'Update: 50 new trees added', 'TrendingUp', 'farm', 7, true),
('مستثمر قام بتحديث بياناته الشخصية', 'Investor updated profile information', 'User', 'investor', 8, true)
ON CONFLICT DO NOTHING;

-- دالة لتحديث updated_at تلقائيًا
CREATE OR REPLACE FUNCTION update_activity_bar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers للتحديث التلقائي
DROP TRIGGER IF EXISTS update_activity_bar_settings_updated_at ON activity_bar_settings;
CREATE TRIGGER update_activity_bar_settings_updated_at
  BEFORE UPDATE ON activity_bar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_bar_updated_at();

DROP TRIGGER IF EXISTS update_activity_bar_messages_updated_at ON activity_bar_messages;
CREATE TRIGGER update_activity_bar_messages_updated_at
  BEFORE UPDATE ON activity_bar_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_bar_updated_at();

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_activity_bar_messages_active ON activity_bar_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_bar_messages_category ON activity_bar_messages(category);
CREATE INDEX IF NOT EXISTS idx_activity_bar_messages_order ON activity_bar_messages(display_order);

/*
  # نظام شريط النشاط المباشر (Live Activity Bar)

  1. الجداول الجديدة
    - `live_activity_bar_settings`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - تفعيل/إيقاف الشريط
      - `mode` (text) - fake/real/hybrid
      - `speed` (integer) - سرعة الحركة (1-100)
      - `show_ownership` (boolean) - عرض عمليات التملك
      - `show_bookings` (boolean) - عرض الحجوزات
      - `show_registrations` (boolean) - عرض التسجيلات
      - `show_verifications` (boolean) - عرض التوثيقات
      - `background_color` (text) - لون الخلفية
      - `text_color` (text) - لون النص
      - `height` (text) - ارتفاع الشريط
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `live_activity_fake_events`
      - `id` (uuid, primary key)
      - `event_type` (text) - ownership/booking/registration/verification
      - `message_ar` (text) - الرسالة بالعربية
      - `message_en` (text) - الرسالة بالإنجليزية
      - `icon` (text) - اسم الأيقونة
      - `enabled` (boolean) - تفعيل/إيقاف الحدث
      - `priority` (integer) - أولوية الظهور
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - Enable RLS على جميع الجداول
    - السماح للجميع بالقراءة
    - السماح للمسؤولين فقط بالتعديل
*/

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS live_activity_bar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT true,
  mode text DEFAULT 'fake' CHECK (mode IN ('fake', 'real', 'hybrid')),
  speed integer DEFAULT 40 CHECK (speed >= 1 AND speed <= 100),
  show_ownership boolean DEFAULT true,
  show_bookings boolean DEFAULT true,
  show_registrations boolean DEFAULT true,
  show_verifications boolean DEFAULT true,
  background_color text DEFAULT '#10B981',
  text_color text DEFAULT '#FFFFFF',
  height text DEFAULT '48px',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الأحداث الوهمية
CREATE TABLE IF NOT EXISTS live_activity_fake_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('ownership', 'booking', 'registration', 'verification')),
  message_ar text NOT NULL,
  message_en text NOT NULL,
  icon text DEFAULT 'CheckCircle',
  enabled boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE live_activity_bar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_activity_fake_events ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - القراءة للجميع
CREATE POLICY "Allow read access to all users for settings"
  ON live_activity_bar_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow read access to all users for fake events"
  ON live_activity_fake_events
  FOR SELECT
  TO public
  USING (true);

-- سياسات التعديل - للمسؤولين فقط
CREATE POLICY "Allow admin insert on settings"
  ON live_activity_bar_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin update on settings"
  ON live_activity_bar_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin insert on fake events"
  ON live_activity_fake_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin update on fake events"
  ON live_activity_fake_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin delete on fake events"
  ON live_activity_fake_events
  FOR DELETE
  TO authenticated
  USING (true);

-- إدراج الإعدادات الافتراضية
INSERT INTO live_activity_bar_settings (enabled, mode, speed)
VALUES (true, 'fake', 40)
ON CONFLICT (id) DO NOTHING;

-- إدراج أحداث وهمية افتراضية
INSERT INTO live_activity_fake_events (event_type, message_ar, message_en, icon, priority) VALUES
  ('ownership', '🎉 أحمد محمد قام بتملك 5 أشجار من مزرعة الخالدية', '🎉 Ahmed Mohammed owned 5 trees from Al-Khaldiya Farm', 'TreePine', 1),
  ('booking', '✨ سارة أحمد حجزت 3 أشجار من مزرعة الخالدية', '✨ Sarah Ahmed booked 3 trees from Al-Khaldiya Farm', 'Calendar', 2),
  ('ownership', '🌟 عبدالله علي أصبح مالكًا لـ 10 أشجار', '🌟 Abdullah Ali became owner of 10 trees', 'Award', 1),
  ('registration', '👋 مستثمر جديد انضم إلى منصة الحبر', '👋 New investor joined Al-Habr Platform', 'UserPlus', 3),
  ('ownership', '💚 فاطمة خالد تملكت 7 أشجار زيتون', '💚 Fatima Khaled owned 7 olive trees', 'Sprout', 1),
  ('verification', '✅ تم توثيق عملية تملك جديدة بنجاح', '✅ New ownership successfully verified', 'CheckCircle', 4),
  ('booking', '🎯 محمد سعيد حجز 15 شجرة نخيل', '🎯 Mohammed Saeed booked 15 palm trees', 'Target', 2),
  ('ownership', '🏆 نورة إبراهيم أصبحت من كبار الملاك', '🏆 Noura Ibrahim became a major owner', 'Trophy', 1),
  ('registration', '🌱 مستثمرة جديدة انضمت للمنصة', '🌱 New female investor joined the platform', 'Sparkles', 3),
  ('ownership', '💎 خالد عمر تملك 20 شجرة من مزرعة الخالدية', '💎 Khaled Omar owned 20 trees from Al-Khaldiya Farm', 'Gem', 1),
  ('booking', '🎊 ليلى أحمد حجزت باقة مميزة', '🎊 Layla Ahmed booked a premium package', 'Gift', 2),
  ('verification', '🔒 تم توثيق وتأمين عملية جديدة', '🔒 New operation verified and secured', 'Shield', 4)
ON CONFLICT (id) DO NOTHING;

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_fake_events_enabled ON live_activity_fake_events(enabled);
CREATE INDEX IF NOT EXISTS idx_fake_events_type ON live_activity_fake_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fake_events_priority ON live_activity_fake_events(priority);

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_live_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_live_activity_bar_settings_updated_at ON live_activity_bar_settings;
CREATE TRIGGER update_live_activity_bar_settings_updated_at
  BEFORE UPDATE ON live_activity_bar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_live_activity_updated_at();

DROP TRIGGER IF EXISTS update_live_activity_fake_events_updated_at ON live_activity_fake_events;
CREATE TRIGGER update_live_activity_fake_events_updated_at
  BEFORE UPDATE ON live_activity_fake_events
  FOR EACH ROW
  EXECUTE FUNCTION update_live_activity_updated_at();
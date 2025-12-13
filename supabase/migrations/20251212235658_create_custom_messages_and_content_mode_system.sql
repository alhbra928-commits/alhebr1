/*
  # نظام الرسائل المخصصة وخيارات المحتوى

  1. جدول الرسائل المخصصة
    - `id` (uuid, primary key)
    - `message_ar` (text) - الرسالة بالعربي
    - `message_en` (text) - الرسالة بالإنجليزي
    - `icon` (text) - اسم الأيقونة
    - `is_active` (boolean) - مفعل/معطل
    - `priority` (integer) - الأولوية
    - `created_at` (timestamptz)

  2. تحديث جدول الإعدادات
    - `content_mode` (text) - مصدر المحتوى (auto/manual/both)
    - `auto_update_interval` (integer) - فترة تحديث البيانات التلقائية

  3. Security
    - RLS policies للتحكم بالصلاحيات
*/

-- جدول الرسائل المخصصة
CREATE TABLE IF NOT EXISTS live_activity_custom_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar text NOT NULL,
  message_en text,
  icon text DEFAULT 'Sparkles' CHECK (icon IN ('ShoppingCart', 'Award', 'TreePine', 'Sparkles', 'TrendingUp', 'Users', 'Zap', 'Star')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إضافة حقول جديدة للإعدادات
ALTER TABLE live_activity_settings
ADD COLUMN IF NOT EXISTS content_mode text DEFAULT 'auto' CHECK (content_mode IN ('auto', 'manual', 'both')),
ADD COLUMN IF NOT EXISTS auto_update_interval integer DEFAULT 30 CHECK (auto_update_interval BETWEEN 5 AND 300),
ADD COLUMN IF NOT EXISTS show_timestamps boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_animations boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS duplicate_content boolean DEFAULT true;

-- تحديث القيم الافتراضية
UPDATE live_activity_settings
SET 
  content_mode = COALESCE(content_mode, 'auto'),
  auto_update_interval = COALESCE(auto_update_interval, 30),
  show_timestamps = COALESCE(show_timestamps, false),
  enable_animations = COALESCE(enable_animations, true),
  duplicate_content = COALESCE(duplicate_content, true);

-- RLS للرسائل المخصصة
ALTER TABLE live_activity_custom_messages ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للجميع
CREATE POLICY "Anyone can view active custom messages"
  ON live_activity_custom_messages
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- السماح بالإدراج والتعديل للمسؤولين
CREATE POLICY "Admins can insert custom messages"
  ON live_activity_custom_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update custom messages"
  ON live_activity_custom_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete custom messages"
  ON live_activity_custom_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_custom_messages_active 
  ON live_activity_custom_messages(is_active, priority DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_custom_messages_priority 
  ON live_activity_custom_messages(priority DESC, created_at DESC);

-- إدراج رسائل تجريبية
INSERT INTO live_activity_custom_messages (message_ar, message_en, icon, is_active, priority) VALUES
  ('مرحباً بكم في منصة مزاد للاستثمار الزراعي', 'Welcome to Mazad Agricultural Investment Platform', 'Sparkles', true, 10),
  ('استثمر في المزارع المستدامة وحقق أرباحاً مضمونة', 'Invest in sustainable farms and achieve guaranteed profits', 'TrendingUp', true, 9),
  ('شهادات التملك الرقمية متاحة الآن', 'Digital ownership certificates now available', 'Award', true, 8),
  ('انضم لآلاف المستثمرين الناجحين', 'Join thousands of successful investors', 'Users', true, 7)
ON CONFLICT DO NOTHING;

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_custom_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_custom_message_timestamp
  BEFORE UPDATE ON live_activity_custom_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_message_updated_at();

-- إضافة Comment
COMMENT ON TABLE live_activity_custom_messages IS 'الرسائل المخصصة لشريط النشاط المباشر';
COMMENT ON COLUMN live_activity_settings.content_mode IS 'مصدر المحتوى: auto (تلقائي), manual (يدوي), both (كلاهما)';

/*
  # نظام إدارة الشريط المتحرك الحي

  1. New Tables:
    - `ticker_messages`
      - `id` (uuid, primary key)
      - `message_ar` (text) - الرسالة بالعربية
      - `message_type` (text) - نوع الرسالة: 'activity', 'alert', 'stat'
      - `icon` (text) - الأيقونة
      - `is_active` (boolean) - تفعيل/تعطيل
      - `priority` (integer) - ترتيب الظهور
      - `display_duration` (integer) - مدة الظهور (بالثواني) - اختياري
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `deleted_at` (timestamptz) - soft delete

  2. Security:
    - Enable RLS
    - Public can read active messages
    - Only admins can manage messages

  3. Functions:
    - Auto-update updated_at timestamp
*/

-- ==================================================
-- 1. إنشاء جدول ticker_messages
-- ==================================================

CREATE TABLE IF NOT EXISTS ticker_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_ar text NOT NULL,
  message_type text NOT NULL DEFAULT 'activity',
  icon text NOT NULL DEFAULT '✨',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  display_duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,

  -- Constraints
  CONSTRAINT valid_message_type CHECK (message_type IN ('activity', 'alert', 'stat', 'custom')),
  CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 100)
);

-- ==================================================
-- 2. Indexes للأداء
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_ticker_messages_active ON ticker_messages(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ticker_messages_priority ON ticker_messages(priority DESC) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_ticker_messages_created ON ticker_messages(created_at DESC) WHERE deleted_at IS NULL;

-- ==================================================
-- 3. Function لتحديث updated_at تلقائياً
-- ==================================================

CREATE OR REPLACE FUNCTION update_ticker_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. Trigger للتحديث التلقائي
-- ==================================================

DROP TRIGGER IF EXISTS trigger_update_ticker_messages_updated_at ON ticker_messages;

CREATE TRIGGER trigger_update_ticker_messages_updated_at
  BEFORE UPDATE ON ticker_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticker_messages_updated_at();

-- ==================================================
-- 5. Enable RLS
-- ==================================================

ALTER TABLE ticker_messages ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- 6. RLS Policies
-- ==================================================

-- Public can read active messages
DROP POLICY IF EXISTS "Anyone can read active ticker messages" ON ticker_messages;
CREATE POLICY "Anyone can read active ticker messages"
  ON ticker_messages FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND is_active = true);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage ticker messages" ON ticker_messages;
CREATE POLICY "Admins can manage ticker messages"
  ON ticker_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==================================================
-- 7. إضافة رسائل افتراضية للاختبار
-- ==================================================

INSERT INTO ticker_messages (message_ar, message_type, icon, is_active, priority)
VALUES
  ('مرحباً بك في منصة تأجير المزارع الموسمي 🌱', 'activity', '👋', true, 100),
  ('استأجر الآن من أرقى المزارع المتاحة ✨', 'activity', '🌾', true, 90),
  ('المنصة تدير كل شيء - تأجير موسمي موثق', 'stat', '⚙️', true, 80),
  ('انضم إلى مجتمع المستأجرين اليوم', 'activity', '🤝', true, 70)
ON CONFLICT DO NOTHING;

-- ==================================================
-- 8. Function لحذف ناعم (Soft Delete)
-- ==================================================

CREATE OR REPLACE FUNCTION soft_delete_ticker_message(message_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE ticker_messages
  SET deleted_at = now(), is_active = false, updated_at = now()
  WHERE id = message_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 9. Function لاستعادة رسالة محذوفة
-- ==================================================

CREATE OR REPLACE FUNCTION restore_ticker_message(message_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE ticker_messages
  SET deleted_at = NULL, updated_at = now()
  WHERE id = message_id AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 10. Enable Realtime للجدول
-- ==================================================

ALTER PUBLICATION supabase_realtime ADD TABLE ticker_messages;

-- ==================================================
-- 11. Grant permissions
-- ==================================================

GRANT SELECT ON ticker_messages TO anon, authenticated;
GRANT ALL ON ticker_messages TO authenticated;
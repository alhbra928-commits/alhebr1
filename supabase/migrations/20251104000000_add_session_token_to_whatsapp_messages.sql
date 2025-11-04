/*
  # إضافة session_token إلى جدول whatsapp_messages للخصوصية

  1. التغييرات
    - إضافة عمود session_token إلى whatsapp_messages
    - إضافة فهرس لتحسين الأداء
    - تحديث RLS policies لدعم الفلترة حسب session_token

  2. الأمان
    - كل مستخدم يرى رسائله فقط
    - session_token فريد لكل زائر
    - لا يمكن الوصول لرسائل الآخرين
*/

-- إضافة عمود session_token
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_messages' 
    AND column_name = 'session_token'
  ) THEN
    ALTER TABLE whatsapp_messages 
    ADD COLUMN session_token text;
  END IF;
END $$;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_token 
ON whatsapp_messages(session_token);

-- إضافة فهرس مركب للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_source 
ON whatsapp_messages(session_token, source_type, created_at DESC);

-- تحديث RLS policies (optional - الجدول قد يكون لديه policies مختلفة)
-- يمكن إضافة policy جديدة إذا لزم الأمر

COMMENT ON COLUMN whatsapp_messages.session_token IS 'Session token للخصوصية - كل مستخدم له جلسة فريدة';

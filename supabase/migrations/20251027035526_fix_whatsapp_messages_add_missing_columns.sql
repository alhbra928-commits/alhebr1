/*
  # إضافة أعمدة مفقودة لجدول whatsapp_messages
  
  1. التغييرات
    - إضافة source_type (smart_button, whatsapp, api, etc)
    - إضافة metadata (jsonb)
    - إضافة فهارس للأداء
    
  2. الأمان
    - لا يؤثر على البيانات الموجودة
*/

-- Add missing columns
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_source_type 
  ON whatsapp_messages(source_type);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_recipient_source 
  ON whatsapp_messages(recipient_phone, source_type);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction_status 
  ON whatsapp_messages(direction, status);

-- Add check constraint for source_type
ALTER TABLE whatsapp_messages
DROP CONSTRAINT IF EXISTS whatsapp_messages_source_type_check;

ALTER TABLE whatsapp_messages
ADD CONSTRAINT whatsapp_messages_source_type_check 
  CHECK (source_type IN ('whatsapp', 'smart_button', 'api', 'web', 'automation'));
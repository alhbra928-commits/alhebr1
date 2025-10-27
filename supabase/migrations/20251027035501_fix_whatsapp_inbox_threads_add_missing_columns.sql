/*
  # إضافة أعمدة مفقودة لجدول whatsapp_inbox_threads
  
  1. التغييرات
    - إضافة source_type (smart_button, whatsapp, etc)
    - إضافة metadata (jsonb)
    - إضافة فهارس للأداء
    
  2. الأمان
    - لا يؤثر على البيانات الموجودة
*/

-- Add missing columns
ALTER TABLE whatsapp_inbox_threads 
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_inbox_threads_source_type 
  ON whatsapp_inbox_threads(source_type);

CREATE INDEX IF NOT EXISTS idx_whatsapp_inbox_threads_user_phone_source 
  ON whatsapp_inbox_threads(user_phone, source_type);

-- Add check constraint for source_type
ALTER TABLE whatsapp_inbox_threads
DROP CONSTRAINT IF EXISTS whatsapp_inbox_threads_source_type_check;

ALTER TABLE whatsapp_inbox_threads
ADD CONSTRAINT whatsapp_inbox_threads_source_type_check 
  CHECK (source_type IN ('whatsapp', 'smart_button', 'api', 'web'));
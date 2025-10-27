/*
  # إضافة عمود unhandled_messages

  ## المشكلة:
  - الدالة handle_smart_button_ai_v2 تحاول استخدام عمود unhandled_messages
  - العمود غير موجود في جدول smart_button_stats

  ## الحل:
  - إضافة عمود unhandled_messages
*/

-- إضافة العمود إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'smart_button_stats' AND column_name = 'unhandled_messages'
  ) THEN
    ALTER TABLE smart_button_stats 
    ADD COLUMN unhandled_messages integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- تحديث القيم الحالية
UPDATE smart_button_stats
SET unhandled_messages = 0
WHERE unhandled_messages IS NULL;

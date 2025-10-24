/*
  # إضافة قيد CHECK لعمود status في جدول notifications
  
  1. التغييرات
    - إضافة CHECK constraint لضمان أن status يكون أحد القيم الصحيحة
    - القيم المسموحة: 'unread', 'read', 'archived'
    
  2. الأمان
    - يحمي من إدخال قيم خاطئة مثل 'active'
*/

-- إضافة constraint إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_status_check'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_status_check 
    CHECK (status IN ('unread', 'read', 'archived'));
  END IF;
END $$;

COMMENT ON CONSTRAINT notifications_status_check ON notifications IS 'Ensures status is one of: unread, read, archived';

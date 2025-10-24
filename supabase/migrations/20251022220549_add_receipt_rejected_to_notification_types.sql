/*
  # إضافة نوع receipt_rejected إلى notifications
  
  1. التغييرات
    - إضافة 'receipt_rejected' و 'receipt_verified' إلى قائمة أنواع الإشعارات المسموحة
  
  2. السبب
    - لتمكين إنشاء إشعارات رفض واعتماد الإيصالات
*/

-- Drop existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with receipt types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'booking_created',
    'booking_approved',
    'booking_pending_verification',
    'booking_verified',
    'ownership_completed',
    'booking_documented',
    'payment_received',
    'receipt_rejected',
    'receipt_verified',
    'general'
  ));

COMMENT ON CONSTRAINT notifications_type_check ON notifications IS 'Allowed notification types including receipt statuses';

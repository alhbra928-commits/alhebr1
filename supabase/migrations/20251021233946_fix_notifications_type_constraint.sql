/*
  # إصلاح قيد type في notifications
  
  إضافة جميع أنواع الإشعارات المطلوبة
*/

-- حذف القيد القديم
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- إنشاء القيد الجديد
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'booking_created',
    'booking_approved',
    'booking_pending_verification',
    'booking_verified',
    'booking_confirmed',
    'certificate_issued',
    'payment_received',
    'general'
  ));

-- اختبار: تحديث الحجز
UPDATE reservations
SET booking_status = 'approved', updated_at = now()
WHERE customer_phone = '+966588888888'
  AND booking_status = 'processing'
  AND deleted_at IS NULL;

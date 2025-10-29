/*
  # إضافة rejected و cancelled إلى booking_status constraint
  
  المشكلة:
  - عند رفض الحجز، يحاول النظام وضع booking_status = 'rejected'
  - لكن constraint لا يسمح بهذه القيمة
  - يسبب خطأ: violates check constraint "reservations_booking_status_check"
  
  الحل:
  - إضافة 'rejected' و 'cancelled' إلى القيم المسموحة
*/

-- حذف constraint القديم
ALTER TABLE reservations 
DROP CONSTRAINT IF EXISTS reservations_booking_status_check;

-- إضافة constraint جديد مع جميع القيم المطلوبة
ALTER TABLE reservations 
ADD CONSTRAINT reservations_booking_status_check 
CHECK (
  booking_status = ANY (ARRAY[
    'temporary'::text,
    'pending'::text,
    'approved'::text,
    'rejected'::text,
    'cancelled'::text,
    'pending_verification'::text,
    'verified'::text,
    'ownership_completed'::text,
    'documented'::text
  ])
);

COMMENT ON CONSTRAINT reservations_booking_status_check ON reservations IS 
'Allows: temporary, pending, approved, rejected, cancelled, pending_verification, verified, ownership_completed, documented';

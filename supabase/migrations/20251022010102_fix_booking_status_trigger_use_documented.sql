/*
  # إصلاح trigger الانتقال التلقائي للحالة

  1. المشكلة
    - الـ trigger يستخدم 'certificate_issued' وهي غير موجودة في القيم المسموحة
    - القيم المسموحة: temporary, approved, pending_verification, verified, ownership_completed, documented
    
  2. الحل
    - تحديث trigger ليستخدم 'documented' بدلاً من 'certificate_issued'
    - 'documented' تعني: تم التوثيق وإصدار شهادة التملك
    
  3. سلسلة الحالات الكاملة
    temporary → approved → pending_verification → verified → documented
*/

-- إعادة إنشاء function مع الحالة الصحيحة
CREATE OR REPLACE FUNCTION update_booking_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- عند تغيير payment_status إلى completed، ننقل booking_status إلى documented (إصدار شهادة)
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.booking_status := 'documented';
    RAISE NOTICE '✅ Payment completed - Booking status updated to documented (certificate issued)';
  END IF;

  -- عند تأكيد الحجز من الإدارة
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    IF NEW.booking_status = 'processing' THEN
      NEW.booking_status := 'approved';
      RAISE NOTICE '✅ Booking confirmed - Status updated to approved';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- التأكد من وجود الـ trigger (تم إنشاؤه سابقاً)
-- DROP TRIGGER IF EXISTS booking_status_auto_update ON reservations;
-- CREATE TRIGGER booking_status_auto_update
--   BEFORE UPDATE ON reservations
--   FOR EACH ROW
--   EXECUTE FUNCTION update_booking_status_on_payment();

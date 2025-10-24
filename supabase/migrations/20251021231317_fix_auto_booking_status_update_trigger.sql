/*
  # إصلاح Trigger التحديث التلقائي للحجز
  
  1. المشكلة
    - الـ trigger السابق كان يبحث بـ investor_phone لكن الجدول يستخدم investor_id
    
  2. الحل
    - تحديث الدالة للعمل مع investor_id
    - البحث عن الحجز من خلال investor_id
*/

-- حذف الدالة القديمة
DROP FUNCTION IF EXISTS update_booking_status_after_receipt() CASCADE;

-- إنشاء الدالة المحدثة
CREATE OR REPLACE FUNCTION update_booking_status_after_receipt()
RETURNS TRIGGER AS $$
DECLARE
  v_reservation_id uuid;
  v_current_status text;
  v_phone text;
BEGIN
  -- الحصول على رقم الهاتف من جدول investors
  SELECT phone INTO v_phone
  FROM investors
  WHERE id = NEW.investor_id
    AND deleted_at IS NULL;

  -- البحث عن الحجز المرتبط
  IF v_phone IS NOT NULL THEN
    SELECT id, booking_status INTO v_reservation_id, v_current_status
    FROM reservations
    WHERE customer_phone = v_phone
      AND deleted_at IS NULL
      AND id = NEW.reservation_id
    LIMIT 1;

    -- إذا وُجد الحجز وحالته 'processing'
    IF v_reservation_id IS NOT NULL AND v_current_status = 'processing' THEN
      -- تحديث الحالة إلى 'pending_verification'
      UPDATE reservations
      SET 
        booking_status = 'pending_verification',
        payment_status = 'pending',
        updated_at = now()
      WHERE id = v_reservation_id;
      
      RAISE NOTICE '✅ تم تحديث حالة الحجز % إلى pending_verification', v_reservation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء المشغل (Trigger)
DROP TRIGGER IF EXISTS trigger_update_booking_after_receipt ON payment_receipts;

CREATE TRIGGER trigger_update_booking_after_receipt
  AFTER INSERT ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_status_after_receipt();

COMMENT ON FUNCTION update_booking_status_after_receipt() IS 'تحديث تلقائي لحالة الحجز بعد رفع إيصال السداد (محدث للعمل مع investor_id)';

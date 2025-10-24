/*
  # تفعيل التحديث التلقائي لحالة الحجز بعد رفع الإيصال
  
  1. الهدف
    - تحديث حالة الحجز تلقائياً عند رفع إيصال السداد
    - تفعيل التتبع في الوقت الفعلي (Realtime)
    
  2. الدالة الجديدة
    - `update_booking_status_after_receipt()` - تحدث booking_status إلى 'pending_verification'
    
  3. المشغل (Trigger)
    - يعمل تلقائياً بعد إدراج إيصال جديد في payment_receipts
    
  4. التدفق
    - مستثمر يرفع إيصال → INSERT في payment_receipts
    - Trigger يعمل تلقائياً → يحدث booking_status في reservations
    - Realtime يُرسل تحديث → واجهة المستثمر تتحدث فوراً
    
  5. الحالات المدعومة
    - processing → pending_verification (بعد رفع الإيصال)
    - pending_verification → verified (بعد مراجعة الإدارة)
    - verified → confirmed (بعد التأكيد النهائي)
    - confirmed → certificate_issued (بعد إصدار الشهادة)
*/

-- إنشاء الدالة التي تحدث حالة الحجز تلقائياً
CREATE OR REPLACE FUNCTION update_booking_status_after_receipt()
RETURNS TRIGGER AS $$
DECLARE
  v_reservation_id uuid;
  v_current_status text;
BEGIN
  -- البحث عن الحجز المرتبط بالإيصال
  SELECT id, booking_status INTO v_reservation_id, v_current_status
  FROM reservations
  WHERE customer_phone = NEW.investor_phone
    AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- إذا وُجد الحجز وحالته 'processing'
  IF v_reservation_id IS NOT NULL THEN
    IF v_current_status = 'processing' THEN
      -- تحديث الحالة إلى 'pending_verification'
      UPDATE reservations
      SET 
        booking_status = 'pending_verification',
        payment_status = 'pending',
        updated_at = now()
      WHERE id = v_reservation_id;
      
      RAISE NOTICE 'تم تحديث حالة الحجز % إلى pending_verification', v_reservation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء المشغل (Trigger)
DROP TRIGGER IF EXISTS trigger_update_booking_after_receipt ON payment_receipts;

CREATE TRIGGER trigger_update_booking_after_receipt
  AFTER INSERT ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_status_after_receipt();

-- تفعيل Realtime على جدول reservations
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- إنشاء دالة مساعدة لتحديث الحالة يدوياً من لوحة الإدارة
CREATE OR REPLACE FUNCTION admin_update_booking_status(
  p_reservation_id uuid,
  p_new_status text,
  p_payment_status text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  -- التحقق من صحة الحالة
  IF p_new_status NOT IN ('processing', 'pending_verification', 'verified', 'confirmed', 'certificate_issued') THEN
    RAISE EXCEPTION 'حالة غير صالحة: %', p_new_status;
  END IF;

  -- تحديث الحالة
  UPDATE reservations
  SET 
    booking_status = p_new_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    updated_at = now()
  WHERE id = p_reservation_id
    AND deleted_at IS NULL;

  -- إرجاع النتيجة
  SELECT json_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'new_status', p_new_status,
    'message', 'تم تحديث الحالة بنجاح'
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة للحصول على تاريخ تغييرات الحالة
CREATE OR REPLACE FUNCTION get_booking_status_history(p_reservation_id uuid)
RETURNS json AS $$
DECLARE
  v_history json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'status', booking_status,
      'payment_status', payment_status,
      'updated_at', updated_at
    ) ORDER BY updated_at DESC
  ) INTO v_history
  FROM reservations
  WHERE id = p_reservation_id;

  RETURN COALESCE(v_history, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إضافة تعليقات توضيحية
COMMENT ON FUNCTION update_booking_status_after_receipt() IS 'تحديث تلقائي لحالة الحجز بعد رفع إيصال السداد';
COMMENT ON FUNCTION admin_update_booking_status(uuid, text, text) IS 'تحديث يدوي لحالة الحجز من لوحة الإدارة';
COMMENT ON FUNCTION get_booking_status_history(uuid) IS 'الحصول على تاريخ تغييرات حالة الحجز';

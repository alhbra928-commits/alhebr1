/*
  # تحديث حالة الحجز تلقائياً عند التوثيق
  
  ## المشكلة
  - عند إصدار شهادة توثيق، أحياناً لا يتم تحديث booking_status في الحجز
  - الحجز يبقى ظاهراً في إدارة الحجوزات رغم وجوده في التوثيق
  
  ## الحل
  - إنشاء trigger يُنفّذ عند إضافة documentation
  - يحدّث booking_status تلقائياً إلى 'documented'
  - يضمن الاتساق بين الجدولين
*/

-- ═══════════════════════════════════════════════════════════
-- Function: تحديث حالة الحجز عند التوثيق
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_update_booking_status_on_documentation()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- تحديث حالة الحجز في جدول reservations
  UPDATE reservations
  SET 
    booking_status = 'documented',
    status = 'completed',
    updated_at = NOW()
  WHERE id = NEW.booking_id
  AND deleted_at IS NULL
  AND booking_status != 'documented';  -- تجنب التحديثات غير الضرورية
  
  IF FOUND THEN
    RAISE NOTICE 'Updated reservation % to documented status', NEW.booking_id;
  END IF;
  
  -- تحديث حالة الحجز في جدول bookings (إن وُجد)
  UPDATE bookings
  SET 
    booking_status = 'documented',
    updated_at = NOW()
  WHERE id = NEW.booking_id
  AND deleted_at IS NULL
  AND booking_status != 'documented';
  
  IF FOUND THEN
    RAISE NOTICE 'Updated booking % to documented status', NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_update_booking_status_on_documentation() IS 
'تحديث حالة الحجز تلقائياً إلى documented عند إصدار شهادة التوثيق';

-- ═══════════════════════════════════════════════════════════
-- Trigger: تطبيق التحديث التلقائي
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_auto_update_booking_on_documentation ON documentation;

CREATE TRIGGER trigger_auto_update_booking_on_documentation
AFTER INSERT ON documentation
FOR EACH ROW
EXECUTE FUNCTION auto_update_booking_status_on_documentation();

COMMENT ON TRIGGER trigger_auto_update_booking_on_documentation ON documentation IS 
'يُنفّذ عند إضافة توثيق جديد - يحدّث حالة الحجز إلى documented تلقائياً';

-- ═══════════════════════════════════════════════════════════
-- إصلاح أي حجوزات موجودة لها توثيق لكن حالتها خطأ
-- ═══════════════════════════════════════════════════════════

-- تحديث جميع الحجوزات التي لها توثيق لكن حالتها ليست documented
UPDATE reservations r
SET 
  booking_status = 'documented',
  status = 'completed',
  updated_at = NOW()
WHERE r.deleted_at IS NULL
AND r.booking_status != 'documented'
AND EXISTS (
  SELECT 1 FROM documentation d
  WHERE d.booking_id = r.id
);

-- عرض عدد الحجوزات التي تم تحديثها
DO $$
DECLARE
  v_updated_count INT;
BEGIN
  SELECT COUNT(*) INTO v_updated_count
  FROM reservations r
  WHERE r.deleted_at IS NULL
  AND r.booking_status = 'documented'
  AND EXISTS (
    SELECT 1 FROM documentation d
    WHERE d.booking_id = r.id
  );
  
  RAISE NOTICE 'تم التأكد من تحديث % حجز موثق', v_updated_count;
END $$;

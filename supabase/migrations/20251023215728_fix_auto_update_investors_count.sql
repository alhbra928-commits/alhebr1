/*
  # تحديث عدد المستثمرين تلقائياً في البطاقة المالية
  
  ## المشكلة
  - عدد المستثمرين في smart_farm_finances لا يتم تحديثه تلقائياً
  - القيمة تبقى 0 حتى عند وجود حجوزات موثقة
  
  ## الحل
  - إنشاء trigger يحدّث عدد المستثمرين عند:
    * إضافة حجز جديد
    * تحديث حالة الحجز
    * حذف حجز
*/

-- ═══════════════════════════════════════════════════════════
-- Function: تحديث عدد المستثمرين
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_investors_count()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_code TEXT;
  v_investors_count INT;
BEGIN
  -- الحصول على farm_code
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = COALESCE(NEW.farm_id, OLD.farm_id);
  
  IF v_farm_code IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- حساب عدد المستثمرين (بناءً على رقم الهاتف الفريد)
  SELECT COUNT(DISTINCT customer_phone) INTO v_investors_count
  FROM reservations
  WHERE farm_id = COALESCE(NEW.farm_id, OLD.farm_id)
  AND deleted_at IS NULL
  AND booking_status IN ('verified', 'ownership_completed', 'documented')
  AND customer_phone IS NOT NULL;
  
  -- تحديث البطاقة المالية
  UPDATE smart_farm_finances
  SET 
    total_investors = v_investors_count,
    updated_at = NOW()
  WHERE farm_code = v_farm_code
  AND deleted_at IS NULL;
  
  RAISE NOTICE 'Updated investors count for farm % to %', v_farm_code, v_investors_count;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION update_investors_count() IS 
'تحديث عدد المستثمرين تلقائياً في البطاقة المالية عند تغيير الحجوزات';

-- ═══════════════════════════════════════════════════════════
-- Triggers: تطبيق التحديث التلقائي
-- ═══════════════════════════════════════════════════════════

-- عند إضافة حجز جديد
DROP TRIGGER IF EXISTS trigger_update_investors_count_insert ON reservations;
CREATE TRIGGER trigger_update_investors_count_insert
AFTER INSERT ON reservations
FOR EACH ROW
WHEN (NEW.booking_status IN ('verified', 'ownership_completed', 'documented'))
EXECUTE FUNCTION update_investors_count();

-- عند تحديث حالة الحجز
DROP TRIGGER IF EXISTS trigger_update_investors_count_update ON reservations;
CREATE TRIGGER trigger_update_investors_count_update
AFTER UPDATE ON reservations
FOR EACH ROW
WHEN (
  OLD.booking_status IS DISTINCT FROM NEW.booking_status
  OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
)
EXECUTE FUNCTION update_investors_count();

-- عند حذف حجز (soft delete)
DROP TRIGGER IF EXISTS trigger_update_investors_count_delete ON reservations;
CREATE TRIGGER trigger_update_investors_count_delete
AFTER UPDATE ON reservations
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION update_investors_count();

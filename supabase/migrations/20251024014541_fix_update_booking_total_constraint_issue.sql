/*
  # إصلاح مشكلة constraint في update_booking_total_from_items

  ## المشكلة
  عند حذف آخر booking_item، الـ trigger يحدث:
  - number_of_trees = 0
  - total_amount = 0
  
  لكن هناك constraints:
  - CHECK (number_of_trees > 0)
  - CHECK (total_amount > 0)
  
  مما يسبب خطأ عند الحذف

  ## الحل
  عدم تحديث إذا لم يكن هناك booking_items متبقية
  أو استخدام NULLIF للسماح بالحذف
*/

CREATE OR REPLACE FUNCTION update_booking_total_from_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_price numeric;
  v_total_trees integer;
  v_booking_id uuid;
  v_reservation_id uuid;
  v_items_count integer;
BEGIN
  -- تحديد أي معرف نستخدم
  v_booking_id := COALESCE(NEW.booking_id, OLD.booking_id);
  v_reservation_id := COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  -- إذا كان لدينا booking_id
  IF v_booking_id IS NOT NULL THEN
    -- حساب الإجماليات
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0),
      COUNT(*)
    INTO v_total_price, v_total_trees, v_items_count
    FROM booking_items
    WHERE booking_id = v_booking_id
      AND deleted_at IS NULL;
    
    -- تحديث فقط إذا كان هناك items
    IF v_items_count > 0 THEN
      UPDATE bookings
      SET 
        total_price = v_total_price,
        reserved_trees = v_total_trees,
        updated_at = now()
      WHERE id = v_booking_id
        AND deleted_at IS NULL;
    END IF;
  END IF;
  
  -- إذا كان لدينا reservation_id
  IF v_reservation_id IS NOT NULL THEN
    -- حساب الإجماليات
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0),
      COUNT(*)
    INTO v_total_price, v_total_trees, v_items_count
    FROM booking_items
    WHERE reservation_id = v_reservation_id
      AND deleted_at IS NULL;
    
    -- تحديث فقط إذا كان هناك items
    IF v_items_count > 0 THEN
      UPDATE reservations
      SET 
        total_amount = v_total_price,
        number_of_trees = v_total_trees,
        updated_at = now()
      WHERE id = v_reservation_id
        AND deleted_at IS NULL;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- إعادة تطبيق الـ Trigger
DROP TRIGGER IF EXISTS trigger_update_booking_total ON booking_items;
CREATE TRIGGER trigger_update_booking_total
  AFTER INSERT OR UPDATE OF quantity, subtotal OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_total_from_items();

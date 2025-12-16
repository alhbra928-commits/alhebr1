/*
  # إصلاح trigger حذف المستثمر
  
  1. المشكلة
    - الـ trigger يستخدم PERFORM مع DISTINCT بشكل خاطئ
    - يجب استخدام loop للمرور على كل farm_id
  
  2. الحل
    - إعادة كتابة trigger بشكل صحيح
    - استخدام loop للمرور على المزارع المتأثرة
*/

-- حذف الـ trigger القديم
DROP TRIGGER IF EXISTS trigger_update_finances_on_investor_delete ON investors;

-- إعادة إنشاء الدالة بشكل صحيح
CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_investor_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_farm_id UUID;
BEGIN
  -- المرور على جميع المزارع التي لها حجوزات من هذا المستثمر
  FOR v_farm_id IN 
    SELECT DISTINCT farm_id
    FROM reservations
    WHERE customer_name = OLD.full_name
      AND deleted_at IS NULL
      AND booking_status = 'documented'
  LOOP
    -- إعادة حساب المبالغ المالية لكل مزرعة
    PERFORM recalculate_farm_finances_excluding_deleted(v_farm_id);
  END LOOP;
  
  RETURN OLD;
END;
$$;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_update_finances_on_investor_delete
AFTER UPDATE ON investors
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION trigger_recalc_finances_on_investor_delete();

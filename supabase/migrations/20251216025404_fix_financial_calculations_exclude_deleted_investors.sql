/*
  # إصلاح الحسابات المالية لاستثناء المستثمرين المحذوفين

  1. المشكلة
    - النظام يحسب المبالغ من جميع الحجوزات الموثقة
    - حتى لو تم حذف المستثمر المرتبط بالحجز
    - هذا يؤدي لعرض مبالغ خاطئة في البطاقات المالية

  2. الحل
    - إنشاء دالة جديدة لحساب المبالغ
    - تستثني الحجوزات التي تم حذف مستثمريها
    - تحديث البطاقات المالية تلقائياً

  3. التغييرات
    - دالة recalculate_farm_finances_excluding_deleted
    - trigger لتحديث المبالغ عند تغيير الحجوزات
    - trigger لتحديث المبالغ عند حذف مستثمر
*/

-- دالة لإعادة حساب المبالغ المالية (استثناء المحذوفين)
CREATE OR REPLACE FUNCTION recalculate_farm_finances_excluding_deleted(p_farm_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_collected NUMERIC;
  v_total_investors INTEGER;
BEGIN
  -- حساب المبلغ المحصل فقط من مستثمرين غير محذوفين
  SELECT 
    COALESCE(SUM(r.total_amount), 0),
    COUNT(DISTINCT r.customer_name)
  INTO 
    v_total_collected,
    v_total_investors
  FROM reservations r
  WHERE r.farm_id = p_farm_id
    AND r.deleted_at IS NULL
    AND r.booking_status = 'documented'
    AND EXISTS (
      SELECT 1 FROM investors i 
      WHERE i.full_name = r.customer_name 
        AND i.deleted_at IS NULL
    );

  -- تحديث البطاقة المالية
  UPDATE smart_farm_finances
  SET 
    total_revenue_collected = v_total_collected,
    collected_from_investors = v_total_collected,
    actual_amount = v_total_collected,
    total_investors = v_total_investors,
    platform_profit = v_total_collected * 0.05,
    charity_amount = v_total_collected * 0.01,
    net_platform_profit = v_total_collected * 0.04,
    remaining_for_owner = v_total_collected * 0.94,
    financial_completion_percentage = CASE 
      WHEN marketing_amount > 0 THEN (v_total_collected / marketing_amount * 100)
      ELSE 0 
    END,
    coverage_percentage = CASE 
      WHEN marketing_amount > 0 THEN (v_total_collected / marketing_amount * 100)
      ELSE 0 
    END,
    remaining_amount = marketing_amount - v_total_collected,
    updated_at = NOW()
  WHERE farm_id = p_farm_id
    AND deleted_at IS NULL;
END;
$$;

-- trigger لإعادة الحساب عند تغيير حالة الحجز
CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_reservation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.booking_status = 'documented' THEN
      PERFORM recalculate_farm_finances_excluding_deleted(NEW.farm_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.booking_status = 'documented' THEN
      PERFORM recalculate_farm_finances_excluding_deleted(OLD.farm_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_update_finances_on_reservation ON reservations;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_update_finances_on_reservation
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_recalc_finances_on_reservation_change();

-- trigger لإعادة الحساب عند حذف مستثمر
CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_investor_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إعادة حساب جميع المزارع التي لها حجوزات من هذا المستثمر
  PERFORM recalculate_farm_finances_excluding_deleted(DISTINCT farm_id)
  FROM reservations
  WHERE customer_name = OLD.full_name
    AND deleted_at IS NULL
    AND booking_status = 'documented';
  
  RETURN OLD;
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_update_finances_on_investor_delete ON investors;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_update_finances_on_investor_delete
AFTER UPDATE ON investors
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION trigger_recalc_finances_on_investor_delete();

-- إعادة حساب جميع المزارع الموجودة
DO $$
DECLARE
  v_farm_id UUID;
BEGIN
  FOR v_farm_id IN 
    SELECT DISTINCT farm_id 
    FROM reservations 
    WHERE deleted_at IS NULL 
      AND booking_status = 'documented'
  LOOP
    PERFORM recalculate_farm_finances_excluding_deleted(v_farm_id);
  END LOOP;
END;
$$;

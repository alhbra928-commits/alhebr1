/*
  # إصلاح Trigger الإيرادات - استخدام farm_id بدلاً من farm_code
*/

CREATE OR REPLACE FUNCTION auto_record_investor_revenue()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_investor_name text;
  v_finance_locked boolean;
  v_farm_code text;
BEGIN
  -- جلب farm_code من farms
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = NEW.farm_id;
  
  IF v_farm_code IS NULL THEN
    RAISE NOTICE 'المزرعة غير موجودة';
    RETURN NEW;
  END IF;
  
  -- التحقق من أن البطاقة المالية غير مقفلة
  SELECT COALESCE(investors_locked, false) INTO v_finance_locked
  FROM smart_farm_finances
  WHERE farm_code = v_farm_code;
  
  IF v_finance_locked THEN
    RAISE NOTICE 'المزرعة مقفلة للمستثمرين الجدد';
    RETURN NEW;
  END IF;
  
  -- جلب اسم المستثمر
  SELECT full_name INTO v_investor_name
  FROM investors
  WHERE id = NEW.investor_id;
  
  -- تسجيل المعاملة فقط إذا كان الحجز معتمد
  IF NEW.booking_status = 'approved' AND (OLD IS NULL OR OLD.booking_status != 'approved') THEN
    BEGIN
      v_transaction_id := record_financial_transaction(
        p_farm_code := v_farm_code,
        p_transaction_type := 'investor_revenue',
        p_amount := COALESCE(NEW.total_amount, 0),
        p_description_ar := 'إيراد من حجز: ' || COALESCE(v_investor_name, 'مستثمر') || ' - ' || COALESCE(NEW.number_of_trees, 0) || ' شجرة',
        p_source_type := 'investor',
        p_source_id := NEW.investor_id,
        p_source_name := v_investor_name,
        p_related_reservation_id := NEW.id,
        p_related_investor_id := NEW.investor_id
      );
      
      RAISE NOTICE '✅ تم تسجيل إيراد بقيمة % ريال من %', NEW.total_amount, v_investor_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ خطأ في تسجيل الإيراد: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_record_investor_revenue ON reservations;
CREATE TRIGGER trigger_auto_record_investor_revenue
  AFTER INSERT OR UPDATE OF booking_status, total_amount ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_record_investor_revenue();

/*
  # إصلاح: auto_record_investor_revenue للحصول على farm_code من farms

  1. المشكلة
    - الـ trigger يستخدم NEW.farm_code لكن reservations ليس فيها farm_code
    - reservations فيها farm_id فقط
    - يجب الحصول على farm_code من جدول farms

  2. الحل
    - تعديل auto_record_investor_revenue
    - جلب farm_code من farms باستخدام farm_id
    - التأكد من وجود smart_farm_finances قبل الاستدعاء
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
  v_farm_finance_id uuid;
BEGIN
  -- الحصول على farm_code من farms
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = NEW.farm_id
    AND deleted_at IS NULL;

  IF v_farm_code IS NULL THEN
    RAISE NOTICE 'Farm not found for reservation %', NEW.id;
    RETURN NEW;
  END IF;

  -- التحقق من وجود smart_farm_finances
  SELECT id, COALESCE(investors_locked, false)
  INTO v_farm_finance_id, v_finance_locked
  FROM smart_farm_finances
  WHERE farm_code = v_farm_code
    AND deleted_at IS NULL;

  -- إذا لم يوجد finance record، إنشاءه تلقائياً
  IF v_farm_finance_id IS NULL THEN
    DECLARE
      v_farm_name text;
      v_farm_id uuid;
    BEGIN
      SELECT id, name_ar INTO v_farm_id, v_farm_name
      FROM farms WHERE farm_code = v_farm_code AND deleted_at IS NULL;

      INSERT INTO smart_farm_finances (
        farm_id, farm_code, farm_name,
        marketing_amount, actual_amount, coverage_percentage, remaining_amount,
        platform_profit, charity_amount, net_platform_profit,
        status, completion_stage, settlement_status, system_phase,
        farm_ownership_status, financial_health_status, sync_status,
        total_investors, total_trees_sold, total_transactions,
        total_revenue_collected, financial_completion_percentage,
        created_at, updated_at
      ) VALUES (
        v_farm_id, v_farm_code, v_farm_name,
        0, 0, 0, 0, 0, 0, 0,
        'active', 'collecting', 'collecting', 'phase_1',
        'owner', 'low', 'pending',
        0, 0, 0, 0, 0,
        now(), now()
      )
      RETURNING id INTO v_farm_finance_id;

      v_finance_locked := false;
      RAISE NOTICE 'Auto-created smart_farm_finances for farm %', v_farm_code;
    END;
  END IF;

  -- إذا كانت المالية مغلقة، توقف
  IF v_finance_locked THEN
    RETURN NEW;
  END IF;

  -- الحصول على اسم المستثمر
  SELECT full_name INTO v_investor_name
  FROM investors
  WHERE id = NEW.investor_id;

  -- تسجيل الإيراد عند approved
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
      
      RAISE NOTICE 'Recorded investor revenue transaction: %', v_transaction_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'خطأ في تسجيل الإيراد: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_record_investor_revenue IS 'تسجيل إيراد المستثمر تلقائياً عند اعتماد الحجز - مع إنشاء تلقائي لـ smart_farm_finances';

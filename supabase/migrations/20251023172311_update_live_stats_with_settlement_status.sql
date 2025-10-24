/*
  # تحديث حالة التسوية تلقائياً عند الاكتمال المالي
*/

CREATE OR REPLACE FUNCTION calculate_live_financial_stats(p_farm_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_name text;
  v_actual_amount numeric;
  v_collected numeric;
  v_remaining numeric;
  v_percentage numeric;
  v_status text;
  v_flash_shown boolean;
  v_settlement_status text;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT 
    sf.farm_id,
    sf.farm_name,
    sf.actual_amount,
    sf.completion_flash_shown,
    sf.settlement_status
  INTO v_farm_id, v_farm_name, v_actual_amount, v_flash_shown, v_settlement_status
  FROM smart_farm_finances sf
  WHERE sf.farm_code = p_farm_code;

  IF v_farm_id IS NULL THEN
    RETURN;
  END IF;

  -- حساب المبلغ المجمع
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_collected
  FROM reservations
  WHERE farm_id = v_farm_id
  AND booking_status = 'approved'
  AND deleted_at IS NULL;

  -- حساب المتبقي
  v_remaining := GREATEST(v_actual_amount - v_collected, 0);
  
  -- حساب النسبة المئوية
  IF v_actual_amount > 0 THEN
    v_percentage := (v_collected / v_actual_amount) * 100;
  ELSE
    v_percentage := 0;
  END IF;

  -- تحديد الحالة الصحية المالية
  IF v_percentage >= 100 THEN
    v_status := 'complete';
  ELSIF v_percentage >= 70 THEN
    v_status := 'high';
  ELSIF v_percentage >= 40 THEN
    v_status := 'medium';
  ELSE
    v_status := 'low';
  END IF;

  -- تحديث البيانات
  UPDATE smart_farm_finances
  SET
    collected_from_investors = v_collected,
    remaining_for_owner = v_remaining,
    completion_percentage_visual = v_percentage,
    financial_health_status = v_status,
    completion_flash_shown = CASE 
      WHEN v_percentage >= 100 AND NOT COALESCE(completion_flash_shown, false) 
      THEN true 
      ELSE completion_flash_shown 
    END,
    flash_shown_at = CASE 
      WHEN v_percentage >= 100 AND NOT COALESCE(completion_flash_shown, false) 
      THEN now() 
      ELSE flash_shown_at 
    END,
    -- تحديث حالة التسوية تلقائياً
    settlement_status = CASE
      WHEN v_percentage >= 100 AND v_settlement_status = 'collecting'
      THEN 'ready_for_settlement'
      ELSE v_settlement_status
    END,
    settlement_ready_at = CASE
      WHEN v_percentage >= 100 AND v_settlement_status = 'collecting'
      THEN now()
      ELSE settlement_ready_at
    END,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- إذا وصلنا للاكتمال لأول مرة
  IF v_percentage >= 100 AND NOT v_flash_shown THEN
    -- تسجيل حدث
    INSERT INTO financial_base_log (
      action_type, entity_type, entity_id, entity_code,
      description_ar, new_data, source_module, status
    ) VALUES (
      'financial_update', 'farm', v_farm_id, p_farm_code,
      '🎉 تم بلوغ المبلغ الكامل لصاحب المزرعة – جاهزة للتسوية',
      jsonb_build_object(
        'collected', v_collected,
        'actual_amount', v_actual_amount,
        'percentage', v_percentage,
        'status', 'complete'
      ),
      'finance', 'success'
    );
    
    -- إرسال إشعار للإدارة
    PERFORM create_financial_completion_notification(
      p_farm_code,
      v_farm_name,
      v_collected
    );
    
    -- تهيئة محفظة المستثمرين
    PERFORM initialize_investors_wallet_for_farm(p_farm_code);
  END IF;
END;
$$;

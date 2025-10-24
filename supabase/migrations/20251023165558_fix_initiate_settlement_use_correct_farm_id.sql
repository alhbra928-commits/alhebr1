/*
  # إصلاح دالة initiate_settlement لاستخدام farm_id الصحيح

  1. المشكلة
    - الدالة تستخدم smart_farm_finances.id
    - يجب استخدام farms.id الفعلي
    
  2. الحل
    - استخراج farm_id من جدول farms
    - استخدامه في farm_revenue_snapshots
*/

CREATE OR REPLACE FUNCTION initiate_settlement(
  p_farm_code text,
  p_initiated_by uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_finance_id uuid;
  v_actual_farm_id uuid;
  v_current_status text;
  v_completion_percentage numeric;
BEGIN
  -- Get farm finance info
  SELECT id, settlement_status, COALESCE(financial_completion_percentage, 0)
  INTO v_farm_finance_id, v_current_status, v_completion_percentage
  FROM smart_farm_finances 
  WHERE farm_code = p_farm_code;

  IF v_farm_finance_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'المزرعة غير موجودة');
  END IF;

  -- Get actual farm_id from farms table
  SELECT id INTO v_actual_farm_id
  FROM farms
  WHERE farm_code = p_farm_code;

  IF v_actual_farm_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'المزرعة غير موجودة في جدول المزارع');
  END IF;

  IF v_completion_percentage < 100 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'المزرعة لم تصل إلى الاكتمال المالي بعد', 
      'completion_percentage', v_completion_percentage
    );
  END IF;

  IF v_current_status != 'ready_for_settlement' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'المزرعة في حالة غير مناسبة للتسوية', 
      'current_status', v_current_status
    );
  END IF;

  -- Update settlement status and lock investors
  UPDATE smart_farm_finances SET 
    settlement_status = 'under_review',
    settlement_initiated_at = now(),
    settlement_initiated_by = p_initiated_by,
    investors_locked = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- Record settlement transaction
  PERFORM record_financial_transaction(
    p_farm_code := p_farm_code,
    p_transaction_type := 'settlement_initiated',
    p_amount := 0,
    p_description_ar := 'بدء عملية التسوية المالية - قفل استقبال المستثمرين',
    p_source_type := 'admin',
    p_source_id := p_initiated_by
  );

  -- Create settlement snapshot with CORRECT farm_id
  INSERT INTO farm_revenue_snapshots (
    farm_id, farm_code, total_revenue, total_investors, total_trees_sold,
    completion_percentage, coverage_percentage, marketing_amount, actual_amount,
    remaining_amount, snapshot_reason, metadata
  )
  SELECT 
    v_actual_farm_id, sff.farm_code, 
    COALESCE(sff.total_revenue_collected, 0), 
    COALESCE(sff.total_investors, 0),
    COALESCE(sff.total_trees_sold, 0), 
    COALESCE(sff.financial_completion_percentage, 0),
    COALESCE(sff.coverage_percentage, 0), 
    COALESCE(sff.marketing_amount, 0), 
    COALESCE(sff.actual_amount, 0),
    COALESCE(sff.actual_amount, 0) - COALESCE(sff.total_revenue_collected, 0), 
    'settlement_start',
    jsonb_build_object('initiated_by', p_initiated_by)
  FROM smart_farm_finances sff
  WHERE sff.farm_code = p_farm_code;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'تم بدء عملية التسوية المالية بنجاح', 
    'farm_code', p_farm_code, 
    'new_status', 'under_review'
  );
END;
$$;

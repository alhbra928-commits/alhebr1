/*
  # إصلاح دالة التسوية - استخدام الحالات الصحيحة

  1. Changes
    - تغيير 'settling' إلى 'under_review' (قيمة موجودة في constraint)
    - إزالة استخدام حالات غير موجودة
*/

-- إصلاح دالة التسوية
CREATE OR REPLACE FUNCTION execute_manual_settlement(
  p_farm_code text,
  p_executed_by_id text,
  p_executed_by_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_name text;
  v_owner_id uuid;
  v_owner_name text;
  v_actual_amount numeric;
  v_collected_amount numeric;
  v_wallet_status text;
  v_settlement_status text;
  v_transaction_code text;
  v_audit_code text;
  v_result jsonb;
BEGIN
  -- 1. التحقق من وجود المزرعة
  SELECT 
    f.id, f.name_ar, f.owner_id, 
    COALESCE(o.full_name, 'غير محدد'),
    sff.actual_amount,
    sff.settlement_status
  INTO v_farm_id, v_farm_name, v_owner_id, v_owner_name, v_actual_amount, v_settlement_status
  FROM farms f
  LEFT JOIN farm_owners o ON f.owner_id = o.id
  LEFT JOIN smart_farm_finances sff ON sff.farm_code = f.farm_code
  WHERE f.farm_code = p_farm_code;

  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'المزرعة غير موجودة'
    );
  END IF;

  -- 2. التحقق من حالة التسوية
  IF v_settlement_status NOT IN ('collecting', 'ready_for_settlement') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'المزرعة ليست جاهزة للتسوية - الحالة الحالية: ' || v_settlement_status
    );
  END IF;

  -- 3. الحصول على المبلغ المجمع من المحفظة
  SELECT total_collected, status 
  INTO v_collected_amount, v_wallet_status
  FROM investors_wallet
  WHERE farm_code = p_farm_code;

  IF v_collected_amount IS NULL OR v_collected_amount = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'لا توجد مبالغ مجمعة في محفظة المستثمرين'
    );
  END IF;

  -- 4. التحقق من كفاية المبلغ
  IF v_collected_amount < v_actual_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'المبلغ المجمع غير كافٍ للتسوية',
      'collected', v_collected_amount,
      'required', v_actual_amount
    );
  END IF;

  -- 5. إنشاء كود المعاملة
  v_transaction_code := 'STL-' || p_farm_code || '-' || to_char(now(), 'YYYYMMDDHH24MISS');
  v_audit_code := 'AUD-' || v_transaction_code;

  -- 6. تسجيل معاملة التسوية
  INSERT INTO settlement_transactions (
    transaction_code,
    farm_id,
    farm_code,
    transaction_type,
    amount,
    from_wallet,
    to_wallet,
    executed_by_id,
    executed_by_name,
    execution_method,
    status,
    description_ar,
    description_en,
    metadata,
    completed_at
  ) VALUES (
    v_transaction_code,
    v_farm_id,
    p_farm_code,
    'settlement_to_owner',
    v_actual_amount,
    'investors_wallet',
    'farm_owner_wallet',
    p_executed_by_id,
    p_executed_by_name,
    'manual',
    'completed',
    'تسوية مالية لصاحب المزرعة: ' || v_owner_name,
    'Financial settlement to farm owner: ' || v_owner_name,
    jsonb_build_object(
      'farm_name', v_farm_name,
      'owner_name', v_owner_name,
      'collected_amount', v_collected_amount,
      'actual_amount', v_actual_amount,
      'timestamp', now()
    ),
    now()
  );

  -- 7. تحديث محفظة المستثمرين
  UPDATE investors_wallet
  SET
    total_transferred_to_owner = v_actual_amount,
    status = 'settled',
    is_locked = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 8. تحديث حالة المزرعة مباشرة إلى 'settled'
  UPDATE smart_farm_finances
  SET
    settlement_status = 'settled',
    settlement_executed_at = now(),
    settlement_executed_by_id = p_executed_by_id,
    settlement_executed_by_name = p_executed_by_name,
    farm_ownership_status = 'platform',
    owner_payment_approved = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 9. تسجيل في سجل التدقيق
  INSERT INTO financial_audit_log (
    log_code,
    timestamp,
    action_type,
    entity_type,
    entity_id,
    entity_code,
    from_wallet,
    to_wallet,
    amount,
    executed_by_id,
    executed_by_name,
    description_ar,
    description_en,
    metadata,
    status
  ) VALUES (
    v_audit_code,
    now(),
    'settlement',
    'farm',
    v_farm_id,
    p_farm_code,
    'investors_wallet',
    'farm_owner_wallet',
    v_actual_amount,
    p_executed_by_id,
    p_executed_by_name,
    '✅ تمت التسوية المالية بنجاح - المزرعة: ' || v_farm_name || ' - المالك: ' || v_owner_name,
    '✅ Settlement completed successfully - Farm: ' || v_farm_name || ' - Owner: ' || v_owner_name,
    jsonb_build_object(
      'transaction_code', v_transaction_code,
      'farm_name', v_farm_name,
      'owner_name', v_owner_name,
      'amount', v_actual_amount,
      'timestamp', now()
    ),
    'success'
  );

  -- 10. إرجاع النتيجة
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تمت التسوية المالية بنجاح',
    'transaction_code', v_transaction_code,
    'farm_code', p_farm_code,
    'farm_name', v_farm_name,
    'owner_name', v_owner_name,
    'amount_settled', v_actual_amount,
    'executed_by', p_executed_by_name,
    'executed_at', now()
  );

  RETURN v_result;
END;
$$;

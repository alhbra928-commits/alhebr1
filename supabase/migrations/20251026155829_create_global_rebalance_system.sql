/*
  # نظام إعادة التوازن المالي الشامل - Global Rebalance

  1. حساب الأرصدة الحقيقية من reservations
  2. إعادة بناء جميع المحافظ
  3. تصحيح جميع القيم بناءً على الواقع
*/

-- ═══════════════════════════════════════════════════════════
-- Function: حساب الأرصدة الحقيقية من الحجوزات
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_real_financial_data(p_farm_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_farm_id UUID;
  v_farm_name TEXT;
  v_total_marketing NUMERIC := 0;
  v_total_actual NUMERIC := 0;
  v_total_collected NUMERIC := 0;
  v_total_verified NUMERIC := 0;
  v_total_pending NUMERIC := 0;
  v_total_investors INTEGER := 0;
  v_total_trees INTEGER := 0;
  v_platform_profit NUMERIC := 0;
  v_charity_amount NUMERIC := 0;
  v_net_profit NUMERIC := 0;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT id, name_ar
  INTO v_farm_id, v_farm_name
  FROM farms
  WHERE farm_code = p_farm_code
    AND deleted_at IS NULL;
  
  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Farm not found');
  END IF;
  
  -- حساب البيانات الحقيقية من الحجوزات
  SELECT 
    COALESCE(SUM(r.total_amount), 0),
    COALESCE(SUM(CASE WHEN r.payment_status = 'completed' THEN r.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN r.booking_status = 'verified' THEN r.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN r.payment_status = 'pending' THEN r.total_amount ELSE 0 END), 0),
    COUNT(DISTINCT r.investor_id),
    COALESCE(SUM(r.number_of_trees), 0)
  INTO 
    v_total_marketing,
    v_total_collected,
    v_total_verified,
    v_total_pending,
    v_total_investors,
    v_total_trees
  FROM reservations r
  WHERE r.farm_id = v_farm_id
    AND r.deleted_at IS NULL;
  
  -- حساب السعر الفعلي من بيانات المزرعة
  SELECT 
    COALESCE(total_actual_price, 0)
  INTO v_total_actual
  FROM farms
  WHERE id = v_farm_id;
  
  -- حساب الأرباح
  v_platform_profit := GREATEST(v_total_verified - v_total_actual, 0);
  v_charity_amount := v_platform_profit * 0.25;
  v_net_profit := v_platform_profit - v_charity_amount;
  
  -- بناء النتيجة
  v_result := jsonb_build_object(
    'farm_code', p_farm_code,
    'farm_name', v_farm_name,
    'total_marketing_price', v_total_marketing,
    'total_actual_price', v_total_actual,
    'total_revenue_collected', v_total_collected,
    'total_verified', v_total_verified,
    'total_pending', v_total_pending,
    'platform_profit', v_platform_profit,
    'charity_amount', v_charity_amount,
    'net_platform_profit', v_net_profit,
    'total_investors', v_total_investors,
    'total_trees_sold', v_total_trees,
    'financial_completion_percentage', 
      CASE 
        WHEN v_total_marketing > 0 THEN (v_total_verified / v_total_marketing * 100)
        ELSE 0
      END
  );
  
  RETURN v_result;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- Function: Global Rebalance - إعادة التوازن الشامل
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION execute_global_financial_rebalance()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_farm_record RECORD;
  v_real_data JSONB;
  v_corrections_count INTEGER := 0;
  v_total_platform_profit NUMERIC := 0;
  v_total_charity NUMERIC := 0;
  v_audit_id UUID;
BEGIN
  -- إنشاء سجل مراجعة
  INSERT INTO finance_audit_log (
    audit_type,
    audit_status,
    audit_notes,
    audited_by
  ) VALUES (
    'recovery',
    'in_progress',
    'Global Financial Rebalance - إعادة حساب جميع الأرصدة من الصفر',
    'system_rebalance'
  )
  RETURNING id INTO v_audit_id;
  
  -- المرور على كل المزارع
  FOR v_farm_record IN 
    SELECT DISTINCT farm_code
    FROM farms
    WHERE deleted_at IS NULL
  LOOP
    -- حساب البيانات الحقيقية
    v_real_data := calculate_real_financial_data(v_farm_record.farm_code);
    
    -- تحديث smart_farm_finances
    INSERT INTO smart_farm_finances (
      farm_id,
      farm_code,
      farm_name,
      marketing_amount,
      actual_amount,
      total_revenue_collected,
      platform_profit,
      charity_amount,
      net_platform_profit,
      total_investors,
      total_trees_sold,
      financial_completion_percentage,
      coverage_percentage,
      remaining_amount,
      status,
      completion_stage,
      settlement_status,
      system_phase,
      farm_ownership_status,
      financial_health_status,
      sync_status,
      created_at,
      updated_at
    )
    SELECT
      (SELECT id FROM farms WHERE farm_code = v_farm_record.farm_code LIMIT 1),
      v_farm_record.farm_code,
      v_real_data->>'farm_name',
      (v_real_data->>'total_marketing_price')::NUMERIC,
      (v_real_data->>'total_actual_price')::NUMERIC,
      (v_real_data->>'total_revenue_collected')::NUMERIC,
      (v_real_data->>'platform_profit')::NUMERIC,
      (v_real_data->>'charity_amount')::NUMERIC,
      (v_real_data->>'net_platform_profit')::NUMERIC,
      (v_real_data->>'total_investors')::INTEGER,
      (v_real_data->>'total_trees_sold')::INTEGER,
      (v_real_data->>'financial_completion_percentage')::NUMERIC,
      CASE 
        WHEN (v_real_data->>'total_marketing_price')::NUMERIC > 0 
        THEN ((v_real_data->>'total_revenue_collected')::NUMERIC / (v_real_data->>'total_marketing_price')::NUMERIC * 100)
        ELSE 0
      END,
      (v_real_data->>'total_marketing_price')::NUMERIC - (v_real_data->>'total_revenue_collected')::NUMERIC,
      'active',
      CASE 
        WHEN (v_real_data->>'financial_completion_percentage')::NUMERIC >= 100 THEN 'owner_payment'
        ELSE 'collecting'
      END,
      CASE 
        WHEN (v_real_data->>'financial_completion_percentage')::NUMERIC >= 100 THEN 'ready_for_settlement'
        ELSE 'collecting'
      END,
      'phase_1',
      'owner',
      CASE 
        WHEN (v_real_data->>'financial_completion_percentage')::NUMERIC >= 80 THEN 'high'
        WHEN (v_real_data->>'financial_completion_percentage')::NUMERIC >= 50 THEN 'medium'
        ELSE 'low'
      END,
      'synced',
      now(),
      now()
    ON CONFLICT (farm_code) 
    DO UPDATE SET
      total_revenue_collected = EXCLUDED.total_revenue_collected,
      platform_profit = EXCLUDED.platform_profit,
      charity_amount = EXCLUDED.charity_amount,
      net_platform_profit = EXCLUDED.net_platform_profit,
      total_investors = EXCLUDED.total_investors,
      total_trees_sold = EXCLUDED.total_trees_sold,
      financial_completion_percentage = EXCLUDED.financial_completion_percentage,
      coverage_percentage = EXCLUDED.coverage_percentage,
      remaining_amount = EXCLUDED.remaining_amount,
      completion_stage = EXCLUDED.completion_stage,
      settlement_status = EXCLUDED.settlement_status,
      financial_health_status = EXCLUDED.financial_health_status,
      sync_status = 'synced',
      updated_at = now();
    
    -- تسجيل التصحيح
    INSERT INTO corrections_log (
      correction_type,
      table_affected,
      new_value,
      correction_reason,
      corrected_by
    ) VALUES (
      'global_rebalance',
      'smart_farm_finances',
      v_real_data,
      'إعادة حساب شاملة بناءً على بيانات الحجوزات الحقيقية',
      'system'
    );
    
    v_corrections_count := v_corrections_count + 1;
    v_total_platform_profit := v_total_platform_profit + (v_real_data->>'platform_profit')::NUMERIC;
    v_total_charity := v_total_charity + (v_real_data->>'charity_amount')::NUMERIC;
  END LOOP;
  
  -- تحديث محفظة الصدقة
  UPDATE charity_wallet
  SET 
    total_balance = v_total_charity,
    total_received = v_total_charity,
    farms_contributed = v_corrections_count,
    last_contribution_date = now(),
    updated_at = now();
  
  -- إنهاء المراجعة
  UPDATE finance_audit_log
  SET 
    audit_status = 'completed',
    total_profit_calculated = v_total_platform_profit,
    total_charity_calculated = v_total_charity,
    discrepancies_resolved = v_corrections_count,
    completed_at = now(),
    audit_notes = audit_notes || ' | إجمالي التصحيحات: ' || v_corrections_count
  WHERE id = v_audit_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'corrections_made', v_corrections_count,
    'total_platform_profit', v_total_platform_profit,
    'total_charity', v_total_charity,
    'audit_id', v_audit_id
  );
END;
$$;

COMMENT ON FUNCTION execute_global_financial_rebalance IS 'إعادة توازن مالية شاملة - يعيد حساب جميع الأرصدة من الصفر بناءً على البيانات الحقيقية';

-- ═══════════════════════════════════════════════════════════
-- Function: تنظيف farm_wallets من الأرقام الخاطئة
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION cleanup_farm_wallets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- تصفير الأرصدة غير المنطقية
  UPDATE farm_wallets
  SET 
    balance = 0,
    total_income = 0,
    total_expense = 0,
    owner_payment_due = 0,
    owner_payment_paid = 0,
    owner_payment_status = 'pending',
    updated_at = now()
  WHERE balance > 100000000 OR owner_payment_due > 50000000;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  INSERT INTO corrections_log (
    correction_type,
    table_affected,
    correction_reason,
    deviation_amount,
    corrected_by
  ) VALUES (
    'cleanup',
    'farm_wallets',
    'تصفير الأرصدة غير المنطقية',
    v_count,
    'system'
  );
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION cleanup_farm_wallets IS 'تنظيف farm_wallets من الأرقام الخاطئة والمبالغ فيها';

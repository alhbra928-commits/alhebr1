/*
  # دوال نظام التسوية اليدوية الذكية

  1. initialize_investors_wallet_for_farm
  2. update_investors_wallet_on_reservation
  3. execute_manual_settlement
  4. close_farm_ownership
  5. distribute_profits_to_platform_and_charity
  6. get_settlement_statistics
*/

-- 1️⃣ تهيئة محفظة المستثمرين للمزرعة
CREATE OR REPLACE FUNCTION initialize_investors_wallet_for_farm(p_farm_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_name text;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT id, name_ar INTO v_farm_id, v_farm_name
  FROM farms
  WHERE farm_code = p_farm_code;

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'المزرعة غير موجودة: %', p_farm_code;
  END IF;

  -- إنشاء محفظة إذا لم تكن موجودة
  INSERT INTO investors_wallet (farm_id, farm_code, farm_name, status)
  VALUES (v_farm_id, p_farm_code, v_farm_name, 'collecting')
  ON CONFLICT (farm_code) DO NOTHING;
END;
$$;

-- 2️⃣ تحديث محفظة المستثمرين عند كل حجز
CREATE OR REPLACE FUNCTION update_investors_wallet_on_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_code text;
  v_farm_name text;
BEGIN
  -- الحصول على farm_code
  SELECT farm_code, name_ar INTO v_farm_code, v_farm_name
  FROM farms
  WHERE id = NEW.farm_id;

  -- تهيئة المحفظة إذا لم تكن موجودة
  PERFORM initialize_investors_wallet_for_farm(v_farm_code);

  -- تحديث المبلغ المجمع
  IF NEW.booking_status = 'approved' THEN
    UPDATE investors_wallet
    SET
      total_collected = total_collected + NEW.total_amount,
      updated_at = now()
    WHERE farm_code = v_farm_code;
  END IF;

  RETURN NEW;
END;
$$;

-- ربط Trigger بجدول reservations
DROP TRIGGER IF EXISTS trigger_update_investors_wallet ON reservations;
CREATE TRIGGER trigger_update_investors_wallet
AFTER INSERT OR UPDATE ON reservations
FOR EACH ROW
WHEN (NEW.booking_status = 'approved')
EXECUTE FUNCTION update_investors_wallet_on_reservation();

-- 3️⃣ تنفيذ التسوية اليدوية (الدالة الرئيسية)
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

  -- 5. بدء التسوية - تغيير الحالة إلى "settling"
  UPDATE smart_farm_finances
  SET
    settlement_status = 'settling',
    investors_locked_for_settlement = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 6. إنشاء كود المعاملة
  v_transaction_code := 'STL-' || p_farm_code || '-' || to_char(now(), 'YYYYMMDDHH24MISS');
  v_audit_code := 'AUD-' || v_transaction_code;

  -- 7. تسجيل معاملة التسوية
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

  -- 8. تحديث محفظة المستثمرين
  UPDATE investors_wallet
  SET
    total_transferred_to_owner = v_actual_amount,
    status = 'settled',
    is_locked = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 9. تحديث حالة المزرعة
  UPDATE smart_farm_finances
  SET
    settlement_status = 'settled',
    settlement_executed_at = now(),
    settlement_executed_by_id = p_executed_by_id,
    settlement_executed_by_name = p_executed_by_name,
    farm_ownership_status = 'platform',
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 10. تسجيل في سجل التدقيق
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

  -- 11. إرجاع النتيجة
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

-- 4️⃣ حساب وتوزيع الأرباح
CREATE OR REPLACE FUNCTION distribute_profits_to_platform_and_charity(p_farm_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_marketing_amount numeric;
  v_actual_amount numeric;
  v_gross_profit numeric;
  v_charity_amount numeric;
  v_net_platform_profit numeric;
  v_result jsonb;
BEGIN
  -- 1. الحصول على بيانات المزرعة
  SELECT 
    farm_id, marketing_amount, actual_amount
  INTO v_farm_id, v_marketing_amount, v_actual_amount
  FROM smart_farm_finances
  WHERE farm_code = p_farm_code;

  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'المزرعة غير موجودة');
  END IF;

  -- 2. حساب الأرباح
  v_gross_profit := v_marketing_amount - v_actual_amount;
  v_charity_amount := v_gross_profit * 0.25;
  v_net_platform_profit := v_gross_profit - v_charity_amount;

  -- 3. تحديث محفظة المنصة
  UPDATE platform_wallet
  SET
    total_received = total_received + v_net_platform_profit,
    total_balance = total_balance + v_net_platform_profit,
    total_profit = total_profit + v_gross_profit,
    net_profit = net_profit + v_net_platform_profit,
    farms_owned = farms_owned + 1,
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000002';

  -- 4. تحديث محفظة الخير
  UPDATE charity_wallet
  SET
    total_received = total_received + v_charity_amount,
    total_balance = total_balance + v_charity_amount,
    farms_contributed = farms_contributed + 1,
    last_contribution_date = now(),
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000001';

  -- 5. تحديث حالة توزيع الأرباح
  UPDATE smart_farm_finances
  SET
    profit_distributed = true,
    charity_distributed = true,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  -- 6. تسجيل في سجل التدقيق
  INSERT INTO financial_audit_log (
    log_code,
    action_type,
    entity_type,
    entity_code,
    amount,
    description_ar,
    status
  ) VALUES (
    'AUD-PROFIT-' || p_farm_code || '-' || to_char(now(), 'YYYYMMDDHH24MISS'),
    'profit_distribution',
    'farm',
    p_farm_code,
    v_gross_profit,
    '💰 توزيع الأرباح: المنصة (' || v_net_platform_profit || ') + الخير (' || v_charity_amount || ')',
    'success'
  );

  v_result := jsonb_build_object(
    'success', true,
    'gross_profit', v_gross_profit,
    'platform_profit', v_net_platform_profit,
    'charity_amount', v_charity_amount
  );

  RETURN v_result;
END;
$$;

-- 5️⃣ إحصائيات التسوية
CREATE OR REPLACE FUNCTION get_settlement_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ready_count integer;
  v_settled_count integer;
  v_owned_count integer;
  v_platform_balance numeric;
  v_charity_balance numeric;
  v_result jsonb;
BEGIN
  -- عدد المزارع حسب الحالة
  SELECT COUNT(*) INTO v_ready_count
  FROM smart_farm_finances
  WHERE settlement_status = 'ready_for_settlement';

  SELECT COUNT(*) INTO v_settled_count
  FROM smart_farm_finances
  WHERE settlement_status = 'settled';

  SELECT COUNT(*) INTO v_owned_count
  FROM smart_farm_finances
  WHERE farm_ownership_status = 'platform';

  -- أرصدة المحافظ
  SELECT total_balance INTO v_platform_balance
  FROM platform_wallet WHERE id = '00000000-0000-0000-0000-000000000002';

  SELECT total_balance INTO v_charity_balance
  FROM charity_wallet WHERE id = '00000000-0000-0000-0000-000000000001';

  v_result := jsonb_build_object(
    'farms_ready_for_settlement', COALESCE(v_ready_count, 0),
    'farms_settled', COALESCE(v_settled_count, 0),
    'farms_owned_by_platform', COALESCE(v_owned_count, 0),
    'platform_wallet_balance', COALESCE(v_platform_balance, 0),
    'charity_wallet_balance', COALESCE(v_charity_balance, 0),
    'charity_percentage', 25
  );

  RETURN v_result;
END;
$$;

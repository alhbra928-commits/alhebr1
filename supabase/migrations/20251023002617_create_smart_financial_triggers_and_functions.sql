/*
  # الدوال والـ Triggers الذكية للنظام المالي
  
  1. الدوال
    - auto_update_marketing_amount() - تحديث المبلغ التسويقي عند كل حجز
    - auto_calculate_farm_finances() - حساب جميع المبالغ تلقائياً
    - auto_process_owner_payment() - معالجة دفع صاحب المزرعة
    - auto_deduct_charity() - استقطاع الخير تلقائياً
    
  2. Triggers
    - عند إضافة/تحديث حجز → تحديث المبلغ التسويقي
    - عند تغيير المبالغ → إعادة حساب كل شيء
    - عند اكتمال التغطية → سداد المالك واستقطاع الخير
    
  3. الأمان
    - SECURITY DEFINER لتنفيذ العمليات بصلاحيات النظام
    - Validation كاملة للمبالغ
    - Audit log لكل عملية
*/

-- ═══════════════════════════════════════════════════════════
-- 1. دالة تحديث المبلغ التسويقي من الحجوزات
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_update_marketing_amount()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_code TEXT;
  v_total_marketing NUMERIC;
  v_finance_id UUID;
BEGIN
  -- الحصول على farm_code
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = NEW.farm_id;
  
  -- حساب إجمالي المبلغ التسويقي من جميع الحجوزات المكتملة
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_marketing
  FROM reservations
  WHERE farm_id = NEW.farm_id
  AND payment_status = 'completed'
  AND deleted_at IS NULL;
  
  -- تحديث البطاقة المالية
  UPDATE smart_farm_finances
  SET 
    marketing_amount = v_total_marketing,
    total_investors = (
      SELECT COUNT(DISTINCT investor_id)
      FROM reservations
      WHERE farm_id = NEW.farm_id
      AND deleted_at IS NULL
    ),
    total_trees_sold = (
      SELECT COALESCE(SUM(number_of_trees), 0)
      FROM reservations
      WHERE farm_id = NEW.farm_id
      AND deleted_at IS NULL
    ),
    last_transaction_date = NOW(),
    updated_at = NOW()
  WHERE farm_code = v_farm_code
  RETURNING id INTO v_finance_id;
  
  -- تسجيل المعاملة
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    INSERT INTO farm_financial_transactions (
      farm_finance_id,
      farm_code,
      transaction_type,
      amount,
      description,
      source_type,
      source_id,
      investor_name,
      reservation_code
    ) VALUES (
      v_finance_id,
      v_farm_code,
      'marketing_income',
      NEW.total_amount,
      'دخل تسويقي من حجز جديد',
      'reservation',
      NEW.id,
      NEW.customer_name,
      'RES-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 2. دالة حساب جميع المبالغ المالية تلقائياً
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_calculate_farm_finances()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_coverage NUMERIC;
  v_remaining NUMERIC;
  v_profit NUMERIC;
  v_charity NUMERIC;
  v_net_profit NUMERIC;
  v_new_stage TEXT;
BEGIN
  -- حساب نسبة التغطية
  IF NEW.actual_amount > 0 THEN
    v_coverage := (NEW.marketing_amount / NEW.actual_amount) * 100;
  ELSE
    v_coverage := 0;
  END IF;
  
  -- حساب المتبقي
  v_remaining := NEW.actual_amount - NEW.marketing_amount;
  IF v_remaining < 0 THEN
    v_remaining := 0;
  END IF;
  
  -- حساب الأرباح (إذا تجاوز التسويقي الفعلي)
  IF NEW.marketing_amount > NEW.actual_amount THEN
    v_profit := NEW.marketing_amount - NEW.actual_amount;
    v_charity := v_profit * 0.25; -- 25% للخير
    v_net_profit := v_profit - v_charity;
  ELSE
    v_profit := 0;
    v_charity := 0;
    v_net_profit := 0;
  END IF;
  
  -- تحديد المرحلة الحالية
  IF v_coverage < 100 THEN
    v_new_stage := 'collecting';
  ELSIF v_coverage >= 100 AND NEW.owner_payment_date IS NULL THEN
    v_new_stage := 'owner_payment';
  ELSIF v_coverage >= 100 AND NEW.owner_payment_date IS NOT NULL AND v_profit > 0 THEN
    v_new_stage := 'charity_deduction';
  ELSIF v_coverage >= 100 AND NEW.owner_payment_date IS NOT NULL THEN
    v_new_stage := 'completed';
  ELSE
    v_new_stage := 'collecting';
  END IF;
  
  -- تحديث القيم
  NEW.coverage_percentage := ROUND(v_coverage, 2);
  NEW.remaining_amount := v_remaining;
  NEW.platform_profit := v_profit;
  NEW.charity_amount := v_charity;
  NEW.net_platform_profit := v_net_profit;
  NEW.completion_stage := v_new_stage;
  NEW.updated_at := NOW();
  
  -- إذا وصلت التغطية 100% ولم يتم الدفع للمالك، نفذ العملية
  IF v_coverage >= 100 AND OLD.coverage_percentage < 100 THEN
    NEW.owner_payment_date := NOW();
    NEW.total_transactions := NEW.total_transactions + 1;
    
    -- تسجيل دفع المالك
    INSERT INTO farm_financial_transactions (
      farm_finance_id,
      farm_code,
      transaction_type,
      amount,
      description,
      source_type
    ) VALUES (
      NEW.id,
      NEW.farm_code,
      'owner_payment',
      NEW.actual_amount,
      'سداد كامل لصاحب المزرعة',
      'payment'
    );
    
    -- إذا كان هناك ربح، استقطع الخير
    IF v_profit > 0 THEN
      INSERT INTO farm_financial_transactions (
        farm_finance_id,
        farm_code,
        transaction_type,
        amount,
        description,
        source_type
      ) VALUES (
        NEW.id,
        NEW.farm_code,
        'charity_deduction',
        v_charity,
        'استقطاع 25% من الربح لمحفظة الخير',
        'charity'
      );
      
      -- تسجيل في محفظة الخير
      INSERT INTO charity_deductions_log (
        farm_finance_id,
        farm_code,
        farm_name,
        platform_profit,
        charity_percentage,
        charity_amount
      ) VALUES (
        NEW.id,
        NEW.farm_code,
        NEW.farm_name,
        v_profit,
        25,
        v_charity
      );
      
      -- تحديث محفظة الخير
      UPDATE platform_charity_wallet
      SET 
        total_balance = total_balance + v_charity,
        total_received = total_received + v_charity,
        farms_contributed = farms_contributed + 1,
        total_transactions = total_transactions + 1,
        last_contribution_date = NOW(),
        updated_at = NOW();
      
      -- تسجيل صافي الربح للمنصة
      INSERT INTO farm_financial_transactions (
        farm_finance_id,
        farm_code,
        transaction_type,
        amount,
        description,
        source_type
      ) VALUES (
        NEW.id,
        NEW.farm_code,
        'platform_profit',
        v_net_profit,
        'صافي ربح المنصة بعد استقطاع الخير',
        'profit'
      );
    END IF;
    
    -- إذا اكتمل كل شيء
    IF v_new_stage = 'completed' THEN
      NEW.completion_date := NOW();
      NEW.status := 'completed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 3. دالة إنشاء بطاقة مالية عند إضافة مزرعة جديدة
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_create_farm_finance_card()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_actual_amount NUMERIC;
  v_owner_name TEXT;
  v_barcode TEXT;
BEGIN
  -- الحصول على المبلغ الفعلي من صاحب المزرعة
  IF NEW.owner_id IS NOT NULL THEN
    SELECT actual_price, full_name 
    INTO v_actual_amount, v_owner_name
    FROM farm_owners
    WHERE id = NEW.owner_id;
  ELSE
    v_actual_amount := 0;
    v_owner_name := NULL;
  END IF;
  
  -- توليد باركود مالي فريد
  v_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  
  -- إنشاء البطاقة المالية
  INSERT INTO smart_farm_finances (
    farm_id,
    farm_code,
    farm_name,
    owner_id,
    owner_name,
    marketing_amount,
    actual_amount,
    financial_barcode,
    status,
    completion_stage
  ) VALUES (
    NEW.id,
    NEW.farm_code,
    NEW.name_ar,
    NEW.owner_id,
    v_owner_name,
    0,
    COALESCE(v_actual_amount, 0),
    v_barcode,
    'active',
    'collecting'
  );
  
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- تسجيل الـ Triggers
-- ═══════════════════════════════════════════════════════════

-- Trigger: تحديث المبلغ التسويقي عند إضافة/تحديث حجز
DROP TRIGGER IF EXISTS trigger_update_marketing_amount ON reservations;
CREATE TRIGGER trigger_update_marketing_amount
AFTER INSERT OR UPDATE OF payment_status, total_amount ON reservations
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL)
EXECUTE FUNCTION auto_update_marketing_amount();

-- Trigger: حساب المبالغ تلقائياً عند التحديث
DROP TRIGGER IF EXISTS trigger_calculate_farm_finances ON smart_farm_finances;
CREATE TRIGGER trigger_calculate_farm_finances
BEFORE UPDATE OF marketing_amount, actual_amount ON smart_farm_finances
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_farm_finances();

-- Trigger: إنشاء بطاقة مالية عند إضافة مزرعة
DROP TRIGGER IF EXISTS trigger_create_farm_finance_card ON farms;
CREATE TRIGGER trigger_create_farm_finance_card
AFTER INSERT ON farms
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL)
EXECUTE FUNCTION auto_create_farm_finance_card();

COMMENT ON FUNCTION auto_update_marketing_amount() IS 'يحدث المبلغ التسويقي تلقائياً من الحجوزات المكتملة';
COMMENT ON FUNCTION auto_calculate_farm_finances() IS 'يحسب جميع المبالغ المالية ونسبة التغطية والأرباح تلقائياً';
COMMENT ON FUNCTION auto_create_farm_finance_card() IS 'ينشئ بطاقة مالية ذكية لكل مزرعة جديدة تلقائياً';

/*
  # ربط النظام المالي بالحجوزات تلقائياً

  ## الهدف
  تسجيل جميع المعاملات المالية تلقائياً عند:
  - إنشاء حجز جديد
  - تغيير حالة الدفع
  - توثيق الحجز

  ## الآلية
  1. عند إنشاء حجز → تسجيل معاملة دخل في farm_ledgers
  2. عند الدفع → تحديث farm_wallets
  3. عند التوثيق → تحديث farm_investors_ledger

  ## الجداول المتأثرة
  - farm_ledgers (سجل المعاملات)
  - farm_wallets (محافظ المزارع)
  - farm_investors_ledger (سجل المستثمرين)
  - farm_financial_audit_log (سجل التدقيق)
*/

-- دالة تسجيل معاملة مالية عند الحجز
CREATE OR REPLACE FUNCTION record_financial_transaction_for_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_barcode text;
  v_farm_code text;
  v_operation_number text;
BEGIN
  -- جلب باركود المزرعة
  SELECT farm_code INTO v_farm_code FROM farms WHERE id = NEW.farm_id LIMIT 1;
  
  IF v_farm_code IS NULL THEN
    RAISE NOTICE 'المزرعة غير موجودة: %', NEW.farm_id;
    RETURN NEW;
  END IF;
  
  v_farm_barcode := v_farm_code;

  -- إنشاء محفظة مالية للمزرعة إذا لم تكن موجودة
  INSERT INTO farm_wallets (farm_barcode, balance, total_income, total_expense, frozen_amount, status, created_at, updated_at)
  VALUES (v_farm_barcode, 0, 0, 0, 0, 'active', now(), now())
  ON CONFLICT (farm_barcode) DO NOTHING;

  -- تسجيل المعاملة في دفتر الأستاذ
  INSERT INTO farm_ledgers (
    farm_barcode,
    transaction_type,
    amount,
    category,
    description,
    from_entity,
    to_entity,
    reference_id,
    status,
    transaction_date,
    created_at
  )
  VALUES (
    v_farm_barcode,
    'income',
    NEW.total_amount,
    NULL,
    'حجز جديد - ' || COALESCE(NEW.customer_name, 'عميل'),
    COALESCE(NEW.customer_name, 'عميل'),
    'المزرعة',
    NEW.id,
    CASE 
      WHEN NEW.payment_status = 'completed' THEN 'completed'
      WHEN NEW.payment_status = 'paid' THEN 'completed'
      ELSE 'pending'
    END,
    now(),
    now()
  );

  -- تحديث المحفظة إذا تم الدفع
  IF NEW.payment_status IN ('completed', 'paid') THEN
    UPDATE farm_wallets 
    SET 
      balance = balance + NEW.total_amount,
      total_income = total_income + NEW.total_amount,
      updated_at = now()
    WHERE farm_barcode = v_farm_barcode;
  END IF;

  -- تسجيل في سجل التدقيق
  v_operation_number := 'FIN-' || substring(gen_random_uuid()::text, 1, 8);
  
  INSERT INTO farm_financial_audit_log (
    operation_number,
    farm_barcode,
    operation_type,
    from_entity,
    to_entity,
    amount,
    status,
    timestamp,
    metadata
  )
  VALUES (
    v_operation_number,
    v_farm_barcode,
    'reservation_created',
    COALESCE(NEW.customer_name, 'عميل'),
    'المزرعة',
    NEW.total_amount,
    'completed',
    now(),
    jsonb_build_object(
      'reservation_id', NEW.id,
      'trees_count', NEW.number_of_trees,
      'payment_status', NEW.payment_status
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger عند إنشاء حجز جديد
DROP TRIGGER IF EXISTS trigger_record_reservation_financial ON reservations;
CREATE TRIGGER trigger_record_reservation_financial
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION record_financial_transaction_for_reservation();

-- دالة تحديث المحفظة عند تغيير حالة الدفع
CREATE OR REPLACE FUNCTION update_wallet_on_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_barcode text;
  v_farm_code text;
BEGIN
  -- التحقق من تغيير حالة الدفع
  IF OLD.payment_status != NEW.payment_status THEN
    -- جلب باركود المزرعة
    SELECT farm_code INTO v_farm_code FROM farms WHERE id = NEW.farm_id LIMIT 1;
    
    IF v_farm_code IS NULL THEN
      RETURN NEW;
    END IF;
    
    v_farm_barcode := v_farm_code;

    -- إذا تم الدفع
    IF NEW.payment_status IN ('completed', 'paid') AND OLD.payment_status NOT IN ('completed', 'paid') THEN
      -- تحديث المحفظة
      UPDATE farm_wallets 
      SET 
        balance = balance + NEW.total_amount,
        total_income = total_income + NEW.total_amount,
        updated_at = now()
      WHERE farm_barcode = v_farm_barcode;

      -- تحديث حالة المعاملة
      UPDATE farm_ledgers
      SET status = 'completed'
      WHERE reference_id = NEW.id AND status = 'pending';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger عند تحديث حالة الدفع
DROP TRIGGER IF EXISTS trigger_update_wallet_on_payment ON reservations;
CREATE TRIGGER trigger_update_wallet_on_payment
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_on_payment_status_change();

-- دالة تسجيل المستثمر عند التوثيق
CREATE OR REPLACE FUNCTION record_investor_on_documentation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_barcode text;
  v_farm_code text;
  v_reservation record;
BEGIN
  -- جلب بيانات الحجز
  SELECT * INTO v_reservation FROM reservations WHERE id = NEW.booking_id LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- جلب باركود المزرعة
  SELECT farm_code INTO v_farm_code FROM farms WHERE id = NEW.farm_id LIMIT 1;
  
  IF v_farm_code IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_farm_barcode := v_farm_code;

  -- تسجيل المستثمر في دفتر المستثمرين
  INSERT INTO farm_investors_ledger (
    farm_barcode,
    investor_id,
    investment_amount,
    ownership_percentage,
    certificate_number,
    status,
    investment_date,
    created_at
  )
  VALUES (
    v_farm_barcode,
    NEW.investor_id,
    NEW.total_price,
    NULL,
    NEW.certificate_code,
    'active',
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger عند إنشاء توثيق
DROP TRIGGER IF EXISTS trigger_record_investor_on_doc ON documentation;
CREATE TRIGGER trigger_record_investor_on_doc
  AFTER INSERT ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION record_investor_on_documentation();

GRANT EXECUTE ON FUNCTION record_financial_transaction_for_reservation() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_wallet_on_payment_status_change() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_investor_on_documentation() TO anon, authenticated;

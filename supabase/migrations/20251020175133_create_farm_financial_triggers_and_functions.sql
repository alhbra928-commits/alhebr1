/*
  # إنشاء Triggers والدوال الذكية للنظام المالي

  ## الدوال

  1. **auto_create_farm_financial_entities** - إنشاء تلقائي للكيانات المالية عند إضافة مزرعة
  2. **validate_farm_barcode** - التحقق من صحة الباركود
  3. **process_farm_transaction** - معالجة معاملة مالية وتحديث المحفظة
  4. **generate_operation_number** - توليد رقم عملية فريد
  5. **check_farm_financial_state** - التحقق من حالة المزرعة قبل العملية
  6. **calculate_charity_amount** - حساب الاستقطاع الخيري

  ## Triggers

  1. **trigger_create_financial_entities** - ينشط عند إضافة مزرعة جديدة
  2. **trigger_update_wallet_on_transaction** - تحديث المحفظة عند معاملة جديدة
  3. **trigger_log_audit_trail** - تسجيل كل عملية في سجل التدقيق
  4. **trigger_update_timestamps** - تحديث updated_at تلقائياً
*/

-- دالة التحقق من صحة الباركود
CREATE OR REPLACE FUNCTION validate_farm_barcode(barcode_input text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  IF barcode_input IS NULL OR length(barcode_input) < 6 THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

-- دالة توليد رقم عملية فريد
CREATE OR REPLACE FUNCTION generate_operation_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  operation_num text;
BEGIN
  operation_num := 'OP-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(gen_random_uuid()::text, 1, 8);
  RETURN operation_num;
END;
$$;

-- دالة إنشاء الكيانات المالية تلقائياً
CREATE OR REPLACE FUNCTION auto_create_farm_financial_entities()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- إنشاء محفظة المزرعة
  INSERT INTO farm_wallets (farm_barcode, balance, status)
  VALUES (NEW.barcode, 0, 'active')
  ON CONFLICT (farm_barcode) DO NOTHING;

  -- إنشاء حالة مالية للمزرعة
  INSERT INTO farm_financial_states (farm_barcode, current_state)
  VALUES (NEW.barcode, 'active')
  ON CONFLICT (farm_barcode) DO NOTHING;

  -- تسجيل في Audit Log
  INSERT INTO farm_financial_audit_log (
    operation_number,
    farm_barcode,
    operation_type,
    status,
    metadata
  )
  VALUES (
    generate_operation_number(),
    NEW.barcode,
    'farm_created',
    'completed',
    jsonb_build_object('farm_id', NEW.id, 'farm_name', NEW.name)
  );

  RETURN NEW;
END;
$$;

-- دالة التحقق من حالة المزرعة المالية
CREATE OR REPLACE FUNCTION check_farm_financial_state(barcode_input text, operation_type text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_state_val text;
BEGIN
  SELECT current_state INTO current_state_val
  FROM farm_financial_states
  WHERE farm_barcode = barcode_input;

  IF current_state_val IS NULL THEN
    RETURN false;
  END IF;

  IF current_state_val = 'completed' THEN
    RETURN false;
  END IF;

  IF current_state_val = 'frozen' AND operation_type != 'unfreeze' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- دالة معالجة المعاملة المالية
CREATE OR REPLACE FUNCTION process_farm_transaction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT validate_farm_barcode(NEW.farm_barcode) THEN
    RAISE EXCEPTION 'باركود غير صالح: %', NEW.farm_barcode;
  END IF;

  IF NOT check_farm_financial_state(NEW.farm_barcode, NEW.transaction_type) THEN
    RAISE EXCEPTION 'حالة المزرعة المالية لا تسمح بهذه العملية';
  END IF;

  IF NEW.transaction_type IN ('income', 'transfer_in', 'investor_deposit') THEN
    UPDATE farm_wallets
    SET 
      balance = balance + NEW.amount,
      total_income = total_income + NEW.amount,
      updated_at = now()
    WHERE farm_barcode = NEW.farm_barcode;

  ELSIF NEW.transaction_type IN ('expense', 'transfer_out') THEN
    UPDATE farm_wallets
    SET 
      balance = balance - NEW.amount,
      total_expense = total_expense + NEW.amount,
      updated_at = now()
    WHERE farm_barcode = NEW.farm_barcode
    AND balance >= NEW.amount;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'رصيد غير كافٍ في محفظة المزرعة';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- دالة تسجيل في Audit Log
CREATE OR REPLACE FUNCTION log_financial_audit_trail()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO farm_financial_audit_log (
    operation_number,
    farm_barcode,
    operation_type,
    from_entity,
    to_entity,
    amount,
    executed_by,
    status,
    metadata
  )
  VALUES (
    generate_operation_number(),
    NEW.farm_barcode,
    NEW.transaction_type,
    NEW.from_entity,
    NEW.to_entity,
    NEW.amount,
    NEW.executed_by,
    NEW.status,
    jsonb_build_object(
      'ledger_id', NEW.id,
      'category', NEW.category,
      'description', NEW.description
    )
  );

  RETURN NEW;
END;
$$;

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- دالة حساب الاستقطاع الخيري (25% من أرباح المنصة فقط)
CREATE OR REPLACE FUNCTION calculate_charity_amount(profit_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  IF profit_amount <= 0 THEN
    RETURN 0;
  END IF;
  RETURN profit_amount * 0.25;
END;
$$;

-- Trigger لإنشاء الكيانات المالية عند إضافة مزرعة
DROP TRIGGER IF EXISTS trigger_create_financial_entities ON farms;
CREATE TRIGGER trigger_create_financial_entities
  AFTER INSERT ON farms
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_farm_financial_entities();

-- Trigger لمعالجة المعاملات وتحديث المحفظة
DROP TRIGGER IF EXISTS trigger_process_farm_transaction ON farm_ledgers;
CREATE TRIGGER trigger_process_farm_transaction
  BEFORE INSERT ON farm_ledgers
  FOR EACH ROW
  EXECUTE FUNCTION process_farm_transaction();

-- Trigger لتسجيل في Audit Log
DROP TRIGGER IF EXISTS trigger_log_audit_trail ON farm_ledgers;
CREATE TRIGGER trigger_log_audit_trail
  AFTER INSERT ON farm_ledgers
  FOR EACH ROW
  EXECUTE FUNCTION log_financial_audit_trail();

-- Trigger لتحديث updated_at في farm_wallets
DROP TRIGGER IF EXISTS trigger_update_farm_wallets_timestamp ON farm_wallets;
CREATE TRIGGER trigger_update_farm_wallets_timestamp
  BEFORE UPDATE ON farm_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger لتحديث updated_at في farm_financial_states
DROP TRIGGER IF EXISTS trigger_update_farm_financial_states_timestamp ON farm_financial_states;
CREATE TRIGGER trigger_update_farm_financial_states_timestamp
  BEFORE UPDATE ON farm_financial_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

/*
  # Triggers التلقائية ونظام المعاملات الآمنة
  # Automatic Triggers & Safe Transaction System

  ## نظرة عامة / Overview
  هذا الملف ينشئ:
  - Triggers تلقائية لجميع الجداول لتسجيل العمليات والنسخ الاحتياطي
  - دوال المعاملات الآمنة (Transaction Functions) للعمليات الحساسة
  - نظام حماية طبقي متعدد المستويات
  
  This migration creates:
  - Automatic triggers for all tables to log operations and backup data
  - Safe transaction functions for sensitive operations
  - Multi-layered protection system

  ## 1. إنشاء Triggers للنسخ الاحتياطي والتدقيق
  Create triggers for backup and audit logging

  ## 2. دوال المعاملات للعمليات الحساسة
  Transaction functions for critical operations

  ## 3. ملاحظات مهمة / Important Notes
  - كل عملية تعديل أو حذف تُسجل تلقائياً
  - كل عملية تُنشئ نسخة احتياطية تلقائية
  - المعاملات المالية محمية بـ Transactions
  - في حالة فشل أي خطوة، يتم التراجع الكامل
*/

-- ===========================
-- 1. إنشاء Triggers للجداول الرئيسية
-- Create Triggers for Main Tables
-- ===========================

-- Triggers لجدول المزارع (farms)
DROP TRIGGER IF EXISTS audit_farms_changes ON farms;
CREATE TRIGGER audit_farms_changes
  AFTER INSERT OR UPDATE OR DELETE ON farms
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_farms_before_change ON farms;
CREATE TRIGGER backup_farms_before_change
  BEFORE UPDATE OR DELETE ON farms
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول أصحاب المزارع (farm_owners)
DROP TRIGGER IF EXISTS audit_farm_owners_changes ON farm_owners;
CREATE TRIGGER audit_farm_owners_changes
  AFTER INSERT OR UPDATE OR DELETE ON farm_owners
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_farm_owners_before_change ON farm_owners;
CREATE TRIGGER backup_farm_owners_before_change
  BEFORE UPDATE OR DELETE ON farm_owners
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول المستثمرين (investors)
DROP TRIGGER IF EXISTS audit_investors_changes ON investors;
CREATE TRIGGER audit_investors_changes
  AFTER INSERT OR UPDATE OR DELETE ON investors
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_investors_before_change ON investors;
CREATE TRIGGER backup_investors_before_change
  BEFORE UPDATE OR DELETE ON investors
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول الحجوزات (reservations)
DROP TRIGGER IF EXISTS audit_reservations_changes ON reservations;
CREATE TRIGGER audit_reservations_changes
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_reservations_before_change ON reservations;
CREATE TRIGGER backup_reservations_before_change
  BEFORE UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول المستندات (documents)
DROP TRIGGER IF EXISTS audit_documents_changes ON documents;
CREATE TRIGGER audit_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_documents_before_change ON documents;
CREATE TRIGGER backup_documents_before_change
  BEFORE UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول المحافظ (wallets)
DROP TRIGGER IF EXISTS audit_wallets_changes ON wallets;
CREATE TRIGGER audit_wallets_changes
  AFTER INSERT OR UPDATE OR DELETE ON wallets
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_wallets_before_change ON wallets;
CREATE TRIGGER backup_wallets_before_change
  BEFORE UPDATE OR DELETE ON wallets
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- Triggers لجدول معاملات المحفظة (wallet_transactions)
DROP TRIGGER IF EXISTS audit_wallet_transactions_changes ON wallet_transactions;
CREATE TRIGGER audit_wallet_transactions_changes
  AFTER INSERT OR UPDATE OR DELETE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS backup_wallet_transactions_before_change ON wallet_transactions;
CREATE TRIGGER backup_wallet_transactions_before_change
  BEFORE UPDATE OR DELETE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION auto_backup_before_change();

-- ===========================
-- 2. دوال المعاملات الآمنة
-- Safe Transaction Functions
-- ===========================

-- دالة إنشاء حجز مع خصم من الأشجار المتاحة (معاملة آمنة)
CREATE OR REPLACE FUNCTION create_reservation_safe(
  p_farm_id uuid,
  p_investor_id uuid,
  p_number_of_trees integer,
  p_contract_start_date date,
  p_contract_end_date date
)
RETURNS jsonb AS $$
DECLARE
  v_farm_record record;
  v_total_amount numeric;
  v_reservation_id uuid;
  v_result jsonb;
BEGIN
  -- بداية المعاملة ضمنية (BEGIN داخل الدالة)
  
  -- 1. التحقق من وجود المزرعة والأشجار المتاحة (مع قفل السطر)
  SELECT * INTO v_farm_record
  FROM farms
  WHERE id = p_farm_id 
    AND status = 'active'
    AND deleted_at IS NULL
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'المزرعة غير موجودة أو غير نشطة';
  END IF;
  
  IF v_farm_record.available_trees < p_number_of_trees THEN
    RAISE EXCEPTION 'عدد الأشجار المتاحة غير كافٍ. المتاح: %, المطلوب: %',
      v_farm_record.available_trees, p_number_of_trees;
  END IF;
  
  -- 2. حساب المبلغ الإجمالي
  v_total_amount := v_farm_record.price_per_tree * p_number_of_trees;
  
  -- 3. إنشاء الحجز
  INSERT INTO reservations (
    farm_id,
    investor_id,
    number_of_trees,
    price_per_tree,
    total_amount,
    contract_start_date,
    contract_end_date,
    status,
    payment_status
  ) VALUES (
    p_farm_id,
    p_investor_id,
    p_number_of_trees,
    v_farm_record.price_per_tree,
    v_total_amount,
    p_contract_start_date,
    p_contract_end_date,
    'pending',
    'pending'
  ) RETURNING id INTO v_reservation_id;
  
  -- 4. تحديث عدد الأشجار المتاحة
  UPDATE farms
  SET 
    available_trees = available_trees - p_number_of_trees,
    updated_at = now()
  WHERE id = p_farm_id;
  
  -- 5. تسجيل في سجل النظام
  INSERT INTO system_logs (
    log_level,
    log_type,
    message_ar,
    message_en,
    user_id,
    metadata
  ) VALUES (
    'info',
    'transaction',
    'تم إنشاء حجز جديد بنجاح',
    'New reservation created successfully',
    auth.uid(),
    jsonb_build_object(
      'reservation_id', v_reservation_id,
      'farm_id', p_farm_id,
      'investor_id', p_investor_id,
      'trees_count', p_number_of_trees,
      'total_amount', v_total_amount
    )
  );
  
  -- 6. إرجاع النتيجة
  v_result := jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'total_amount', v_total_amount,
    'message', 'تم إنشاء الحجز بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- في حالة حدوث خطأ، يتم التراجع التلقائي
    INSERT INTO system_logs (
      log_level,
      log_type,
      message_ar,
      message_en,
      user_id,
      metadata
    ) VALUES (
      'error',
      'transaction',
      'فشل إنشاء الحجز',
      'Reservation creation failed',
      auth.uid(),
      jsonb_build_object(
        'error', SQLERRM,
        'farm_id', p_farm_id,
        'investor_id', p_investor_id
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة إلغاء حجز وإرجاع الأشجار (معاملة آمنة)
CREATE OR REPLACE FUNCTION cancel_reservation_safe(
  p_reservation_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_reservation_record record;
  v_result jsonb;
BEGIN
  -- 1. الحصول على معلومات الحجز (مع قفل السطر)
  SELECT * INTO v_reservation_record
  FROM reservations
  WHERE id = p_reservation_id
    AND deleted_at IS NULL
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الحجز غير موجود';
  END IF;
  
  IF v_reservation_record.status = 'cancelled' THEN
    RAISE EXCEPTION 'الحجز ملغى مسبقاً';
  END IF;
  
  -- 2. تحديث حالة الحجز
  UPDATE reservations
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE id = p_reservation_id;
  
  -- 3. إرجاع الأشجار للمزرعة
  UPDATE farms
  SET 
    available_trees = available_trees + v_reservation_record.number_of_trees,
    updated_at = now()
  WHERE id = v_reservation_record.farm_id;
  
  -- 4. تسجيل في سجل النظام
  INSERT INTO system_logs (
    log_level,
    log_type,
    message_ar,
    message_en,
    user_id,
    metadata
  ) VALUES (
    'info',
    'transaction',
    'تم إلغاء الحجز وإرجاع الأشجار',
    'Reservation cancelled and trees returned',
    auth.uid(),
    jsonb_build_object(
      'reservation_id', p_reservation_id,
      'farm_id', v_reservation_record.farm_id,
      'trees_returned', v_reservation_record.number_of_trees,
      'reason', p_reason
    )
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم إلغاء الحجز بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO system_logs (
      log_level,
      log_type,
      message_ar,
      message_en,
      user_id,
      metadata
    ) VALUES (
      'error',
      'transaction',
      'فشل إلغاء الحجز',
      'Reservation cancellation failed',
      auth.uid(),
      jsonb_build_object(
        'error', SQLERRM,
        'reservation_id', p_reservation_id
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة معاملة محفظة آمنة
CREATE OR REPLACE FUNCTION process_wallet_transaction_safe(
  p_wallet_id uuid,
  p_transaction_type text,
  p_amount numeric,
  p_description_ar text,
  p_description_en text,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_wallet_record record;
  v_transaction_id uuid;
  v_new_balance numeric;
  v_result jsonb;
BEGIN
  -- 1. الحصول على معلومات المحفظة (مع قفل السطر)
  SELECT * INTO v_wallet_record
  FROM wallets
  WHERE id = p_wallet_id
    AND status = 'active'
    AND deleted_at IS NULL
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'المحفظة غير موجودة أو غير نشطة';
  END IF;
  
  -- 2. التحقق من الرصيد في حالة السحب
  IF p_transaction_type IN ('withdrawal', 'payment') THEN
    IF v_wallet_record.balance < p_amount THEN
      RAISE EXCEPTION 'الرصيد غير كافٍ. الرصيد الحالي: %, المطلوب: %',
        v_wallet_record.balance, p_amount;
    END IF;
  END IF;
  
  -- 3. حساب الرصيد الجديد
  IF p_transaction_type IN ('deposit', 'refund', 'return') THEN
    v_new_balance := v_wallet_record.balance + p_amount;
  ELSE
    v_new_balance := v_wallet_record.balance - p_amount;
  END IF;
  
  -- 4. إنشاء المعاملة
  INSERT INTO wallet_transactions (
    wallet_id,
    transaction_type,
    amount,
    description_ar,
    description_en,
    reference_id,
    reference_type,
    status
  ) VALUES (
    p_wallet_id,
    p_transaction_type,
    p_amount,
    p_description_ar,
    p_description_en,
    p_reference_id,
    p_reference_type,
    'completed'
  ) RETURNING id INTO v_transaction_id;
  
  -- 5. تحديث رصيد المحفظة
  UPDATE wallets
  SET 
    balance = v_new_balance,
    total_deposits = CASE WHEN p_transaction_type IN ('deposit', 'refund', 'return') 
                          THEN total_deposits + p_amount 
                          ELSE total_deposits END,
    total_withdrawals = CASE WHEN p_transaction_type IN ('withdrawal', 'payment') 
                             THEN total_withdrawals + p_amount 
                             ELSE total_withdrawals END,
    updated_at = now()
  WHERE id = p_wallet_id;
  
  -- 6. تسجيل في سجل النظام
  INSERT INTO system_logs (
    log_level,
    log_type,
    message_ar,
    message_en,
    user_id,
    metadata
  ) VALUES (
    'info',
    'transaction',
    'تمت معاملة المحفظة بنجاح',
    'Wallet transaction completed successfully',
    auth.uid(),
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'wallet_id', p_wallet_id,
      'type', p_transaction_type,
      'amount', p_amount,
      'old_balance', v_wallet_record.balance,
      'new_balance', v_new_balance
    )
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance,
    'message', 'تمت المعاملة بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO system_logs (
      log_level,
      log_type,
      message_ar,
      message_en,
      user_id,
      metadata
    ) VALUES (
      'error',
      'transaction',
      'فشلت معاملة المحفظة',
      'Wallet transaction failed',
      auth.uid(),
      jsonb_build_object(
        'error', SQLERRM,
        'wallet_id', p_wallet_id,
        'type', p_transaction_type,
        'amount', p_amount
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحذف الآمن (Soft Delete)
CREATE OR REPLACE FUNCTION soft_delete_record(
  p_table_name text,
  p_record_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_query text;
  v_result jsonb;
BEGIN
  -- 1. التحقق من أن الجدول يدعم Soft Delete
  v_query := format(
    'SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = %L AND column_name = %L
    )', p_table_name, 'deleted_at'
  );
  
  EXECUTE v_query INTO v_result;
  
  IF NOT (v_result::boolean) THEN
    RAISE EXCEPTION 'الجدول % لا يدعم الحذف الآمن', p_table_name;
  END IF;
  
  -- 2. تنفيذ الحذف الآمن
  v_query := format(
    'UPDATE %I SET deleted_at = now(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
    p_table_name
  );
  
  EXECUTE v_query USING auth.uid(), p_record_id;
  
  -- 3. تسجيل العملية
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    user_id,
    metadata
  ) VALUES (
    p_table_name,
    p_record_id,
    'SOFT_DELETE',
    auth.uid(),
    jsonb_build_object('deleted_at', now())
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'تم الحذف الآمن بنجاح'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
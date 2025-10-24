/*
  # تهيئة النظام المالي الذكي للمزرعة الموجودة (الخالدية)
  
  1. التغييرات
    - إنشاء بطاقة مالية لمزرعة الخالدية
    - حساب المبلغ التسويقي من الحجوزات الموجودة
    - ربط المبلغ الفعلي من صاحب المزرعة
    - تسجيل المعاملة الأولى
    
  2. الأمان
    - التحقق من وجود البيانات
    - حساب تلقائي للمبالغ
*/

-- إنشاء بطاقة مالية لمزرعة الخالدية
DO $$
DECLARE
  v_farm_id UUID;
  v_farm_code TEXT := 'FARM-2025-0003';
  v_farm_name TEXT;
  v_owner_id UUID;
  v_owner_name TEXT;
  v_actual_amount NUMERIC;
  v_marketing_amount NUMERIC;
  v_finance_id UUID;
  v_barcode TEXT;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT id, name_ar, owner_id
  INTO v_farm_id, v_farm_name, v_owner_id
  FROM farms
  WHERE farm_code = v_farm_code
  AND deleted_at IS NULL;
  
  IF v_farm_id IS NULL THEN
    RAISE NOTICE 'مزرعة الخالدية غير موجودة!';
    RETURN;
  END IF;
  
  -- الحصول على بيانات المالك والمبلغ الفعلي
  SELECT full_name, actual_price
  INTO v_owner_name, v_actual_amount
  FROM farm_owners
  WHERE id = v_owner_id;
  
  -- حساب المبلغ التسويقي من الحجوزات
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_marketing_amount
  FROM reservations
  WHERE farm_id = v_farm_id
  AND payment_status = 'completed'
  AND deleted_at IS NULL;
  
  -- توليد باركود مالي
  v_barcode := 'FIN-' || v_farm_code || '-' || UPPER(SUBSTRING(MD5(v_farm_id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  
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
    completion_stage,
    total_investors,
    total_trees_sold
  ) VALUES (
    v_farm_id,
    v_farm_code,
    v_farm_name,
    v_owner_id,
    v_owner_name,
    v_marketing_amount,
    COALESCE(v_actual_amount, 0),
    v_barcode,
    'active',
    CASE 
      WHEN v_marketing_amount >= COALESCE(v_actual_amount, 0) THEN 'owner_payment'
      ELSE 'collecting'
    END,
    (SELECT COUNT(DISTINCT investor_id) FROM reservations WHERE farm_id = v_farm_id AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(number_of_trees), 0) FROM reservations WHERE farm_id = v_farm_id AND deleted_at IS NULL)
  )
  RETURNING id INTO v_finance_id;
  
  -- تسجيل المعاملات الموجودة
  INSERT INTO farm_financial_transactions (
    farm_finance_id,
    farm_code,
    transaction_type,
    amount,
    description,
    source_type,
    investor_name
  )
  SELECT 
    v_finance_id,
    v_farm_code,
    'marketing_income',
    r.total_amount,
    'دخل تسويقي من حجز مستثمر',
    'reservation',
    r.customer_name
  FROM reservations r
  WHERE r.farm_id = v_farm_id
  AND r.payment_status = 'completed'
  AND r.deleted_at IS NULL;
  
  RAISE NOTICE 'تم إنشاء بطاقة مالية ذكية لمزرعة الخالدية بنجاح!';
  RAISE NOTICE 'المبلغ التسويقي: %', v_marketing_amount;
  RAISE NOTICE 'المبلغ الفعلي: %', v_actual_amount;
  RAISE NOTICE 'الباركود المالي: %', v_barcode;
END $$;

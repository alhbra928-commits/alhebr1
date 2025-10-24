/*
  # تحسين إنشاء المحفظة المالية عند إضافة مزرعة

  ## المشكلة
  عند إنشاء مزرعة جديدة، لا يتم ملء الحقول الجديدة (owner_payment_due, owner_payment_paid, owner_payment_status)

  ## الحل
  تحديث دالة auto_create_farm_financial_entities لتضع القيم الصحيحة:
  - owner_payment_due = total_actual_price من المزرعة
  - owner_payment_paid = 0 (لم يتم التسديد بعد)
  - owner_payment_status = 'pending' (في انتظار التسديد)

  ## النتيجة
  - المزرعة تظهر فوراً في لوحة الإدارة المالية
  - الحقول الجديدة جاهزة لتتبع التسديدات
*/

-- دالة محسّنة لإنشاء الكيانات المالية تلقائياً
CREATE OR REPLACE FUNCTION auto_create_farm_financial_entities()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_actual_price NUMERIC;
BEGIN
  -- جلب السعر الفعلي من المزرعة
  v_actual_price := COALESCE(NEW.total_actual_price, 0);

  -- التحقق من وجود الحقول الجديدة
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_due'
  ) THEN
    -- إنشاء محفظة المزرعة مع الحقول الجديدة
    INSERT INTO farm_wallets (
      farm_barcode,
      balance,
      total_income,
      total_expense,
      frozen_amount,
      status,
      owner_payment_due,
      owner_payment_paid,
      owner_payment_status
    )
    VALUES (
      NEW.barcode,
      0,
      0,
      0,
      0,
      'active',
      v_actual_price,
      0,
      'pending'
    )
    ON CONFLICT (farm_barcode) DO NOTHING;
  ELSE
    -- إنشاء محفظة المزرعة بدون الحقول الجديدة
    INSERT INTO farm_wallets (
      farm_barcode,
      balance,
      status
    )
    VALUES (
      NEW.barcode,
      0,
      'active'
    )
    ON CONFLICT (farm_barcode) DO NOTHING;
  END IF;

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
    'OP-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(gen_random_uuid()::text, 1, 8),
    NEW.barcode,
    'farm_created',
    'completed',
    jsonb_build_object(
      'farm_id', NEW.id,
      'farm_name', NEW.name,
      'owner_name', NEW.owner_name,
      'actual_price', v_actual_price
    )
  );

  RETURN NEW;
END;
$$;

-- تحديث المحافظ الموجودة: ملء owner_payment_due من farms
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_due'
  ) THEN
    UPDATE farm_wallets fw
    SET
      owner_payment_due = (
        SELECT COALESCE(total_actual_price, 0)
        FROM farms f
        WHERE f.barcode = fw.farm_barcode
      ),
      owner_payment_paid = COALESCE(owner_payment_paid, 0),
      owner_payment_status = COALESCE(owner_payment_status, 'pending')
    WHERE EXISTS (
      SELECT 1 FROM farms WHERE barcode = fw.farm_barcode
    );

    RAISE NOTICE '✅ تم تحديث % محفظة بالبيانات الجديدة', (SELECT COUNT(*) FROM farm_wallets);
  END IF;
END $$;

-- رسالة توضيحية
DO $$
BEGIN
  RAISE NOTICE '✅ تم تحسين نظام إنشاء المحافظ المالية';
  RAISE NOTICE '📊 الآن عند إضافة مزرعة جديدة:';
  RAISE NOTICE '   1. تُنشأ المحفظة تلقائياً';
  RAISE NOTICE '   2. owner_payment_due = السعر الفعلي';
  RAISE NOTICE '   3. owner_payment_paid = 0';
  RAISE NOTICE '   4. owner_payment_status = pending';
  RAISE NOTICE '   5. المزرعة تظهر فوراً في لوحة الإدارة المالية';
END $$;

/*
  # ربط الحجوزات بتسديدات صاحب المزرعة

  ## التغييرات
  1. تعديل trigger الحجوزات لتسجيل المدفوعات كتسديد لصاحب المزرعة
  2. عند دفع حجز جديد:
     - يتم تسجيل المبلغ في farm_ledgers كـ "investor_deposit"
     - يتم تحديث owner_payment_paid في farm_wallets
     - يتم تحديث owner_payment_status تلقائياً

  ## المنطق
  - عمليات الشراء (الحجوزات) = تسديد لصاحب المزرعة
  - المبلغ المدفوع من المستثمر = جزء من السعر الفعلي للمزرعة
  - عندما يكتمل التسديد → owner_payment_status = 'completed'
  - فقط بعد التسديد الكامل → يتم حساب ربح المنصة
*/

-- دالة محسّنة لتسجيل الحجوزات كتسديد لصاحب المزرعة
CREATE OR REPLACE FUNCTION record_reservation_as_owner_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_barcode text;
  v_operation_number text;
  v_owner_name text;
BEGIN
  -- جلب معلومات المزرعة
  SELECT barcode, owner_name
  INTO v_farm_barcode, v_owner_name
  FROM farms
  WHERE id = NEW.farm_id;

  IF v_farm_barcode IS NULL THEN
    RAISE NOTICE 'المزرعة غير موجودة: %', NEW.farm_id;
    RETURN NEW;
  END IF;

  -- التأكد من وجود محفظة مالية للمزرعة
  -- التحقق من وجود الحقول الجديدة
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_due'
  ) THEN
    -- إذا كانت الحقول موجودة، استخدم INSERT الكامل
    INSERT INTO farm_wallets (
      farm_barcode,
      balance,
      total_income,
      total_expense,
      frozen_amount,
      status,
      owner_payment_due,
      owner_payment_paid,
      owner_payment_status,
      created_at,
      updated_at
    )
    VALUES (
      v_farm_barcode,
      0,
      0,
      0,
      0,
      'active',
      (SELECT total_actual_price FROM farms WHERE barcode = v_farm_barcode),
      0,
      'pending',
      now(),
      now()
    )
    ON CONFLICT (farm_barcode) DO NOTHING;
  ELSE
    -- إذا لم تكن موجودة، استخدم INSERT الأساسي فقط
    INSERT INTO farm_wallets (
      farm_barcode,
      balance,
      total_income,
      total_expense,
      frozen_amount,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_farm_barcode,
      0,
      0,
      0,
      0,
      'active',
      now(),
      now()
    )
    ON CONFLICT (farm_barcode) DO NOTHING;
  END IF;

  -- فقط إذا تم الدفع (completed أو paid)
  IF NEW.payment_status IN ('completed', 'paid') THEN

    -- تسجيل المعاملة كإيداع من مستثمر (يُعتبر تسديداً لصاحب المزرعة)
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
      'investor_deposit',
      NEW.total_amount,
      NULL,
      'تسديد من حجز: ' || COALESCE(NEW.customer_name, 'مستثمر') || ' - ' || NEW.tree_count || ' شجرة',
      COALESCE(NEW.customer_name, 'مستثمر'),
      COALESCE(v_owner_name, 'صاحب المزرعة'),
      NEW.id,
      'completed',
      now(),
      now()
    );

    -- تحديث المحفظة المالية
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_paid'
    ) THEN
      -- إذا كانت الحقول الجديدة موجودة
      UPDATE farm_wallets
      SET
        balance = balance + NEW.total_amount,
        total_income = total_income + NEW.total_amount,
        owner_payment_paid = COALESCE(owner_payment_paid, 0) + NEW.total_amount,
        updated_at = now()
      WHERE farm_barcode = v_farm_barcode;
    ELSE
      -- إذا لم تكن موجودة، استخدم UPDATE الأساسي فقط
      UPDATE farm_wallets
      SET
        balance = balance + NEW.total_amount,
        total_income = total_income + NEW.total_amount,
        updated_at = now()
      WHERE farm_barcode = v_farm_barcode;
    END IF;

    -- ملاحظة: owner_payment_status سيتم تحديثه تلقائياً بواسطة trigger موجود مسبقاً

    -- تسجيل في سجل التدقيق
    v_operation_number := 'OWNER-PAY-' || substring(gen_random_uuid()::text, 1, 8);

    INSERT INTO farm_financial_audit_log (
      operation_number,
      farm_barcode,
      operation_type,
      from_entity,
      to_entity,
      amount,
      status,
      metadata,
      created_at
    )
    VALUES (
      v_operation_number,
      v_farm_barcode,
      'owner_payment_deposit',
      COALESCE(NEW.customer_name, 'مستثمر'),
      COALESCE(v_owner_name, 'صاحب المزرعة'),
      NEW.total_amount,
      'completed',
      jsonb_build_object(
        'reservation_id', NEW.id,
        'customer_name', NEW.customer_name,
        'customer_phone', NEW.customer_phone,
        'tree_count', NEW.tree_count,
        'tree_type', NEW.tree_type,
        'payment_method', NEW.payment_method
      ),
      now()
    );

  END IF;

  RETURN NEW;
END;
$$;

-- استبدال trigger الحجوزات القديم بالجديد
DROP TRIGGER IF EXISTS trigger_record_financial_transaction ON reservations;

CREATE TRIGGER trigger_record_owner_payment
  AFTER INSERT OR UPDATE OF payment_status
  ON reservations
  FOR EACH ROW
  WHEN (NEW.payment_status IN ('completed', 'paid'))
  EXECUTE FUNCTION record_reservation_as_owner_payment();

-- تحديث البيانات الموجودة: حساب owner_payment_paid من الحجوزات المدفوعة
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_wallets' AND column_name = 'owner_payment_paid'
  ) THEN
    UPDATE farm_wallets fw
    SET owner_payment_paid = (
      SELECT COALESCE(SUM(r.total_amount), 0)
      FROM reservations r
      JOIN farms f ON f.id = r.farm_id
      WHERE f.barcode = fw.farm_barcode
        AND r.payment_status IN ('completed', 'paid')
    )
    WHERE EXISTS (
      SELECT 1 FROM farms WHERE barcode = fw.farm_barcode
    );
  END IF;
END $$;

-- رسالة توضيحية
DO $$
BEGIN
  RAISE NOTICE '✅ تم ربط نظام الحجوزات بتسديدات أصحاب المزارع';
  RAISE NOTICE '📊 الآن عند شراء أشجار:';
  RAISE NOTICE '   1. يُسجل المبلغ كتسديد لصاحب المزرعة';
  RAISE NOTICE '   2. يُحدّث owner_payment_paid تلقائياً';
  RAISE NOTICE '   3. عند اكتمال التسديد → يُحسب ربح المنصة';
END $$;

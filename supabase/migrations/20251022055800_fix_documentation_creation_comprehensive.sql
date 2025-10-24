/*
  # إصلاح شامل لنظام إنشاء التوثيق التلقائي

  ## المشكلة الجذرية
  - الشهادات لا تُنشأ تلقائياً عند تغيير booking_status إلى documented
  - الدالة auto_migrate_to_documentation تشترط شروط صارمة جداً
  - لا يوجد Trigger تلقائي لإنشاء السجلات في documentation

  ## الحل الشامل

  1. **دالة محسّنة للنقل إلى التوثيق**
     - شروط أكثر مرونة
     - دعم جميع حالات payment_status
     - إنشاء المستثمر تلقائياً إذا لم يوجد
     - معالجة أخطاء RLS بشكل صحيح

  2. **Trigger تلقائي على reservations**
     - عند تغيير booking_status إلى 'documented'
     - إنشاء سجل في documentation تلقائياً
     - بدون تدخل يدوي

  3. **دالة مساعدة لإنشاء التوثيق مباشرة**
     - للاستخدام اليدوي من لوحة الإدارة
     - تتجاوز جميع الشروط

  ## الأمان
  - SECURITY DEFINER للتعامل مع RLS
  - التحقق من البيانات قبل الإدراج
  - تسجيل كامل في audit_log
*/

-- ===================================================================
-- الجزء 1: دالة محسّنة لإنشاء التوثيق (أكثر مرونة)
-- ===================================================================

DROP FUNCTION IF EXISTS auto_migrate_to_documentation(uuid, uuid, text);

CREATE OR REPLACE FUNCTION auto_migrate_to_documentation(
  p_booking_id uuid,
  p_migrated_by uuid DEFAULT NULL,
  p_migration_reason text DEFAULT 'Certificate issued'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_documentation_id uuid;
  v_certificate_code text;
  v_verification_token text;
  v_booking_code text;
  v_source_table text;
  v_farm_code text;
  v_investor_id uuid;
BEGIN
  -- محاولة البحث في جدول reservations أولاً
  SELECT
    id,
    farm_id,
    customer_name,
    customer_phone,
    number_of_trees,
    total_amount,
    booking_status,
    payment_status,
    status,
    investor_id
  INTO v_booking
  FROM reservations
  WHERE id = p_booking_id
    AND deleted_at IS NULL;

  IF FOUND THEN
    v_source_table := 'reservations';
    v_booking_code := 'RES-' || substring(v_booking.id::text, 1, 8);

    -- 🔍 البحث عن المستثمر بناءً على investor_id أو رقم الهاتف
    v_investor_id := v_booking.investor_id;

    IF v_investor_id IS NULL THEN
      SELECT id INTO v_investor_id
      FROM investors
      WHERE mobile_number = v_booking.customer_phone
        AND deleted_at IS NULL
      LIMIT 1;
    END IF;

    -- إذا لم يوجد المستثمر، إنشاؤه
    IF v_investor_id IS NULL THEN
      INSERT INTO investors (
        full_name,
        mobile_number,
        email,
        total_investments,
        active_investments,
        created_at
      ) VALUES (
        v_booking.customer_name,
        v_booking.customer_phone,
        v_booking.customer_phone || '@investor.temp',
        v_booking.total_amount,
        1,
        now()
      )
      RETURNING id INTO v_investor_id;

      RAISE NOTICE '✅ تم إنشاء مستثمر جديد: %', v_investor_id;
    END IF;

    RAISE NOTICE '✅ تم العثور على الحجز في reservations';
  ELSE
    -- إذا لم توجد في reservations، ابحث في bookings
    SELECT
      id,
      farm_id,
      booking_code,
      investor_id,
      investor_name,
      reserved_trees,
      total_price,
      booking_status,
      payment_status
    INTO v_booking
    FROM bookings
    WHERE id = p_booking_id
      AND deleted_at IS NULL;

    IF FOUND THEN
      v_source_table := 'bookings';
      v_booking_code := v_booking.booking_code;
      v_investor_id := v_booking.investor_id;

      RAISE NOTICE '✅ تم العثور على الحجز في bookings';
    ELSE
      RAISE EXCEPTION '❌ الحجز غير موجود (ID: %)', p_booking_id;
    END IF;
  END IF;

  -- التحقق من عدم وجود شهادة سابقة
  IF EXISTS (
    SELECT 1 FROM documentation
    WHERE booking_id = p_booking_id
  ) THEN
    RAISE NOTICE '⚠️ شهادة موجودة بالفعل لهذا الحجز';
    SELECT id INTO v_documentation_id
    FROM documentation
    WHERE booking_id = p_booking_id
    LIMIT 1;

    RETURN v_documentation_id;
  END IF;

  -- توليد رقم الشهادة ورمز التحقق
  v_certificate_code := generate_certificate_code();
  v_verification_token := replace(gen_random_uuid()::text, '-', '');

  -- الحصول على farm_code
  SELECT farm_code INTO v_farm_code
  FROM farms
  WHERE id = v_booking.farm_id
  LIMIT 1;

  -- إنشاء سجل التوثيق (مع تجاوز RLS بفضل SECURITY DEFINER)
  IF v_source_table = 'reservations' THEN
    INSERT INTO documentation (
      booking_id,
      booking_code,
      certificate_code,
      farm_id,
      farm_code,
      investor_id,
      investor_name,
      reserved_trees,
      total_price,
      verification_token,
      status,
      created_at
    ) VALUES (
      v_booking.id,
      v_booking_code,
      v_certificate_code,
      v_booking.farm_id,
      v_farm_code,
      v_investor_id,
      v_booking.customer_name,
      v_booking.number_of_trees,
      v_booking.total_amount,
      v_verification_token,
      'documented',
      now()
    )
    RETURNING id INTO v_documentation_id;
  ELSE
    INSERT INTO documentation (
      booking_id,
      booking_code,
      certificate_code,
      farm_id,
      farm_code,
      investor_id,
      investor_name,
      reserved_trees,
      total_price,
      verification_token,
      status,
      created_at
    ) VALUES (
      v_booking.id,
      v_booking.booking_code,
      v_certificate_code,
      v_booking.farm_id,
      v_farm_code,
      v_booking.investor_id,
      v_booking.investor_name,
      v_booking.reserved_trees,
      v_booking.total_price,
      v_verification_token,
      'documented',
      now()
    )
    RETURNING id INTO v_documentation_id;
  END IF;

  RAISE NOTICE '✅ تم إنشاء توثيق جديد: %', v_documentation_id;

  -- تحديث booking_status إلى documented
  IF v_source_table = 'reservations' THEN
    UPDATE reservations
    SET
      booking_status = 'documented',
      updated_at = now()
    WHERE id = p_booking_id;
  ELSE
    UPDATE bookings
    SET
      booking_status = 'documented',
      updated_at = now()
    WHERE id = p_booking_id;
  END IF;

  -- إنشاء سجل في investor_certificates للمستثمر
  INSERT INTO investor_certificates (
    investor_id,
    certificate_code,
    documentation_id,
    farm_name,
    trees_count,
    issue_date,
    status,
    created_at
  ) VALUES (
    v_investor_id,
    v_certificate_code,
    v_documentation_id,
    (SELECT name_ar FROM farms WHERE id = v_booking.farm_id LIMIT 1),
    COALESCE(v_booking.number_of_trees, v_booking.reserved_trees),
    now(),
    'active',
    now()
  )
  ON CONFLICT (certificate_code) DO NOTHING;

  -- تسجيل في audit_log
  INSERT INTO audit_log (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_by,
    changed_at
  ) VALUES (
    'documentation',
    v_documentation_id,
    'MIGRATE_TO_DOCUMENTATION',
    json_build_object('booking_id', p_booking_id),
    json_build_object(
      'documentation_id', v_documentation_id,
      'certificate_code', v_certificate_code,
      'reason', p_migration_reason
    ),
    p_migrated_by,
    now()
  );

  RETURN v_documentation_id;
END;
$$;

-- ===================================================================
-- الجزء 2: Trigger تلقائي على reservations
-- ===================================================================

-- دالة Trigger لإنشاء التوثيق تلقائياً عند تغيير booking_status
CREATE OR REPLACE FUNCTION trigger_auto_create_documentation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_documentation_id uuid;
BEGIN
  -- التحقق من أن الحالة تغيرت إلى documented
  IF NEW.booking_status = 'documented' AND (OLD.booking_status IS NULL OR OLD.booking_status != 'documented') THEN

    -- التحقق من عدم وجود شهادة سابقة
    IF NOT EXISTS (
      SELECT 1 FROM documentation
      WHERE booking_id = NEW.id
    ) THEN

      BEGIN
        -- محاولة إنشاء التوثيق تلقائياً
        v_documentation_id := auto_migrate_to_documentation(
          NEW.id,
          NULL,
          'Auto-created by trigger'
        );

        RAISE NOTICE '✅ تم إنشاء توثيق تلقائياً: %', v_documentation_id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '⚠️ فشل إنشاء التوثيق التلقائي: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء Trigger على جدول reservations
DROP TRIGGER IF EXISTS trigger_reservations_auto_documentation ON reservations;

CREATE TRIGGER trigger_reservations_auto_documentation
  AFTER UPDATE OF booking_status ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_status = 'documented')
  EXECUTE FUNCTION trigger_auto_create_documentation();

COMMENT ON TRIGGER trigger_reservations_auto_documentation ON reservations IS
'إنشاء سجل توثيق تلقائياً عند تغيير booking_status إلى documented';

-- ===================================================================
-- الجزء 3: دالة مساعدة لإصلاح الشهادات المفقودة
-- ===================================================================

CREATE OR REPLACE FUNCTION fix_missing_documentation_records()
RETURNS TABLE(
  reservation_id uuid,
  documentation_id uuid,
  certificate_code text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation record;
  v_doc_id uuid;
BEGIN
  -- البحث عن جميع الحجوزات الموثقة التي ليس لها سجل في documentation
  FOR v_reservation IN
    SELECT r.id, r.customer_name
    FROM reservations r
    WHERE r.booking_status = 'documented'
      AND r.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM documentation d
        WHERE d.booking_id = r.id
      )
  LOOP
    BEGIN
      -- محاولة إنشاء التوثيق
      v_doc_id := auto_migrate_to_documentation(
        v_reservation.id,
        NULL,
        'Fixed by fix_missing_documentation_records'
      );

      RETURN QUERY
      SELECT
        v_reservation.id,
        v_doc_id,
        (SELECT certificate_code FROM documentation WHERE id = v_doc_id),
        'success'::text;

    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY
        SELECT
          v_reservation.id,
          NULL::uuid,
          NULL::text,
          ('error: ' || SQLERRM)::text;
    END;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION fix_missing_documentation_records() IS
'إصلاح الشهادات المفقودة - إنشاء سجلات documentation لجميع الحجوزات الموثقة';

-- ===================================================================
-- الجزء 4: منح الصلاحيات
-- ===================================================================

-- منح صلاحيات التنفيذ لجميع المستخدمين
GRANT EXECUTE ON FUNCTION auto_migrate_to_documentation(uuid, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION fix_missing_documentation_records() TO authenticated;

-- ===================================================================
-- الجزء 5: تشغيل الإصلاح التلقائي
-- ===================================================================

-- إصلاح جميع السجلات المفقودة الموجودة حالياً
DO $$
DECLARE
  v_result record;
  v_fixed_count integer := 0;
  v_error_count integer := 0;
BEGIN
  RAISE NOTICE '🔧 بدء إصلاح السجلات المفقودة...';

  FOR v_result IN
    SELECT * FROM fix_missing_documentation_records()
  LOOP
    IF v_result.status = 'success' THEN
      v_fixed_count := v_fixed_count + 1;
      RAISE NOTICE '✅ تم إصلاح: % -> %', v_result.reservation_id, v_result.certificate_code;
    ELSE
      v_error_count := v_error_count + 1;
      RAISE WARNING '❌ فشل: % -> %', v_result.reservation_id, v_result.status;
    END IF;
  END LOOP;

  RAISE NOTICE '📊 النتائج: تم إصلاح % سجل، فشل %', v_fixed_count, v_error_count;
END;
$$;

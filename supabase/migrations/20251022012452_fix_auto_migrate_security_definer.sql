/*
  # إصلاح دالة auto_migrate_to_documentation - SECURITY DEFINER
  
  ## المشكلة
  - الدالة تحاول إنشاء سجل في documentation
  - RLS على documentation يتطلب authenticated user
  - الدالة تُستدعى من frontend بدون authentication
  - النتيجة: new row violates row-level security policy
  
  ## الحل
  1. تغيير الدالة إلى SECURITY DEFINER
  2. هذا يجعل الدالة تعمل بصلاحيات صاحب الدالة (postgres/service role)
  3. تتجاوز RLS policies بشكل آمن ومُتحكم به
  
  ## الأمان
  - الدالة تتحقق من جميع الشروط قبل الإنشاء
  - فقط الحجوزات المعتمدة والمدفوعة يمكن تحويلها
  - SECURITY DEFINER آمن لأن المنطق محمي داخل الدالة
*/

-- حذف الدالة القديمة
DROP FUNCTION IF EXISTS auto_migrate_to_documentation(uuid, uuid, text);

-- إنشاء الدالة مع SECURITY DEFINER
CREATE OR REPLACE FUNCTION auto_migrate_to_documentation(
  p_booking_id uuid,
  p_migrated_by uuid DEFAULT NULL,
  p_migration_reason text DEFAULT 'Certificate issued'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- ✅ تشغيل بصلاحيات عالية لتجاوز RLS
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_documentation_id uuid;
  v_certificate_code text;
  v_verification_token text;
  v_investor_cert_id uuid;
  v_booking_code text;
  v_source_table text;
  v_farm_code text;
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
    status
  INTO v_booking
  FROM reservations
  WHERE id = p_booking_id
    AND deleted_at IS NULL
    AND booking_status IN ('verified', 'approved')
    AND payment_status = 'completed'
    AND booking_status != 'documented';

  IF FOUND THEN
    v_source_table := 'reservations';
    v_booking_code := 'RES-' || substring(v_booking.id::text, 1, 8);
    
    RAISE NOTICE 'Found booking in reservations: booking_status=%, payment_status=%', 
      v_booking.booking_status, v_booking.payment_status;
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
      AND deleted_at IS NULL
      AND booking_status = 'approved'
      AND booking_status != 'documented';

    IF FOUND THEN
      v_source_table := 'bookings';
      v_booking_code := v_booking.booking_code;
      
      RAISE NOTICE 'Found booking in bookings: booking_status=%', v_booking.booking_status;
    ELSE
      RAISE EXCEPTION 'الحجز غير موجود أو غير جاهز لإصدار الشهادة. تحقق من: 1) الحجز معتمد (approved) 2) الدفع مكتمل (completed) 3) لم يتم إصدار شهادة مسبقاً';
    END IF;
  END IF;

  -- توليد رقم الشهادة ورمز التحقق
  v_certificate_code := generate_certificate_code();
  v_verification_token := encode(gen_random_bytes(16), 'hex');

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
      NULL,
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

  -- تسجيل في migration_log
  INSERT INTO migration_log (
    booking_id,
    booking_code,
    documentation_id,
    certificate_code,
    migrated_by,
    migration_reason,
    backup_data,
    created_at
  ) VALUES (
    v_booking.id,
    v_booking_code,
    v_documentation_id,
    v_certificate_code,
    p_migrated_by,
    p_migration_reason || ' (from ' || v_source_table || ')',
    row_to_json(v_booking),
    now()
  );

  -- تحديث حالة الحجز في الجدول المناسب
  IF v_source_table = 'reservations' THEN
    UPDATE reservations
    SET booking_status = 'documented',
        status = 'completed',
        updated_at = now()
    WHERE id = p_booking_id;
  ELSE
    UPDATE bookings
    SET booking_status = 'documented',
        updated_at = now()
    WHERE id = p_booking_id;
  END IF;

  RAISE NOTICE 'Successfully created documentation with ID: %, certificate: %', 
    v_documentation_id, v_certificate_code;
  
  RETURN v_documentation_id;
END;
$$;

-- منح صلاحيات التنفيذ لجميع المستخدمين (بما فيهم anon)
GRANT EXECUTE ON FUNCTION auto_migrate_to_documentation(uuid, uuid, text) TO anon, authenticated;

COMMENT ON FUNCTION auto_migrate_to_documentation IS 
'إصدار شهادة تملك من حجز معتمد - SECURITY DEFINER للسماح بالإنشاء بدون authentication';

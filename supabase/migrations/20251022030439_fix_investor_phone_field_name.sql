/*
  # إصلاح اسم حقل الهاتف في دالة auto_migrate_to_documentation

  ## المشكلة
  - الدالة تستخدم mobile_number لكن الحقل الصحيح هو phone
  - هذا يسبب فشل في البحث عن المستثمر وإنشاء مستثمر جديد في كل مرة

  ## الحل
  - تحديث الدالة لاستخدام phone بدلاً من mobile_number
*/

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
  SELECT id, farm_id, customer_name, customer_phone, number_of_trees, total_amount, booking_status, payment_status, status, investor_id
  INTO v_booking
  FROM reservations
  WHERE id = p_booking_id AND deleted_at IS NULL;

  IF FOUND THEN
    v_source_table := 'reservations';
    v_booking_code := 'RES-' || substring(v_booking.id::text, 1, 8);
    v_investor_id := v_booking.investor_id;

    IF v_investor_id IS NULL THEN
      SELECT id INTO v_investor_id FROM investors WHERE phone = v_booking.customer_phone AND deleted_at IS NULL LIMIT 1;
    END IF;

    IF v_investor_id IS NULL THEN
      INSERT INTO investors (full_name, phone, email, total_investments, active_investments, created_at)
      VALUES (v_booking.customer_name, v_booking.customer_phone, v_booking.customer_phone || '@investor.temp', v_booking.total_amount, 1, now())
      RETURNING id INTO v_investor_id;

      RAISE NOTICE 'تم إنشاء مستثمر جديد';
    END IF;
  ELSE
    SELECT id, farm_id, booking_code, investor_id, investor_name, reserved_trees, total_price, booking_status, payment_status
    INTO v_booking
    FROM bookings
    WHERE id = p_booking_id AND deleted_at IS NULL;

    IF FOUND THEN
      v_source_table := 'bookings';
      v_booking_code := v_booking.booking_code;
      v_investor_id := v_booking.investor_id;
    ELSE
      RAISE EXCEPTION 'الحجز غير موجود';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM documentation WHERE booking_id = p_booking_id) THEN
    SELECT id INTO v_documentation_id FROM documentation WHERE booking_id = p_booking_id LIMIT 1;
    RETURN v_documentation_id;
  END IF;

  v_certificate_code := generate_certificate_code();
  v_verification_token := replace(gen_random_uuid()::text, '-', '');
  SELECT farm_code INTO v_farm_code FROM farms WHERE id = v_booking.farm_id LIMIT 1;

  IF v_source_table = 'reservations' THEN
    INSERT INTO documentation (booking_id, booking_code, certificate_code, farm_id, farm_code, investor_id, investor_name, reserved_trees, total_price, verification_token, status, created_at)
    VALUES (v_booking.id, v_booking_code, v_certificate_code, v_booking.farm_id, v_farm_code, v_investor_id, v_booking.customer_name, v_booking.number_of_trees, v_booking.total_amount, v_verification_token, 'documented', now())
    RETURNING id INTO v_documentation_id;
  ELSE
    INSERT INTO documentation (booking_id, booking_code, certificate_code, farm_id, farm_code, investor_id, investor_name, reserved_trees, total_price, verification_token, status, created_at)
    VALUES (v_booking.id, v_booking.booking_code, v_certificate_code, v_booking.farm_id, v_farm_code, v_booking.investor_id, v_booking.investor_name, v_booking.reserved_trees, v_booking.total_price, v_verification_token, 'documented', now())
    RETURNING id INTO v_documentation_id;
  END IF;

  IF v_source_table = 'reservations' THEN
    UPDATE reservations SET booking_status = 'documented', updated_at = now() WHERE id = p_booking_id;
  ELSE
    UPDATE bookings SET booking_status = 'documented', updated_at = now() WHERE id = p_booking_id;
  END IF;

  INSERT INTO investor_certificates (investor_id, certificate_code, documentation_id, farm_name, trees_count, issue_date, status, created_at)
  VALUES (v_investor_id, v_certificate_code, v_documentation_id, (SELECT name_ar FROM farms WHERE id = v_booking.farm_id LIMIT 1), COALESCE(v_booking.number_of_trees, v_booking.reserved_trees), now(), 'active', now())
  ON CONFLICT (certificate_code) DO NOTHING;

  RETURN v_documentation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION auto_migrate_to_documentation(uuid, uuid, text) TO anon, authenticated;

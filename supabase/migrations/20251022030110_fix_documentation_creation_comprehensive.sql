/*
  # إصلاح شامل لنظام إنشاء التوثيق التلقائي

  ## المشكلة الجذرية
  - الشهادات لا تُنشأ تلقائياً عند تغيير booking_status إلى documented
  - الدالة auto_migrate_to_documentation تشترط شروط صارمة جداً
  - لا يوجد Trigger تلقائي لإنشاء السجلات في documentation

  ## الحل الشامل

  1. دالة محسّنة للنقل إلى التوثيق
  2. Trigger تلقائي على reservations
  3. دالة مساعدة لإصلاح الشهادات المفقودة
*/

-- الجزء 1: دالة محسّنة
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
      SELECT id INTO v_investor_id FROM investors WHERE mobile_number = v_booking.customer_phone AND deleted_at IS NULL LIMIT 1;
    END IF;

    IF v_investor_id IS NULL THEN
      INSERT INTO investors (full_name, mobile_number, email, total_investments, active_investments, created_at)
      VALUES (v_booking.customer_name, v_booking.customer_phone, v_booking.customer_phone || '@investor.temp', v_booking.total_amount, 1, now())
      RETURNING id INTO v_investor_id;
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

-- الجزء 2: Trigger تلقائي
CREATE OR REPLACE FUNCTION trigger_auto_create_documentation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_documentation_id uuid;
BEGIN
  IF NEW.booking_status = 'documented' AND (OLD.booking_status IS NULL OR OLD.booking_status != 'documented') THEN
    IF NOT EXISTS (SELECT 1 FROM documentation WHERE booking_id = NEW.id) THEN
      BEGIN
        v_documentation_id := auto_migrate_to_documentation(NEW.id, NULL, 'Auto-created by trigger');
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'فشل إنشاء التوثيق التلقائي: %', SQLERRM;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_reservations_auto_documentation ON reservations;
CREATE TRIGGER trigger_reservations_auto_documentation
  AFTER UPDATE OF booking_status ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_status = 'documented')
  EXECUTE FUNCTION trigger_auto_create_documentation();

-- الجزء 3: دالة إصلاح
CREATE OR REPLACE FUNCTION fix_missing_documentation_records()
RETURNS TABLE(reservation_id uuid, documentation_id uuid, certificate_code text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation record;
  v_doc_id uuid;
BEGIN
  FOR v_reservation IN
    SELECT r.id, r.customer_name FROM reservations r
    WHERE r.booking_status = 'documented' AND r.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM documentation d WHERE d.booking_id = r.id)
  LOOP
    BEGIN
      v_doc_id := auto_migrate_to_documentation(v_reservation.id, NULL, 'Fixed by fix_missing_documentation_records');
      RETURN QUERY SELECT v_reservation.id, v_doc_id, (SELECT certificate_code FROM documentation WHERE id = v_doc_id), 'success'::text;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT v_reservation.id, NULL::uuid, NULL::text, ('error: ' || SQLERRM)::text;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION auto_migrate_to_documentation(uuid, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION fix_missing_documentation_records() TO authenticated;

-- الجزء 4: تشغيل الإصلاح
DO $$
DECLARE
  v_result record;
  v_fixed_count integer := 0;
BEGIN
  FOR v_result IN SELECT * FROM fix_missing_documentation_records() LOOP
    IF v_result.status = 'success' THEN
      v_fixed_count := v_fixed_count + 1;
    END IF;
  END LOOP;
END;
$$;

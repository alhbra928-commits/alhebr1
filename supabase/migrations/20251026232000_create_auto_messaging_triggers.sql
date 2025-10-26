/*
  # Auto Messaging Engine - Event Triggers

  ## Overview
  Automated WhatsApp messaging triggers for key platform events.
  Monitors system events and automatically sends WhatsApp messages via event connectors.

  ## Event Triggers

  1. **booking_created** - When a new booking is created
  2. **booking_confirmed** - When booking payment is completed
  3. **certificate_issued** - When ownership certificate is issued
  4. **payment_received** - When payment receipt is approved
  5. **payment_rejected** - When payment receipt is rejected
  6. **settlement_completed** - When profit settlement is completed
  7. **farm_approved** - When farm submission is approved
  8. **farm_rejected** - When farm submission is rejected
  9. **investor_welcome** - When new investor registers
  10. **owner_welcome** - When new farm owner registers

  ## Security
  - Triggers run as SECURITY DEFINER for system operations
  - All messages logged for audit trail
*/

-- Trigger: booking_created
CREATE OR REPLACE FUNCTION notify_whatsapp_booking_created()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  -- Get investor and farm details
  SELECT i.phone, i.full_name_ar
  INTO v_investor_phone, v_investor_name
  FROM investors i
  WHERE i.id = NEW.investor_id;

  SELECT f.name_ar
  INTO v_farm_name
  FROM farms f
  WHERE f.farm_code = NEW.farm_code;

  -- Only send if investor has phone
  IF v_investor_phone IS NOT NULL THEN
    PERFORM trigger_whatsapp_event(
      p_event_type := 'booking_created',
      p_recipient_phone := v_investor_phone,
      p_recipient_name := v_investor_name,
      p_variables := jsonb_build_object(
        'اسم_المستخدم', v_investor_name,
        'رقم_الحجز', NEW.id::text,
        'المزرعة', v_farm_name,
        'عدد_الأشجار', NEW.reserved_trees::text,
        'المبلغ', NEW.total_price::text,
        'التاريخ', NEW.created_at::date::text,
        'customer_name', v_investor_name,
        'booking_id', NEW.id::text,
        'farm_name', v_farm_name,
        'trees_count', NEW.reserved_trees::text,
        'amount', NEW.total_price::text,
        'date', NEW.created_at::date::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_booking_created_whatsapp
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_status = 'pending')
  EXECUTE FUNCTION notify_whatsapp_booking_created();

-- Trigger: certificate_issued
CREATE OR REPLACE FUNCTION notify_whatsapp_certificate_issued()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  -- Get investor and farm details from reservation
  SELECT i.phone, i.full_name_ar, f.name_ar
  INTO v_investor_phone, v_investor_name, v_farm_name
  FROM investors i
  JOIN reservations r ON r.investor_id = i.id
  JOIN farms f ON f.farm_code = r.farm_code
  WHERE r.id = NEW.reservation_id;

  -- Send WhatsApp notification
  IF v_investor_phone IS NOT NULL THEN
    PERFORM trigger_whatsapp_event(
      p_event_type := 'certificate_issued',
      p_recipient_phone := v_investor_phone,
      p_recipient_name := v_investor_name,
      p_variables := jsonb_build_object(
        'اسم_المستخدم', v_investor_name,
        'رقم_الشهادة', NEW.certificate_number,
        'المزرعة', v_farm_name,
        'عدد_الأشجار', NEW.trees_count::text,
        'رمز_التحقق', NEW.verification_token,
        'customer_name', v_investor_name,
        'certificate_number', NEW.certificate_number,
        'farm_name', v_farm_name,
        'trees_count', NEW.trees_count::text,
        'verification_code', NEW.verification_token
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_certificate_issued_whatsapp
  AFTER INSERT ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_certificate_issued();

-- Trigger: payment_received
CREATE OR REPLACE FUNCTION notify_whatsapp_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  -- Only trigger when status changes to verified
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    -- Get investor and farm details
    SELECT i.phone, i.full_name_ar, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM investors i
    JOIN reservations r ON r.investor_id = i.id
    JOIN farms f ON f.farm_code = r.farm_code
    WHERE r.id = NEW.reservation_id;

    IF v_investor_phone IS NOT NULL THEN
      PERFORM trigger_whatsapp_event(
        p_event_type := 'payment_received',
        p_recipient_phone := v_investor_phone,
        p_recipient_name := v_investor_name,
        p_variables := jsonb_build_object(
          'اسم_المستخدم', v_investor_name,
          'المزرعة', v_farm_name,
          'المبلغ', NEW.amount::text,
          'التاريخ', NEW.payment_date::text,
          'customer_name', v_investor_name,
          'farm_name', v_farm_name,
          'amount', NEW.amount::text,
          'date', NEW.payment_date::text
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_payment_received_whatsapp
  AFTER UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_payment_received();

-- Trigger: payment_rejected
CREATE OR REPLACE FUNCTION notify_whatsapp_payment_rejected()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  -- Only trigger when status changes to rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Get investor and farm details
    SELECT i.phone, i.full_name_ar, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM investors i
    JOIN reservations r ON r.investor_id = i.id
    JOIN farms f ON f.farm_code = r.farm_code
    WHERE r.id = NEW.reservation_id;

    IF v_investor_phone IS NOT NULL THEN
      PERFORM trigger_whatsapp_event(
        p_event_type := 'payment_rejected',
        p_recipient_phone := v_investor_phone,
        p_recipient_name := v_investor_name,
        p_variables := jsonb_build_object(
          'اسم_المستخدم', v_investor_name,
          'المزرعة', v_farm_name,
          'سبب_الرفض', COALESCE(NEW.rejection_reason, 'غير محدد'),
          'customer_name', v_investor_name,
          'farm_name', v_farm_name,
          'rejection_reason', COALESCE(NEW.rejection_reason, 'Not specified')
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_payment_rejected_whatsapp
  AFTER UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_payment_rejected();

-- Trigger: farm_approved
CREATE OR REPLACE FUNCTION notify_whatsapp_farm_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_phone text;
  v_owner_name text;
BEGIN
  -- Only trigger when status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get owner details
    SELECT mobile, owner_name
    INTO v_owner_phone, v_owner_name
    FROM farm_owners
    WHERE id = NEW.owner_id;

    IF v_owner_phone IS NOT NULL THEN
      PERFORM trigger_whatsapp_event(
        p_event_type := 'farm_approved',
        p_recipient_phone := v_owner_phone,
        p_recipient_name := v_owner_name,
        p_variables := jsonb_build_object(
          'اسم_المالك', v_owner_name,
          'اسم_المزرعة', NEW.name_ar,
          'الموقع', NEW.location,
          'التاريخ', NEW.updated_at::date::text,
          'owner_name', v_owner_name,
          'farm_name', NEW.name_ar,
          'location', NEW.location,
          'date', NEW.updated_at::date::text
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_farm_approved_whatsapp
  AFTER UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_farm_approved();

-- Trigger: farm_rejected
CREATE OR REPLACE FUNCTION notify_whatsapp_farm_rejected()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_phone text;
  v_owner_name text;
BEGIN
  -- Only trigger when status changes to rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Get owner details
    SELECT mobile, owner_name
    INTO v_owner_phone, v_owner_name
    FROM farm_owners
    WHERE id = NEW.owner_id;

    IF v_owner_phone IS NOT NULL THEN
      PERFORM trigger_whatsapp_event(
        p_event_type := 'farm_rejected',
        p_recipient_phone := v_owner_phone,
        p_recipient_name := v_owner_name,
        p_variables := jsonb_build_object(
          'اسم_المالك', v_owner_name,
          'اسم_المزرعة', NEW.name_ar,
          'owner_name', v_owner_name,
          'farm_name', NEW.name_ar
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_farm_rejected_whatsapp
  AFTER UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_farm_rejected();

-- Trigger: investor_welcome (when first reservation is created)
CREATE OR REPLACE FUNCTION notify_whatsapp_investor_welcome()
RETURNS TRIGGER AS $$
DECLARE
  v_reservation_count integer;
BEGIN
  -- Check if this is investor's first reservation
  SELECT COUNT(*)
  INTO v_reservation_count
  FROM reservations
  WHERE investor_id = NEW.investor_id;

  -- Send welcome message only for first reservation
  IF v_reservation_count = 1 THEN
    PERFORM trigger_whatsapp_event(
      p_event_type := 'investor_welcome',
      p_recipient_phone := (SELECT phone FROM investors WHERE id = NEW.investor_id),
      p_recipient_name := (SELECT full_name_ar FROM investors WHERE id = NEW.investor_id),
      p_variables := jsonb_build_object(
        'اسم_المستخدم', (SELECT full_name_ar FROM investors WHERE id = NEW.investor_id),
        'customer_name', (SELECT full_name_ar FROM investors WHERE id = NEW.investor_id)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_investor_welcome_whatsapp
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_investor_welcome();

-- Trigger: owner_welcome (when farm is first approved)
CREATE OR REPLACE FUNCTION notify_whatsapp_owner_welcome()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_phone text;
  v_owner_name text;
  v_farm_count integer;
BEGIN
  -- Only when status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get owner details and count approved farms
    SELECT fo.mobile, fo.owner_name, COUNT(f.id)
    INTO v_owner_phone, v_owner_name, v_farm_count
    FROM farm_owners fo
    LEFT JOIN farms f ON f.owner_id = fo.id AND f.status = 'approved'
    WHERE fo.id = NEW.owner_id
    GROUP BY fo.id, fo.mobile, fo.owner_name;

    -- Send welcome message only for first approved farm
    IF v_farm_count = 1 AND v_owner_phone IS NOT NULL THEN
      PERFORM trigger_whatsapp_event(
        p_event_type := 'owner_welcome',
        p_recipient_phone := v_owner_phone,
        p_recipient_name := v_owner_name,
        p_variables := jsonb_build_object(
          'اسم_المالك', v_owner_name,
          'اسم_المزرعة', NEW.name_ar,
          'owner_name', v_owner_name,
          'farm_name', NEW.name_ar
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_owner_welcome_whatsapp
  AFTER UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION notify_whatsapp_owner_welcome();

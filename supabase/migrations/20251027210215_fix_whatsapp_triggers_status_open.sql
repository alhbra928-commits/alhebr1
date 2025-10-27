/*
  # إصلاح WhatsApp Triggers - استخدام status = 'open'
  
  المشكلة:
  - الدوال تستخدم status = 'pending'
  - القيم المسموحة: 'open', 'closed', 'archived'
  
  الحل:
  - استبدال 'pending' بـ 'open'
*/

-- 1. إصلاح notify_whatsapp_booking_created
CREATE OR REPLACE FUNCTION notify_whatsapp_booking_created()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  SELECT i.phone, i.full_name
  INTO v_investor_phone, v_investor_name
  FROM investors i
  WHERE i.id = NEW.investor_id;
  
  SELECT f.name_ar
  INTO v_farm_name
  FROM farms f
  WHERE f.id = NEW.farm_id;
  
  INSERT INTO whatsapp_inbox_threads (
    user_phone,
    user_name,
    last_message,
    status,
    metadata
  ) VALUES (
    v_investor_phone,
    COALESCE(v_investor_name, 'مستثمر'),
    format('حجز جديد: %s - %s أشجار', v_farm_name, NEW.number_of_trees),
    'open',
    jsonb_build_object(
      'event_type', 'booking_created',
      'reservation_id', NEW.id,
      'farm_name', v_farm_name,
      'trees', NEW.number_of_trees
    )
  )
  ON CONFLICT (user_phone) 
  DO UPDATE SET
    last_message = EXCLUDED.last_message,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- 2. إصلاح notify_whatsapp_certificate_issued
CREATE OR REPLACE FUNCTION notify_whatsapp_certificate_issued()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  SELECT i.phone, i.full_name, f.name_ar
  INTO v_investor_phone, v_investor_name, v_farm_name
  FROM reservations r
  JOIN investors i ON i.id = r.investor_id
  JOIN farms f ON f.id = r.farm_id
  WHERE r.id = NEW.booking_id;
  
  INSERT INTO whatsapp_inbox_threads (
    user_phone,
    user_name,
    last_message,
    status,
    metadata
  ) VALUES (
    v_investor_phone,
    COALESCE(v_investor_name, 'مستثمر'),
    format('🏆 شهادة ملكيتك جاهزة! - %s', v_farm_name),
    'open',
    jsonb_build_object(
      'event_type', 'certificate_issued',
      'certificate_id', NEW.id,
      'farm_name', v_farm_name
    )
  )
  ON CONFLICT (user_phone) 
  DO UPDATE SET
    last_message = EXCLUDED.last_message,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- 3. إصلاح notify_whatsapp_payment_received
CREATE OR REPLACE FUNCTION notify_whatsapp_payment_received()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    
    SELECT i.phone, i.full_name, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM reservations r
    JOIN investors i ON i.id = r.investor_id
    JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id;
    
    INSERT INTO whatsapp_inbox_threads (
      user_phone,
      user_name,
      last_message,
      status,
      metadata
    ) VALUES (
      v_investor_phone,
      COALESCE(v_investor_name, 'مستثمر'),
      format('✅ تم التحقق من سدادك - %s', v_farm_name),
      'open',
      jsonb_build_object(
        'event_type', 'payment_verified',
        'receipt_id', NEW.id,
        'farm_name', v_farm_name
      )
    )
    ON CONFLICT (user_phone) 
    DO UPDATE SET
      last_message = EXCLUDED.last_message,
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. إصلاح notify_whatsapp_payment_rejected
CREATE OR REPLACE FUNCTION notify_whatsapp_payment_rejected()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_phone text;
  v_investor_name text;
  v_farm_name text;
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    SELECT i.phone, i.full_name, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM reservations r
    JOIN investors i ON i.id = r.investor_id
    JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id;
    
    INSERT INTO whatsapp_inbox_threads (
      user_phone,
      user_name,
      last_message,
      status,
      metadata
    ) VALUES (
      v_investor_phone,
      COALESCE(v_investor_name, 'مستثمر'),
      format('⚠️ يرجى إعادة رفع إيصال السداد - %s', v_farm_name),
      'open',
      jsonb_build_object(
        'event_type', 'payment_rejected',
        'receipt_id', NEW.id,
        'farm_name', v_farm_name,
        'rejection_reason', NEW.verification_notes
      )
    )
    ON CONFLICT (user_phone) 
    DO UPDATE SET
      last_message = EXCLUDED.last_message,
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION notify_whatsapp_booking_created IS 'ALL FIXED: correct columns + status=open';
COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'ALL FIXED: correct columns + status=open + booking_id';
COMMENT ON FUNCTION notify_whatsapp_payment_received IS 'ALL FIXED: correct columns + status=open';
COMMENT ON FUNCTION notify_whatsapp_payment_rejected IS 'ALL FIXED: correct columns + status=open';

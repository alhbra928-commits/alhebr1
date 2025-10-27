/*
  # إصلاح WhatsApp Triggers - استخدام name_ar بدلاً من name
  
  المشكلة:
  - الدوال تستخدم f.name
  - العمود الصحيح في جدول farms هو name_ar
  - يسبب خطأ: column f.name does not exist
  
  الحل:
  - استبدال f.name بـ f.name_ar في جميع الدوال
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
  -- Get investor and farm details
  SELECT i.phone, i.full_name
  INTO v_investor_phone, v_investor_name
  FROM investors i
  WHERE i.id = NEW.investor_id;
  
  SELECT f.name_ar
  INTO v_farm_name
  FROM farms f
  WHERE f.id = NEW.farm_id;
  
  -- Insert WhatsApp notification
  INSERT INTO whatsapp_inbox_threads (
    phone_number,
    customer_name,
    last_message,
    status,
    priority,
    metadata
  ) VALUES (
    v_investor_phone,
    COALESCE(v_investor_name, 'مستثمر'),
    format('حجز جديد: %s - %s أشجار', v_farm_name, NEW.number_of_trees),
    'pending',
    'high',
    jsonb_build_object(
      'event_type', 'booking_created',
      'reservation_id', NEW.id,
      'farm_name', v_farm_name,
      'trees', NEW.number_of_trees
    )
  )
  ON CONFLICT (phone_number) 
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
  -- Get investor and farm details from reservation
  SELECT i.phone, i.full_name, f.name_ar
  INTO v_investor_phone, v_investor_name, v_farm_name
  FROM reservations r
  JOIN investors i ON i.id = r.investor_id
  JOIN farms f ON f.id = r.farm_id
  WHERE r.id = NEW.reservation_id;
  
  -- Insert WhatsApp notification
  INSERT INTO whatsapp_inbox_threads (
    phone_number,
    customer_name,
    last_message,
    status,
    priority,
    metadata
  ) VALUES (
    v_investor_phone,
    COALESCE(v_investor_name, 'مستثمر'),
    format('🏆 شهادة ملكيتك جاهزة! - %s', v_farm_name),
    'pending',
    'urgent',
    jsonb_build_object(
      'event_type', 'certificate_issued',
      'certificate_id', NEW.id,
      'farm_name', v_farm_name
    )
  )
  ON CONFLICT (phone_number) 
  DO UPDATE SET
    last_message = EXCLUDED.last_message,
    priority = 'urgent',
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
  -- Only trigger when status changes to verified
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    
    -- Get investor and farm details
    SELECT i.phone, i.full_name, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM reservations r
    JOIN investors i ON i.id = r.investor_id
    JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id;
    
    -- Insert WhatsApp notification
    INSERT INTO whatsapp_inbox_threads (
      phone_number,
      customer_name,
      last_message,
      status,
      priority,
      metadata
    ) VALUES (
      v_investor_phone,
      COALESCE(v_investor_name, 'مستثمر'),
      format('✅ تم التحقق من سدادك - %s', v_farm_name),
      'pending',
      'high',
      jsonb_build_object(
        'event_type', 'payment_verified',
        'receipt_id', NEW.id,
        'farm_name', v_farm_name
      )
    )
    ON CONFLICT (phone_number) 
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
  -- Only trigger when status changes to rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    -- Get investor and farm details
    SELECT i.phone, i.full_name, f.name_ar
    INTO v_investor_phone, v_investor_name, v_farm_name
    FROM reservations r
    JOIN investors i ON i.id = r.investor_id
    JOIN farms f ON f.id = r.farm_id
    WHERE r.id = NEW.reservation_id;
    
    -- Insert WhatsApp notification
    INSERT INTO whatsapp_inbox_threads (
      phone_number,
      customer_name,
      last_message,
      status,
      priority,
      metadata
    ) VALUES (
      v_investor_phone,
      COALESCE(v_investor_name, 'مستثمر'),
      format('⚠️ يرجى إعادة رفع إيصال السداد - %s', v_farm_name),
      'pending',
      'urgent',
      jsonb_build_object(
        'event_type', 'payment_rejected',
        'receipt_id', NEW.id,
        'farm_name', v_farm_name,
        'rejection_reason', NEW.rejection_reason
      )
    )
    ON CONFLICT (phone_number) 
    DO UPDATE SET
      last_message = EXCLUDED.last_message,
      priority = 'urgent',
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- التحقق
COMMENT ON FUNCTION notify_whatsapp_booking_created IS 'Fixed: uses f.name_ar instead of f.name';
COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'Fixed: uses f.name_ar instead of f.name';
COMMENT ON FUNCTION notify_whatsapp_payment_received IS 'Fixed: uses f.name_ar instead of f.name';
COMMENT ON FUNCTION notify_whatsapp_payment_rejected IS 'Fixed: uses f.name_ar instead of f.name';

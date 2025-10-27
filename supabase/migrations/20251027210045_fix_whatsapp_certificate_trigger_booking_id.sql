/*
  # إصلاح WhatsApp Certificate Trigger - استخدام booking_id
  
  المشكلة:
  - notify_whatsapp_certificate_issued يستخدم NEW.reservation_id
  - لكن جدول documentation يحتوي على booking_id وليس reservation_id
  - يسبب خطأ: record "new" has no field "reservation_id"
  
  الحل:
  - استبدال NEW.reservation_id بـ NEW.booking_id
  - booking_id هو نفسه reservation_id (هما نفس الشيء)
*/

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
  -- استخدام NEW.booking_id بدلاً من NEW.reservation_id
  SELECT i.phone, i.full_name, f.name_ar
  INTO v_investor_phone, v_investor_name, v_farm_name
  FROM reservations r
  JOIN investors i ON i.id = r.investor_id
  JOIN farms f ON f.id = r.farm_id
  WHERE r.id = NEW.booking_id;
  
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

COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'Fixed: uses NEW.booking_id instead of NEW.reservation_id';

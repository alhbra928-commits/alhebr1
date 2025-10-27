/*
  # إصلاح الدالتين المتبقيتين - full_name_ar إلى full_name
  
  1. الدوال
    - notify_whatsapp_investor_welcome
    - verify_whatsapp_otp
  
  2. الإصلاح
    - استبدال full_name_ar بـ full_name في جدول investors
*/

-- 1. إصلاح notify_whatsapp_investor_welcome
CREATE OR REPLACE FUNCTION notify_whatsapp_investor_welcome()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
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
      p_recipient_name := (SELECT full_name FROM investors WHERE id = NEW.investor_id),
      p_variables := jsonb_build_object(
        'اسم_المستخدم', (SELECT full_name FROM investors WHERE id = NEW.investor_id),
        'customer_name', (SELECT full_name FROM investors WHERE id = NEW.investor_id)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. إصلاح verify_whatsapp_otp
CREATE OR REPLACE FUNCTION verify_whatsapp_otp(
  p_phone_number text,
  p_otp_code text,
  p_user_type text
)
RETURNS jsonb
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_otp_record RECORD;
  v_user_id uuid;
  v_user_name text;
BEGIN
  -- Find valid OTP
  SELECT *
  INTO v_otp_record
  FROM login_otps
  WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code
    AND user_type = p_user_type
    AND is_used = false
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if OTP exists and is valid
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'رمز التحقق غير صحيح أو منتهي الصلاحية'
    );
  END IF;
  
  -- Mark OTP as used
  UPDATE login_otps
  SET is_used = true,
      used_at = NOW()
  WHERE id = v_otp_record.id;
  
  -- Get user details based on type
  IF p_user_type = 'investor' THEN
    SELECT id, full_name
    INTO v_user_id, v_user_name
    FROM investors
    WHERE phone = p_phone_number
      AND deleted_at IS NULL
    LIMIT 1;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'المستثمر غير موجود'
      );
    END IF;
    
  ELSIF p_user_type = 'owner' THEN
    SELECT id, owner_name
    INTO v_user_id, v_user_name
    FROM farm_owners
    WHERE mobile = p_phone_number
      AND deleted_at IS NULL
    LIMIT 1;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'صاحب المزرعة غير موجود'
      );
    END IF;
  END IF;
  
  -- Return success with user info
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'user_name', v_user_name,
    'user_type', p_user_type,
    'phone', p_phone_number
  );
END;
$$;

-- التحقق من الإصلاح
COMMENT ON FUNCTION notify_whatsapp_investor_welcome IS 'WhatsApp welcome notification - Fixed to use full_name';
COMMENT ON FUNCTION verify_whatsapp_otp IS 'Verify WhatsApp OTP - Fixed to use full_name';

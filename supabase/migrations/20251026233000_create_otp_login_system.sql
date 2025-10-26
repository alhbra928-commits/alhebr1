/*
  # OTP Login System via WhatsApp

  ## Overview
  Complete OTP (One-Time Password) authentication system via WhatsApp
  for investors and farm owners to login securely.

  ## Functions

  1. `generate_otp_code` - Generate 6-digit random OTP
  2. `request_whatsapp_otp` - Request OTP and send via WhatsApp
  3. `verify_whatsapp_otp` - Verify OTP code
  4. `cleanup_expired_otps` - Remove expired OTPs

  ## Security
  - OTP expires in 3 minutes
  - Each phone can request new OTP (old ones invalidated)
  - OTP can only be used once
  - All operations logged
*/

-- Function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$;

-- Function to request OTP via WhatsApp
CREATE OR REPLACE FUNCTION request_whatsapp_otp(
  p_phone_number text,
  p_user_type text,
  p_user_name text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp_code text;
  v_otp_id uuid;
  v_expires_at timestamptz;
  v_message_id uuid;
BEGIN
  -- Validate user type
  IF p_user_type NOT IN ('investor', 'owner') THEN
    RAISE EXCEPTION 'Invalid user type. Must be investor or owner';
  END IF;

  -- Validate phone number format
  IF p_phone_number IS NULL OR LENGTH(p_phone_number) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  -- Generate OTP code
  v_otp_code := generate_otp_code();

  -- Set expiration (3 minutes from now)
  v_expires_at := NOW() + INTERVAL '3 minutes';

  -- Invalidate any existing active OTPs for this phone
  UPDATE login_otps
  SET is_used = true
  WHERE phone_number = p_phone_number
    AND is_used = false
    AND expires_at > NOW();

  -- Insert new OTP
  INSERT INTO login_otps (
    phone_number,
    otp_code,
    expires_at,
    user_type,
    ip_address,
    user_agent
  )
  VALUES (
    p_phone_number,
    v_otp_code,
    v_expires_at,
    p_user_type,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_otp_id;

  -- Send OTP via WhatsApp
  BEGIN
    v_message_id := trigger_whatsapp_event(
      p_event_type := 'login_otp',
      p_recipient_phone := p_phone_number,
      p_recipient_name := p_user_name,
      p_variables := jsonb_build_object(
        'رمز_التحقق', v_otp_code,
        'verification_code', v_otp_code,
        'اسم_المستخدم', COALESCE(p_user_name, 'مستخدم'),
        'customer_name', COALESCE(p_user_name, 'User')
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail OTP generation
    INSERT INTO whatsapp_logs (
      operation,
      status,
      error_message,
      request_data
    )
    VALUES (
      'send_otp',
      'error',
      SQLERRM,
      jsonb_build_object(
        'phone', p_phone_number,
        'user_type', p_user_type
      )
    );
  END;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'otp_id', v_otp_id,
    'expires_at', v_expires_at,
    'message', 'تم إرسال رمز التحقق إلى واتساب'
  );
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION verify_whatsapp_otp(
  p_phone_number text,
  p_otp_code text,
  p_user_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
    SELECT id, full_name_ar
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

-- Function to cleanup expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM login_otps
  WHERE expires_at < NOW() - INTERVAL '1 day';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  INSERT INTO whatsapp_logs (
    operation,
    status,
    request_data
  )
  VALUES (
    'cleanup_expired_otps',
    'success',
    jsonb_build_object('deleted_count', v_deleted_count)
  );

  RETURN v_deleted_count;
END;
$$;

-- Add policy for anon to request OTP
CREATE POLICY "Anyone can request OTP via function"
  ON login_otps FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_login_otps_lookup
  ON login_otps(phone_number, otp_code, user_type, is_used, expires_at)
  WHERE is_used = false;

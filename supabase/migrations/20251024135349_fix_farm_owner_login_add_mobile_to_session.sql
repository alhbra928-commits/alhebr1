/*
  # تحديث دالة farm_owner_login_or_create لإدراج mobile_number في الجلسة

  1. المشكلة
    - جدول farm_owner_sessions يتطلب mobile_number
    - الدالة لا تُدخل هذا الحقل

  2. الحل
    - تحديث الدالة لإدراج mobile_number
*/

CREATE OR REPLACE FUNCTION farm_owner_login_or_create(
  p_mobile_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
  v_session_token text;
  v_status text;
  v_is_new boolean := false;
BEGIN
  -- البحث عن الحساب
  SELECT id, status INTO v_profile_id, v_status
  FROM farm_owner_profiles
  WHERE mobile_number = p_mobile_number
    AND deleted_at IS NULL;

  -- إذا لم يكن موجود، إنشاء حساب جديد
  IF v_profile_id IS NULL THEN
    INSERT INTO farm_owner_profiles (
      mobile_number,
      status
    ) VALUES (
      p_mobile_number,
      'pending'
    )
    RETURNING id, status INTO v_profile_id, v_status;

    v_is_new := true;

    -- إنشاء إشعار ترحيبي
    INSERT INTO farm_owner_notifications (
      profile_id,
      title_ar,
      message_ar,
      notification_type,
      priority
    ) VALUES (
      v_profile_id,
      'مرحباً بك في منصة الحبر الزراعية',
      'تم إنشاء حسابك بنجاح. يمكنك الآن إضافة بيانات مزرعتك.',
      'account_created',
      'high'
    );

    -- تسجيل في audit_logs
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      new_data,
      metadata
    ) VALUES (
      'farm_owner_profiles',
      v_profile_id,
      'INSERT',
      jsonb_build_object(
        'mobile_number', p_mobile_number,
        'status', 'pending'
      ),
      jsonb_build_object(
        'source', 'farm_owner_login',
        'is_new_account', true
      )
    );
  END IF;

  -- إنشاء جلسة جديدة
  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO farm_owner_sessions (
    profile_id,
    mobile_number,
    session_token,
    ip_address,
    user_agent,
    expires_at
  ) VALUES (
    v_profile_id,
    p_mobile_number,
    v_session_token,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent',
    now() + interval '30 days'
  );

  -- تسجيل في audit_logs
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    new_data,
    metadata
  ) VALUES (
    'farm_owner_sessions',
    v_profile_id,
    'INSERT',
    jsonb_build_object(
      'profile_id', v_profile_id,
      'action', 'login'
    ),
    jsonb_build_object(
      'source', 'farm_owner_login',
      'is_new_account', v_is_new
    )
  );

  -- إرجاع النتيجة
  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'session_token', v_session_token,
    'status', v_status,
    'is_new_profile', v_is_new
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

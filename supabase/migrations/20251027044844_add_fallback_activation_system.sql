/*
  # نظام تفعيل الرد الافتراضي

  1. التغييرات
    - إضافة حقل is_default_fallback لتحديد الرد الافتراضي
    - إضافة حقل fallback_enabled لتفعيل/تعطيل الرد الافتراضي
    - تحديث الدالة لاستخدام الرد المفعّل فقط
    - حذف الرد الافتراضي التلقائي السابق

  2. الميزات
    - الإدارة تختار أي رد يكون افتراضي
    - يمكن تفعيل/تعطيل الرد الافتراضي
    - رد واحد فقط يمكن أن يكون افتراضي في وقت واحد
*/

-- Add columns for fallback system
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_auto_responses' 
    AND column_name = 'is_default_fallback'
  ) THEN
    ALTER TABLE whatsapp_auto_responses 
    ADD COLUMN is_default_fallback boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_auto_responses' 
    AND column_name = 'fallback_enabled'
  ) THEN
    ALTER TABLE whatsapp_auto_responses 
    ADD COLUMN fallback_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Remove the auto-generated fallback
DELETE FROM whatsapp_auto_responses 
WHERE keyword = '__DEFAULT_FALLBACK__';

-- Create function to set a response as default fallback
CREATE OR REPLACE FUNCTION set_as_default_fallback(p_response_id uuid, p_enabled boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- First, unset all other fallbacks
  UPDATE whatsapp_auto_responses
  SET is_default_fallback = false, fallback_enabled = false
  WHERE is_default_fallback = true;
  
  -- Set the new fallback
  UPDATE whatsapp_auto_responses
  SET 
    is_default_fallback = true,
    fallback_enabled = p_enabled
  WHERE id = p_response_id
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الرد غير موجود'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN p_enabled THEN 'تم تفعيل الرد الافتراضي بنجاح'
      ELSE 'تم تعطيل الرد الافتراضي'
    END
  );
END;
$$;

-- Create function to toggle fallback status
CREATE OR REPLACE FUNCTION toggle_fallback_status(p_response_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status boolean;
  v_new_status boolean;
BEGIN
  -- Get current status
  SELECT fallback_enabled INTO v_current_status
  FROM whatsapp_auto_responses
  WHERE id = p_response_id
    AND is_default_fallback = true
    AND deleted_at IS NULL;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'هذا الرد ليس رد افتراضي'
    );
  END IF;
  
  -- Toggle status
  v_new_status := NOT v_current_status;
  
  UPDATE whatsapp_auto_responses
  SET fallback_enabled = v_new_status
  WHERE id = p_response_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'enabled', v_new_status,
    'message', CASE 
      WHEN v_new_status THEN 'تم تفعيل الرد الافتراضي'
      ELSE 'تم تعطيل الرد الافتراضي'
    END
  );
END;
$$;

-- Update get_fallback_response to use enabled fallback only
CREATE OR REPLACE FUNCTION get_fallback_response(p_language text DEFAULT 'ar')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response text;
  v_fallback_enabled boolean;
BEGIN
  -- Check if fallback is enabled
  SELECT fallback_enabled INTO v_fallback_enabled
  FROM whatsapp_auto_responses
  WHERE is_default_fallback = true
    AND deleted_at IS NULL
  LIMIT 1;
  
  -- If not enabled, return null (will forward to admin without auto response)
  IF v_fallback_enabled IS NULL OR v_fallback_enabled = false THEN
    RETURN NULL;
  END IF;
  
  -- Get the response
  SELECT 
    CASE 
      WHEN p_language = 'en' THEN response_en
      ELSE response_ar
    END INTO v_response
  FROM whatsapp_auto_responses
  WHERE is_default_fallback = true
    AND fallback_enabled = true
    AND status = 'active'
    AND deleted_at IS NULL
  LIMIT 1;
  
  RETURN v_response;
END;
$$;

-- Update handle_smart_button_ai_v2 to handle null fallback
CREATE OR REPLACE FUNCTION handle_smart_button_ai_v2(
  p_session_token text,
  p_message text,
  p_user_type text,
  p_user_id uuid DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_page_url text DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id uuid;
  v_auto_response jsonb;
  v_thread_id uuid;
  v_message_id uuid;
  v_response_message_id uuid;
  v_context jsonb;
  v_rate_limit_check jsonb;
  v_intent_data jsonb;
  v_fallback_response text;
BEGIN
  -- Rate limit check
  SELECT 
    CASE 
      WHEN COUNT(*) >= 10 THEN jsonb_build_object('blocked', true, 'reason', 'rate_limit')
      ELSE jsonb_build_object('blocked', false)
    END INTO v_rate_limit_check
  FROM smart_button_rate_limits
  WHERE session_token = p_session_token
    AND window_start > NOW() - INTERVAL '1 minute';
  
  IF (v_rate_limit_check->>'blocked')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'تم تجاوز الحد المسموح. يرجى الانتظار قليلاً.',
      'rate_limited', true
    );
  END IF;
  
  -- Record rate limit
  INSERT INTO smart_button_rate_limits (session_token, ip_address, window_start)
  VALUES (p_session_token, p_ip_address, DATE_TRUNC('minute', NOW()))
  ON CONFLICT (session_token, window_start)
  DO UPDATE SET message_count = smart_button_rate_limits.message_count + 1;
  
  -- Extract context
  v_context := jsonb_build_object(
    'page_url', p_page_url,
    'user_type', p_user_type,
    'timestamp', NOW()
  );
  
  -- Create/update session
  INSERT INTO smart_button_sessions (
    session_token, user_id, user_type, phone_number, page_url, context_data, last_activity_at
  )
  VALUES (p_session_token, p_user_id, p_user_type, p_phone_number, p_page_url, v_context, NOW())
  ON CONFLICT (session_token)
  DO UPDATE SET last_activity_at = NOW(), page_url = COALESCE(p_page_url, smart_button_sessions.page_url)
  RETURNING id INTO v_session_id;
  
  -- Get/create thread
  SELECT id INTO v_thread_id
  FROM whatsapp_inbox_threads
  WHERE user_phone = COALESCE(p_phone_number, 'session-' || p_session_token)
    AND source_type = 'smart_button'
  LIMIT 1;
  
  IF v_thread_id IS NULL THEN
    INSERT INTO whatsapp_inbox_threads (user_phone, user_name, user_type, source_type, status, metadata)
    VALUES (
      COALESCE(p_phone_number, 'session-' || p_session_token),
      CASE p_user_type WHEN 'investor' THEN 'مستثمر' WHEN 'owner' THEN 'صاحب مزرعة' ELSE 'زائر' END,
      p_user_type, 'smart_button', 'open', v_context
    )
    RETURNING id INTO v_thread_id;
  END IF;
  
  -- Save incoming message
  INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
  VALUES (
    COALESCE(p_phone_number, 'system'), p_message, 'inbound', 'delivered', 'smart_button',
    jsonb_build_object('session_id', v_session_id, 'user_type', p_user_type, 'context', v_context)
  )
  RETURNING id INTO v_message_id;
  
  -- Try to find auto response
  v_auto_response := find_matching_auto_response(p_message, 'ar');
  
  IF (v_auto_response->>'found')::boolean THEN
    -- Send matched response
    INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
    VALUES (
      COALESCE(p_phone_number, 'system'),
      v_auto_response->>'response',
      'outbound', 'sent', 'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'ai_v2', true,
        'response_id', v_auto_response->>'response_id',
        'intent', v_auto_response->>'intent',
        'keyword', v_auto_response->>'keyword',
        'thread_id', v_thread_id
      )
    )
    RETURNING id INTO v_response_message_id;
    
    -- Update stats
    INSERT INTO smart_button_stats (date, total_messages, auto_responses_sent)
    VALUES (CURRENT_DATE, 1, 1)
    ON CONFLICT (date)
    DO UPDATE SET
      total_messages = smart_button_stats.total_messages + 1,
      auto_responses_sent = smart_button_stats.auto_responses_sent + 1;
    
    RETURN jsonb_build_object(
      'success', true,
      'auto_response', true,
      'ai_v2', true,
      'response', v_auto_response->>'response',
      'intent', v_auto_response->>'intent',
      'keyword', v_auto_response->>'keyword',
      'priority', v_auto_response->>'priority',
      'thread_id', v_thread_id
    );
  ELSE
    -- No match, try fallback
    v_fallback_response := get_fallback_response('ar');
    
    IF v_fallback_response IS NOT NULL THEN
      -- Send fallback response
      INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
      VALUES (
        COALESCE(p_phone_number, 'system'),
        v_fallback_response,
        'outbound', 'sent', 'smart_button',
        jsonb_build_object(
          'auto_response', true,
          'is_fallback', true,
          'ai_v2', true,
          'intent', 'general',
          'original_message', p_message,
          'thread_id', v_thread_id
        )
      )
      RETURNING id INTO v_response_message_id;
      
      -- Update stats
      INSERT INTO smart_button_stats (date, total_messages, fallback_responses_sent)
      VALUES (CURRENT_DATE, 1, 1)
      ON CONFLICT (date)
      DO UPDATE SET 
        total_messages = smart_button_stats.total_messages + 1,
        fallback_responses_sent = COALESCE(smart_button_stats.fallback_responses_sent, 0) + 1;
      
      -- Still forward to admin
      UPDATE whatsapp_inbox_threads
      SET unread_count = unread_count + 1, last_message_at = NOW(), status = 'open'
      WHERE id = v_thread_id;
      
      RETURN jsonb_build_object(
        'success', true,
        'auto_response', true,
        'is_fallback', true,
        'response', v_fallback_response,
        'intent', 'general',
        'message', 'تم إرسال رسالتك إلى فريق الدعم',
        'thread_id', v_thread_id
      );
    ELSE
      -- No fallback enabled, just forward to admin
      UPDATE whatsapp_inbox_threads
      SET unread_count = unread_count + 1, last_message_at = NOW(), status = 'open'
      WHERE id = v_thread_id;
      
      -- Update stats
      INSERT INTO smart_button_stats (date, total_messages)
      VALUES (CURRENT_DATE, 1)
      ON CONFLICT (date)
      DO UPDATE SET total_messages = smart_button_stats.total_messages + 1;
      
      RETURN jsonb_build_object(
        'success', true,
        'auto_response', false,
        'message', 'شكراً لتواصلك! سيقوم فريق الدعم بالرد عليك قريباً 🌿',
        'thread_id', v_thread_id,
        'forwarded_to_admin', true
      );
    END IF;
  END IF;
END;
$$;

-- Create view for fallback management
CREATE OR REPLACE VIEW fallback_response_management AS
SELECT 
  id,
  keyword,
  response_ar,
  response_en,
  is_default_fallback,
  fallback_enabled,
  status,
  created_at,
  updated_at
FROM whatsapp_auto_responses
WHERE deleted_at IS NULL
ORDER BY is_default_fallback DESC, created_at DESC;

-- Grant permissions
GRANT SELECT ON fallback_response_management TO authenticated;
GRANT EXECUTE ON FUNCTION set_as_default_fallback(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_fallback_status(uuid) TO authenticated;

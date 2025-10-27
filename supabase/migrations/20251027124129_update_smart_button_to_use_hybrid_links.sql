/*
  # تحديث الزر الذكي لاستخدام الروابط الهجينة

  ## التحديثات:
  1. تحديث handle_smart_button_ai_v2 لاستخدام get_auto_response_with_hybrid_link
  2. إرجاع whatsapp_link و is_hybrid في النتيجة
  3. دعم كامل للرسالة الهجينة في الزر الذكي
*/

-- تحديث دالة الزر الذكي لاستخدام الروابط الهجينة
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
  v_fallback_response text;
  v_page_context text;
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
  
  -- Extract page context
  v_page_context := COALESCE(p_page_url, 'محادثة الزر الذكي');
  IF p_page_url LIKE '%/bookings%' THEN
    v_page_context := 'صفحة الحجوزات';
  ELSIF p_page_url LIKE '%/farms%' THEN
    v_page_context := 'صفحة المزارع';
  ELSIF p_page_url LIKE '%/investor%' THEN
    v_page_context := 'بوابة المستثمر';
  ELSIF p_page_url LIKE '%/owner%' THEN
    v_page_context := 'بوابة صاحب المزرعة';
  END IF;

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
  
  -- ✅ استخدام الدالة الجديدة مع دعم الروابط الهجينة
  v_auto_response := get_auto_response_with_hybrid_link(
    p_message, 
    p_user_type,
    v_page_context
  );
  
  IF (v_auto_response->>'found')::boolean THEN
    -- Send matched response with WhatsApp link
    INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
    VALUES (
      COALESCE(p_phone_number, 'system'),
      v_auto_response->>'response_text',
      'outbound', 'sent', 'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'ai_v2', true,
        'intent', v_auto_response->>'intent',
        'keyword', v_auto_response->>'keyword',
        'whatsapp_link', v_auto_response->>'whatsapp_link',
        'is_hybrid', (v_auto_response->>'is_hybrid')::boolean,
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
    
    -- ✅ إرجاع النتيجة مع الرابط الهجين
    RETURN jsonb_build_object(
      'success', true,
      'auto_response', true,
      'ai_v2', true,
      'response', v_auto_response->>'response_text',
      'whatsapp_link', v_auto_response->>'whatsapp_link',
      'hybrid_link', v_auto_response->>'whatsapp_link',
      'is_hybrid', (v_auto_response->>'is_hybrid')::boolean,
      'intent', v_auto_response->>'intent',
      'keyword', v_auto_response->>'keyword',
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
        fallback_responses_sent = smart_button_stats.fallback_responses_sent + 1;
      
      RETURN jsonb_build_object(
        'success', true,
        'auto_response', true,
        'is_fallback', true,
        'message', v_fallback_response,
        'intent', 'general',
        'thread_id', v_thread_id
      );
    ELSE
      -- No response available
      INSERT INTO smart_button_stats (date, total_messages, unhandled_messages)
      VALUES (CURRENT_DATE, 1, 1)
      ON CONFLICT (date)
      DO UPDATE SET
        total_messages = smart_button_stats.total_messages + 1,
        unhandled_messages = smart_button_stats.unhandled_messages + 1;
      
      RETURN jsonb_build_object(
        'success', false,
        'no_match', true,
        'message', 'عذراً، لم نتمكن من فهم رسالتك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
        'thread_id', v_thread_id
      );
    END IF;
  END IF;
END;
$$;

-- تعليق على التحديث
COMMENT ON FUNCTION handle_smart_button_ai_v2 IS 
'دالة محدّثة للزر الذكي - تدعم الروابط الهجينة مع الرسالة المرافقة';

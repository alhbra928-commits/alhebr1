/*
  # دمج الذكاء الاصطناعي المتقدم مع الزر الذكي
  
  1. التحديثات
    - تحديث handle_smart_button_ai_v2 لاستخدام النظام المتقدم
    - إضافة الاقتراحات الذكية في الرد
    - تتبع السياق والمشاعر
    - التعلم التلقائي من المحادثات
*/

-- Update handle_smart_button_ai_v2 with advanced AI
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
  v_smart_response jsonb;
  v_thread_id uuid;
  v_message_id uuid;
  v_response_message_id uuid;
  v_context jsonb;
  v_rate_limit_check jsonb;
  v_start_time timestamptz;
BEGIN
  v_start_time := clock_timestamp();
  
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
  
  -- Get context-aware response with advanced AI
  v_smart_response := get_context_aware_response(
    p_message,
    p_session_token,
    p_user_type,
    'ar'
  );
  
  IF (v_smart_response->>'found')::boolean THEN
    -- Send response
    INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
    VALUES (
      COALESCE(p_phone_number, 'system'),
      v_smart_response->>'response',
      'outbound', 'sent', 'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'ai_v2', true,
        'advanced_ai', true,
        'intent', v_smart_response->>'intent',
        'confidence', v_smart_response->>'confidence',
        'sentiment', v_smart_response->>'sentiment',
        'urgency', v_smart_response->>'urgency',
        'context_enhanced', v_smart_response->>'context_enhanced',
        'suggestions', v_smart_response->'suggestions',
        'thread_id', v_thread_id,
        'response_time_ms', EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))
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
      'advanced_ai', true,
      'response', v_smart_response->>'response',
      'intent', v_smart_response->>'intent',
      'confidence', v_smart_response->>'confidence',
      'sentiment', v_smart_response->>'sentiment',
      'urgency', v_smart_response->>'urgency',
      'suggestions', v_smart_response->'suggestions',
      'context_enhanced', v_smart_response->>'context_enhanced',
      'message_count', v_smart_response->>'message_count',
      'thread_id', v_thread_id,
      'response_time_ms', EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))
    );
  ELSE
    -- No match, forward to admin
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
      'message', v_smart_response->>'message',
      'intent', v_smart_response->>'intent',
      'sentiment', v_smart_response->>'sentiment',
      'urgency', v_smart_response->>'urgency',
      'suggestions', v_smart_response->'suggestions',
      'thread_id', v_thread_id
    );
  END IF;
END;
$$;
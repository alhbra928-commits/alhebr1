/*
  # ربط الزر الذكي مع الردود التلقائية الذكية
  
  1. التغييرات
    - إنشاء دالة find_matching_auto_response للبحث في whatsapp_auto_responses
    - تحديث handle_smart_button_ai_v2 لاستخدام الردود التلقائية
    - إضافة نظام تسجيل الاستخدام (usage tracking)
    
  2. المميزات
    - مطابقة ذكية للكلمات المفتاحية
    - دعم الأولويات
    - تسجيل عدد مرات الاستخدام
    - تحديث آخر استخدام
*/

-- Drop existing function if exists
DROP FUNCTION IF EXISTS find_matching_auto_response(text, text);

-- Create function to find matching auto response from whatsapp_auto_responses table
CREATE OR REPLACE FUNCTION find_matching_auto_response(
  p_message text,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_lower text;
  v_best_match RECORD;
  v_response_text text;
BEGIN
  v_message_lower := LOWER(TRIM(p_message));
  
  -- Search for best matching auto response
  SELECT *
  INTO v_best_match
  FROM whatsapp_auto_responses
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND (
      -- Exact keyword match
      v_message_lower = LOWER(keyword)
      OR
      -- Keyword contains message
      v_message_lower LIKE '%' || LOWER(keyword) || '%'
      OR
      -- Message contains keyword
      LOWER(keyword) LIKE '%' || v_message_lower || '%'
    )
  ORDER BY
    -- Prioritize exact matches
    CASE WHEN v_message_lower = LOWER(keyword) THEN 1 ELSE 2 END,
    -- Then by priority
    priority DESC,
    -- Then by usage count (popular responses)
    usage_count DESC,
    -- Finally by creation date
    created_at DESC
  LIMIT 1;
  
  -- If match found
  IF v_best_match.id IS NOT NULL THEN
    -- Update usage statistics
    UPDATE whatsapp_auto_responses
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE id = v_best_match.id;
    
    -- Get response text based on language
    v_response_text := CASE 
      WHEN p_language = 'en' AND v_best_match.response_en IS NOT NULL 
        THEN v_best_match.response_en
      ELSE v_best_match.response_ar
    END;
    
    -- Return success response
    RETURN jsonb_build_object(
      'found', true,
      'response', v_response_text,
      'intent', v_best_match.intent,
      'priority', v_best_match.priority,
      'keyword', v_best_match.keyword,
      'response_id', v_best_match.id,
      'ai_generated', v_best_match.ai_generated
    );
  END IF;
  
  -- No match found
  RETURN jsonb_build_object(
    'found', false,
    'message', 'شكراً لتواصلك! سيقوم فريق الدعم بالرد عليك قريباً 🌿'
  );
END;
$$;

-- Update handle_smart_button_ai_v2 to use the new function
DROP FUNCTION IF EXISTS handle_smart_button_ai_v2(text, text, text, uuid, text, text, text);

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
  
  -- Try to find auto response from whatsapp_auto_responses table
  v_auto_response := find_matching_auto_response(p_message, 'ar');
  
  -- Detect intent for analytics
  v_intent_data := jsonb_build_object(
    'intent', v_auto_response->>'intent',
    'keyword', v_auto_response->>'keyword'
  );
  
  IF (v_auto_response->>'found')::boolean THEN
    -- Send response
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
      'message', v_auto_response->>'message',
      'thread_id', v_thread_id
    );
  END IF;
END;
$$;
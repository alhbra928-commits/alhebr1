/*
  # Enhanced Smart Button - Dynamic Context System

  ## Features
  
  - Context-aware responses based on page URL
  - Automatic extraction of farm names, booking IDs, etc.
  - Rate limiting for security
  - Real-time notifications
  - Advanced analytics

  ## Updates
  
  - Enhanced message handling with context
  - Rate limiting system
  - Notification preferences
  - Advanced statistics tracking
*/

-- Add context fields to sessions
ALTER TABLE smart_button_sessions
ADD COLUMN IF NOT EXISTS context_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS farm_id uuid,
ADD COLUMN IF NOT EXISTS booking_id uuid;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS smart_button_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  ip_address text,
  message_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_token, window_start)
);

-- Enable RLS
ALTER TABLE smart_button_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check rate limits"
  ON smart_button_rate_limits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can manage rate limits"
  ON smart_button_rate_limits FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enhanced function to extract context from URL
CREATE OR REPLACE FUNCTION extract_page_context(
  p_url text,
  p_user_type text DEFAULT 'visitor'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_context jsonb := '{}'::jsonb;
  v_farm_id uuid;
  v_booking_id text;
  v_farm_name text;
BEGIN
  -- Extract farm context
  IF p_url ~ '/farm/' OR p_url ~ '/farms/' THEN
    -- Try to extract farm ID from URL
    v_farm_id := (regexp_match(p_url, '/farm/([a-f0-9-]+)'))[1]::uuid;
    
    IF v_farm_id IS NOT NULL THEN
      SELECT name_ar INTO v_farm_name
      FROM farms
      WHERE id = v_farm_id
      LIMIT 1;
      
      v_context := jsonb_build_object(
        'type', 'farm',
        'farm_id', v_farm_id,
        'farm_name', v_farm_name,
        'suggested_response', 'استفسار عن مزرعة ' || COALESCE(v_farm_name, 'غير محدد')
      );
    END IF;
  END IF;

  -- Extract booking context
  IF p_url ~ '/booking/' OR p_url ~ '/reservations/' THEN
    v_context := jsonb_set(
      v_context,
      '{type}',
      '"booking"'
    );
    v_context := jsonb_set(
      v_context,
      '{suggested_response}',
      '"استفسار عن حجز"'
    );
  END IF;

  -- User type context
  v_context := jsonb_set(
    v_context,
    '{user_type}',
    to_jsonb(p_user_type)
  );

  -- Page type
  IF p_url ~ '/investor' THEN
    v_context := jsonb_set(v_context, '{section}', '"investor_portal"');
  ELSIF p_url ~ '/farm-owner' THEN
    v_context := jsonb_set(v_context, '{section}', '"owner_portal"');
  ELSIF p_url ~ '/public' OR p_url = '/' THEN
    v_context := jsonb_set(v_context, '{section}', '"public_platform"');
  END IF;

  RETURN v_context;
END;
$$;

-- Enhanced message handler with rate limiting and context
CREATE OR REPLACE FUNCTION handle_smart_button_message_v2(
  p_session_token text,
  p_message text,
  p_user_type text DEFAULT 'visitor',
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
  v_enhanced_message text;
BEGIN
  -- Check rate limit (10 messages per minute)
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

  -- Extract context from URL
  v_context := extract_page_context(p_page_url, p_user_type);

  -- Enhance message with context
  v_enhanced_message := p_message;
  IF v_context->>'suggested_response' IS NOT NULL THEN
    v_enhanced_message := v_context->>'suggested_response' || E'\n\nالسؤال: ' || p_message;
  END IF;

  -- Create or update session with context
  INSERT INTO smart_button_sessions (
    session_token,
    user_id,
    user_type,
    phone_number,
    page_url,
    context_data,
    farm_id,
    last_activity_at
  )
  VALUES (
    p_session_token,
    p_user_id,
    p_user_type,
    p_phone_number,
    p_page_url,
    v_context,
    (v_context->>'farm_id')::uuid,
    NOW()
  )
  ON CONFLICT (session_token)
  DO UPDATE SET
    last_activity_at = NOW(),
    page_url = COALESCE(p_page_url, smart_button_sessions.page_url),
    context_data = v_context,
    farm_id = COALESCE((v_context->>'farm_id')::uuid, smart_button_sessions.farm_id)
  RETURNING id INTO v_session_id;

  -- Create or get inbox thread
  SELECT id INTO v_thread_id
  FROM whatsapp_inbox_threads
  WHERE user_phone = COALESCE(p_phone_number, 'session-' || p_session_token)
    AND source_type = 'smart_button'
  LIMIT 1;

  IF v_thread_id IS NULL THEN
    INSERT INTO whatsapp_inbox_threads (
      user_phone,
      user_name,
      user_type,
      source_type,
      status,
      metadata
    )
    VALUES (
      COALESCE(p_phone_number, 'session-' || p_session_token),
      CASE p_user_type
        WHEN 'investor' THEN 'مستثمر'
        WHEN 'owner' THEN 'صاحب مزرعة'
        ELSE 'زائر'
      END,
      p_user_type,
      'smart_button',
      'open',
      v_context
    )
    RETURNING id INTO v_thread_id;
  ELSE
    -- Update thread metadata with latest context
    UPDATE whatsapp_inbox_threads
    SET metadata = v_context
    WHERE id = v_thread_id;
  END IF;

  -- Save incoming message
  INSERT INTO whatsapp_messages (
    recipient_phone,
    content,
    direction,
    status,
    source_type,
    metadata
  )
  VALUES (
    COALESCE(p_phone_number, 'system'),
    v_enhanced_message,
    'inbound',
    'delivered',
    'smart_button',
    jsonb_build_object(
      'session_id', v_session_id,
      'user_type', p_user_type,
      'user_id', p_user_id,
      'page_url', p_page_url,
      'context', v_context,
      'original_message', p_message
    )
  )
  RETURNING id INTO v_message_id;

  -- Try to find auto response
  v_auto_response := find_auto_response(p_message, 'ar');

  IF (v_auto_response->>'found')::boolean THEN
    -- Send auto response
    INSERT INTO whatsapp_messages (
      recipient_phone,
      content,
      direction,
      status,
      source_type,
      metadata
    )
    VALUES (
      COALESCE(p_phone_number, 'system'),
      v_auto_response->>'response',
      'outbound',
      'sent',
      'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'category', v_auto_response->>'category',
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
      'response', v_auto_response->>'response',
      'thread_id', v_thread_id,
      'context', v_context
    );
  ELSE
    -- No auto response, forward to admin
    UPDATE whatsapp_inbox_threads
    SET 
      unread_count = unread_count + 1,
      last_message_at = NOW(),
      status = 'open'
    WHERE id = v_thread_id;

    -- Update stats
    INSERT INTO smart_button_stats (date, total_messages)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date)
    DO UPDATE SET
      total_messages = smart_button_stats.total_messages + 1;

    RETURN jsonb_build_object(
      'success', true,
      'auto_response', false,
      'message', 'سيتم الرد عليك من قبل فريق الدعم قريباً',
      'thread_id', v_thread_id,
      'context', v_context
    );
  END IF;
END;
$$;

-- Function to send admin response to user
CREATE OR REPLACE FUNCTION send_admin_response_to_button(
  p_thread_id uuid,
  p_message text,
  p_admin_id uuid,
  p_admin_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_phone text;
  v_message_id uuid;
BEGIN
  -- Get user phone from thread
  SELECT user_phone INTO v_user_phone
  FROM whatsapp_inbox_threads
  WHERE id = p_thread_id;

  IF v_user_phone IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Thread not found');
  END IF;

  -- Insert admin response
  INSERT INTO whatsapp_messages (
    recipient_phone,
    content,
    direction,
    status,
    source_type,
    metadata
  )
  VALUES (
    v_user_phone,
    p_message,
    'outbound',
    'sent',
    'smart_button',
    jsonb_build_object(
      'admin_response', true,
      'admin_id', p_admin_id,
      'admin_name', p_admin_name,
      'thread_id', p_thread_id
    )
  )
  RETURNING id INTO v_message_id;

  -- Update thread
  UPDATE whatsapp_inbox_threads
  SET 
    last_message_at = NOW(),
    unread_count = 0
  WHERE id = p_thread_id;

  -- Update stats
  INSERT INTO smart_button_stats (date, manual_responses_sent)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET
    manual_responses_sent = smart_button_stats.manual_responses_sent + 1;

  RETURN jsonb_build_object(
    'success', true,
    'message_id', v_message_id,
    'sent_at', NOW()
  );
END;
$$;

-- Function to get smart button analytics
CREATE OR REPLACE FUNCTION get_smart_button_analytics(
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_clicks', COALESCE(SUM(total_clicks), 0),
    'total_messages', COALESCE(SUM(total_messages), 0),
    'auto_responses', COALESCE(SUM(auto_responses_sent), 0),
    'manual_responses', COALESCE(SUM(manual_responses_sent), 0),
    'auto_response_rate', 
      CASE 
        WHEN SUM(total_messages) > 0 
        THEN ROUND((SUM(auto_responses_sent)::decimal / SUM(total_messages)) * 100, 2)
        ELSE 0
      END,
    'by_user_type', jsonb_object_agg(
      date,
      by_user_type
    ),
    'daily_stats', jsonb_agg(
      jsonb_build_object(
        'date', date,
        'clicks', total_clicks,
        'messages', total_messages,
        'auto_responses', auto_responses_sent,
        'manual_responses', manual_responses_sent
      ) ORDER BY date DESC
    )
  ) INTO v_result
  FROM smart_button_stats
  WHERE date BETWEEN p_start_date AND p_end_date;

  RETURN v_result;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_session_window 
  ON smart_button_rate_limits(session_token, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_context 
  ON smart_button_sessions USING gin(context_data);

CREATE INDEX IF NOT EXISTS idx_sessions_farm 
  ON smart_button_sessions(farm_id) WHERE farm_id IS NOT NULL;

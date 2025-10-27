/*
  # Smart AI Assistant v2 - Conversational Intelligence

  ## Overview
  Advanced conversational AI system with:
  - Natural language processing engine
  - Auto-learning from conversations
  - Smart escalation to human staff
  - Tone management
  - Comprehensive analytics

  ## New Tables
  
  1. `auto_learning_logs` - Training data from conversations
  2. `conversation_scores` - Quality metrics for responses
  3. `escalation_rules` - Rules for human handoff
  4. `ai_analytics` - Detailed analytics for AI performance

  ## Features
  
  - Natural conversation understanding
  - Context-aware responses
  - Learning from human responses
  - Smart escalation
  - Tone and personality management
*/

-- Auto Learning Logs Table
CREATE TABLE IF NOT EXISTS auto_learning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message text NOT NULL,
  ai_response text,
  human_response text,
  was_escalated boolean DEFAULT false,
  user_satisfaction text CHECK (user_satisfaction IN ('satisfied', 'neutral', 'unsatisfied', 'unknown')),
  intent text,
  keywords text[],
  context_data jsonb DEFAULT '{}'::jsonb,
  learned_at timestamptz,
  is_approved boolean DEFAULT false,
  should_add_to_kb boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Conversation Scores Table
CREATE TABLE IF NOT EXISTS conversation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  thread_id uuid,
  message_id uuid,
  response_quality decimal DEFAULT 0,
  intent_accuracy decimal DEFAULT 0,
  user_engagement decimal DEFAULT 0,
  escalation_needed boolean DEFAULT false,
  escalation_reason text,
  created_at timestamptz DEFAULT now()
);

-- Escalation Rules Table
CREATE TABLE IF NOT EXISTS escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  trigger_type text CHECK (trigger_type IN (
    'repeated_question', 'negative_sentiment', 'complex_query',
    'unsatisfied_response', 'keyword_match', 'timeout'
  )),
  trigger_condition jsonb NOT NULL,
  priority integer DEFAULT 0,
  auto_assign_to uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- AI Analytics Table
CREATE TABLE IF NOT EXISTS ai_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_conversations integer DEFAULT 0,
  ai_handled integer DEFAULT 0,
  human_escalated integer DEFAULT 0,
  auto_learned integer DEFAULT 0,
  top_intent text,
  top_keywords text[],
  satisfaction_score decimal DEFAULT 0,
  avg_response_time interval,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE auto_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can manage learning logs"
  ON auto_learning_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read scores"
  ON conversation_scores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can manage scores"
  ON conversation_scores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage escalation rules"
  ON escalation_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read active rules"
  ON escalation_rules FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read analytics"
  ON ai_analytics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage analytics"
  ON ai_analytics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to analyze conversation complexity
CREATE OR REPLACE FUNCTION analyze_conversation_complexity(
  p_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_word_count integer;
  v_sentence_count integer;
  v_question_marks integer;
  v_complexity_score decimal;
  v_contains_numbers boolean;
  v_contains_multiple_topics boolean;
BEGIN
  -- Count words
  v_word_count := array_length(string_to_array(p_message, ' '), 1);
  
  -- Count sentences (rough estimate)
  v_sentence_count := array_length(regexp_split_to_array(p_message, '[.!?؟]+'), 1);
  
  -- Count question marks
  v_question_marks := array_length(regexp_split_to_array(p_message, '[?؟]'), 1) - 1;
  
  -- Check for numbers
  v_contains_numbers := p_message ~ '\d+';
  
  -- Check for multiple topics (simple heuristic)
  v_contains_multiple_topics := (
    (LOWER(p_message) LIKE '%و%' OR LOWER(p_message) LIKE '%and%')
    AND v_word_count > 15
  );
  
  -- Calculate complexity score
  v_complexity_score := 
    (v_word_count * 0.1) +
    (v_sentence_count * 2) +
    (v_question_marks * 3) +
    (CASE WHEN v_contains_numbers THEN 2 ELSE 0 END) +
    (CASE WHEN v_contains_multiple_topics THEN 5 ELSE 0 END);
  
  RETURN jsonb_build_object(
    'word_count', v_word_count,
    'sentence_count', v_sentence_count,
    'question_marks', v_question_marks,
    'complexity_score', v_complexity_score,
    'is_complex', v_complexity_score > 10,
    'contains_numbers', v_contains_numbers,
    'multiple_topics', v_contains_multiple_topics
  );
END;
$$;

-- Function to detect user sentiment
CREATE OR REPLACE FUNCTION detect_user_sentiment(
  p_message text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_lower text;
  v_positive_count integer := 0;
  v_negative_count integer := 0;
BEGIN
  v_message_lower := LOWER(p_message);
  
  -- Count positive indicators
  v_positive_count := (
    (CASE WHEN v_message_lower ~ 'شكر|ممتاز|رائع|جميل|thank|perfect|great|excellent' THEN 3 ELSE 0 END) +
    (CASE WHEN v_message_lower ~ 'تمام|جيد|حلو|good|nice|ok' THEN 2 ELSE 0 END) +
    (CASE WHEN v_message_lower ~ '😊|🙂|😃|👍|❤️|🌟' THEN 2 ELSE 0 END)
  );
  
  -- Count negative indicators
  v_negative_count := (
    (CASE WHEN v_message_lower ~ 'سيء|فاشل|غلط|مشكلة|bad|wrong|problem|issue' THEN 3 ELSE 0 END) +
    (CASE WHEN v_message_lower ~ 'ما فهمت|مافي فايدة|لا يعمل|not working|don''t understand' THEN 3 ELSE 0 END) +
    (CASE WHEN v_message_lower ~ '😠|😡|😤|👎' THEN 2 ELSE 0 END) +
    (CASE WHEN v_message_lower ~ 'للأسف|unfortunately|sadly' THEN 1 ELSE 0 END)
  );
  
  -- Determine sentiment
  IF v_positive_count > v_negative_count AND v_positive_count >= 2 THEN
    RETURN 'positive';
  ELSIF v_negative_count > v_positive_count AND v_negative_count >= 2 THEN
    RETURN 'negative';
  ELSIF v_negative_count > 0 THEN
    RETURN 'neutral_negative';
  ELSE
    RETURN 'neutral';
  END IF;
END;
$$;

-- Function to check if escalation is needed
CREATE OR REPLACE FUNCTION should_escalate_conversation(
  p_session_token text,
  p_message text,
  p_thread_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_context RECORD;
  v_sentiment text;
  v_complexity jsonb;
  v_recent_messages integer;
  v_repeated_intent integer;
  v_should_escalate boolean := false;
  v_escalation_reason text;
BEGIN
  -- Get conversation context
  SELECT * INTO v_context
  FROM conversation_contexts
  WHERE session_token = p_session_token;
  
  -- Detect sentiment
  v_sentiment := detect_user_sentiment(p_message);
  
  -- Analyze complexity
  v_complexity := analyze_conversation_complexity(p_message);
  
  -- Count recent messages in this session
  SELECT COUNT(*) INTO v_recent_messages
  FROM whatsapp_messages m
  JOIN smart_button_sessions s ON s.session_token = p_session_token
  WHERE m.created_at > NOW() - INTERVAL '5 minutes'
    AND m.direction = 'inbound';
  
  -- Check for repeated intent (same intent 3+ times)
  IF v_context.message_count >= 3 THEN
    SELECT COUNT(*) INTO v_repeated_intent
    FROM conversation_contexts cc
    WHERE cc.session_token = p_session_token
      AND cc.current_intent = v_context.current_intent;
      
    IF v_repeated_intent >= 3 THEN
      v_should_escalate := true;
      v_escalation_reason := 'repeated_same_question';
    END IF;
  END IF;
  
  -- Check for negative sentiment
  IF v_sentiment IN ('negative', 'neutral_negative') THEN
    v_should_escalate := true;
    v_escalation_reason := 'negative_sentiment';
  END IF;
  
  -- Check for high complexity
  IF (v_complexity->>'is_complex')::boolean THEN
    v_should_escalate := true;
    v_escalation_reason := COALESCE(v_escalation_reason, 'complex_query');
  END IF;
  
  -- Check for too many messages without resolution
  IF v_recent_messages >= 5 THEN
    v_should_escalate := true;
    v_escalation_reason := COALESCE(v_escalation_reason, 'extended_conversation');
  END IF;
  
  RETURN jsonb_build_object(
    'should_escalate', v_should_escalate,
    'reason', v_escalation_reason,
    'sentiment', v_sentiment,
    'complexity_score', v_complexity->>'complexity_score',
    'message_count', v_recent_messages
  );
END;
$$;

-- Enhanced smart reply with escalation
CREATE OR REPLACE FUNCTION find_smart_reply_v2(
  p_message text,
  p_user_type text DEFAULT 'visitor',
  p_session_token text DEFAULT NULL,
  p_thread_id uuid DEFAULT NULL,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_reply jsonb;
  v_escalation_check jsonb;
  v_tone_prefix text;
  v_tone_suffix text;
  v_final_response text;
BEGIN
  -- Check if escalation is needed first
  IF p_session_token IS NOT NULL THEN
    v_escalation_check := should_escalate_conversation(p_session_token, p_message, p_thread_id);
    
    IF (v_escalation_check->>'should_escalate')::boolean THEN
      -- Mark thread for escalation
      UPDATE whatsapp_inbox_threads
      SET 
        status = 'escalated',
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{escalation_reason}',
          to_jsonb(v_escalation_check->>'reason')
        )
      WHERE id = p_thread_id;
      
      RETURN jsonb_build_object(
        'found', true,
        'response', 'جارٍ تحويلك إلى موظف مختص لمساعدتك بشكل أفضل 🌿' || E'\n' ||
                    'سيتم الرد عليك في أقرب وقت ممكن.',
        'escalated', true,
        'escalation_data', v_escalation_check
      );
    END IF;
  END IF;
  
  -- Get base reply from v1
  v_base_reply := find_smart_reply(p_message, p_user_type, p_session_token, p_language);
  
  -- If found, enhance with tone
  IF (v_base_reply->>'found')::boolean THEN
    -- Add friendly tone based on context
    v_tone_prefix := CASE 
      WHEN p_message ~* '^(مرحب|هلا|السلام)' THEN 'الله يحيّيك! 🌿' || E'\n'
      WHEN p_message ~* 'شكر' THEN 'على الرحب والسعة! 😊' || E'\n'
      ELSE ''
    END;
    
    v_tone_suffix := CASE
      WHEN (v_base_reply->>'intent') = 'question' THEN E'\n\nهل تحتاج مساعدة إضافية؟'
      WHEN (v_base_reply->>'intent') = 'financial' THEN E'\n\nأي استفسار إضافي، أنا هنا! 💚'
      ELSE ''
    END;
    
    v_final_response := v_tone_prefix || (v_base_reply->>'response') || v_tone_suffix;
    
    RETURN jsonb_set(
      v_base_reply,
      '{response}',
      to_jsonb(v_final_response)
    );
  END IF;
  
  RETURN v_base_reply;
END;
$$;

-- Function to learn from human responses
CREATE OR REPLACE FUNCTION learn_from_human_response(
  p_user_message text,
  p_ai_response text,
  p_human_response text,
  p_thread_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_intent_data jsonb;
  v_similar_count integer;
BEGIN
  -- Detect intent of user message
  v_intent_data := detect_message_intent(p_user_message);
  
  -- Log for learning
  INSERT INTO auto_learning_logs (
    user_message,
    ai_response,
    human_response,
    was_escalated,
    intent,
    keywords,
    should_add_to_kb
  )
  VALUES (
    p_user_message,
    p_ai_response,
    p_human_response,
    true,
    v_intent_data->>'intent',
    ARRAY(SELECT jsonb_array_elements_text(v_intent_data->'matched_keywords')),
    false
  );
  
  -- Check if this pattern appears frequently (3+ times)
  SELECT COUNT(*) INTO v_similar_count
  FROM auto_learning_logs
  WHERE intent = v_intent_data->>'intent'
    AND was_escalated = true
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- If frequent, suggest adding to knowledge base
  IF v_similar_count >= 3 THEN
    UPDATE auto_learning_logs
    SET 
      should_add_to_kb = true,
      learned_at = NOW()
    WHERE intent = v_intent_data->>'intent'
      AND was_escalated = true
      AND should_add_to_kb = false;
  END IF;
END;
$$;

-- Function to update AI analytics
CREATE OR REPLACE FUNCTION update_ai_analytics(
  p_was_ai_handled boolean,
  p_was_escalated boolean,
  p_intent text,
  p_keywords text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO ai_analytics (
    date,
    total_conversations,
    ai_handled,
    human_escalated,
    top_intent,
    top_keywords
  )
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN p_was_ai_handled THEN 1 ELSE 0 END,
    CASE WHEN p_was_escalated THEN 1 ELSE 0 END,
    p_intent,
    p_keywords
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_conversations = ai_analytics.total_conversations + 1,
    ai_handled = ai_analytics.ai_handled + CASE WHEN p_was_ai_handled THEN 1 ELSE 0 END,
    human_escalated = ai_analytics.human_escalated + CASE WHEN p_was_escalated THEN 1 ELSE 0 END,
    top_intent = CASE 
      WHEN p_intent IS NOT NULL THEN p_intent 
      ELSE ai_analytics.top_intent 
    END,
    top_keywords = CASE
      WHEN p_keywords IS NOT NULL THEN p_keywords
      ELSE ai_analytics.top_keywords
    END;
END;
$$;

-- Master function for smart button with AI v2
CREATE OR REPLACE FUNCTION handle_smart_button_ai_v2(
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
  v_smart_reply jsonb;
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
  v_context := extract_page_context(p_page_url, p_user_type);

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

  -- Get smart reply with AI v2
  v_smart_reply := find_smart_reply_v2(p_message, p_user_type, p_session_token, v_thread_id, 'ar');

  -- Detect intent for analytics
  v_intent_data := detect_message_intent(p_message);

  IF (v_smart_reply->>'found')::boolean OR (v_smart_reply->>'escalated')::boolean THEN
    -- Send response
    INSERT INTO whatsapp_messages (recipient_phone, content, direction, status, source_type, metadata)
    VALUES (
      COALESCE(p_phone_number, 'system'),
      v_smart_reply->>'response',
      'outbound', 'sent', 'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'ai_v2', true,
        'escalated', COALESCE((v_smart_reply->>'escalated')::boolean, false),
        'intent', v_intent_data->>'intent',
        'thread_id', v_thread_id
      )
    )
    RETURNING id INTO v_response_message_id;

    -- Update analytics
    PERFORM update_ai_analytics(
      NOT COALESCE((v_smart_reply->>'escalated')::boolean, false),
      COALESCE((v_smart_reply->>'escalated')::boolean, false),
      v_intent_data->>'intent',
      ARRAY(SELECT jsonb_array_elements_text(v_intent_data->'matched_keywords'))
    );

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
      'response', v_smart_reply->>'response',
      'escalated', COALESCE((v_smart_reply->>'escalated')::boolean, false),
      'intent', v_intent_data->>'intent',
      'thread_id', v_thread_id
    );
  ELSE
    -- No match, forward to admin
    UPDATE whatsapp_inbox_threads
    SET unread_count = unread_count + 1, last_message_at = NOW(), status = 'open'
    WHERE id = v_thread_id;

    PERFORM update_ai_analytics(false, true, v_intent_data->>'intent', NULL);

    RETURN jsonb_build_object(
      'success', true,
      'auto_response', false,
      'message', 'شكراً لتواصلك! سيقوم فريق الدعم بالرد عليك قريباً. 🌿',
      'intent', v_intent_data->>'intent',
      'thread_id', v_thread_id
    );
  END IF;
END;
$$;

-- Insert default escalation rules
INSERT INTO escalation_rules (rule_name, trigger_type, trigger_condition, priority) VALUES
('Repeated same question 3+ times', 'repeated_question', '{"count": 3}'::jsonb, 100),
('Negative sentiment detected', 'negative_sentiment', '{"threshold": 0.7}'::jsonb, 90),
('Complex query (score > 10)', 'complex_query', '{"complexity_threshold": 10}'::jsonb, 80),
('Extended conversation (5+ messages)', 'timeout', '{"message_count": 5}'::jsonb, 70);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_logs_intent ON auto_learning_logs(intent, was_escalated);
CREATE INDEX IF NOT EXISTS idx_learning_logs_created ON auto_learning_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_logs_should_add ON auto_learning_logs(should_add_to_kb) WHERE should_add_to_kb = true;
CREATE INDEX IF NOT EXISTS idx_conversation_scores_session ON conversation_scores(session_token);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_date ON ai_analytics(date DESC);

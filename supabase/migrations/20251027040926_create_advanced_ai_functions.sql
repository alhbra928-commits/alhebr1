/*
  # دوال الذكاء الاصطناعي المتقدمة
  
  1. الدوال
    - detect_advanced_intent: كشف النية المتقدم مع تحليل المشاعر
    - update_conversation_context: تحديث سياق المحادثة
    - get_smart_suggestions: الحصول على اقتراحات ذكية
    - learn_from_conversation: التعلم من المحادثة
    - get_context_aware_response: الحصول على رد سياقي
    
  2. المميزات
    - تحليل المشاعر (Sentiment Analysis)
    - تتبع المواضيع
    - اقتراحات ذكية بناءً على السياق
    - تعلم تلقائي
*/

-- Function: Detect Advanced Intent with Sentiment
CREATE OR REPLACE FUNCTION detect_advanced_intent(
  p_message text,
  p_context jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_message_lower text;
  v_intent text := 'unknown';
  v_sentiment text := 'neutral';
  v_urgency text := 'normal';
  v_confidence decimal(3,2) := 0.0;
  v_topics text[] := '{}';
BEGIN
  v_message_lower := LOWER(TRIM(p_message));
  
  -- Detect Sentiment (المشاعر)
  IF v_message_lower ~* '(ممتاز|رائع|شكرا|جيد|ممنون|سعيد)' THEN
    v_sentiment := 'positive';
  ELSIF v_message_lower ~* '(سيء|مشكلة|خطأ|غاضب|متضايق|للأسف)' THEN
    v_sentiment := 'negative';
  ELSIF v_message_lower ~* '(مستعجل|سريع|فوري|الآن|ضروري)' THEN
    v_urgency := 'high';
  END IF;
  
  -- Detect Intent with confidence
  IF v_message_lower ~* '^(مرحب|هلا|السلام|صباح|مساء|أهلا)' THEN
    v_intent := 'greeting';
    v_confidence := 0.95;
  ELSIF v_message_lower ~* '(حجز|احجز|أريد حجز|أرغب في حجز)' THEN
    v_intent := 'booking';
    v_confidence := 0.90;
    v_topics := ARRAY['booking', 'purchase'];
  ELSIF v_message_lower ~* '(سعر|أسعار|كم سعر|تكلفة|كم يكلف)' THEN
    v_intent := 'pricing';
    v_confidence := 0.90;
    v_topics := ARRAY['pricing', 'cost'];
  ELSIF v_message_lower ~* '(شهادة|ملكية|توثيق|وثيقة)' THEN
    v_intent := 'certificate';
    v_confidence := 0.85;
    v_topics := ARRAY['certificate', 'documentation'];
  ELSIF v_message_lower ~* '(تحويل|دفع|ارسال|تسديد|سداد)' THEN
    v_intent := 'payment';
    v_confidence := 0.85;
    v_topics := ARRAY['payment', 'financial'];
  ELSIF v_message_lower ~* '(ارباح|عائد|توزيع|مكاسب)' THEN
    v_intent := 'profits';
    v_confidence := 0.85;
    v_topics := ARRAY['profits', 'financial', 'returns'];
  ELSIF v_message_lower ~* '(استرجاع|استرداد|الغاء|إلغاء)' THEN
    v_intent := 'refund';
    v_confidence := 0.80;
    v_topics := ARRAY['refund', 'cancellation'];
    v_urgency := 'high';
  ELSIF v_message_lower ~* '(مشكلة|خطأ|عطل|لا يعمل)' THEN
    v_intent := 'technical_issue';
    v_confidence := 0.80;
    v_topics := ARRAY['technical', 'support'];
    v_sentiment := 'negative';
  ELSIF v_message_lower ~* '(كيف|طريقة|خطوات|الطريقة)' THEN
    v_intent := 'how_to';
    v_confidence := 0.75;
    v_topics := ARRAY['tutorial', 'guide'];
  ELSIF v_message_lower ~* '(متى|موعد|وقت|تاريخ)' THEN
    v_intent := 'timing';
    v_confidence := 0.75;
    v_topics := ARRAY['schedule', 'timing'];
  ELSIF v_message_lower ~* '(شكر|ممنون|تسلم)' THEN
    v_intent := 'thanks';
    v_confidence := 0.95;
    v_sentiment := 'positive';
  ELSIF v_message_lower ~* '(وداع|مع السلامة|باي|الله يعطيك العافية)' THEN
    v_intent := 'goodbye';
    v_confidence := 0.95;
  ELSIF v_message_lower ~* '\?' THEN
    v_intent := 'question';
    v_confidence := 0.60;
  END IF;
  
  RETURN jsonb_build_object(
    'intent', v_intent,
    'confidence', v_confidence,
    'sentiment', v_sentiment,
    'urgency', v_urgency,
    'topics', v_topics,
    'message_length', LENGTH(p_message),
    'has_question_mark', v_message_lower LIKE '%?%' OR v_message_lower LIKE '%؟%'
  );
END;
$$;

-- Function: Update Conversation Context
CREATE OR REPLACE FUNCTION update_conversation_context(
  p_session_token text,
  p_user_type text,
  p_intent_data jsonb,
  p_bot_action text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_context_id uuid;
  v_current_intent text;
  v_previous_intents text[];
  v_topics text[];
BEGIN
  v_current_intent := p_intent_data->>'intent';
  v_topics := ARRAY(SELECT jsonb_array_elements_text(p_intent_data->'topics'));
  
  -- Insert or update context
  INSERT INTO smart_button_context (
    session_token,
    user_type,
    current_intent,
    previous_intents,
    mentioned_topics,
    user_mood,
    last_bot_action,
    context_data,
    message_count,
    last_activity_at
  )
  VALUES (
    p_session_token,
    p_user_type,
    v_current_intent,
    ARRAY[v_current_intent],
    v_topics,
    p_intent_data->>'sentiment',
    p_bot_action,
    p_intent_data,
    1,
    NOW()
  )
  ON CONFLICT (session_token)
  DO UPDATE SET
    previous_intents = CASE
      WHEN smart_button_context.current_intent IS NOT NULL 
      THEN array_append(smart_button_context.previous_intents[1:9], smart_button_context.current_intent)
      ELSE smart_button_context.previous_intents
    END,
    current_intent = v_current_intent,
    mentioned_topics = array_cat(smart_button_context.mentioned_topics, v_topics),
    user_mood = p_intent_data->>'sentiment',
    last_bot_action = p_bot_action,
    context_data = p_intent_data,
    message_count = smart_button_context.message_count + 1,
    last_activity_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_context_id;
  
  RETURN v_context_id;
END;
$$;

-- Function: Get Smart Suggestions
CREATE OR REPLACE FUNCTION get_smart_suggestions(
  p_intent text,
  p_user_type text DEFAULT 'all',
  p_context jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_suggestions jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'text', suggestion_text_ar,
      'type', suggestion_type,
      'action_data', action_data
    ) ORDER BY priority DESC, success_rate DESC
  )
  INTO v_suggestions
  FROM smart_suggestions
  WHERE is_active = true
    AND trigger_intent = p_intent
    AND (user_type = p_user_type OR user_type = 'all')
  LIMIT 4;
  
  RETURN COALESCE(v_suggestions, '[]'::jsonb);
END;
$$;

-- Function: Learn from Conversation
CREATE OR REPLACE FUNCTION learn_from_conversation(
  p_user_message text,
  p_bot_response text,
  p_intent text,
  p_context_snapshot jsonb,
  p_resolution_successful boolean DEFAULT NULL,
  p_escalated boolean DEFAULT false,
  p_response_time_seconds integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_learning_id uuid;
BEGIN
  INSERT INTO conversation_learning (
    user_message,
    bot_response,
    intent,
    context_snapshot,
    resolution_successful,
    escalated,
    response_time_seconds
  )
  VALUES (
    p_user_message,
    p_bot_response,
    p_intent,
    p_context_snapshot,
    p_resolution_successful,
    p_escalated,
    p_response_time_seconds
  )
  RETURNING id INTO v_learning_id;
  
  RETURN v_learning_id;
END;
$$;

-- Function: Get Context-Aware Response
CREATE OR REPLACE FUNCTION get_context_aware_response(
  p_message text,
  p_session_token text,
  p_user_type text,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_intent_data jsonb;
  v_context RECORD;
  v_auto_response jsonb;
  v_enhanced_response text;
  v_suggestions jsonb;
  v_greeting_prefix text := '';
  v_context_note text := '';
BEGIN
  -- Detect advanced intent
  v_intent_data := detect_advanced_intent(p_message, '{}'::jsonb);
  
  -- Get conversation context
  SELECT * INTO v_context
  FROM smart_button_context
  WHERE session_token = p_session_token;
  
  -- Update context
  PERFORM update_conversation_context(
    p_session_token,
    p_user_type,
    v_intent_data,
    'auto_response'
  );
  
  -- Add greeting prefix for first message
  IF v_context.message_count IS NULL OR v_context.message_count = 0 THEN
    v_greeting_prefix := CASE p_user_type
      WHEN 'investor' THEN 'مرحباً عزيزي المستثمر! 🌿' || E'\n\n'
      WHEN 'owner' THEN 'أهلاً صاحب المزرعة! 🌳' || E'\n\n'
      ELSE 'مرحباً بك في منصة تملك الأشجار! 🌴' || E'\n\n'
    END;
  END IF;
  
  -- Add context note for returning users
  IF v_context.message_count > 5 THEN
    v_context_note := E'\n\n💡 يمكنني مساعدتك بناءً على محادثاتنا السابقة!';
  END IF;
  
  -- Get base auto response
  v_auto_response := find_matching_auto_response(p_message, p_language);
  
  -- If response found, enhance it
  IF (v_auto_response->>'found')::boolean THEN
    v_enhanced_response := v_greeting_prefix || (v_auto_response->>'response') || v_context_note;
    
    -- Get smart suggestions
    v_suggestions := get_smart_suggestions(
      v_intent_data->>'intent',
      p_user_type,
      v_intent_data
    );
    
    -- Learn from this interaction
    PERFORM learn_from_conversation(
      p_message,
      v_enhanced_response,
      v_intent_data->>'intent',
      jsonb_build_object(
        'context', row_to_json(v_context),
        'intent_data', v_intent_data
      ),
      true,
      false,
      NULL
    );
    
    RETURN jsonb_build_object(
      'found', true,
      'response', v_enhanced_response,
      'intent', v_intent_data->>'intent',
      'confidence', v_intent_data->>'confidence',
      'sentiment', v_intent_data->>'sentiment',
      'urgency', v_intent_data->>'urgency',
      'suggestions', v_suggestions,
      'context_enhanced', true,
      'message_count', COALESCE(v_context.message_count, 0) + 1
    );
  END IF;
  
  -- No match, learn from this
  PERFORM learn_from_conversation(
    p_message,
    'No match found',
    v_intent_data->>'intent',
    jsonb_build_object('intent_data', v_intent_data),
    false,
    true,
    NULL
  );
  
  RETURN jsonb_build_object(
    'found', false,
    'message', 'شكراً لتواصلك! سيقوم فريق الدعم بالرد عليك قريباً 🌿',
    'intent', v_intent_data->>'intent',
    'sentiment', v_intent_data->>'sentiment',
    'urgency', v_intent_data->>'urgency',
    'suggestions', '[]'::jsonb
  );
END;
$$;
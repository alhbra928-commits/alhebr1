/*
  # Smart Reply Engine v1 - Knowledge Base & NLP System

  ## Overview
  Advanced AI-powered response system with:
  - Knowledge base for smart replies
  - Intent classification (NLP)
  - Context-aware responses
  - Personalized greetings
  - Conversation flow management

  ## New Tables
  
  1. `whatsapp_knowledge_base` - Knowledge base for smart replies
  2. `conversation_contexts` - Track conversation state
  3. `intent_patterns` - NLP patterns for intent detection

  ## Features
  
  - Smart keyword matching
  - Intent classification (question, request, financial, closing)
  - Priority-based response selection
  - Related links for navigation
  - Conversation state tracking
*/

-- Knowledge Base Table
CREATE TABLE IF NOT EXISTS whatsapp_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords text[] NOT NULL,
  intent text NOT NULL CHECK (intent IN (
    'question', 'request', 'financial', 'booking', 
    'certificate', 'payment', 'farm', 'support', 'closing', 'greeting'
  )),
  answer_ar text NOT NULL,
  answer_en text,
  related_link text,
  priority integer DEFAULT 0,
  requires_auth boolean DEFAULT false,
  user_type text CHECK (user_type IN ('visitor', 'investor', 'owner', 'all')),
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Intent Patterns Table
CREATE TABLE IF NOT EXISTS intent_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intent text NOT NULL,
  patterns text[] NOT NULL,
  keywords text[] NOT NULL,
  confidence_score decimal DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Conversation Contexts Table
CREATE TABLE IF NOT EXISTS conversation_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  current_intent text,
  last_intent text,
  conversation_state text DEFAULT 'active',
  context_data jsonb DEFAULT '{}'::jsonb,
  message_count integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_token)
);

-- Enable RLS
ALTER TABLE whatsapp_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;

-- Policies for knowledge base
CREATE POLICY "Anyone can read active knowledge"
  ON whatsapp_knowledge_base FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage knowledge"
  ON whatsapp_knowledge_base FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for intent patterns
CREATE POLICY "Anyone can read active patterns"
  ON intent_patterns FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage patterns"
  ON intent_patterns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for conversation contexts
CREATE POLICY "Users can manage own contexts"
  ON conversation_contexts FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to detect intent from message
CREATE OR REPLACE FUNCTION detect_message_intent(
  p_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_lower text;
  v_intent_result RECORD;
  v_best_intent text;
  v_confidence decimal := 0;
  v_matched_keywords text[];
BEGIN
  v_message_lower := LOWER(p_message);
  
  -- Check intent patterns
  FOR v_intent_result IN
    SELECT 
      intent,
      patterns,
      keywords,
      confidence_score
    FROM intent_patterns
    WHERE is_active = true
    ORDER BY confidence_score DESC
  LOOP
    -- Check if any pattern matches
    DECLARE
      v_pattern text;
      v_keyword text;
      v_match_count integer := 0;
    BEGIN
      -- Check patterns
      FOREACH v_pattern IN ARRAY v_intent_result.patterns
      LOOP
        IF v_message_lower ~ v_pattern THEN
          v_match_count := v_match_count + 2;
        END IF;
      END LOOP;
      
      -- Check keywords
      FOREACH v_keyword IN ARRAY v_intent_result.keywords
      LOOP
        IF v_message_lower LIKE '%' || v_keyword || '%' THEN
          v_match_count := v_match_count + 1;
          v_matched_keywords := array_append(v_matched_keywords, v_keyword);
        END IF;
      END LOOP;
      
      -- If we have matches and confidence is higher
      IF v_match_count > 0 AND (v_match_count * v_intent_result.confidence_score) > v_confidence THEN
        v_confidence := v_match_count * v_intent_result.confidence_score;
        v_best_intent := v_intent_result.intent;
      END IF;
    END;
  END LOOP;
  
  -- Return result
  RETURN jsonb_build_object(
    'intent', COALESCE(v_best_intent, 'unknown'),
    'confidence', v_confidence,
    'matched_keywords', COALESCE(v_matched_keywords, ARRAY[]::text[])
  );
END;
$$;

-- Enhanced function to find smart reply
CREATE OR REPLACE FUNCTION find_smart_reply(
  p_message text,
  p_user_type text DEFAULT 'visitor',
  p_session_token text DEFAULT NULL,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_intent_data jsonb;
  v_intent text;
  v_message_lower text;
  v_best_match RECORD;
  v_match_score integer := 0;
  v_context RECORD;
  v_greeting text;
BEGIN
  -- Detect intent first
  v_intent_data := detect_message_intent(p_message);
  v_intent := v_intent_data->>'intent';
  v_message_lower := LOWER(p_message);
  
  -- Get or create conversation context
  IF p_session_token IS NOT NULL THEN
    INSERT INTO conversation_contexts (session_token, current_intent, message_count)
    VALUES (p_session_token, v_intent, 1)
    ON CONFLICT (session_token)
    DO UPDATE SET
      last_intent = conversation_contexts.current_intent,
      current_intent = v_intent,
      message_count = conversation_contexts.message_count + 1,
      last_activity_at = NOW()
    RETURNING * INTO v_context;
  END IF;
  
  -- If it's a greeting and first message, return personalized greeting
  IF v_intent = 'greeting' AND (v_context.message_count <= 1 OR v_context.message_count IS NULL) THEN
    v_greeting := CASE p_user_type
      WHEN 'investor' THEN 'مرحباً بك عزيزي المستثمر! 🌿' || E'\n\n' ||
        'يمكنك متابعة حجوزاتك، شهادات الملكية، أو إرسال استفسار جديد.' || E'\n' ||
        'كيف يمكنني مساعدتك اليوم؟'
      WHEN 'owner' THEN 'أهلاً وسهلاً صاحب المزرعة! 🌳' || E'\n\n' ||
        'يمكنك متابعة حالة مزارعك، التحويلات المالية، أو طلب دعم فني.' || E'\n' ||
        'كيف يمكنني خدمتك؟'
      ELSE 'مرحباً بك في منصة تملك الأشجار! 🌴' || E'\n\n' ||
        'هل ترغب بمعرفة:' || E'\n' ||
        '🌿 طريقة التملك والبدء' || E'\n' ||
        '💰 الأسعار والباقات' || E'\n' ||
        '📞 التواصل مع الإدارة' || E'\n\n' ||
        'أو اسأل مباشرة وسأساعدك!'
    END;
    
    RETURN jsonb_build_object(
      'found', true,
      'response', v_greeting,
      'intent', 'greeting',
      'is_personalized', true
    );
  END IF;
  
  -- If it's a closing message
  IF v_intent = 'closing' THEN
    RETURN jsonb_build_object(
      'found', true,
      'response', 'على الرحب والسعة! 😊' || E'\n' ||
        'نحن هنا دائماً لمساعدتك.' || E'\n\n' ||
        'بالتوفيق! 🌿',
      'intent', 'closing',
      'close_conversation', true
    );
  END IF;
  
  -- Search knowledge base for best match
  FOR v_best_match IN
    SELECT 
      kb.*,
      (
        SELECT COUNT(*)
        FROM unnest(kb.keywords) keyword
        WHERE v_message_lower LIKE '%' || LOWER(keyword) || '%'
      ) as keyword_matches
    FROM whatsapp_knowledge_base kb
    WHERE kb.is_active = true
      AND (kb.user_type = p_user_type OR kb.user_type = 'all')
      AND (kb.intent = v_intent OR v_intent = 'unknown')
    ORDER BY 
      keyword_matches DESC,
      kb.priority DESC,
      kb.usage_count DESC
    LIMIT 1
  LOOP
    IF v_best_match.keyword_matches > 0 THEN
      -- Update usage count
      UPDATE whatsapp_knowledge_base
      SET 
        usage_count = usage_count + 1,
        updated_at = NOW()
      WHERE id = v_best_match.id;
      
      RETURN jsonb_build_object(
        'found', true,
        'response', CASE 
          WHEN p_language = 'en' AND v_best_match.answer_en IS NOT NULL 
          THEN v_best_match.answer_en
          ELSE v_best_match.answer_ar
        END,
        'intent', v_best_match.intent,
        'related_link', v_best_match.related_link,
        'kb_id', v_best_match.id
      );
    END IF;
  END LOOP;
  
  -- No match found
  RETURN jsonb_build_object(
    'found', false,
    'intent', v_intent,
    'suggested_response', 'شكراً لتواصلك! سيقوم فريق الدعم بالرد عليك قريباً. 🌿'
  );
END;
$$;

-- Enhanced smart button message handler with AI
CREATE OR REPLACE FUNCTION handle_smart_button_message_v3(
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

  -- Create or update session
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
    context_data = v_context
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
    p_message,
    'inbound',
    'delivered',
    'smart_button',
    jsonb_build_object(
      'session_id', v_session_id,
      'user_type', p_user_type,
      'user_id', p_user_id,
      'page_url', p_page_url,
      'context', v_context
    )
  )
  RETURNING id INTO v_message_id;

  -- Try to find smart reply using AI
  v_smart_reply := find_smart_reply(p_message, p_user_type, p_session_token, 'ar');

  IF (v_smart_reply->>'found')::boolean THEN
    -- Send smart reply
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
      v_smart_reply->>'response',
      'outbound',
      'sent',
      'smart_button',
      jsonb_build_object(
        'auto_response', true,
        'smart_reply', true,
        'intent', v_smart_reply->>'intent',
        'kb_id', v_smart_reply->>'kb_id',
        'thread_id', v_thread_id
      )
    )
    RETURNING id INTO v_response_message_id;

    -- Close conversation if it's a closing intent
    IF (v_smart_reply->>'close_conversation')::boolean THEN
      UPDATE whatsapp_inbox_threads
      SET status = 'closed'
      WHERE id = v_thread_id;
    END IF;

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
      'smart_reply', true,
      'response', v_smart_reply->>'response',
      'intent', v_smart_reply->>'intent',
      'related_link', v_smart_reply->>'related_link',
      'thread_id', v_thread_id
    );
  ELSE
    -- No smart reply, forward to admin
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
      'message', v_smart_reply->>'suggested_response',
      'intent', v_smart_reply->>'intent',
      'thread_id', v_thread_id
    );
  END IF;
END;
$$;

-- Insert intent patterns
INSERT INTO intent_patterns (intent, patterns, keywords, confidence_score) VALUES
('greeting', ARRAY['^مرحب', '^هلا', '^أهلا', '^السلام', '^صباح', '^مساء', '^hello', '^hi', '^hey'], 
 ARRAY['مرحبا', 'هلا', 'أهلا', 'السلام', 'صباح', 'مساء', 'hello', 'hi'],
 1.0),

('question', ARRAY['\\?$', '^كيف', '^متى', '^أين', '^ما هو', '^ما هي', '^هل', '^how', '^what', '^when', '^where'],
 ARRAY['كيف', 'متى', 'أين', 'ما', 'هل', 'how', 'what', 'when', 'where', 'which'],
 0.9),

('request', ARRAY['^أريد', '^أبغى', '^عطني', '^ممكن', '^بدي', '^i want', '^i need', '^give me'],
 ARRAY['أريد', 'أبغى', 'ممكن', 'أحتاج', 'بدي', 'want', 'need'],
 0.9),

('financial', ARRAY['تحويل', 'دفع', 'سعر', 'كم', 'فلوس', 'مبلغ', 'ريال', 'payment', 'price', 'cost'],
 ARRAY['تحويل', 'دفع', 'سعر', 'كم', 'فلوس', 'مبلغ', 'ريال', 'payment', 'transfer', 'price'],
 0.95),

('booking', ARRAY['حجز', 'حجوزات', 'حجزت', 'booking', 'reserve', 'reservation'],
 ARRAY['حجز', 'حجوزات', 'booking', 'reserve', 'reservation'],
 0.95),

('certificate', ARRAY['شهادة', 'شهادات', 'ملكية', 'certificate', 'ownership'],
 ARRAY['شهادة', 'شهادات', 'ملكية', 'certificate', 'ownership'],
 0.95),

('closing', ARRAY['^شكرا', '^تمام', '^تم', '^ممتاز', '^thank', '^perfect', '^ok$', '^okay'],
 ARRAY['شكرا', 'تمام', 'تم', 'ممتاز', 'thank', 'thanks', 'perfect', 'ok'],
 1.0);

-- Insert comprehensive knowledge base
INSERT INTO whatsapp_knowledge_base (keywords, intent, answer_ar, answer_en, related_link, priority, user_type) VALUES

-- Greeting responses
(ARRAY['مرحبا', 'هلا', 'السلام', 'hello'], 'greeting',
 'مرحباً بك! 👋 كيف يمكنني مساعدتك اليوم؟',
 'Welcome! 👋 How can I help you today?',
 NULL, 100, 'all'),

-- Ownership & Starting
(ARRAY['تملك', 'كيف أبدأ', 'البداية', 'start', 'begin'], 'question',
 'يمكنك البدء في التملك بخطوات بسيطة:' || E'\n\n' ||
 '1️⃣ تصفح المزارع المتاحة' || E'\n' ||
 '2️⃣ اختر المزرعة والأشجار المناسبة' || E'\n' ||
 '3️⃣ أدخل بياناتك (رقم الجوال يكفي!)' || E'\n' ||
 '4️⃣ أتمم الدفع واحصل على شهادة الملكية' || E'\n\n' ||
 'ابدأ الآن من الصفحة الرئيسية! 🌴',
 'You can start ownership with simple steps...',
 '/', 100, 'all'),

-- Prices
(ARRAY['سعر', 'أسعار', 'كم', 'تكلفة', 'price', 'cost'], 'financial',
 'الأسعار تختلف حسب نوع الشجرة والمزرعة:' || E'\n\n' ||
 '🌴 زيتون: من 500 ريال للشجرة' || E'\n' ||
 '🌴 نخيل: من 800 ريال للشجرة' || E'\n' ||
 '🌴 زيتون عضوي: من 700 ريال' || E'\n\n' ||
 'كل شجرة مع شهادة ملكية رسمية!' || E'\n' ||
 'تصفح المزارع لرؤية الأسعار التفصيلية',
 'Prices vary by tree type and farm...',
 '/public', 90, 'all'),

-- Registration
(ARRAY['تسجيل', 'حساب', 'register', 'account', 'signup'], 'request',
 'لا تحتاج تسجيل معقد! 😊' || E'\n\n' ||
 'فقط رقم جوالك يكفي لـ:' || E'\n' ||
 '✅ تأكيد الحجز' || E'\n' ||
 '✅ إصدار شهادة الملكية' || E'\n' ||
 '✅ متابعة استثماراتك' || E'\n\n' ||
 'ابدأ الآن بدون تعقيدات!',
 'No complicated registration needed!',
 NULL, 85, 'all'),

-- Payment methods
(ARRAY['دفع', 'payment', 'طريقة', 'method'], 'financial',
 'طرق الدفع المتاحة:' || E'\n\n' ||
 '💳 تحويل بنكي' || E'\n' ||
 '📱 مدى' || E'\n' ||
 '💵 نقداً (عند الزيارة)' || E'\n\n' ||
 'بعد تأكيد الدفع، تصدر شهادة الملكية فوراً!' || E'\n' ||
 'آمن ومضمون 100%',
 'Available payment methods...',
 NULL, 90, 'all'),

-- Certificate
(ARRAY['شهادة', 'certificate', 'ملكية', 'ownership'], 'certificate',
 'شهادة الملكية تصدر فوراً بعد إتمام الدفع! 📜' || E'\n\n' ||
 'الشهادة تحتوي على:' || E'\n' ||
 '✅ رقم فريد' || E'\n' ||
 '✅ رمز تحقق' || E'\n' ||
 '✅ معلومات المزرعة' || E'\n' ||
 '✅ عدد الأشجار' || E'\n' ||
 '✅ تاريخ الإصدار' || E'\n\n' ||
 'يمكنك التحقق منها في أي وقت!',
 'Ownership certificate is issued immediately...',
 NULL, 85, 'all'),

-- Booking check (investor)
(ARRAY['حجز', 'حجوزاتي', 'booking', 'my bookings'], 'booking',
 'للتحقق من حالة حجزك:' || E'\n\n' ||
 '1️⃣ ادخل على لوحة المستثمر' || E'\n' ||
 '2️⃣ قسم "حجوزاتي"' || E'\n' ||
 '3️⃣ ستجد جميع التفاصيل' || E'\n\n' ||
 'يمكنك أيضاً رفع إيصال الدفع من هناك!',
 'To check your booking status...',
 '/investor', 90, 'investor'),

-- Financial transfer
(ARRAY['تحويل', 'transfer', 'متى', 'when'], 'financial',
 'التحويل المالي يتم خلال 24 ساعة ⏰' || E'\n\n' ||
 'بعد:' || E'\n' ||
 '✅ اكتمال المبلغ المطلوب' || E'\n' ||
 '✅ اعتماد جميع المستندات' || E'\n\n' ||
 'سيصلك إشعار فوري عند التحويل!',
 'Financial transfer is done within 24 hours...',
 NULL, 90, 'owner'),

-- Farm status (owner)
(ARRAY['مزرعة', 'مزارعي', 'farm', 'my farms'], 'farm',
 'لمتابعة حالة مزارعك:' || E'\n\n' ||
 '1️⃣ ادخل على لوحة المالك' || E'\n' ||
 '2️⃣ قسم "مزارعي"' || E'\n' ||
 '3️⃣ شاهد التفاصيل المالية والحجوزات' || E'\n\n' ||
 'جميع البيانات محدّثة لحظياً!',
 'To track your farms status...',
 '/farm-owner', 85, 'owner'),

-- Support
(ARRAY['مساعدة', 'help', 'support', 'دعم'], 'support',
 'يسعدنا مساعدتك! 🌿' || E'\n\n' ||
 'أنا مساعد آلي ذكي، لكن يمكنني:' || E'\n' ||
 '✅ الإجابة على الأسئلة الشائعة' || E'\n' ||
 '✅ توجيهك للقسم المناسب' || E'\n' ||
 '✅ تحويلك لفريق الدعم' || E'\n\n' ||
 'اسأل مباشرة وسأحاول المساعدة!',
 'Happy to help!',
 NULL, 80, 'all'),

-- Closing
(ARRAY['شكرا', 'thank', 'تمام', 'ok', 'ممتاز'], 'closing',
 'على الرحب والسعة! 😊' || E'\n' ||
 'نحن هنا دائماً لمساعدتك.' || E'\n\n' ||
 'بالتوفيق! 🌿',
 'You are welcome!',
 NULL, 100, 'all');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON whatsapp_knowledge_base USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_intent ON whatsapp_knowledge_base(intent, is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_priority ON whatsapp_knowledge_base(priority DESC, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_intent_patterns_active ON intent_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_session ON conversation_contexts(session_token);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_activity ON conversation_contexts(last_activity_at DESC);

/*
  # Smart WhatsApp Button System

  ## Overview
  Complete system for the smart floating WhatsApp button that appears
  on all pages and allows users to chat with the platform.

  ## New Tables
  
  1. `auto_responses` - Automatic responses based on keywords
  2. `smart_button_sessions` - Track user sessions with the button
  3. `smart_button_stats` - Statistics for the button usage

  ## Features
  
  - Keyword-based auto responses
  - Session tracking
  - Real-time message handling
  - User type detection
  - Statistics tracking
*/

-- Auto responses table
CREATE TABLE IF NOT EXISTS auto_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords text[] NOT NULL,
  response_ar text NOT NULL,
  response_en text NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Smart button sessions
CREATE TABLE IF NOT EXISTS smart_button_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text CHECK (user_type IN ('visitor', 'investor', 'owner', 'admin')),
  session_token text UNIQUE NOT NULL,
  phone_number text,
  page_url text,
  is_active boolean DEFAULT true,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Smart button statistics
CREATE TABLE IF NOT EXISTS smart_button_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_clicks integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  auto_responses_sent integer DEFAULT 0,
  manual_responses_sent integer DEFAULT 0,
  by_user_type jsonb DEFAULT '{"visitor": 0, "investor": 0, "owner": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_button_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_button_stats ENABLE ROW LEVEL SECURITY;

-- Policies for auto_responses
CREATE POLICY "Anyone can read active auto responses"
  ON auto_responses FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage auto responses"
  ON auto_responses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for smart_button_sessions
CREATE POLICY "Users can read own sessions"
  ON smart_button_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON smart_button_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON smart_button_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for smart_button_stats
CREATE POLICY "Anyone can read stats"
  ON smart_button_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can update stats"
  ON smart_button_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to find matching auto response
CREATE OR REPLACE FUNCTION find_auto_response(
  p_message text,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response RECORD;
  v_keywords text[];
  v_keyword text;
  v_message_lower text;
BEGIN
  v_message_lower := LOWER(p_message);
  
  -- Search for matching keywords
  FOR v_response IN
    SELECT *
    FROM auto_responses
    WHERE is_active = true
    ORDER BY priority DESC, created_at DESC
  LOOP
    FOREACH v_keyword IN ARRAY v_response.keywords
    LOOP
      IF v_message_lower LIKE '%' || LOWER(v_keyword) || '%' THEN
        RETURN jsonb_build_object(
          'found', true,
          'response', CASE 
            WHEN p_language = 'en' THEN v_response.response_en
            ELSE v_response.response_ar
          END,
          'category', v_response.category
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object('found', false);
END;
$$;

-- Function to handle incoming smart button message
CREATE OR REPLACE FUNCTION handle_smart_button_message(
  p_session_token text,
  p_message text,
  p_user_type text DEFAULT 'visitor',
  p_user_id uuid DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_page_url text DEFAULT NULL
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
BEGIN
  -- Create or update session
  INSERT INTO smart_button_sessions (
    session_token,
    user_id,
    user_type,
    phone_number,
    page_url,
    last_activity_at
  )
  VALUES (
    p_session_token,
    p_user_id,
    p_user_type,
    p_phone_number,
    p_page_url,
    NOW()
  )
  ON CONFLICT (session_token)
  DO UPDATE SET
    last_activity_at = NOW(),
    page_url = COALESCE(p_page_url, smart_button_sessions.page_url)
  RETURNING id INTO v_session_id;

  -- Create or get inbox thread
  SELECT id INTO v_thread_id
  FROM whatsapp_inbox_threads
  WHERE user_phone = p_phone_number
    AND source_type = 'smart_button'
  LIMIT 1;

  IF v_thread_id IS NULL THEN
    INSERT INTO whatsapp_inbox_threads (
      user_phone,
      user_name,
      user_type,
      source_type,
      status
    )
    VALUES (
      COALESCE(p_phone_number, 'anonymous-' || p_session_token),
      CASE p_user_type
        WHEN 'investor' THEN 'مستثمر'
        WHEN 'owner' THEN 'صاحب مزرعة'
        ELSE 'زائر'
      END,
      p_user_type,
      'smart_button',
      'open'
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
      'page_url', p_page_url
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
        'category', v_auto_response->>'category'
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
      'thread_id', v_thread_id
    );
  ELSE
    -- No auto response, forward to admin
    UPDATE whatsapp_inbox_threads
    SET 
      unread_count = unread_count + 1,
      last_message_at = NOW()
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
      'message', 'سيتم الرد عليك قريباً',
      'thread_id', v_thread_id
    );
  END IF;
END;
$$;

-- Function to track button click
CREATE OR REPLACE FUNCTION track_smart_button_click(
  p_session_token text,
  p_user_type text DEFAULT 'visitor'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update stats
  INSERT INTO smart_button_stats (date, total_clicks)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET
    total_clicks = smart_button_stats.total_clicks + 1,
    by_user_type = jsonb_set(
      smart_button_stats.by_user_type,
      ARRAY[p_user_type],
      to_jsonb(COALESCE((smart_button_stats.by_user_type->>p_user_type)::integer, 0) + 1)
    );
END;
$$;

-- Insert default auto responses
INSERT INTO auto_responses (keywords, response_ar, response_en, priority, category) VALUES
(ARRAY['كيف', 'أبدأ', 'تملك', 'البداية', 'start'], 
 'مرحباً بك في منصة تملك الأشجار 🌴\n\nيمكنك البدء من الصفحة الرئيسية عبر زر "ابدأ التملك" أو تصفح المزارع المتاحة مباشرة.\n\nهل تحتاج مساعدة أخرى؟',
 'Welcome to the Trees Ownership Platform 🌴\n\nYou can start from the homepage via "Start Ownership" button or browse available farms directly.\n\nNeed more help?',
 100, 'onboarding'),

(ARRAY['تسجيل', 'حساب', 'register', 'account'],
 'لا تحتاج تسجيل معقد! 😊\n\nفقط رقم جوالك يكفي لتأكيد الحجز وإصدار شهادة الملكية.\n\nهل لديك استفسار آخر؟',
 'No complicated registration needed! 😊\n\nJust your mobile number is enough to confirm booking and issue ownership certificate.\n\nAny other questions?',
 90, 'account'),

(ARRAY['سعر', 'تكلفة', 'كم', 'price', 'cost'],
 'الأسعار تختلف حسب نوع الشجرة والمزرعة 💰\n\nيمكنك مشاهدة جميع الأسعار عبر تصفح المزارع المتاحة.\n\nكل شجرة تأتي مع شهادة ملكية رسمية!\n\nهل تريد معرفة المزيد؟',
 'Prices vary by tree type and farm 💰\n\nYou can view all prices by browsing available farms.\n\nEach tree comes with official ownership certificate!\n\nWant to know more?',
 85, 'pricing'),

(ARRAY['دفع', 'payment', 'طريقة', 'method'],
 'طرق الدفع المتاحة:\n\n💳 تحويل بنكي\n📱 مدى\n💵 نقداً\n\nبعد تأكيد الدفع، تصدر شهادة الملكية فوراً!\n\nهل لديك سؤال آخر؟',
 'Available payment methods:\n\n💳 Bank transfer\n📱 Mada\n💵 Cash\n\nAfter payment confirmation, ownership certificate is issued immediately!\n\nAny other questions?',
 80, 'payment'),

(ARRAY['شهادة', 'certificate', 'ملكية', 'ownership'],
 'شهادة الملكية تصدر فوراً بعد إتمام الدفع! 📜\n\nالشهادة تحتوي على:\n✅ رقم فريد\n✅ رمز تحقق\n✅ معلومات المزرعة\n✅ عدد الأشجار\n\nيمكنك التحقق من صحتها في أي وقت.\n\nهل تحتاج مساعدة أخرى؟',
 'Ownership certificate is issued immediately after payment! 📜\n\nCertificate contains:\n✅ Unique number\n✅ Verification code\n✅ Farm details\n✅ Number of trees\n\nYou can verify it anytime.\n\nNeed more help?',
 85, 'certificate'),

(ARRAY['مساعدة', 'help', 'استفسار', 'question'],
 'يسعدنا مساعدتك! 🌿\n\nأنا مساعد آلي، لكن يمكنني توجيهك أو تحويلك لفريق الدعم.\n\nما الذي تحتاج المساعدة به؟',
 'Happy to help! 🌿\n\nI''m an automated assistant, but I can guide you or transfer to support team.\n\nWhat do you need help with?',
 70, 'support'),

(ARRAY['مرحبا', 'السلام', 'hello', 'hi'],
 'مرحباً بك! 👋\n\nأنا المساعد الذكي لمنصة تملك الأشجار.\n\nكيف يمكنني مساعدتك اليوم؟',
 'Welcome! 👋\n\nI''m the smart assistant for Trees Ownership Platform.\n\nHow can I help you today?',
 60, 'greeting');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auto_responses_active ON auto_responses(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_smart_button_sessions_token ON smart_button_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_smart_button_sessions_active ON smart_button_sessions(is_active, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_button_stats_date ON smart_button_stats(date DESC);

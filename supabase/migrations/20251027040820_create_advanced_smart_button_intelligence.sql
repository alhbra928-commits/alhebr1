/*
  # نظام الزر الذكي المتقدم - الذكاء الاصطناعي
  
  1. الجداول الجديدة
    - smart_button_context: سياق المحادثة لكل مستخدم
    - smart_suggestions: الاقتراحات الذكية
    - conversation_learning: التعلم من المحادثات
    - multi_step_flows: تدفقات متعددة الخطوات
    
  2. المميزات
    - كشف النية المتقدم مع تحليل المشاعر
    - ردود سياقية بناءً على تاريخ المحادثة
    - تعلم من المحادثات الناجحة
    - اقتراحات ذكية للمستخدم
    - تدفقات محادثة متعددة الخطوات
*/

-- Table: Smart Button Context (لحفظ سياق المحادثة)
CREATE TABLE IF NOT EXISTS smart_button_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  user_type text NOT NULL,
  current_intent text,
  previous_intents text[] DEFAULT '{}',
  mentioned_topics text[] DEFAULT '{}',
  user_mood text DEFAULT 'neutral',
  conversation_stage text DEFAULT 'greeting',
  last_bot_action text,
  context_data jsonb DEFAULT '{}',
  message_count integer DEFAULT 0,
  successful_resolutions integer DEFAULT 0,
  escalation_count integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  last_activity_at timestamptz DEFAULT NOW(),
  UNIQUE(session_token)
);

-- Table: Smart Suggestions (الاقتراحات الذكية)
CREATE TABLE IF NOT EXISTS smart_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_intent text NOT NULL,
  trigger_keywords text[] DEFAULT '{}',
  suggestion_text_ar text NOT NULL,
  suggestion_text_en text,
  suggestion_type text NOT NULL, -- quick_reply, action, link, question
  action_data jsonb DEFAULT '{}',
  priority integer DEFAULT 3,
  user_type text DEFAULT 'all',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Table: Conversation Learning (التعلم من المحادثات)
CREATE TABLE IF NOT EXISTS conversation_learning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message text NOT NULL,
  bot_response text NOT NULL,
  intent text NOT NULL,
  context_snapshot jsonb DEFAULT '{}',
  user_feedback text, -- positive, negative, neutral
  resolution_successful boolean,
  escalated boolean DEFAULT false,
  response_time_seconds integer,
  created_at timestamptz DEFAULT NOW()
);

-- Table: Multi-Step Flows (تدفقات متعددة الخطوات)
CREATE TABLE IF NOT EXISTS multi_step_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_name text NOT NULL UNIQUE,
  flow_type text NOT NULL, -- booking, inquiry, support
  steps jsonb NOT NULL, -- Array of step definitions
  is_active boolean DEFAULT true,
  completion_rate decimal(5,2) DEFAULT 0,
  average_duration_seconds integer,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Table: Active Flow Sessions (جلسات التدفقات النشطة)
CREATE TABLE IF NOT EXISTS active_flow_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  flow_id uuid REFERENCES multi_step_flows(id),
  current_step integer DEFAULT 0,
  collected_data jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT NOW(),
  last_interaction_at timestamptz DEFAULT NOW(),
  completed boolean DEFAULT false,
  abandoned boolean DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_button_context_session 
  ON smart_button_context(session_token);

CREATE INDEX IF NOT EXISTS idx_smart_button_context_intent 
  ON smart_button_context(current_intent);

CREATE INDEX IF NOT EXISTS idx_smart_suggestions_intent 
  ON smart_suggestions(trigger_intent);

CREATE INDEX IF NOT EXISTS idx_smart_suggestions_active 
  ON smart_suggestions(is_active, priority DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_learning_intent 
  ON conversation_learning(intent);

CREATE INDEX IF NOT EXISTS idx_conversation_learning_feedback 
  ON conversation_learning(user_feedback);

CREATE INDEX IF NOT EXISTS idx_multi_step_flows_active 
  ON multi_step_flows(is_active);

CREATE INDEX IF NOT EXISTS idx_active_flow_sessions_token 
  ON active_flow_sessions(session_token);

-- RLS Policies
ALTER TABLE smart_button_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_step_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_flow_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anon to read and write (for smart button functionality)
CREATE POLICY "anon_all_smart_button_context"
  ON smart_button_context FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_read_smart_suggestions"
  ON smart_suggestions FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "anon_all_conversation_learning"
  ON conversation_learning FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_read_multi_step_flows"
  ON multi_step_flows FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "anon_all_active_flow_sessions"
  ON active_flow_sessions FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "authenticated_all_smart_button_context"
  ON smart_button_context FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_smart_suggestions"
  ON smart_suggestions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_conversation_learning"
  ON conversation_learning FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_multi_step_flows"
  ON multi_step_flows FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_active_flow_sessions"
  ON active_flow_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
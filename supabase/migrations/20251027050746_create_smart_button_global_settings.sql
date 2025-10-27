/*
  # إنشاء نظام الإعدادات العامة للزر الذكي

  1. الجدول الجديد
    - smart_button_settings: إعدادات عامة للزر الذكي
    
  2. الإعدادات
    - is_enabled: تفعيل/تعطيل الزر بالكامل
    - position: موقع الزر (يسار/يمين)
    - primary_color: اللون الأساسي
    - pulse_enabled: تفعيل النبض المتحرك
    - sound_enabled: تفعيل الصوت
    - auto_responses_enabled: تفعيل الردود التلقائية
    - ai_enabled: تفعيل الذكاء الاصطناعي
    - rate_limit_per_minute: الحد الأقصى للرسائل في الدقيقة
    - welcome_message_ar: رسالة الترحيب بالعربية
    - welcome_message_en: رسالة الترحيب بالإنجليزية
    
  3. الأمان
    - RLS enabled
    - يمكن للإدارة فقط التعديل
    - الجميع يمكنه القراءة
*/

-- Create smart button settings table
CREATE TABLE IF NOT EXISTS smart_button_global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic settings
  is_enabled boolean DEFAULT true NOT NULL,
  position text DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left')),
  primary_color text DEFAULT '#10B981' NOT NULL,
  
  -- Visual effects
  pulse_enabled boolean DEFAULT true NOT NULL,
  pulse_interval_seconds integer DEFAULT 5 CHECK (pulse_interval_seconds > 0),
  
  -- Sound
  sound_enabled boolean DEFAULT true NOT NULL,
  
  -- Features toggles
  auto_responses_enabled boolean DEFAULT true NOT NULL,
  ai_enabled boolean DEFAULT true NOT NULL,
  fallback_response_enabled boolean DEFAULT true NOT NULL,
  
  -- Rate limiting
  rate_limit_enabled boolean DEFAULT true NOT NULL,
  rate_limit_per_minute integer DEFAULT 10 CHECK (rate_limit_per_minute > 0),
  
  -- Welcome messages
  welcome_message_ar text DEFAULT 'مرحباً! كيف يمكنني مساعدتك؟ 😊',
  welcome_message_en text DEFAULT 'Hello! How can I help you? 😊',
  
  -- Appearance
  button_size text DEFAULT 'medium' CHECK (button_size IN ('small', 'medium', 'large')),
  show_badge boolean DEFAULT true NOT NULL,
  badge_text text DEFAULT 'تواصل معنا',
  
  -- Advanced
  session_timeout_minutes integer DEFAULT 30 CHECK (session_timeout_minutes > 0),
  save_conversation_history boolean DEFAULT true NOT NULL,
  
  -- Metadata
  updated_by text,
  updated_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Insert default settings
INSERT INTO smart_button_global_settings (
  is_enabled,
  position,
  primary_color,
  pulse_enabled,
  pulse_interval_seconds,
  sound_enabled,
  auto_responses_enabled,
  ai_enabled,
  fallback_response_enabled,
  rate_limit_enabled,
  rate_limit_per_minute,
  welcome_message_ar,
  welcome_message_en,
  button_size,
  show_badge,
  badge_text,
  session_timeout_minutes,
  save_conversation_history,
  updated_by
)
VALUES (
  true,                           -- is_enabled
  'bottom-right',                 -- position
  '#10B981',                      -- primary_color (green)
  true,                           -- pulse_enabled
  5,                              -- pulse_interval_seconds
  true,                           -- sound_enabled
  true,                           -- auto_responses_enabled
  true,                           -- ai_enabled
  true,                           -- fallback_response_enabled
  true,                           -- rate_limit_enabled
  10,                             -- rate_limit_per_minute
  'مرحباً! كيف يمكنني مساعدتك؟ 😊',  -- welcome_message_ar
  'Hello! How can I help you? 😊', -- welcome_message_en
  'medium',                       -- button_size
  true,                           -- show_badge
  'تواصل معنا',                   -- badge_text
  30,                             -- session_timeout_minutes
  true,                           -- save_conversation_history
  'system'                        -- updated_by
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE smart_button_global_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Anyone can read smart button settings"
  ON smart_button_global_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update smart button settings"
  ON smart_button_global_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to get current settings
CREATE OR REPLACE FUNCTION get_smart_button_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  SELECT row_to_json(s)::jsonb INTO v_settings
  FROM smart_button_global_settings s
  LIMIT 1;
  
  RETURN COALESCE(v_settings, jsonb_build_object(
    'is_enabled', true,
    'auto_responses_enabled', true,
    'ai_enabled', true,
    'fallback_response_enabled', true
  ));
END;
$$;

-- Create function to update settings
CREATE OR REPLACE FUNCTION update_smart_button_settings(
  p_settings jsonb,
  p_updated_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_setting_id uuid;
  v_result jsonb;
BEGIN
  -- Get the settings ID (should only be one row)
  SELECT id INTO v_setting_id
  FROM smart_button_global_settings
  LIMIT 1;
  
  -- Update settings
  UPDATE smart_button_global_settings
  SET
    is_enabled = COALESCE((p_settings->>'is_enabled')::boolean, is_enabled),
    position = COALESCE(p_settings->>'position', position),
    primary_color = COALESCE(p_settings->>'primary_color', primary_color),
    pulse_enabled = COALESCE((p_settings->>'pulse_enabled')::boolean, pulse_enabled),
    sound_enabled = COALESCE((p_settings->>'sound_enabled')::boolean, sound_enabled),
    auto_responses_enabled = COALESCE((p_settings->>'auto_responses_enabled')::boolean, auto_responses_enabled),
    ai_enabled = COALESCE((p_settings->>'ai_enabled')::boolean, ai_enabled),
    fallback_response_enabled = COALESCE((p_settings->>'fallback_response_enabled')::boolean, fallback_response_enabled),
    rate_limit_enabled = COALESCE((p_settings->>'rate_limit_enabled')::boolean, rate_limit_enabled),
    rate_limit_per_minute = COALESCE((p_settings->>'rate_limit_per_minute')::integer, rate_limit_per_minute),
    welcome_message_ar = COALESCE(p_settings->>'welcome_message_ar', welcome_message_ar),
    welcome_message_en = COALESCE(p_settings->>'welcome_message_en', welcome_message_en),
    button_size = COALESCE(p_settings->>'button_size', button_size),
    show_badge = COALESCE((p_settings->>'show_badge')::boolean, show_badge),
    badge_text = COALESCE(p_settings->>'badge_text', badge_text),
    updated_by = COALESCE(p_updated_by, updated_by),
    updated_at = NOW()
  WHERE id = v_setting_id
  RETURNING row_to_json(smart_button_global_settings.*)::jsonb INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'settings', v_result,
    'message', 'تم تحديث الإعدادات بنجاح'
  );
END;
$$;

-- Grant permissions
GRANT SELECT ON smart_button_global_settings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_smart_button_settings() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_smart_button_settings(jsonb, text) TO authenticated;

-- Create view for easy access
CREATE OR REPLACE VIEW smart_button_settings_view AS
SELECT 
  is_enabled,
  position,
  primary_color,
  pulse_enabled,
  sound_enabled,
  auto_responses_enabled,
  ai_enabled,
  fallback_response_enabled,
  rate_limit_enabled,
  rate_limit_per_minute,
  welcome_message_ar,
  welcome_message_en,
  button_size,
  show_badge,
  badge_text,
  updated_at
FROM smart_button_global_settings
LIMIT 1;

GRANT SELECT ON smart_button_settings_view TO authenticated, anon;
